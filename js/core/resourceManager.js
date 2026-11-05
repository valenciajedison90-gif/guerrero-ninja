// js/core/resourceManager.js - Gestor Centralizado de Recursos y Memoria VRAM con Conteo de Referencias
import * as THREE from 'three';

class ResourceManager {
    constructor() {
        // Mapas de recursos con conteo de referencias
        // key -> { resource, refCount }
        this.geometries = new Map();
        this.materials = new Map();
        this.textures = new Map();

        // Conjunto de recursos globales persistentes que NUNCA deben liberarse
        this.persistentResources = new Set();
    }

    /**
     * Marca un recurso (geometría, material o textura) como persistente.
     * Nunca se liberará durante cambios de nivel.
     */
    markPersistent(resource) {
        if (resource) {
            this.persistentResources.add(resource);
        }
        return resource;
    }

    /**
     * Obtiene una geometría compartida de la caché o la crea si no existe.
     * Incrementa su contador de referencias.
     */
    getGeometry(key, factory) {
        if (this.geometries.has(key)) {
            const entry = this.geometries.get(key);
            entry.refCount++;
            return entry.resource;
        }
        const geom = factory();
        this.geometries.set(key, { resource: geom, refCount: 1 });
        return geom;
    }

    /**
     * Obtiene un material compartido de la caché o lo crea si no existe.
     * Incrementa su contador de referencias.
     */
    getMaterial(key, factory) {
        if (this.materials.has(key)) {
            const entry = this.materials.get(key);
            entry.refCount++;
            return entry.resource;
        }
        const mat = factory();
        this.materials.set(key, { resource: mat, refCount: 1 });
        return mat;
    }

    /**
     * Registra un recurso genérico y aumenta su conteo de referencias.
     */
    retain(resource) {
        if (!resource) return;
        if (resource.isGeometry || resource.isBufferGeometry) {
            this._incrementRef(this.geometries, resource);
        } else if (resource.isMaterial) {
            this._incrementRef(this.materials, resource);
        } else if (resource.isTexture) {
            this._incrementRef(this.textures, resource);
        }
    }

    _incrementRef(map, resource) {
        for (const [key, entry] of map.entries()) {
            if (entry.resource === resource) {
                entry.refCount++;
                return;
            }
        }
        // Si no estaba en el mapa, registrar con refCount 1
        const id = resource.uuid || Math.random().toString(36).substr(2, 9);
        map.set(id, { resource, refCount: 1 });
    }

    /**
     * Libera de forma segura una geometría si no tiene más referencias ni es persistente.
     */
    releaseGeometry(geom) {
        if (!geom || this.persistentResources.has(geom)) return;
        for (const [key, entry] of this.geometries.entries()) {
            if (entry.resource === geom) {
                entry.refCount--;
                if (entry.refCount <= 0) {
                    geom.dispose();
                    this.geometries.delete(key);
                }
                return;
            }
        }
        // Si no está registrado en el mapa, liberarlo directamente
        geom.dispose();
    }

    /**
     * Libera de forma segura un material (y sus mapas de textura asociados si aplica).
     */
    releaseMaterial(mat) {
        if (!mat || this.persistentResources.has(mat)) return;
        for (const [key, entry] of this.materials.entries()) {
            if (entry.resource === mat) {
                entry.refCount--;
                if (entry.refCount <= 0) {
                    this._disposeMaterialInternal(mat);
                    this.materials.delete(key);
                }
                return;
            }
        }
        this._disposeMaterialInternal(mat);
    }

    _disposeMaterialInternal(mat) {
        if (!mat) return;
        // Liberar texturas vinculadas que no sean persistentes
        ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'alphaMap'].forEach(slot => {
            const tex = mat[slot];
            if (tex && !this.persistentResources.has(tex)) {
                tex.dispose();
            }
        });
        mat.dispose();
    }

    /**
     * Limpia y destruye completamente una jerarquía de Object3D (malla, grupo, hijos).
     * Respeta recursos compartidos y persistentes.
     */
    disposeHierarchy(rootObject) {
        if (!rootObject) return;

        rootObject.traverse(child => {
            // 1. Geometrías
            if (child.geometry) {
                this.releaseGeometry(child.geometry);
            }

            // 2. Materiales
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => this.releaseMaterial(m));
                } else {
                    this.releaseMaterial(child.material);
                }
            }

            // 3. Luces con shadow maps
            if (child.isLight && child.shadow && child.shadow.map) {
                child.shadow.map.dispose();
            }
        });

        // Limpiar hijos sin romper índices
        while (rootObject.children && rootObject.children.length > 0) {
            const child = rootObject.children[rootObject.children.length - 1];
            rootObject.remove(child);
        }
    }

    /**
     * Estadísticas actuales de recursos en memoria.
     */
    getStats() {
        return {
            cachedGeometries: this.geometries.size,
            cachedMaterials: this.materials.size,
            cachedTextures: this.textures.size,
            persistentCount: this.persistentResources.size
        };
    }
}

export const resourceManager = new ResourceManager();
