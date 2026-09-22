// js/weapons.js - Catálogo de Armas, Estadísticas y Generador de Mallas 3D
import * as THREE from 'three';

export const WEAPONS = {
    bokken: {
        id: 'bokken',
        name: 'Espada de Madera (Bokken)',
        cost: 0,
        damage: 16,
        attackSpeed: 0.26,
        range: 2.2,
        type: 'melee',
        element: 'wood',
        desc: 'Espada ligera ideal para comenzar el entrenamiento ninja.',
        icon: '🪵',
        color: 0xc8963e,
        glowColor: null
    },
    steel_katana: {
        id: 'steel_katana',
        name: 'Katana Ninja de Acero',
        cost: 80,
        damage: 30,
        attackSpeed: 0.22,
        range: 2.5,
        type: 'melee',
        element: 'steel',
        desc: 'Filo forjado en acero templado. Cortes limpios y rápidos.',
        icon: '⚔️',
        color: 0xe0e6ed,
        glowColor: 0x90b0e0
    },
    shurikens: {
        id: 'shurikens',
        name: 'Estrellas Ninja (Shurikens)',
        cost: 150,
        damage: 24,
        attackSpeed: 0.32,
        range: 22.0,
        type: 'ranged',
        element: 'ninja',
        desc: '¡Lanza estrellas afiladas a larga distancia contra los enemigos!',
        icon: '⭐',
        color: 0x4a5568,
        glowColor: 0x81e6d9
    },
    fire_katana: {
        id: 'fire_katana',
        name: 'Hoja del Dragón de Fuego',
        cost: 300,
        damage: 50,
        attackSpeed: 0.20,
        range: 2.8,
        type: 'melee',
        element: 'fire',
        desc: '¡Quema a los enemigos con una estela de fuego ardiente!',
        icon: '🔥',
        color: 0xff4500,
        glowColor: 0xff7700
    },
    thunder_blade: {
        id: 'thunder_blade',
        name: 'Katana del Rayo Celestial',
        cost: 600,
        damage: 75,
        attackSpeed: 0.18,
        range: 3.0,
        type: 'melee',
        element: 'thunder',
        desc: '¡Cargas eléctricas de alta velocidad que sacuden al oponente!',
        icon: '⚡',
        color: 0x00f5ff,
        glowColor: 0x38bdf8
    },
    gold_dragon: {
        id: 'gold_dragon',
        name: 'Espada Mítica del Maestro Dorado',
        cost: 1200,
        damage: 120,
        attackSpeed: 0.16,
        range: 3.5,
        type: 'melee',
        element: 'gold',
        desc: '¡El arma definitiva! Aura celestial dorada y daño colosal.',
        icon: '👑',
        color: 0xffd700,
        glowColor: 0xfff066
    }
};

/**
 * Crea la representación geométrica 3D del arma estilo Roblox
 */
export function createWeaponMesh(weaponId) {
    const data = WEAPONS[weaponId] || WEAPONS.bokken;
    const group = new THREE.Group();
    group.name = `weapon_${weaponId}`;

    if (data.type === 'ranged') {
        // Modelo 3D de Shuriken
        const starGroup = new THREE.Group();
        const bladeMat = new THREE.MeshStandardMaterial({
            color: 0x2d3748,
            metalness: 0.8,
            roughness: 0.3
        });
        const centerMat = new THREE.MeshStandardMaterial({
            color: 0x81e6d9,
            emissive: 0x319795,
            emissiveIntensity: 0.6
        });

        // 4 aspas triangulares
        for (let i = 0; i < 4; i++) {
            const bladeGeom = new THREE.ConeGeometry(0.12, 0.45, 3);
            const blade = new THREE.Mesh(bladeGeom, bladeMat);
            blade.rotation.z = (Math.PI / 2) * i;
            blade.position.x = Math.cos((Math.PI / 2) * i) * 0.22;
            blade.position.y = Math.sin((Math.PI / 2) * i) * 0.22;
            starGroup.add(blade);
        }

        // Núcleo central con agujero ninja
        const centerRing = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.04, 8, 16), centerMat);
        starGroup.add(centerRing);

        starGroup.scale.set(1.2, 1.2, 1.2);
        group.add(starGroup);
        return group;
    }

    // Modelo de Espada / Katana
    const handleMat = new THREE.MeshStandardMaterial({
        color: data.element === 'wood' ? 0x8b5a2b : 0x1a202c,
        roughness: 0.7
    });

    const guardMat = new THREE.MeshStandardMaterial({
        color: data.element === 'gold' ? 0xffcc00 : (data.element === 'wood' ? 0x5c3a21 : 0xd69e2e),
        metalness: data.element === 'wood' ? 0.1 : 0.8,
        roughness: 0.3
    });

    let bladeMat;
    if (data.element === 'fire') {
        bladeMat = new THREE.MeshStandardMaterial({
            color: 0xff3b10,
            emissive: 0xff4500,
            emissiveIntensity: 0.7,
            roughness: 0.2,
            metalness: 0.5
        });
    } else if (data.element === 'thunder') {
        bladeMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x0284c7,
            emissiveIntensity: 0.8,
            roughness: 0.1,
            metalness: 0.7
        });
    } else if (data.element === 'gold') {
        bladeMat = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            emissive: 0xf59e0b,
            emissiveIntensity: 0.6,
            roughness: 0.2,
            metalness: 0.9
        });
    } else if (data.element === 'wood') {
        bladeMat = new THREE.MeshStandardMaterial({
            color: 0xdeb887,
            roughness: 0.9,
            metalness: 0.0
        });
    } else {
        // Acero
        bladeMat = new THREE.MeshStandardMaterial({
            color: 0xf1f5f9,
            metalness: 0.85,
            roughness: 0.25
        });
    }

    // Mango (Tsuka)
    const handleGeom = new THREE.CylinderGeometry(0.045, 0.045, 0.45, 8);
    const handle = new THREE.Mesh(handleGeom, handleMat);
    handle.position.y = -0.25;
    group.add(handle);

    // Pomo final
    const pommelGeom = new THREE.SphereGeometry(0.065, 8, 8);
    const pommel = new THREE.Mesh(pommelGeom, guardMat);
    pommel.position.y = -0.48;
    group.add(pommel);

    // Tsuba (Guardamano circular)
    const tsubaGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.035, 12);
    const tsuba = new THREE.Mesh(tsubaGeom, guardMat);
    tsuba.position.y = 0.0;
    group.add(tsuba);

    // Hoja estilizada (Roblox blocky / bevel)
    const bladeGeom = new THREE.BoxGeometry(0.06, 1.25, 0.12);
    const blade = new THREE.Mesh(bladeGeom, bladeMat);
    blade.position.y = 0.65;
    blade.castShadow = true;
    group.add(blade);

    // Punta en ángulo
    const tipGeom = new THREE.ConeGeometry(0.075, 0.25, 4);
    const tip = new THREE.Mesh(tipGeom, bladeMat);
    tip.position.y = 1.35;
    tip.rotation.y = Math.PI / 4;
    group.add(tip);

    // Si tiene luz mística (Fuego, Trueno, Oro)
    if (data.glowColor) {
        const light = new THREE.PointLight(data.glowColor, 1.2, 3.5);
        light.position.y = 0.8;
        group.add(light);
    }

    return group;
}
