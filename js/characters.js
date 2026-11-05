// js/characters.js - Sistema de Personajes de Fauna Colombiana: NINJA COLOMBIA ARENA
// Modelado 3D Estilizado de Alta Fidelidad con Texturas Procedurales HD y Siluetas Orgánicas
import * as THREE from 'three';
import { textureGen } from './core/textureGenerator.js?v=20.1';

export const CHARACTERS_DATA = {
    chucho: {
        id: 'chucho',
        name: 'Chucho',
        animalName: 'Oso de Anteojos',
        title: 'Guardián de los Andes',
        role: 'Equilibrio & Fuerza',
        desc: 'Noble, fuerte y protector de la cordillera. Con su mítico pelaje oscuro y bandana tricolor, lidera la resistencia contra El Invernal.',
        icon: '🐻',
        themeColor: 0x1e293b,
        accentColor: 0xdc2626,
        stats: {
            health: 200,
            speed: 10.5,
            damage: 26,
            defense: 85,
            jumpForce: 13.5
        },
        skill: {
            id: 'andean_roar',
            name: 'Rugido Andino',
            icon: '📢',
            cooldown: 7.0,
            desc: 'Libera una potente onda sísmica sónica que empuja a todos los enemigos y rompe todas las cajas a 7 metros.'
        }
    },

    yari: {
        id: 'yari',
        name: 'Yarí',
        animalName: 'Tigrillo Colombiano',
        title: 'Sombra del Amazonas',
        role: 'Velocidad & Agilidad',
        desc: 'Ágil cazadora felina de reflejos incomparables. Usa sus visores morados para rastrear enemigos y atacar a la velocidad del rayo.',
        icon: '🐆',
        themeColor: 0xf59e0b,
        accentColor: 0x8b5cf6,
        stats: {
            health: 170,
            speed: 13.2,
            damage: 24,
            defense: 70,
            jumpForce: 14.5
        },
        skill: {
            id: 'lightning_claw',
            name: 'Garra Relámpago',
            icon: '⚡',
            cooldown: 5.5,
            desc: 'Sprint instantáneo hacia adelante con estela dorada que atraviesa enemigos infligiendo daño crítico.'
        }
    },

    guaca: {
        id: 'guaca',
        name: 'Guaca',
        animalName: 'Guacamaya Escarlata',
        title: 'As de los Cielos Tropicales',
        role: 'Movilidad Aérea',
        desc: 'Acróbata aérea con plumaje tricolor y auriculares de piloto. Domina el cielo y planea sobre los obstáculos más difíciles.',
        icon: '🦜',
        themeColor: 0xef4444,
        accentColor: 0x0284c7,
        stats: {
            health: 160,
            speed: 11.5,
            damage: 22,
            defense: 65,
            jumpForce: 16.5
        },
        skill: {
            id: 'jungle_glide',
            name: 'Planeo de Selva',
            icon: '🪶',
            cooldown: 6.0,
            desc: 'Se eleva con un torbellino de plumas y planea flotando en el aire durante 3 segundos con velocidad aumentada.'
        }
    },

    capibu: {
        id: 'capibu',
        name: 'Capibú',
        animalName: 'Chigüiro / Capibara',
        title: 'Coloso de los Llanos',
        role: 'Resistencia & Tanque',
        desc: 'El guerrero más carismático y resistente. Su calma zen y su armadura de barro absorben los impactos más feroces.',
        icon: '🦫',
        themeColor: 0x78350f,
        accentColor: 0x0284c7,
        stats: {
            health: 260,
            speed: 9.2,
            damage: 30,
            defense: 100,
            jumpForce: 12.0
        },
        skill: {
            id: 'mud_shield',
            name: 'Escudo de Lodo',
            icon: '🛡️',
            cooldown: 8.5,
            desc: 'Activa una coraza de lodo endurecido que reduce el daño 60% y repele a los atacantes cercanos con una embestida.'
        }
    },

    ranaik: {
        id: 'ranaik',
        name: 'Ranaik',
        animalName: 'Rana Dorada del Chocó',
        title: 'Espíritu de la Llovizna',
        role: 'Agilidad & Veneno Sagrado',
        desc: 'Mística guardiana de piel dorada radiante. Sus saltos elásticos cubren enormes distancias y deja charcos ralentizantes.',
        icon: '🐸',
        themeColor: 0xfacc15,
        accentColor: 0x06b6d4,
        stats: {
            health: 155,
            speed: 12.5,
            damage: 28,
            defense: 60,
            jumpForce: 17.5
        },
        skill: {
            id: 'toxic_hop',
            name: 'Salto Sagrado',
            icon: '✨',
            cooldown: 6.0,
            desc: 'Gran salto parabólico que libera una nube luminosa que ralentiza y aturde a los enemigos en el área de impacto.'
        }
    },

    el_invernal: {
        id: 'el_invernal',
        name: 'El Invernal',
        animalName: 'Pantera de Escarcha',
        title: 'Traficante de Sombras',
        role: 'Villano Supremo',
        desc: 'Jefe despiadado que busca congelar la biodiversidad andina con tecnología de frío y katanas de hielo corrupto.',
        icon: '❄️',
        themeColor: 0x312e81,
        accentColor: 0x818cf8,
        stats: {
            health: 550,
            speed: 8.5,
            damage: 22,
            defense: 90,
            jumpForce: 13.0
        },
        skill: {
            id: 'frost_nova',
            name: 'Ventisca Corrupta',
            icon: '🧊',
            cooldown: 9.0,
            desc: 'Onda glacial de frío que congela el suelo y lanza agujas de hielo afiladas.'
        }
    }
};

