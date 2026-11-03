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
        leftLegPivot.position.set(-0.22, -0.45, 0);
        torso.add(leftLegPivot);

        const leftKneePivot = new THREE.Group();
        leftKneePivot.position.set(0, -0.40, 0);
        leftLegPivot.add(leftKneePivot);

        const rightLegPivot = new THREE.Group();
        rightLegPivot.position.set(0.22, -0.45, 0);
        torso.add(rightLegPivot);

        const rightKneePivot = new THREE.Group();
        rightKneePivot.position.set(0, -0.40, 0);
        rightLegPivot.add(rightKneePivot);

        // Porta-armas en la mano derecha
        const weaponHolder = new THREE.Group();
        weaponHolder.position.set(0, -0.40, 0.25);
        rightElbowPivot.add(weaponHolder);

        // Materiales generales de fauna caricaturesca y accesorios ninja
        const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
        const eyeScleraMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const eyeGleamMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.85, roughness: 0.25 });
        const pawPadMat = new THREE.MeshStandardMaterial({ color: 0x1f1a18, roughness: 0.7 });
        const clawMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.4 });

        // Cintas traseras ondeantes de la cinta ninja en la cabeza
        const ribbonMat = new THREE.MeshStandardMaterial({ color: charData.accentColor || 0xdc2626, roughness: 0.35 });
        const tail1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.72, 0.02), ribbonMat);
        tail1.position.set(-0.10, 0.12, -0.40);
        tail1.rotation.x = 0.38;
        head.add(tail1);

        const tail2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.60, 0.02), ribbonMat);
        tail2.position.set(0.10, 0.16, -0.40);
        tail2.rotation.x = 0.48;
        head.add(tail2);

        // =====================================================================
        // ESPECIALIZACIÓN VISUAL POR ANIMAL (CUERPO NATURAL + CINTURÓN + CINTA)
        // =====================================================================
        switch (charData.id) {
            case 'chucho': {
                // 1. CHUCHO: OSO DE ANTEOJOS (DISEÑO CARTOON AMIGABLE Y EXPRESIVO)
                const furDarkMat = new THREE.MeshStandardMaterial({ color: 0x3d3027, roughness: 0.60, metalness: 0.08 });
                const creamMarkMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.50 });
                const beltMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.40 });

                // Vientre regordete y tierno de oso (esfera suave)
                const belly = new THREE.Mesh(new THREE.SphereGeometry(0.52, 24, 20), furDarkMat);
                belly.scale.set(1.08, 0.95, 1.05);
                belly.position.set(0, -0.12, 0.02);
                torso.add(belly);

                // Pecho superior de oso
                const chest = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 20), furDarkMat);
                chest.scale.set(1.02, 0.92, 0.98);
                chest.position.set(0, 0.20, 0);
                torso.add(chest);

                // Marca natural de oso de anteojos en el pecho (media luna curvada crema)
                const chestPatch = new THREE.Mesh(new THREE.SphereGeometry(0.36, 20, 16), creamMarkMat);
                chestPatch.scale.set(1.02, 0.80, 0.35);
                chestPatch.position.set(0, 0.18, 0.35);
                torso.add(chestPatch);

                // Cinturón ninja rojo con hebilla de huella dorada
                const belt = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.075, 16, 28), beltMat);
                belt.rotation.x = Math.PI / 2;
                belt.position.set(0, -0.32, 0);
                torso.add(belt);

                const buckle = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.04, 18), goldMat);
                buckle.rotation.x = Math.PI / 2;
                buckle.position.set(0, -0.32, 0.48);
                torso.add(buckle);

                // Nudo decorativo del cinturón
                const knot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.03), beltMat);
                knot.position.set(0.12, -0.42, 0.48);
                torso.add(knot);

                // Cabeza de oso redonda estilo cartoon 3D
                const bearHead = new THREE.Mesh(new THREE.SphereGeometry(0.46, 24, 20), furDarkMat);
                bearHead.scale.set(1.12, 1.02, 1.06);
                head.add(bearHead);

                // Orejas redondas y esponjosas de oso
                [-0.34, 0.34].forEach(ox => {
                    const earOuter = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), furDarkMat);
                    earOuter.position.set(ox, 0.42, 0);
                    head.add(earOuter);

                    const earInner = new THREE.Mesh(new THREE.SphereGeometry(0.10, 12, 12), creamMarkMat);
                    earInner.position.set(ox, 0.42, 0.08);
                    head.add(earInner);
                });

                // Hocico redondeado en la mitad inferior de la cara
                const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.20, 20, 18), creamMarkMat);
                muzzle.scale.set(1.15, 0.85, 1.10);
                muzzle.position.set(0, -0.12, 0.38);
                head.add(muzzle);

                // Nariz negra redondeada de oso sobre el hocico
                const nose = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 14), eyePupilMat);
                nose.scale.set(1.2, 0.8, 0.9);
                nose.position.set(0, -0.04, 0.56);
                head.add(nose);

                // Sonrisa amigable en el hocico
                const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.02, 0.02), eyePupilMat);
                mouth.position.set(0, -0.16, 0.54);
                head.add(mouth);

                // Ojos GRANDES, brillantes y expresivos con los icónicos "anteojos" (aros crema)
                [-0.16, 0.16].forEach(ex => {
                    // Aro crema de oso de anteojos
                    const spectacleRing = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.038, 14, 20), creamMarkMat);
                    spectacleRing.position.set(ex, 0.12, 0.44);
                    head.add(spectacleRing);

                    // Esclerótica blanca
                    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 14), eyeScleraMat);
                    sclera.position.set(ex, 0.12, 0.46);
                    head.add(sclera);

                    // Pupila oscura
                    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), eyePupilMat);
                    eye.position.set(ex, 0.12, 0.52);
                    head.add(eye);

                    // Destello brillante en los ojos (expresión animada y amigable)
                    const eyeGlint = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), eyeGleamMat);
                    eyeGlint.position.set(ex + 0.018, 0.138, 0.555);
                    head.add(eyeGlint);
                });

                // Cinta roja ninja en la frente (por encima de los ojos)
                const band = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.065, 16, 28), beltMat);
                band.rotation.x = Math.PI / 2;
                band.position.set(0, 0.28, 0);
                head.add(band);

                // Placa frontal con la bandera tricolor de Colombia
                const flagY = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.04, 0.02), goldMat);
                flagY.position.set(0, 0.33, 0.48);
                head.add(flagY);
                const flagB = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.02, 0.02), new THREE.MeshBasicMaterial({ color: 0x2563eb }));
                flagB.position.set(0, 0.30, 0.48);
                head.add(flagB);
                const flagR = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.02, 0.02), new THREE.MeshBasicMaterial({ color: 0xdc2626 }));
                flagR.position.set(0, 0.28, 0.48);
                head.add(flagR);

                // Extremidades de oso con pelaje natural y patas con garras
                AnimalCharacterBuilder.buildAnimalLimbs(furDarkMat, pawPadMat, clawMat, leftArmPivot, leftElbowPivot, rightArmPivot, rightElbowPivot, leftLegPivot, leftKneePivot, rightLegPivot, rightKneePivot);
                break;
            }

            case 'yari': {
                // 2. YARÍ: TIGRILLO COLOMBIANO (OCELOTE / MARGAY)
                const ocelotGoldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.55 });
                const ocelotSpotMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.65 });
                const creamBellyMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 });
                const purpleBeltMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.4 });
                const visorLensMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x9333ea, emissiveIntensity: 0.6, metalness: 0.8 });

                // Torso felino ágil y curvilíneo (pelaje natural dorado con vientre crema)
                const belly = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 16), ocelotGoldMat);
                belly.scale.set(1.0, 0.95, 1.0);
                belly.position.set(0, -0.15, 0.02);
                torso.add(belly);

                const chest = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 16), ocelotGoldMat);
                chest.scale.set(1.0, 0.95, 0.96);
                chest.position.set(0, 0.18, 0);
                torso.add(chest);

                const chestWhite = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 14), creamBellyMat);
                chestWhite.scale.set(0.9, 0.8, 0.3);
                chestWhite.position.set(0, 0.16, 0.30);
                torso.add(chestWhite);

                // Manchas de roseta de ocelote en el pecho y espalda
                [[-0.14, 0.22, 0.32], [0.14, 0.22, 0.32], [-0.10, 0.05, 0.32], [0.10, 0.05, 0.32], [0, 0.18, -0.32]].forEach(([sx, sy, sz]) => {
                    const spot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), ocelotSpotMat);
                    spot.position.set(sx, sy, sz);
                    torso.add(spot);
                });

                // Cinturón ninja morado con hebilla dorada
                const belt = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.065, 16, 24), purpleBeltMat);
                belt.rotation.x = Math.PI / 2;
                belt.position.set(0, -0.32, 0);
                torso.add(belt);

                const buckle = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 16), goldMat);
                buckle.rotation.x = Math.PI / 2;
                buckle.position.set(0, -0.32, 0.36);
                torso.add(buckle);

                // Cola felina larga curvada y elegante
                const tailGroup = new THREE.Group();
                tailGroup.position.set(0, -0.32, -0.22);
                const tail1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.38, 12), ocelotGoldMat);
                tail1.rotation.x = -Math.PI / 4;
                tail1.position.set(0, 0.14, -0.14);
                tailGroup.add(tail1);
                const tail2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.36, 12), ocelotSpotMat);
                tail2.position.set(0, 0.34, -0.25);
                tailGroup.add(tail2);
                torso.add(tailGroup);

                // Cabeza felina estilizada con orejas triangulares
                const catHead = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 20), ocelotGoldMat);
                catHead.scale.set(1.08, 0.98, 1.05);
                head.add(catHead);

                [-0.26, 0.26].forEach(ex => {
                    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 16), ocelotGoldMat);
                    ear.position.set(ex, 0.42, 0);
                    ear.rotation.z = ex > 0 ? -0.25 : 0.25;
                    head.add(ear);

                    const earTip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.14, 14), ocelotSpotMat);
                    earTip.position.set(ex, 0.48, 0.02);
                    head.add(earTip);
                });

                // Cinta morada en la cabeza con visor táctico de rastreo
                const band = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.06, 16, 24), purpleBeltMat);
                band.rotation.x = Math.PI / 2;
                band.position.set(0, 0.22, 0);
                head.add(band);

                const visorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.10, 0.10), new THREE.MeshStandardMaterial({ color: 0x1e1b4b }));
                visorFrame.position.set(0, 0.24, 0.36);
                head.add(visorFrame);

                [-0.11, 0.11].forEach(vx => {
                    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 14), visorLensMat);
                    lens.rotation.x = Math.PI / 2;
                    lens.position.set(vx, 0.24, 0.42);
                    head.add(lens);
                });

                // Hocico felino claro y nariz rosada
                const catMuzzle = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 14), creamBellyMat);
                catMuzzle.scale.set(1.2, 0.8, 1.0);
                catMuzzle.position.set(0, -0.06, 0.36);
                head.add(catMuzzle);

                const catNose = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.06, 12), new THREE.MeshBasicMaterial({ color: 0xf472b6 }));
                catNose.rotation.x = Math.PI;
                catNose.position.set(0, -0.02, 0.48);
                head.add(catNose);

                // Ojos felinos verdes con pupila vertical
                [-0.14, 0.14].forEach(ex => {
                    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 14), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
                    eye.position.set(ex, 0.08, 0.38);
                    head.add(eye);

                    const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.02), eyePupilMat);
                    pupil.position.set(ex, 0.08, 0.43);
                    head.add(pupil);
                });

                AnimalCharacterBuilder.buildAnimalLimbs(ocelotGoldMat, pawPadMat, clawMat, leftArmPivot, leftElbowPivot, rightArmPivot, rightElbowPivot, leftLegPivot, leftKneePivot, rightLegPivot, rightKneePivot);
                break;
            }

            case 'guaca': {
                // 3. GUACA: GUACAMAYA ESCARLATA (PLUMAJE TRICOLOR Y ALAS)
                const redFeatherMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
                const blueFeatherMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });
                const yellowFeatherMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });
                const beakMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.3, metalness: 0.2 });
                const greenBeltMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.45 });

                // Torso emplumado escarlata con pecho amarillo radiante
                const belly = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 16), yellowFeatherMat);
                belly.scale.set(1.0, 0.95, 1.0);
                belly.position.set(0, -0.14, 0.02);
                torso.add(belly);

                const chest = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 16), redFeatherMat);
                chest.scale.set(1.0, 0.95, 0.96);
                chest.position.set(0, 0.18, 0);
                torso.add(chest);

                const yellowChest = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 14), yellowFeatherMat);
                yellowChest.scale.set(0.9, 0.8, 0.3);
                yellowChest.position.set(0, 0.16, 0.30);
                torso.add(yellowChest);

                // Cinturón ninja verde esmeralda
                const belt = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.065, 16, 24), greenBeltMat);
                belt.rotation.x = Math.PI / 2;
                belt.position.set(0, -0.32, 0);
                torso.add(belt);

                const buckle = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 16), goldMat);
                buckle.rotation.x = Math.PI / 2;
                buckle.position.set(0, -0.32, 0.36);
                torso.add(buckle);

                // Cola larga de guacamaya con plumas azules y rojas
                const tailFeathers = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.75, 0.04), blueFeatherMat);
                tailFeathers.rotation.x = -Math.PI / 5;
                tailFeathers.position.set(0, -0.35, -0.25);
                torso.add(tailFeathers);

                // Cabeza de ave escarlata
                const birdHead = new THREE.Mesh(new THREE.SphereGeometry(0.40, 24, 20), redFeatherMat);
                head.add(birdHead);

                // Cinta verde en la cabeza
                const band = new THREE.Mesh(new THREE.TorusGeometry(0.41, 0.06, 16, 24), greenBeltMat);
                band.rotation.x = Math.PI / 2;
                band.position.set(0, 0.20, 0);
                head.add(band);

                // Pico curvado de guacamaya (negro e imponente)
                const upperBeak = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.38, 16), beakMat);
                upperBeak.rotation.x = Math.PI * 0.65;
                upperBeak.position.set(0, -0.06, 0.42);
                head.add(upperBeak);

                const lowerBeak = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.22, 16), new THREE.MeshBasicMaterial({ color: 0x111827 }));
                lowerBeak.rotation.x = Math.PI * 0.45;
                lowerBeak.position.set(0, -0.16, 0.36);
                head.add(lowerBeak);

                // Máscara facial blanca alrededor de los ojos
                [-0.15, 0.15].forEach(ex => {
                    const whitePatch = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), eyeScleraMat);
                    whitePatch.scale.set(1.0, 1.2, 0.3);
                    whitePatch.position.set(ex, 0.08, 0.32);
                    head.add(whitePatch);

                    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), eyePupilMat);
                    eye.position.set(ex, 0.08, 0.38);
                    head.add(eye);
                });

                // Alas de guacamaya y patas con garras
                AnimalCharacterBuilder.buildBirdWings(redFeatherMat, blueFeatherMat, yellowFeatherMat, leftArmPivot, leftElbowPivot, rightArmPivot, rightElbowPivot);
                AnimalCharacterBuilder.buildBirdLegs(beakMat, leftLegPivot, leftKneePivot, rightLegPivot, rightKneePivot);
                break;
            }

            case 'capibu': {
                // 4. CAPIBÚ: CHIGÜIRO / CAPIBARA
                const capyFurMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.85 });
                const capyTanMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 });
                const brownBeltMat = new THREE.MeshStandardMaterial({ color: 0x3f200c, roughness: 0.5 });
                const teethMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

                // Torso ancho y redondo peludo (silueta de capibara adorable y pacífico)
                const belly = new THREE.Mesh(new THREE.SphereGeometry(0.56, 24, 20), capyFurMat);
                belly.scale.set(1.12, 0.95, 1.08);
                belly.position.set(0, -0.12, 0.02);
                torso.add(belly);

                const chest = new THREE.Mesh(new THREE.SphereGeometry(0.50, 24, 20), capyFurMat);
                chest.scale.set(1.08, 0.92, 1.0);
                chest.position.set(0, 0.20, 0);
                torso.add(chest);

                const chestTan = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 16), capyTanMat);
                chestTan.scale.set(1.0, 0.8, 0.35);
                chestTan.position.set(0, 0.16, 0.38);
                torso.add(chestTan);

                // Cinturón ninja de cuero oscuro
                const belt = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.075, 16, 28), brownBeltMat);
                belt.rotation.x = Math.PI / 2;
                belt.position.set(0, -0.32, 0);
                torso.add(belt);

                const buckle = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.03, 16), goldMat);
                buckle.rotation.x = Math.PI / 2;
                buckle.position.set(0, -0.32, 0.52);
                torso.add(buckle);

                // Mochila Arhuaca tejida al costado (identidad colombiana)
                const arhuacaBag = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.16, 0.38, 16), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 }));
                arhuacaBag.rotation.z = 0.3;
                arhuacaBag.position.set(0.28, 0.05, -0.30);
                torso.add(arhuacaBag);

                // Cabeza ancha y cuadrada de capibara
                const capyHead = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.48, 0.62), capyFurMat);
                head.add(capyHead);

                // Cinta naranja en la cabeza
                const band = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.12, 0.64), new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.45 }));
                band.position.y = 0.18;
                head.add(band);

                // Orejas redondeadas
                [-0.26, 0.26].forEach(ox => {
                    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.10, 14, 14), capyFurMat);
                    ear.position.set(ox, 0.30, -0.10);
                    head.add(ear);
                });

                // Hocico característico de capibara
                const snout = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.30, 0.30), new THREE.MeshStandardMaterial({ color: 0x663309, roughness: 0.8 }));
                snout.position.set(0, -0.06, 0.42);
                head.add(snout);

                // Dientes de roedor
                const tooth1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.10, 0.02), teethMat);
                tooth1.position.set(-0.035, -0.22, 0.54);
                head.add(tooth1);
                const tooth2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.10, 0.02), teethMat);
                tooth2.position.set(0.035, -0.22, 0.54);
                head.add(tooth2);

                // Ojos tranquilos y serenos
                [-0.25, 0.25].forEach(ex => {
                    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), eyePupilMat);
                    eye.position.set(ex, 0.14, 0.26);
                    head.add(eye);
                });

                AnimalCharacterBuilder.buildAnimalLimbs(capyFurMat, pawPadMat, clawMat, leftArmPivot, leftElbowPivot, rightArmPivot, rightElbowPivot, leftLegPivot, leftKneePivot, rightLegPivot, rightKneePivot);
                break;
            }

            case 'ranaik': {
                // 5. RANAIK: RANA DORADA VENENOSA DEL CHOCÓ
                const frogGoldMat = new THREE.MeshStandardMaterial({
                    color: 0xfacc15,
                    roughness: 0.25,
                    metalness: 0.15,
                    emissive: 0xd97706,
                    emissiveIntensity: 0.12
                });
                const frogBeltMat = new THREE.MeshStandardMaterial({ color: 0x0891b2, roughness: 0.35 });
                const frogSpotMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });

                // Torso esbelto anfibio y aerodinámico
                const belly = new THREE.Mesh(new THREE.SphereGeometry(0.36, 20, 16), frogGoldMat);
                belly.scale.set(1.0, 0.92, 1.0);
                belly.position.set(0, -0.14, 0.02);
                torso.add(belly);

                const chest = new THREE.Mesh(new THREE.SphereGeometry(0.36, 20, 16), frogGoldMat);
                chest.scale.set(1.0, 0.92, 0.96);
                chest.position.set(0, 0.18, 0);
                torso.add(chest);

                // Manchas dorsales oscuras
                [[-0.10, 0.22, -0.24], [0.10, 0.22, -0.24], [0, 0.06, -0.24]].forEach(([sx, sy, sz]) => {
                    const spot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), frogSpotMat);
                    spot.position.set(sx, sy, sz);
                    torso.add(spot);
                });

                // Cinturón ninja cian
                const belt = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.06, 16, 24), frogBeltMat);
                belt.rotation.x = Math.PI / 2;
                belt.position.set(0, -0.32, 0);
                torso.add(belt);

                const buckle = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 16), goldMat);
                buckle.rotation.x = Math.PI / 2;
                buckle.position.set(0, -0.32, 0.34);
                torso.add(buckle);

                // Cabeza ancha y divertida de rana
                const frogHead = new THREE.Mesh(new THREE.SphereGeometry(0.44, 24, 18), frogGoldMat);
                frogHead.scale.set(1.18, 0.80, 1.15);
                head.add(frogHead);

                // Cinta cian en la cabeza
                const band = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.055, 16, 24), frogBeltMat);
                band.rotation.x = Math.PI / 2;
                band.position.set(0, 0.16, 0);
                head.add(band);

                // Ojos saltones gigantes de anfibio
                [-0.24, 0.24].forEach(ex => {
                    const eyeBulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), frogGoldMat);
                    eyeBulb.position.set(ex, 0.26, 0.15);
                    head.add(eyeBulb);

                    const eyeIris = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), frogSpotMat);
                    eyeIris.position.set(ex, 0.28, 0.22);
                    head.add(eyeIris);

                    const pupilGleam = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), eyeScleraMat);
                    pupilGleam.position.set(ex + 0.02, 0.31, 0.28);
                    head.add(pupilGleam);
                });

                AnimalCharacterBuilder.buildAnimalLimbs(frogGoldMat, frogSpotMat, clawMat, leftArmPivot, leftElbowPivot, rightArmPivot, rightElbowPivot, leftLegPivot, leftKneePivot, rightLegPivot, rightKneePivot);
                break;
            }

            case 'el_invernal':
            default: {
                // VILLANO PRINCIPAL: EL INVERNAL (Pantera corrompida por frío)
                const darkOcelotMat = new THREE.MeshStandardMaterial({ color: 0x312e81, roughness: 0.55 });
                const frostPurpleMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x6b21a8, emissiveIntensity: 0.5 });
                const silverArmorMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 });

                const chest = new THREE.Mesh(new THREE.SphereGeometry(0.46, 24, 20), darkOcelotMat);
                chest.position.y = 0.15;
                torso.add(chest);

                const belly = new THREE.Mesh(new THREE.SphereGeometry(0.40, 24, 20), frostPurpleMat);
                belly.position.y = -0.22;
                torso.add(belly);

                const headVillain = new THREE.Mesh(new THREE.SphereGeometry(0.44, 24, 20), darkOcelotMat);
                headVillain.scale.set(1.08, 0.98, 1.08);
                head.add(headVillain);

                [-0.26, 0.26].forEach(ex => {
                    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 16), darkOcelotMat);
                    ear.position.set(ex, 0.44, 0);
                    head.add(ear);
                });

                AnimalCharacterBuilder.buildAnimalLimbs(darkOcelotMat, frostPurpleMat, silverArmorMat, leftArmPivot, leftElbowPivot, rightArmPivot, rightElbowPivot, leftLegPivot, leftKneePivot, rightLegPivot, rightKneePivot);
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

    // Extremidades de animales con pelaje natural y patas redondeadas auténticas
    static buildAnimalLimbs(furMat, pawPadMat, clawMat, lArm, lElbow, rArm, rElbow, lLeg, lKnee, rLeg, rKnee) {
        // Brazos con silueta orgánica
        const lUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.38, 16), furMat);
        lUpper.position.y = -0.19;
        lArm.add(lUpper);

        const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.38, 16), furMat);
        lForearm.position.y = -0.19;
        lElbow.add(lForearm);

        // Pata animal con dedos y almohadillas suaves
        const lHandPaw = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 14), furMat);
        lHandPaw.position.set(0, -0.40, 0.06);
        lHandPaw.scale.set(1.0, 0.85, 1.15);
        lElbow.add(lHandPaw);

        // Almohadilla palmar
        const lPalmPad = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), pawPadMat);
        lPalmPad.position.set(0, -0.44, 0.10);
        lElbow.add(lPalmPad);

        const rUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.38, 16), furMat);
        rUpper.position.y = -0.19;
        rArm.add(rUpper);

        const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.38, 16), furMat);
        rForearm.position.y = -0.19;
        rElbow.add(rForearm);

        const rHandPaw = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 14), furMat);
        rHandPaw.position.set(0, -0.40, 0.06);
        rHandPaw.scale.set(1.0, 0.85, 1.15);
        rElbow.add(rHandPaw);

        const rPalmPad = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), pawPadMat);
        rPalmPad.position.set(0, -0.44, 0.10);
        rElbow.add(rPalmPad);

        // Piernas fuertes y estables de animal
        const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.16, 0.40, 16), furMat);
        lThigh.position.y = -0.20;
        lLeg.add(lThigh);

        const lShin = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.40, 16), furMat);
        lShin.position.y = -0.20;
        lKnee.add(lShin);

        // Pata trasera de animal plantígrada / digitígrada
        const lFootPaw = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 14), furMat);
        lFootPaw.position.set(0, -0.40, 0.10);
        lFootPaw.scale.set(1.1, 0.75, 1.35);
        lKnee.add(lFootPaw);

        // Almohadillas en los dedos de la pata
        [-0.07, 0, 0.07].forEach(px => {
            const pad = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), pawPadMat);
            pad.position.set(px, -0.45, 0.20);
            lKnee.add(pad);
        });

        const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.16, 0.40, 16), furMat);
        rThigh.position.y = -0.20;
        rLeg.add(rThigh);

        const rShin = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.40, 16), furMat);
        rShin.position.y = -0.20;
        rKnee.add(rShin);

        const rFootPaw = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 14), furMat);
        rFootPaw.position.set(0, -0.40, 0.10);
        rFootPaw.scale.set(1.1, 0.75, 1.35);
        rKnee.add(rFootPaw);

        [-0.07, 0, 0.07].forEach(px => {
            const pad = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), pawPadMat);
            pad.position.set(px, -0.45, 0.20);
            rKnee.add(pad);
        });
    }

    // Alas de ave para Guaca
    static buildBirdWings(redMat, blueMat, yellowMat, lArm, lElbow, rArm, rElbow) {
        [-1, 1].forEach(side => {
            const arm = side < 0 ? lArm : rArm;
            const elbow = side < 0 ? lElbow : rElbow;

            const upperFeathers = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.38, 0.26), redMat);
            upperFeathers.position.set(0, -0.19, -0.06);
            arm.add(upperFeathers);

            const wingSpan = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.34), blueMat);
            wingSpan.position.set(0, -0.20, -0.10);
            elbow.add(wingSpan);

            // Borde dorado inferior de la pluma
            const wingGoldEdge = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.14, 0.36), yellowMat);
            wingGoldEdge.position.set(0, -0.40, -0.10);
            elbow.add(wingGoldEdge);
        });
    }

    // Patas de ave para Guaca
    static buildBirdLegs(beakMat, lLeg, lKnee, rLeg, rKnee) {
        [lLeg, rLeg].forEach(leg => {
            const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.38, 12), beakMat);
            thigh.position.y = -0.19;
            leg.add(thigh);
        });

        [lKnee, rKnee].forEach(knee => {
            const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.40, 12), beakMat);
            shin.position.y = -0.20;
            knee.add(shin);

            // Garras de ave
            const claw = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.07, 0.28), beakMat);
            claw.position.set(0, -0.40, 0.06);
            knee.add(claw);
        });
    }
}
