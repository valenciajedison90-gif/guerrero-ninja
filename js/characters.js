// js/characters.js - Sistema de Personajes de Fauna Colombiana: NINJA COLOMBIA ARENA
import * as THREE from 'three';

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
// CONSTRUCTOR 3D PROCEDURAL DE ANIMALES NINJA COLOMBIANOS
// =============================================================================
export class AnimalCharacterBuilder {
    static build(characterId = 'chucho', skinId = 'default') {
        const charData = CHARACTERS_DATA[characterId] || CHARACTERS_DATA.chucho;
        const root = new THREE.Group();
        root.name = `character_${charData.id}`;

        // Contenedores estándar para cinemática articular y animación de locomoción
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
        leftLegPivot.position.set(-0.20, -0.45, 0);
        torso.add(leftLegPivot);

        const leftKneePivot = new THREE.Group();
        leftKneePivot.position.set(0, -0.40, 0);
        leftLegPivot.add(leftKneePivot);

        const rightLegPivot = new THREE.Group();
        rightLegPivot.position.set(0.20, -0.45, 0);
        torso.add(rightLegPivot);

        const rightKneePivot = new THREE.Group();
        rightKneePivot.position.set(0, -0.40, 0);
        rightLegPivot.add(rightKneePivot);

        // Porta-armas en la mano derecha
        const weaponHolder = new THREE.Group();
        weaponHolder.position.set(0, -0.40, 0.25);
        rightElbowPivot.add(weaponHolder);

        // Materiales generales
        const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
        const eyeScleraMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2 });
        const darkClothMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });

        // Cintas traseras ondeantes
        const ribbonMat = new THREE.MeshStandardMaterial({ color: charData.accentColor, roughness: 0.4 });
        const tail1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.65, 0.02), ribbonMat);
        tail1.position.set(-0.08, 0.08, -0.36);
        tail1.rotation.x = 0.35;
        head.add(tail1);

        const tail2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.02), ribbonMat);
        tail2.position.set(0.08, 0.12, -0.36);
        tail2.rotation.x = 0.45;
        head.add(tail2);

        // =====================================================================
        // ESPECIALIZACIÓN VISUAL POR ANIMAL
        // =====================================================================
        switch (charData.id) {
            case 'chucho': {
                // =============================================================
                // 1. CHUCHO: OSO DE ANTEOJOS
                // =============================================================
                const furDarkMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.85 });
                const creamMarkMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.8 });
                const vestMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.6 });
                const redHeadbandMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });

                // Torso de oso robusto
                const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.42, 0.58, 24), vestMat);
                chest.position.y = 0.15;
                torso.add(chest);

                const belly = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.38, 0.45, 24), furDarkMat);
                belly.position.y = -0.24;
                torso.add(belly);

                // Cinturón rojo con hebilla de huella dorada
                const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.40, 0.15, 24), redHeadbandMat);
                belt.position.y = -0.42;
                torso.add(belt);

                const buckle = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 16), goldMat);
                buckle.rotation.x = Math.PI / 2;
                buckle.position.set(0, -0.42, 0.40);
                torso.add(buckle);

                // Mochila de explorador en la espalda
                const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.55, 0.28), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 }));
                backpack.position.set(0, 0.10, -0.32);
                torso.add(backpack);

                // Cabeza de oso redonda
                const bearHead = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 20), furDarkMat);
                bearHead.scale.set(1.1, 1.0, 1.08);
                head.add(bearHead);

                // Orejas redondas de oso
                [-0.32, 0.32].forEach(ox => {
                    const earOuter = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), furDarkMat);
                    earOuter.position.set(ox, 0.38, 0);
                    head.add(earOuter);

                    const earInner = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), creamMarkMat);
                    earInner.position.set(ox, 0.38, 0.06);
                    head.add(earInner);
                });

                // Hocico prominente de oso con pelaje claro
                const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.22, 18), creamMarkMat);
                muzzle.rotation.x = Math.PI / 2;
                muzzle.position.set(0, -0.06, 0.38);
                head.add(muzzle);

                // Nariz negra de oso
                const nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), eyePupilMat);
                nose.position.set(0, -0.02, 0.50);
                head.add(nose);

                // Marcas de anteojos (aros amarillos alrededor de los ojos)
                [-0.14, 0.14].forEach(ex => {
                    const spectacleRing = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.035, 12, 20), creamMarkMat);
                    spectacleRing.position.set(ex, 0.08, 0.38);
                    head.add(spectacleRing);

                    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), eyePupilMat);
                    eye.position.set(ex, 0.08, 0.40);
                    head.add(eye);

                    const eyeGlint = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), eyeScleraMat);
                    eyeGlint.position.set(ex + 0.015, 0.095, 0.44);
                    head.add(eyeGlint);
                });

                // Bandana roja con franja tricolor colombiana (Hitai-ate)
                const band = new THREE.Mesh(new THREE.CylinderGeometry(0.425, 0.425, 0.14, 24, 1, true, -Math.PI * 0.6, Math.PI * 1.2), redHeadbandMat);
                band.position.y = 0.24;
                head.add(band);

                // Rayas de la bandera colombiana (Amarillo, Azul, Rojo)
                const flagY = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.02), goldMat);
                flagY.position.set(0, 0.27, 0.43);
                head.add(flagY);

                const flagB = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.02), new THREE.MeshBasicMaterial({ color: 0x2563eb }));
                flagB.position.set(0, 0.24, 0.43);
                head.add(flagB);

                const flagR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.02), new THREE.MeshBasicMaterial({ color: 0xdc2626 }));
                flagR.position.set(0, 0.22, 0.43);
                head.add(flagR);

                // Brazos y patas con pelo oscuro y muñequeras
                AnimalCharacterBuilder.buildLimbs(furDarkMat, redHeadbandMat, darkClothMat, leftArmPivot, leftElbowPivot, rightArmPivot, rightElbowPivot, leftLegPivot, leftKneePivot, rightLegPivot, rightKneePivot);
                break;
            }

            case 'yari': {
                // =============================================================
                // 2. YARÍ: TIGRILLO COLOMBIANO
                // =============================================================
                const ocelotGoldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 });
                const ocelotSpotMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
                const purpleSuitMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.4 });
                const visorLensMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x9333ea, emissiveIntensity: 0.6, metalness: 0.8 });

                // Torso esbelto y ágil
                const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.32, 0.54, 24), purpleSuitMat);
                chest.position.y = 0.15;
                torso.add(chest);

                const belly = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.42, 24), ocelotGoldMat);
                belly.position.y = -0.25;
                torso.add(belly);

                // Cabeza felina con orejas puntiagudas
                const catHead = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 20), ocelotGoldMat);
                catHead.scale.set(1.05, 0.95, 1.05);
                head.add(catHead);

                [-0.24, 0.24].forEach(ex => {
                    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.24, 16), ocelotGoldMat);
                    ear.position.set(ex, 0.38, 0);
                    ear.rotation.z = ex > 0 ? -0.2 : 0.2;
                    head.add(ear);

                    const earTip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.12, 16), ocelotSpotMat);
                    earTip.position.set(ex, 0.44, 0.02);
                    head.add(earTip);
                });

                // Visor tecnológico morado en la frente
                const visorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.14), darkClothMat);
                visorFrame.position.set(0, 0.24, 0.32);
                head.add(visorFrame);

                [-0.12, 0.12].forEach(vx => {
                    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 16), visorLensMat);
                    lens.rotation.x = Math.PI / 2;
                    lens.position.set(vx, 0.24, 0.38);
                    head.add(lens);
                });

                // Hocico felino y bigotes
                const catMuzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.16, 16), new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.7 }));
                catMuzzle.rotation.x = Math.PI / 2;
                catMuzzle.position.set(0, -0.06, 0.34);
                head.add(catMuzzle);

                const catNose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
                catNose.position.set(0, -0.03, 0.42);
                head.add(catNose);

                // Ojos felinos ámbar rasgados
                [-0.12, 0.12].forEach(ex => {
                    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
                    eye.scale.set(1.2, 0.7, 0.4);
                    eye.position.set(ex, 0.06, 0.36);
                    head.add(eye);

                    const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.02), eyePupilMat);
                    pupil.position.set(ex, 0.06, 0.39);
                    head.add(pupil);
                });

                // Cola felina larga y curva
                const tailGroup = new THREE.Group();
                tailGroup.position.set(0, -0.38, -0.28);
                const tailMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.75, 12), ocelotGoldMat);
                tailMesh.position.set(0, -0.28, -0.20);
                tailMesh.rotation.x = -Math.PI / 3;
                tailGroup.add(tailMesh);
                torso.add(tailGroup);

                AnimalCharacterBuilder.buildLimbs(ocelotGoldMat, purpleSuitMat, darkClothMat, leftArmPivot, leftElbowPivot, rightArmPivot, rightElbowPivot, leftLegPivot, leftKneePivot, rightLegPivot, rightKneePivot);
                break;
            }

            case 'guaca': {
                // =============================================================
                // 3. GUACA: GUACAMAYA ESCARLATA
                // =============================================================
                const redFeatherMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
                const blueFeatherMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });
                const yellowFeatherMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });
                const beakMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.3, metalness: 0.3 });

                // Torso escarlata con chaleco de plumas
                const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.32, 0.52, 24), redFeatherMat);
                chest.position.y = 0.15;
                torso.add(chest);

                const belly = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.42, 24), yellowFeatherMat);
                belly.position.y = -0.24;
                torso.add(belly);

                // Cabeza de ave
                const birdHead = new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 20), redFeatherMat);
                head.add(birdHead);

                // Auriculares de aviador
                const headphoneArch = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.04, 12, 24, Math.PI), darkClothMat);
                headphoneArch.rotation.z = Math.PI;
                headphoneArch.position.y = 0.15;
                head.add(headphoneArch);

                [-0.36, 0.36].forEach(hx => {
                    const earpiece = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16), blueFeatherMat);
                    earpiece.rotation.z = Math.PI / 2;
                    earpiece.position.set(hx, 0.15, 0);
                    head.add(earpiece);
                });

                // Pico curvado de guacamaya
                const upperBeak = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.34, 16), beakMat);
                upperBeak.rotation.x = Math.PI * 0.65;
                upperBeak.position.set(0, -0.06, 0.38);
                head.add(upperBeak);

                const lowerBeak = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.20, 16), new THREE.MeshBasicMaterial({ color: 0x111827 }));
                lowerBeak.rotation.x = Math.PI * 0.45;
                lowerBeak.position.set(0, -0.16, 0.32);
                head.add(lowerBeak);

                // Ojos circulares de guacamaya con parche facial blanco
                [-0.14, 0.14].forEach(ex => {
                    const whitePatch = new THREE.Mesh(new THREE.SphereGeometry(0.10, 16, 16), eyeScleraMat);
                    whitePatch.scale.set(1.0, 1.2, 0.3);
                    whitePatch.position.set(ex, 0.06, 0.30);
                    head.add(whitePatch);

                    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), eyePupilMat);
                    eye.position.set(ex, 0.06, 0.34);
                    head.add(eye);
                });

                // Alas-brazos con plumas extendidas
                AnimalCharacterBuilder.buildBirdWings(redFeatherMat, blueFeatherMat, yellowFeatherMat, leftArmPivot, leftElbowPivot, rightArmPivot, rightElbowPivot);
                AnimalCharacterBuilder.buildBirdLegs(beakMat, leftLegPivot, leftKneePivot, rightLegPivot, rightKneePivot);
                break;
            }

            case 'capibu': {
                // =============================================================
                // 4. CAPIBÚ: CHIGÜIRO / CAPIBARA
                // =============================================================
                const capyFurMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.85 });
                const blueTacticalMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5 });
                const teethMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

                // Torso ancho y redondo
                const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.46, 0.58, 24), blueTacticalMat);
                chest.position.y = 0.15;
                torso.add(chest);

                const belly = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.42, 0.45, 24), capyFurMat);
                belly.position.y = -0.24;
                torso.add(belly);

                // Mochila Arhuaca colombiana tejida
                const arhuacaBag = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.20, 0.45, 16), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 }));
                arhuacaBag.rotation.z = 0.3;
                arhuacaBag.position.set(0.22, 0.05, -0.32);
                torso.add(arhuacaBag);

                // Cabeza ancha y relajada de capibara
                const capyHead = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.45, 0.58), capyFurMat);
                head.add(capyHead);

                // Orejas pequeñas de capibara
                [-0.24, 0.24].forEach(ox => {
                    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), capyFurMat);
                    ear.position.set(ox, 0.26, -0.10);
                    head.add(ear);
                });

                // Hocico cuadrado de capibara
                const snout = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.28, 0.26), new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.8 }));
                snout.position.set(0, -0.06, 0.38);
                head.add(snout);

                // Dientes frontales blancos
                const tooth1 = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.08, 0.02), teethMat);
                tooth1.position.set(-0.03, -0.20, 0.48);
                head.add(tooth1);

                const tooth2 = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.08, 0.02), teethMat);
                tooth2.position.set(0.03, -0.20, 0.48);
                head.add(tooth2);

                // Ojitos tranquilos de capibara
                [-0.22, 0.22].forEach(ex => {
                    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), eyePupilMat);
                    eye.position.set(ex, 0.12, 0.22);
                    head.add(eye);
                });

                AnimalCharacterBuilder.buildLimbs(capyFurMat, blueTacticalMat, darkClothMat, leftArmPivot, leftElbowPivot, rightArmPivot, rightElbowPivot, leftLegPivot, leftKneePivot, rightLegPivot, rightKneePivot);
                break;
            }

            case 'ranaik': {
                // =============================================================
                // 5. RANAIK: RANA DORADA
                // =============================================================
                const frogGoldMat = new THREE.MeshStandardMaterial({
                    color: 0xfacc15,
                    roughness: 0.2,
                    metalness: 0.3,
                    emissive: 0xeab308,
                    emissiveIntensity: 0.2
                });
                const cyanWrapMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.4 });
                const blackSpotsMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });

                // Torso esbelto y anfibio
                const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.28, 0.52, 24), frogGoldMat);
                chest.position.y = 0.15;
                torso.add(chest);

                const belly = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.40, 24), new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3 }));
                belly.position.y = -0.24;
                torso.add(belly);

                // Cabeza ancha de rana
                const frogHead = new THREE.Mesh(new THREE.SphereGeometry(0.40, 24, 18), frogGoldMat);
                frogHead.scale.set(1.15, 0.82, 1.15);
                head.add(frogHead);

                // Ojos saltones gigantes característicos de rana
                [-0.22, 0.22].forEach(ex => {
                    const eyeBulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), frogGoldMat);
                    eyeBulb.position.set(ex, 0.24, 0.15);
                    head.add(eyeBulb);

                    const eyeIris = new THREE.Mesh(new THREE.SphereGeometry(0.10, 16, 16), blackSpotsMat);
                    eyeIris.position.set(ex, 0.26, 0.20);
                    head.add(eyeIris);

                    const pupilGleam = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), eyeScleraMat);
                    pupilGleam.position.set(ex + 0.02, 0.29, 0.26);
                    head.add(pupilGleam);
                });

                // Collar ceremonial precolombino turquesa
                const collar = new THREE.Mesh(new THREE.TorusGeometry(0.30, 0.05, 12, 24), cyanWrapMat);
                collar.rotation.x = Math.PI / 2;
                collar.position.y = -0.05;
                head.add(collar);

                AnimalCharacterBuilder.buildLimbs(frogGoldMat, cyanWrapMat, cyanWrapMat, leftArmPivot, leftElbowPivot, rightArmPivot, rightElbowPivot, leftLegPivot, leftKneePivot, rightLegPivot, rightKneePivot);
                break;
            }

            case 'el_invernal': {
                // =============================================================
                // 6. EL INVERNAL: VILLANO PRINCIPAL (PANTERA DE ESCARCHA)
                // =============================================================
                const shadowMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.5 });
                const purpleArmorMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, metalness: 0.7, roughness: 0.3 });
                const iceCrystalMat = new THREE.MeshStandardMaterial({
                    color: 0x67e8f9,
                    emissive: 0x06b6d4,
                    emissiveIntensity: 0.5,
                    roughness: 0.15,
                    metalness: 0.8
                });

                const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.44, 0.60, 24), purpleArmorMat);
                chest.position.y = 0.15;
                torso.add(chest);

                // Cristal corrupto en el pecho
                const heartCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), iceCrystalMat);
                heartCrystal.position.set(0, 0.18, 0.44);
                torso.add(heartCrystal);

                const villainHead = new THREE.Mesh(new THREE.SphereGeometry(0.40, 24, 20), shadowMat);
                head.add(villainHead);

                // Máscara cibernética morada (Menpo)
                const mask = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.32, 0.25, 20, 1, false, -Math.PI * 0.45, Math.PI * 0.9), purpleArmorMat);
                mask.position.set(0, -0.08, 0.18);
                head.add(mask);

                // Ojos brillantes de hielo
                [-0.14, 0.14].forEach(ex => {
                    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.04, 0.03), iceCrystalMat);
                    eye.position.set(ex, 0.08, 0.36);
                    head.add(eye);
                });

                // Hombreras de hielo afilado
                [-0.56, 0.56].forEach(px => {
                    const pauldron = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.36, 6), iceCrystalMat);
                    pauldron.position.set(px, 0.48, 0);
                    pauldron.rotation.z = px > 0 ? -0.4 : 0.4;
                    torso.add(pauldron);
                });

                AnimalCharacterBuilder.buildLimbs(shadowMat, purpleArmorMat, darkClothMat, leftArmPivot, leftElbowPivot, rightArmPivot, rightElbowPivot, leftLegPivot, leftKneePivot, rightLegPivot, rightKneePivot);
                break;
            }
        }

        return {
            group: root,
            torso,
            head,
            leftArmPivot,
            leftElbowPivot,
            rightArmPivot,
            rightElbowPivot,
            leftLegPivot,
            leftKneePivot,
            rightLegPivot,
            rightKneePivot,
            weaponHolder,
            bandanaTail1: tail1,
            bandanaTail2: tail2
        };
    }

    // Constructor de extremidades genérico para mamíferos y anfibios
    static buildLimbs(primaryMat, accentMat, shoeMat, lArm, lElbow, rArm, rElbow, lLeg, lKnee, rLeg, rKnee) {
        // Brazos
        const lUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.38, 16), primaryMat);
        lUpper.position.y = -0.19;
        lArm.add(lUpper);

        const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.38, 16), accentMat);
        lForearm.position.y = -0.19;
        lElbow.add(lForearm);

        const rUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.38, 16), primaryMat);
        rUpper.position.y = -0.19;
        rArm.add(rUpper);

        const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.38, 16), accentMat);
        rForearm.position.y = -0.19;
        rElbow.add(rForearm);

        // Piernas
        const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.40, 16), primaryMat);
        lThigh.position.y = -0.20;
        lLeg.add(lThigh);

        const lShin = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.40, 16), accentMat);
        lShin.position.y = -0.20;
        lKnee.add(lShin);

        const lFoot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.28), shoeMat);
        lFoot.position.set(0, -0.42, 0.05);
        lKnee.add(lFoot);

        const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.40, 16), primaryMat);
        rThigh.position.y = -0.20;
        rLeg.add(rThigh);

        const rShin = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.40, 16), accentMat);
        rShin.position.y = -0.20;
        rKnee.add(rShin);

        const rFoot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.28), shoeMat);
        rFoot.position.set(0, -0.42, 0.05);
        rKnee.add(rFoot);
    }

    // Alas de ave para Guaca
    static buildBirdWings(redMat, blueMat, yellowMat, lArm, lElbow, rArm, rElbow) {
        [-1, 1].forEach(side => {
            const arm = side < 0 ? lArm : rArm;
            const elbow = side < 0 ? lElbow : rElbow;

            const upperFeathers = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.38, 0.24), redMat);
            upperFeathers.position.set(0, -0.19, -0.06);
            arm.add(upperFeathers);

            const wingSpan = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.32), blueMat);
            wingSpan.position.set(0, -0.20, -0.10);
            elbow.add(wingSpan);

            // Borde dorado inferior de la pluma
            const wingGoldEdge = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.12, 0.34), yellowMat);
            wingGoldEdge.position.set(0, -0.40, -0.10);
            elbow.add(wingGoldEdge);
        });
    }

    // Patas de ave para Guaca
    static buildBirdLegs(beakMat, lLeg, lKnee, rLeg, rKnee) {
        [lLeg, rLeg].forEach(leg => {
            const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.38, 12), beakMat);
            thigh.position.y = -0.19;
            leg.add(thigh);
        });

        [lKnee, rKnee].forEach(knee => {
            const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.40, 12), beakMat);
            shin.position.y = -0.20;
            knee.add(shin);

            // Garras de ave
            const claw = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.26), beakMat);
            claw.position.set(0, -0.40, 0.05);
            knee.add(claw);
        });
    }
}