// =============================================================================
// CONSTRUCTOR 3D PROCEDURAL DE ALTA FIDELIDAD: NINJA COLOMBIA
// =============================================================================
export class AnimalCharacterBuilder {
    static build(characterId = 'chucho', skinId = 'default') {
        const charData = CHARACTERS_DATA[characterId] || CHARACTERS_DATA.chucho;
        const root = new THREE.Group();
        root.name = `character_${charData.id}`;

        // 1. Contenedores estándar para cinemática articular y locomoción fluida
        const torso = new THREE.Group();
        torso.position.y = 1.35;
        root.add(torso);

        const head = new THREE.Group();
        head.position.y = 0.65;
        torso.add(head);

        // Extremidades y pivotes articulares
        const leftArmPivot = new THREE.Group();
        leftArmPivot.position.set(-0.48, 0.35, 0);
        torso.add(leftArmPivot);

        const leftElbowPivot = new THREE.Group();
        leftElbowPivot.position.set(0, -0.38, 0);
        leftArmPivot.add(leftElbowPivot);

        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(0.48, 0.35, 0);
        torso.add(rightArmPivot);

        const rightElbowPivot = new THREE.Group();
        rightElbowPivot.position.set(0, -0.38, 0);
        rightArmPivot.add(rightElbowPivot);

        const leftLegPivot = new THREE.Group();
        leftLegPivot.position.set(-0.24, -0.45, 0);
        torso.add(leftLegPivot);

        const leftKneePivot = new THREE.Group();
        leftKneePivot.position.set(0, -0.40, 0);
        leftLegPivot.add(leftKneePivot);

        const rightLegPivot = new THREE.Group();
        rightLegPivot.position.set(0.24, -0.45, 0);
        torso.add(rightLegPivot);

        const rightKneePivot = new THREE.Group();
        rightKneePivot.position.set(0, -0.40, 0);
        rightLegPivot.add(rightKneePivot);

        // Porta-armas en la mano derecha
        const weaponHolder = new THREE.Group();
        weaponHolder.position.set(0, -0.40, 0.25);
        rightElbowPivot.add(weaponHolder);

        // Materiales base compartidos
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.85, roughness: 0.25 });
        const pawPadMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.7 });
        const clawMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.3, metalness: 0.4 });
        const ribbonMat = new THREE.MeshStandardMaterial({ color: charData.accentColor || 0xdc2626, roughness: 0.35 });

        // Cintas traseras ondeantes de la cinta ninja en la cabeza (animadas por Player)
        const tail1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.72, 0.02), ribbonMat);
        tail1.position.set(-0.10, 0.12, -0.42);
        tail1.rotation.x = 0.38;
        head.add(tail1);

        const tail2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.60, 0.02), ribbonMat);
        tail2.position.set(0.10, 0.16, -0.42);
        tail2.rotation.x = 0.48;
        head.add(tail2);

        // =====================================================================
        // ESPECIALIZACIÓN VISUAL POR HÉROE DE COLOMBIA
        // =====================================================================
        switch (charData.id) {
            case 'guaca': {
                // 🦜 GUACA: GUACAMAYA ESCARLATA (ARA MACAO) - HÉROE VOLADOR CARTOON 3D
                const featherTex = textureGen.getFeatherTexture('#dc2626', '#2563eb', '#facc15');
                const redFeatherMat = new THREE.MeshStandardMaterial({
                    color: 0xdc2626,
                    roughness: 0.45,
                    map: featherTex
                });
                const yellowFeatherMat = new THREE.MeshStandardMaterial({
                    color: 0xfacc15,
                    roughness: 0.45,
                    metalness: 0.05
                });
                const blueFeatherMat = new THREE.MeshStandardMaterial({
                    color: 0x1d4ed8,
                    roughness: 0.45,
                    metalness: 0.1
                });
                const ivoryBeakMat = new THREE.MeshStandardMaterial({
                    color: 0xfef3c7,
                    roughness: 0.35,
                    metalness: 0.15
                });
                const darkBeakMat = new THREE.MeshStandardMaterial({
                    color: 0x18181b,
                    roughness: 0.4,
                    metalness: 0.2
                });
                const ninjaBeltMat = new THREE.MeshStandardMaterial({
                    color: 0x059669,
                    roughness: 0.4
                });

                // 1. Torso aerodinámico de ave: Pecho atlético en quilla
                const chestGeom = new THREE.SphereGeometry(0.44, 24, 20);
                chestGeom.scale(1.02, 1.15, 0.95);
                const chestMesh = new THREE.Mesh(chestGeom, redFeatherMat);
                chestMesh.position.set(0, 0.15, 0);
                torso.add(chestMesh);

                // Pecho dorado interior (plumaje ventral radiante)
                const bellyGeom = new THREE.SphereGeometry(0.34, 20, 16);
                bellyGeom.scale(0.96, 0.98, 0.45);
                const bellyMesh = new THREE.Mesh(bellyGeom, yellowFeatherMat);
                bellyMesh.position.set(0, 0.08, 0.30);
                torso.add(bellyMesh);

                // Cinturón ninja de tela esmeralda con hebilla solar Quimbaya
                const belt = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.07, 16, 28), ninjaBeltMat);
                belt.rotation.x = Math.PI / 2;
                belt.position.set(0, -0.32, 0);
                torso.add(belt);

                const sunBuckle = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.04, 18), goldMat);
                sunBuckle.rotation.x = Math.PI / 2;
                sunBuckle.position.set(0, -0.32, 0.38);
                torso.add(sunBuckle);

                // Estuche porta-shuriken lateral de cuero en el cinturón
                const shurikenPouch = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.10), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 }));
                shurikenPouch.position.set(0.38, -0.32, 0.12);
                torso.add(shurikenPouch);

                // Cola majestuosa de guacamaya en 3 capas ondeantes
                const tailGroup = new THREE.Group();
                tailGroup.position.set(0, -0.35, -0.22);
                tailGroup.rotation.x = -0.45;

                // Pluma espina central larga escarlata (1.1m)
                const centerTailGeom = new THREE.ConeGeometry(0.14, 1.1, 6);
                centerTailGeom.scale(0.25, 1.0, 1.0);
                centerTailGeom.translate(0, -0.55, 0);
                const centerTail = new THREE.Mesh(centerTailGeom, redFeatherMat);
                tailGroup.add(centerTail);

                // Plumas laterales azul cobalto con puntas doradas
                [-0.12, 0.12].forEach(tx => {
                    const sideTailGeom = new THREE.ConeGeometry(0.11, 0.85, 6);
                    sideTailGeom.scale(0.25, 1.0, 0.9);
                    sideTailGeom.translate(0, -0.42, 0);
                    const sideTail = new THREE.Mesh(sideTailGeom, blueFeatherMat);
                    sideTail.position.set(tx, 0.08, 0.04);
                    sideTail.rotation.z = (tx < 0 ? 0.22 : -0.22);
                    tailGroup.add(sideTail);
                });
                torso.add(tailGroup);

                // 2. Cabeza de Guacamaya Escarlata esculpida
                const headGeom = new THREE.SphereGeometry(0.42, 24, 20);
                headGeom.scale(1.04, 1.0, 1.06);
                const birdHead = new THREE.Mesh(headGeom, redFeatherMat);
                head.add(birdHead);

                // Cresta de plumas en la coronilla (3 plumas estilizadas hacia atrás)
                const crestCenter = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.34, 6), redFeatherMat);
                crestCenter.rotation.x = -0.65;
                crestCenter.position.set(0, 0.46, -0.15);
                head.add(crestCenter);

                [-0.10, 0.10].forEach(cx => {
                    const sideCrest = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.28, 6), yellowFeatherMat);
                    sideCrest.rotation.x = -0.55;
                    sideCrest.rotation.z = (cx < 0 ? -0.25 : 0.25);
                    sideCrest.position.set(cx, 0.44, -0.12);
                    head.add(sideCrest);
                });

                // Máscara facial blanca curva (piel desnuda icónica de la guacamaya)
                const eyeMat = new THREE.MeshStandardMaterial({
                    map: textureGen.getEyeTexture('#f59e0b'),
                    roughness: 0.15
                });
                const whiteFaceMat = new THREE.MeshStandardMaterial({
                    color: 0xfafaf9,
                    roughness: 0.7
                });

                [-0.16, 0.16].forEach(ex => {
                    // Parche facial blanco curvado con grabados sutiles
                    const facePatchGeom = new THREE.SphereGeometry(0.18, 16, 14);
                    facePatchGeom.scale(0.65, 1.15, 0.45);
                    const facePatch = new THREE.Mesh(facePatchGeom, whiteFaceMat);
                    facePatch.position.set(ex, 0.08, 0.32);
                    facePatch.rotation.y = (ex < 0 ? -0.25 : 0.25);
                    head.add(facePatch);

                    // Ojo anime grande y brillante con pupila y destellos
                    const eyeSphere = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 16), eyeMat);
                    eyeSphere.rotation.y = (ex < 0 ? -0.3 : 0.3);
                    eyeSphere.position.set(ex, 0.09, 0.42);
                    head.add(eyeSphere);
                });

                // Pico curvado hacia abajo (Pico superior de marfil/hueso con cera nasal)
                const beakGroup = new THREE.Group();
                beakGroup.position.set(0, -0.02, 0.44);

                // Cera nasal (base del pico)
                const cere = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 12), darkBeakMat);
                cere.scale.set(1.2, 0.5, 0.8);
                cere.position.set(0, 0.07, -0.04);
                beakGroup.add(cere);

                // Gancho superior curvado
                const upperBeakGeom = new THREE.ConeGeometry(0.16, 0.42, 16);
                upperBeakGeom.scale(0.85, 1.0, 1.25);
                upperBeakGeom.translate(0, -0.18, 0.06);
                const upperBeak = new THREE.Mesh(upperBeakGeom, ivoryBeakMat);
                upperBeak.rotation.x = Math.PI * 0.62;
                beakGroup.add(upperBeak);

                // Punta afilada oscura del pico
                const beakTipGeom = new THREE.ConeGeometry(0.08, 0.18, 14);
                beakTipGeom.translate(0, -0.08, 0.02);
                const beakTip = new THREE.Mesh(beakTipGeom, darkBeakMat);
                beakTip.rotation.x = Math.PI * 0.68;
                beakTip.position.set(0, -0.20, 0.20);
                beakGroup.add(beakTip);

                // Mandíbula inferior corta y ancha
                const lowerBeakGeom = new THREE.ConeGeometry(0.12, 0.22, 14);
                lowerBeakGeom.scale(0.9, 0.8, 1.1);
                const lowerBeak = new THREE.Mesh(lowerBeakGeom, darkBeakMat);
                lowerBeak.rotation.x = Math.PI * 0.42;
                lowerBeak.position.set(0, -0.16, -0.02);
                beakGroup.add(lowerBeak);

                head.add(beakGroup);

                // Cinta ninja frontal con insignia dorada
                const headband = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.055, 16, 28), ninjaBeltMat);
                headband.rotation.x = Math.PI / 2;
                headband.position.set(0, 0.22, 0);
                head.add(headband);

                const headMedallion = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), goldMat);
                headMedallion.position.set(0, 0.23, 0.44);
                head.add(headMedallion);

                // 3. Alas de Guacamaya y Patas de Rapaz
                AnimalCharacterBuilder.buildBirdWings(redFeatherMat, blueFeatherMat, yellowFeatherMat, leftArmPivot, leftElbowPivot, rightArmPivot, rightElbowPivot);
                AnimalCharacterBuilder.buildBirdLegs(redFeatherMat, darkBeakMat, clawMat, goldMat, leftLegPivot, leftKneePivot, rightLegPivot, rightKneePivot);
                break;
            }

            case 'chucho': {
                // 🐻 CHUCHO: OSO DE ANTEOJOS (TREMARCTOS ORNATUS)
                const furTex = textureGen.getFurTexture('#292524', '#44403c');
                const darkFurMat = new THREE.MeshStandardMaterial({
                    color: 0x292524,
                    roughness: 0.65,
                    map: furTex
                });
                const creamMarkMat = new THREE.MeshStandardMaterial({
                    color: 0xfef08a,
                    roughness: 0.55
                });
                const redSashMat = new THREE.MeshStandardMaterial({
                    color: 0xdc2626,
                    roughness: 0.40
                });

                // Vientre imponente y protector de oso
                const belly = new THREE.Mesh(new THREE.SphereGeometry(0.54, 24, 20), darkFurMat);
                belly.scale.set(1.08, 0.96, 1.05);
                belly.position.set(0, -0.12, 0.02);
                torso.add(belly);

                const chest = new THREE.Mesh(new THREE.SphereGeometry(0.50, 24, 20), darkFurMat);
                chest.scale.set(1.04, 0.94, 0.98);
                chest.position.set(0, 0.22, 0);
                torso.add(chest);

                // Mancha natural en forma de medialuna crema en el pecho
                const chestPatch = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 16), creamMarkMat);
                chestPatch.scale.set(1.02, 0.82, 0.35);
                chestPatch.position.set(0, 0.20, 0.36);
                torso.add(chestPatch);

                // Arnés de cuero cruzado con remaches de bronce
                const harnessMat = new THREE.MeshStandardMaterial({ color: 0x573618, roughness: 0.6 });
                const strap1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.95, 0.04), harnessMat);
                strap1.rotation.z = 0.55;
                strap1.position.set(0, 0.12, 0.44);
                torso.add(strap1);

                // Cinturón rojo andino con hebilla de huella dorada
                const belt = new THREE.Mesh(new THREE.TorusGeometry(0.50, 0.08, 16, 28), redSashMat);
                belt.rotation.x = Math.PI / 2;
                belt.position.set(0, -0.32, 0);
                torso.add(belt);

                const buckle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 18), goldMat);
                buckle.rotation.x = Math.PI / 2;
                buckle.position.set(0, -0.32, 0.50);
                torso.add(buckle);

                // Cabeza de oso redonda y adorable
                const bearHead = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 20), darkFurMat);
                bearHead.scale.set(1.12, 1.02, 1.06);
                head.add(bearHead);

                // Orejas esponjosas con interior crema
                [-0.36, 0.36].forEach(ox => {
                    const earOuter = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 16), darkFurMat);
                    earOuter.position.set(ox, 0.44, 0);
                    head.add(earOuter);

                    const earInner = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), creamMarkMat);
                    earInner.position.set(ox, 0.44, 0.08);
                    head.add(earInner);
                });

                // Hocico crema redondeado
                const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 18), creamMarkMat);
                muzzle.scale.set(1.18, 0.88, 1.12);
                muzzle.position.set(0, -0.10, 0.40);
                head.add(muzzle);

                const nose = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 14), pawPadMat);
                nose.scale.set(1.3, 0.8, 0.9);
                nose.position.set(0, -0.02, 0.58);
                head.add(nose);

                // Ojos expresivos con los icónicos anteojos
                const eyeMat = new THREE.MeshStandardMaterial({
                    map: textureGen.getEyeTexture('#d97706'),
                    roughness: 0.2
                });
                [-0.17, 0.17].forEach(ex => {
                    const spectacleRing = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.04, 14, 20), creamMarkMat);
                    spectacleRing.position.set(ex, 0.12, 0.46);
                    head.add(spectacleRing);

                    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 14), eyeMat);
                    eye.position.set(ex, 0.12, 0.48);
                    head.add(eye);
                });

                // Cinta tricolor colombiana en la frente
                const band = new THREE.Mesh(new THREE.TorusGeometry(0.50, 0.07, 16, 28), redSashMat);
                band.rotation.x = Math.PI / 2;
                band.position.set(0, 0.30, 0);
                head.add(band);

                const flagY = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.02), goldMat);
                flagY.position.set(0, 0.35, 0.50);
                head.add(flagY);

                AnimalCharacterBuilder.buildAnimalLimbs(darkFurMat, pawPadMat, clawMat, leftArmPivot, leftElbowPivot, rightArmPivot, rightElbowPivot, leftLegPivot, leftKneePivot, rightLegPivot, rightKneePivot);
                break;
            }

            case 'yari': {
                // 🐆 YARÍ: TIGRILLO COLOMBIANO / JAGUAR
                const jagTex = textureGen.getJaguarTexture('#d97706', '#1c1917', '#b45309');
                const jaguarMat = new THREE.MeshStandardMaterial({
                    color: 0xd97706,
                    roughness: 0.55,
                    map: jagTex
                });
                const creamMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 });
                const purpleBeltMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.4 });

                const belly = new THREE.Mesh(new THREE.SphereGeometry(0.40, 20, 16), jaguarMat);
                belly.scale.set(1.0, 0.95, 1.0);
                belly.position.set(0, -0.15, 0.02);
                torso.add(belly);

                const chest = new THREE.Mesh(new THREE.SphereGeometry(0.40, 20, 16), jaguarMat);
                chest.scale.set(1.0, 0.95, 0.96);
                chest.position.set(0, 0.18, 0);
                torso.add(chest);

                const chestWhite = new THREE.Mesh(new THREE.SphereGeometry(0.30, 16, 14), creamMat);
                chestWhite.scale.set(0.9, 0.8, 0.3);
                chestWhite.position.set(0, 0.16, 0.32);
                torso.add(chestWhite);

                // Cinturón ninja morado con hebilla dorada
                const belt = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.065, 16, 24), purpleBeltMat);
                belt.rotation.x = Math.PI / 2;
                belt.position.set(0, -0.32, 0);
                torso.add(belt);

                const buckle = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.03, 16), goldMat);
                buckle.rotation.x = Math.PI / 2;
                buckle.position.set(0, -0.32, 0.38);
                torso.add(buckle);

                // Cola larga y sinuosa de felino con anillos oscuros
                const tailGroup = new THREE.Group();
                tailGroup.position.set(0, -0.32, -0.22);
                const tail1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.42, 12), jaguarMat);
                tail1.rotation.x = -Math.PI / 4;
                tail1.position.set(0, 0.15, -0.16);
                tailGroup.add(tail1);

                const tail2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.40, 12), jaguarMat);
                tail2.position.set(0, 0.38, -0.28);
                tail2.rotation.x = -0.2;
                tailGroup.add(tail2);
                torso.add(tailGroup);

                // Cabeza felina estilizada con orejas puntiagudas
                const catHead = new THREE.Mesh(new THREE.SphereGeometry(0.44, 24, 20), jaguarMat);
                catHead.scale.set(1.08, 0.98, 1.05);
                head.add(catHead);

                [-0.26, 0.26].forEach(ex => {
                    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.30, 16), jaguarMat);
                    ear.position.set(ex, 0.44, 0);
                    ear.rotation.z = (ex > 0 ? -0.25 : 0.25);
                    head.add(ear);

                    const earInner = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 14), creamMat);
                    earInner.position.set(ex, 0.44, 0.04);
                    head.add(earInner);
                });

                // Ojos de felino verde esmeralda con pupila vertical
                const catEyeMat = new THREE.MeshStandardMaterial({
                    map: textureGen.getEyeTexture('#10b981', true),
                    roughness: 0.15
                });
                [-0.15, 0.15].forEach(ex => {
                    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 14), catEyeMat);
                    eye.position.set(ex, 0.09, 0.40);
                    head.add(eye);
                });

                // Hocico felino y nariz rosada
                const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 14), creamMat);
                muzzle.scale.set(1.2, 0.8, 1.0);
                muzzle.position.set(0, -0.06, 0.38);
                head.add(muzzle);

                const nose = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.06, 12), new THREE.MeshBasicMaterial({ color: 0xf472b6 }));
                nose.rotation.x = Math.PI;
                nose.position.set(0, -0.02, 0.50);
                head.add(nose);

                AnimalCharacterBuilder.buildAnimalLimbs(jaguarMat, pawPadMat, clawMat, leftArmPivot, leftElbowPivot, rightArmPivot, rightElbowPivot, leftLegPivot, leftKneePivot, rightLegPivot, rightKneePivot);
                break;
            }

            case 'capibu': {
                // 🦫 CAPIBÚ: CHIGÜIRO / CAPIBARA ZEN DE LOS LLANOS
                const capyFurTex = textureGen.getFurTexture('#78350f', '#92400e');
                const capyFurMat = new THREE.MeshStandardMaterial({
                    color: 0x854d0e,
                    roughness: 0.80,
                    map: capyFurTex
                });
                const teethMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

                // Torso ancho y redondo
                const belly = new THREE.Mesh(new THREE.SphereGeometry(0.56, 24, 20), capyFurMat);
                belly.scale.set(1.12, 0.95, 1.08);
                belly.position.set(0, -0.12, 0.02);
                torso.add(belly);

                const chest = new THREE.Mesh(new THREE.SphereGeometry(0.50, 24, 20), capyFurMat);
                chest.scale.set(1.08, 0.92, 1.0);
                chest.position.set(0, 0.20, 0);
                torso.add(chest);

                // Mochila Arhuaca tejida con patrones geométricos precolombinos
                const arhuacaBag = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.16, 0.38, 16), new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.85 }));
                arhuacaBag.rotation.z = 0.35;
                arhuacaBag.position.set(0.30, 0.05, -0.28);
                torso.add(arhuacaBag);

                // Cabeza noble con hocico cuadrado característico de capibara
                const headGroup = new THREE.Group();
                const capyHead = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.48, 0.58), capyFurMat);
                headGroup.add(capyHead);

                // Sombrero vueltiao tradicional colombiano en la cabeza
                const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.03, 24), new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.7 }));
                hatBrim.position.set(0, 0.32, 0);
                hatBrim.rotation.x = -0.15;
                headGroup.add(hatBrim);

                const hatCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.22, 18), new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.6 }));
                hatCrown.position.set(0, 0.42, 0);
                hatCrown.rotation.x = -0.15;
                headGroup.add(hatCrown);

                // Hocico dulce y pacífico
                const snout = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.30, 0.32), new THREE.MeshStandardMaterial({ color: 0x663309, roughness: 0.8 }));
                snout.position.set(0, -0.06, 0.42);
                headGroup.add(snout);

                // Dientes de roedor
                const tooth1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.10, 0.02), teethMat);
                tooth1.position.set(-0.035, -0.22, 0.56);
                headGroup.add(tooth1);
                const tooth2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.10, 0.02), teethMat);
                tooth2.position.set(0.035, -0.22, 0.56);
                headGroup.add(tooth2);

                // Ojos tranquilos con destellos zen
                const capyEyeMat = new THREE.MeshStandardMaterial({ map: textureGen.getEyeTexture('#78350f'), roughness: 0.2 });
                [-0.24, 0.24].forEach(ex => {
                    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), capyEyeMat);
                    eye.position.set(ex, 0.12, 0.28);
                    headGroup.add(eye);
                });

                head.add(headGroup);

                AnimalCharacterBuilder.buildAnimalLimbs(capyFurMat, pawPadMat, clawMat, leftArmPivot, leftElbowPivot, rightArmPivot, rightElbowPivot, leftLegPivot, leftKneePivot, rightLegPivot, rightKneePivot);
                break;
            }

            case 'ranaik': {
                // 🐸 RANAIK: RANA DORADA VENENOSA DEL CHOCÓ (PHYLLOBATES TERRIBILIS)
                const frogSkinTex = textureGen.getFrogSkinTexture('#facc15', '#09090b');
                const frogGoldMat = new THREE.MeshStandardMaterial({
                    color: 0xfacc15,
                    roughness: 0.25,
                    metalness: 0.15,
                    map: frogSkinTex,
                    emissive: 0xd97706,
                    emissiveIntensity: 0.15
                });
                const frogBeltMat = new THREE.MeshStandardMaterial({ color: 0x0891b2, roughness: 0.35 });

                const belly = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 16), frogGoldMat);
                belly.scale.set(1.0, 0.92, 1.0);
                belly.position.set(0, -0.14, 0.02);
                torso.add(belly);

                const chest = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 16), frogGoldMat);
                chest.scale.set(1.0, 0.92, 0.96);
                chest.position.set(0, 0.18, 0);
                torso.add(chest);

                // Cinturón ninja turquesa
                const belt = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.065, 16, 24), frogBeltMat);
                belt.rotation.x = Math.PI / 2;
                belt.position.set(0, -0.32, 0);
                torso.add(belt);

                const buckle = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 16), goldMat);
                buckle.rotation.x = Math.PI / 2;
                buckle.position.set(0, -0.32, 0.36);
                torso.add(buckle);

                // Cabeza ancha y expresiva de rana
                const frogHead = new THREE.Mesh(new THREE.SphereGeometry(0.44, 24, 18), frogGoldMat);
                frogHead.scale.set(1.20, 0.82, 1.15);
                head.add(frogHead);

                // Ojos saltones gigantescos de anfibio con iris turquesa mística
                const frogEyeMat = new THREE.MeshStandardMaterial({ map: textureGen.getEyeTexture('#06b6d4'), roughness: 0.1 });
                [-0.24, 0.24].forEach(ex => {
                    const eyeBulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), frogGoldMat);
                    eyeBulb.position.set(ex, 0.26, 0.15);
                    head.add(eyeBulb);

                    const eyeIris = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), frogEyeMat);
                    eyeIris.position.set(ex, 0.28, 0.22);
                    head.add(eyeIris);
                });

                AnimalCharacterBuilder.buildFrogLimbs(frogGoldMat, leftArmPivot, leftElbowPivot, rightArmPivot, rightElbowPivot, leftLegPivot, leftKneePivot, rightLegPivot, rightKneePivot);
                break;
            }

            case 'el_invernal':
            default: {
                // ❄️ VILLANO SUPREMO: EL INVERNAL (PANTERA DE ESCARCHA)
                const darkMat = new THREE.MeshStandardMaterial({ color: 0x312e81, roughness: 0.55 });
                const iceMat = new THREE.MeshStandardMaterial({ color: 0x67e8f9, emissive: 0x0284c7, emissiveIntensity: 0.4, roughness: 0.2 });

                const chest = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 20), darkMat);
                chest.position.y = 0.15;
                torso.add(chest);

                const belly = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 20), iceMat);
                belly.position.y = -0.22;
                torso.add(belly);

                const headVillain = new THREE.Mesh(new THREE.SphereGeometry(0.46, 24, 20), darkMat);
                headVillain.scale.set(1.08, 0.98, 1.08);
                head.add(headVillain);

                AnimalCharacterBuilder.buildAnimalLimbs(darkMat, iceMat, goldMat, leftArmPivot, leftElbowPivot, rightArmPivot, rightElbowPivot, leftLegPivot, leftKneePivot, rightLegPivot, rightKneePivot);
                break;
            }
        }

        return {
            group: root,
            torso: torso,
            head: head,
            leftArmPivot: leftArmPivot,
            leftElbowPivot: leftElbowPivot,
            rightArmPivot: rightArmPivot,
            rightElbowPivot: rightElbowPivot,
            leftLegPivot: leftLegPivot,
            leftKneePivot: leftKneePivot,
            rightLegPivot: rightLegPivot,
            rightKneePivot: rightKneePivot,
            weaponHolder: weaponHolder,
            bandanaTail1: tail1,
            bandanaTail2: tail2
        };
    }

    // Extremidades de animales con pelaje y garras
    static buildAnimalLimbs(furMat, pawPadMat, clawMat, lArm, lElbow, rArm, rElbow, lLeg, lKnee, rLeg, rKnee) {
        [lArm, rArm].forEach(arm => {
            const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.38, 16), furMat);
            upper.position.y = -0.19;
            arm.add(upper);
        });

        [lElbow, rElbow].forEach(elbow => {
            const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.38, 16), furMat);
            forearm.position.y = -0.19;
            elbow.add(forearm);

            const handPaw = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 14), furMat);
            handPaw.position.set(0, -0.40, 0.06);
            handPaw.scale.set(1.0, 0.85, 1.15);
            elbow.add(handPaw);

            // Almohadilla palmar
            const palmPad = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), pawPadMat);
            palmPad.position.set(0, -0.44, 0.10);
            elbow.add(palmPad);
        });

        [lLeg, rLeg].forEach(leg => {
            const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.16, 0.40, 16), furMat);
            thigh.position.y = -0.20;
            leg.add(thigh);
        });

        [lKnee, rKnee].forEach(knee => {
            const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.40, 16), furMat);
            shin.position.y = -0.20;
            knee.add(shin);

            const footPaw = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 14), furMat);
            footPaw.position.set(0, -0.40, 0.10);
            footPaw.scale.set(1.1, 0.75, 1.35);
            knee.add(footPaw);

            [-0.07, 0, 0.07].forEach(px => {
                const pad = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), pawPadMat);
                pad.position.set(px, -0.45, 0.20);
                knee.add(pad);
            });
        });
    }

    // Extremidades anfibias con ventosas para Ranaik
    static buildFrogLimbs(skinMat, lArm, lElbow, rArm, rElbow, lLeg, lKnee, rLeg, rKnee) {
        const suctionMat = new THREE.MeshStandardMaterial({ color: 0x0891b2, roughness: 0.3 });

        [lArm, rArm].forEach(arm => {
            const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.36, 14), skinMat);
            upper.position.y = -0.18;
            arm.add(upper);
        });

        [lElbow, rElbow].forEach(elbow => {
            const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.08, 0.36, 14), skinMat);
            forearm.position.y = -0.18;
            elbow.add(forearm);

            // Mano con 3 dedos palmeados con ventosas redondeadas
            [-0.08, 0, 0.08].forEach(fx => {
                const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.16, 8), skinMat);
                finger.position.set(fx, -0.38, 0.08);
                finger.rotation.x = Math.PI / 4;
                elbow.add(finger);

                const suction = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), suctionMat);
                suction.position.set(fx, -0.44, 0.14);
                elbow.add(suction);
            });
        });

        [lLeg, rLeg].forEach(leg => {
            const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.44, 16), skinMat);
            thigh.position.y = -0.22;
            leg.add(thigh);
        });

        [lKnee, rKnee].forEach(knee => {
            const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.44, 16), skinMat);
            shin.position.y = -0.22;
            knee.add(shin);

            // Pie palmeado con 4 ventosas
            [-0.10, -0.03, 0.03, 0.10].forEach(tx => {
                const toe = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.20, 8), skinMat);
                toe.position.set(tx, -0.42, 0.10);
                toe.rotation.x = Math.PI / 3;
                knee.add(toe);

                const suction = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), suctionMat);
                suction.position.set(tx, -0.47, 0.18);
                knee.add(suction);
            });
        });
    }

    // Alas aerodinámicas de ave para Guaca (reemplaza cajas rectangulares)
    static buildBirdWings(redMat, blueMat, yellowMat, lArm, lElbow, rArm, rElbow) {
        [-1, 1].forEach(side => {
            const arm = side < 0 ? lArm : rArm;
            const elbow = side < 0 ? lElbow : rElbow;

            // Hombro emplumado escarlata (cobertoras primarias)
            const shoulderGeom = new THREE.ConeGeometry(0.18, 0.42, 8);
            shoulderGeom.scale(0.7, 1.0, 1.15);
            shoulderGeom.translate(0, -0.20, -0.04);
            const shoulder = new THREE.Mesh(shoulderGeom, redMat);
            shoulder.rotation.z = side * 0.15;
            arm.add(shoulder);

            // Abanico alar curvado articulado en el antebrazo
            const wingGroup = new THREE.Group();
            wingGroup.position.set(0, -0.20, 0);

            // Capa 1: Cobertoras rojas superiores
            const feather1 = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.44, 6), redMat);
            feather1.scale.set(0.35, 1.0, 1.0);
            feather1.position.set(side * 0.04, -0.05, -0.08);
            feather1.rotation.x = -0.45;
            feather1.rotation.z = side * 0.2;
            wingGroup.add(feather1);

            // Capa 2: Plumas secundarias azul cobalto
            const feather2 = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.50, 6), blueMat);
            feather2.scale.set(0.3, 1.0, 1.0);
            feather2.position.set(side * 0.05, -0.12, -0.14);
            feather2.rotation.x = -0.55;
            feather2.rotation.z = side * 0.28;
            wingGroup.add(feather2);

            // Capa 3: Plumas primarias doradas de vuelo con punta afilada
            const feather3 = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.56, 6), yellowMat);
            feather3.scale.set(0.25, 1.0, 1.0);
            feather3.position.set(side * 0.06, -0.18, -0.20);
            feather3.rotation.x = -0.65;
            feather3.rotation.z = side * 0.35;
            wingGroup.add(feather3);

            elbow.add(wingGroup);

            // Empuñadura ninja en la mano para sujetar armas de forma natural
            const handGrip = new THREE.Mesh(new THREE.SphereGeometry(0.10, 12, 10), yellowMat);
            handGrip.position.set(0, -0.40, 0.08);
            elbow.add(handGrip);
        });
    }

    // Patas de ave de presa para Guaca (reemplaza cilindros negros y bloques)
    static buildBirdLegs(redMat, darkMat, clawMat, goldMat, lLeg, lKnee, rLeg, rKnee) {
        [lLeg, rLeg].forEach(leg => {
            // Muslos emplumados musculosos
            const thighGeom = new THREE.CylinderGeometry(0.19, 0.12, 0.38, 14);
            thighGeom.translate(0, -0.19, 0);
            const thigh = new THREE.Mesh(thighGeom, redMat);
            leg.add(thigh);
        });

        [lKnee, rKnee].forEach(knee => {
            // Tarso escamado oscuro y estilizado
            const tarsusGeom = new THREE.CylinderGeometry(0.09, 0.075, 0.42, 12);
            tarsusGeom.translate(0, -0.21, 0);
            const tarsus = new THREE.Mesh(tarsusGeom, darkMat);
            knee.add(tarsus);

            // Anillos escamosos en el tobillo
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.02, 8, 16), goldMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = -0.36;
            knee.add(ring);

            // Garras de ave rapaz (3 dedos frontales con nudillos y garra curva + 1 espolón trasero)
            [-0.08, 0, 0.08].forEach(dx => {
                const toe = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.18, 8), darkMat);
                toe.position.set(dx, -0.42, 0.08);
                toe.rotation.x = Math.PI / 4;
                toe.rotation.y = dx * 1.5;
                knee.add(toe);

                const claw = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.10, 8), clawMat);
                claw.position.set(dx * 1.2, -0.47, 0.16);
                claw.rotation.x = Math.PI * 0.7;
                knee.add(claw);
            });

            // Espolón trasero para agarre en plataformas
            const spur = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.10, 8), clawMat);
            spur.position.set(0, -0.44, -0.08);
            spur.rotation.x = -Math.PI * 0.7;
            knee.add(spur);
        });
    }
}
