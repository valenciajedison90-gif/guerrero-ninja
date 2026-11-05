// js/core/objectPool.js - Sistema de Pooling de Objetos para Cero Garbage Collection y 60 FPS
import * as THREE from 'three';

export class ObjectPool {
    constructor(factory, initialSize = 10, maxSize = 60) {
        this.factory = factory;
        this.maxSize = maxSize;
        this.pool = [];
        this.active = new Set();

        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.factory());
        }
    }

    acquire() {
        let item;
        if (this.pool.length > 0) {
            item = this.pool.pop();
        } else {
            item = this.factory();
        }
        this.active.add(item);
        if (item.onAcquire) item.onAcquire();
        return item;
    }

    release(item) {
        if (!this.active.has(item)) return;
        this.active.delete(item);
        if (item.onRelease) item.onRelease();

        if (this.pool.length < this.maxSize) {
            this.pool.push(item);
        } else if (item.dispose) {
            item.dispose();
        }
    }

    releaseAll() {
        for (const item of this.active) {
            if (item.onRelease) item.onRelease();
            if (this.pool.length < this.maxSize) {
                this.pool.push(item);
            } else if (item.dispose) {
                item.dispose();
            }
        }
        this.active.clear();
    }

    clear() {
        this.releaseAll();
        while (this.pool.length > 0) {
            const item = this.pool.pop();
            if (item.dispose) item.dispose();
        }
    }

    getStats() {
        return {
            available: this.pool.length,
            active: this.active.size,
            total: this.pool.length + this.active.size
        };
    }
}

/**
 * Pool de Vectores Matemáticos Temporales
 * Evita instanciar 'new THREE.Vector3()' en bucles calientes de física y combate.
 */
class VectorPool {
    constructor(size = 32) {
        this.pool = [];
        for (let i = 0; i < size; i++) {
            this.pool.push(new THREE.Vector3());
        }
    }

    get(x = 0, y = 0, z = 0) {
        const v = this.pool.length > 0 ? this.pool.pop() : new THREE.Vector3();
        v.set(x, y, z);
        return v;
    }

    release(v) {
        if (v && this.pool.length < 64) {
            this.pool.push(v);
        }
    }
}

export const vectorPool = new VectorPool();
