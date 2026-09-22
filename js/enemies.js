// js/enemies.js - Enemigos Caricaturescos estilo Roblox, IA Activa y Saltarines
import * as THREE from 'three';
import { sounds } from './sound.js';

export class EnemyManager {
    constructor(scene, particles) {
        this.scene = scene;
        this.particles = particles;
        this.enemies = [];
        this.wave = 1;
        this.bossSpawned = false;

        // Iniciar primeros enemigos activos
        this.spawnInitialEnemies();
    }

    spawnInitialEnemies() {
        // 1 Muñeco de práctica estático en una esquina para pruebas
        this.spawnDummy(new THREE.Vector3(0, 0, -9));

        // 2 Ninjas de las sombras patrullando y persiguiendo
        this.spawnShadowNinja(new THREE.Vector3(-14, 0, 8));
        this.spawnShadowNinja(new THREE.Vector3(14, 0, 8));

        // 2 Ninjas acróbatas saltadores
        this.spawnAcrobatNinja(new THREE.Vector3(-18, 0, -14));
        this.spawnAcrobatNinja(new THREE.Vector3(18, 0, -14));
    }

    createHealthBar(maxHealth) {
        const group = new THREE.Group();
        group.position.y = 2.4;

        // Fondo oscuro
        const bgGeom = new THREE.BoxGeometry(1.2, 0.16, 0.05);
        const bgMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
        const bg = new THREE.Mesh(bgGeom, bgMat);
        group.add(bg);

        // Barra de vida verde
        const barGeom = new THREE.BoxGeometry(1.16, 0.12, 0.06);
        const barMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
        const bar = new THREE.Mesh(barGeom, barMat);
        bar.position.z = 0.01;
        group.add(bar);

        group.barMesh = bar;
        group.maxHealth = maxHealth;
        return group;
    }

    updateHealthBar(healthBarGroup, currentHealth) {
        const ratio = Math.max(0, currentHealth / healthBarGroup.maxHealth);
        healthBarGroup.barMesh.scale.x = ratio;
        healthBarGroup.barMesh.position.x = -(1 - ratio) * 0.58;

        if (ratio < 0.3) {
            healthBarGroup.barMesh.material.color.setHex(0xef4444); // Rojo crítico
        } else if (ratio < 0.6) {
            healthBarGroup.barMesh.material.color.setHex(0xeab308); // Amarillo
        } else {
            healthBarGroup.barMesh.material.color.setHex(0x22c55e); // Verde
        }
    }

    spawnDummy(pos) {
        const group = new THREE.Group();
        group.position.copy(pos);

        const woodMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.8 });
        const strawMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.9 });
        const ropeMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });

        // Poste central redondeado de cedro
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.9, 12), woodMat);
        post.position.y = 0.95;
        post.castShadow = true;
        group.add(post);

        // Torso acolchado cilíndrico de paja trenzada
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.38, 0.95, 16), strawMat);
        body.position.y = 1.4;
        body.castShadow = true;
        group.add(body);

        // Cuerdas de cáñamo atadas alrededor del torso
        [-0.2, 0.0, 0.2].forEach(yOff => {
            const rope = new THREE.Mesh(new THREE.TorusGeometry(0.41, 0.03, 6, 16), ropeMat);
            rope.rotation.x = Math.PI / 2;
            rope.position.y = 1.4 + yOff;
            group.add(rope);
        });

        // Cabeza esférica de paja
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 12), strawMat);
        head.position.y = 2.05;
        head.castShadow = true;
        group.add(head);

        // Cintas de entrenamiento
        const headband = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 12), new THREE.MeshStandardMaterial({ color: 0xd92323 }));
        headband.position.y = 2.12;
        group.add(headband);

        // Brazos de madera horizontales redondeados
        const crossArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.7, 10), woodMat);
        crossArm.rotation.z = Math.PI / 2;
        crossArm.position.y = 1.4;
        group.add(crossArm);

        // Barra de vida
        const healthBar = this.createHealthBar(35);
        healthBar.position.y = 2.65;
        group.add(healthBar);

        const enemy = {
            mesh: group,
            type: 'dummy',
            name: 'Muñeco de Práctica',
            health: 35,
            maxHealth: 35,
            healthBar: healthBar,
            coinsDrop: 12,
            xpDrop: 20,
            originalPos: pos.clone(),
            attackCooldown: 99999,
            bodyMesh: body,
            velocity: new THREE.Vector3(0, 0, 0),
            isGrounded: true
        };

        this.enemies.push(enemy);
        this.scene.add(group);
    }

    spawnShadowNinja(pos) {
        const group = new THREE.Group();
        group.position.copy(pos);

        const suitMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.2 });
        const purpleClothMat = new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.4 });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
        const steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 });

        // 1. Torso Humanoide Anatómico
        const torsoGroup = new THREE.Group();
        torsoGroup.position.y = 1.3;
        group.add(torsoGroup);

        const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.30, 0.52, 14), suitMat);
        chest.position.y = 0.12;
        chest.castShadow = true;
        torsoGroup.add(chest);

        const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.27, 0.40, 14), suitMat);
        waist.position.y = -0.22;
        waist.castShadow = true;
        torsoGroup.add(waist);

        // Cinturón púrpura
        const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.14, 14), purpleClothMat);
        belt.position.y = -0.30;
        torsoGroup.add(belt);

        // 2. Cabeza Humanoide con capucha y ojos rojos
        const headGroup = new THREE.Group();
        headGroup.position.y = 0.65;
        torsoGroup.add(headGroup);

        const hoodGeom = new THREE.SphereGeometry(0.32, 14, 14);
        hoodGeom.scale(1.0, 1.12, 1.05);
        const hood = new THREE.Mesh(hoodGeom, suitMat);
        hood.castShadow = true;
        headGroup.add(hood);

        // Máscara
        const mask = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.20, 0.28, 12), suitMat);
        mask.position.set(0, -0.1, 0.08);
        headGroup.add(mask);

        // Ojos amenazantes de ninja sombra
        [-0.10, 0.10].forEach((eyeX) => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
            eye.scale.set(1.2, 0.5, 0.4);
            eye.position.set(eyeX, 0.05, 0.31);
            headGroup.add(eye);
        });

        // 3. Brazo Izquierdo Humanoide
        const leftArmPivot = new THREE.Group();
        leftArmPivot.position.set(-0.44, 0.32, 0);
        torsoGroup.add(leftArmPivot);

        const lShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), purpleClothMat);
        leftArmPivot.add(lShoulder);

        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.38, 10), suitMat);
        lArm.position.y = -0.20;
        leftArmPivot.add(lArm);

        const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.08, 0.40, 10), purpleClothMat);
        lForearm.position.y = -0.50;
        leftArmPivot.add(lForearm);

        // 4. Brazo Derecho Humanoide con Katana
        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(0.44, 0.32, 0);
        torsoGroup.add(rightArmPivot);

        const rShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), purpleClothMat);
        rightArmPivot.add(rShoulder);

        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.38, 10), suitMat);
        rArm.position.y = -0.20;
        rightArmPivot.add(rArm);

        const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.08, 0.40, 10), purpleClothMat);
        rForearm.position.y = -0.50;
        rightArmPivot.add(rForearm);

        // Katana de acero curvada
        const katana = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.25, 0.03), steelMat);
        katana.position.set(0, -0.65, 0.30);
        katana.rotation.x = Math.PI / 3;
        rightArmPivot.add(katana);

        // 5. Piernas Humanoides
        const leftLegPivot = new THREE.Group();
        leftLegPivot.position.set(-0.18, -0.42, 0);
        torsoGroup.add(leftLegPivot);

        const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.44, 10), suitMat);
        lThigh.position.y = -0.22;
        leftLegPivot.add(lThigh);

        const lShin = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.10, 0.45, 10), purpleClothMat);
        lShin.position.y = -0.60;
        leftLegPivot.add(lShin);

        const rightLegPivot = new THREE.Group();
        rightLegPivot.position.set(0.18, -0.42, 0);
        torsoGroup.add(rightLegPivot);

        const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.44, 10), suitMat);
        rThigh.position.y = -0.22;
        rightLegPivot.add(rThigh);

        const rShin = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.10, 0.45, 10), purpleClothMat);
        rShin.position.y = -0.60;
        rightLegPivot.add(rShin);

        // Barra de vida
        const healthBar = this.createHealthBar(65);
        healthBar.position.y = 2.6;
        group.add(healthBar);

        const enemy = {
            mesh: group,
            type: 'shadow_ninja',
            name: 'Ninja Sombra',
            health: 65,
            maxHealth: 65,
            healthBar: healthBar,
            coinsDrop: 28,
            xpDrop: 45,
            damage: 8,
            speed: 9.0, // Rápido y ágil
            attackRange: 2.2,
            attackCooldown: 1.0,
            timer: 0,
            bodyMesh: chest,
            velocity: new THREE.Vector3(0, 0, 0),
            isGrounded: true,
            jumpTimer: 1.5 + Math.random() * 2.0,
            patrolTarget: pos.clone(),
            patrolTimer: 0,
            originalPos: pos.clone(),
            rightArmPivot: rightArmPivot,
            leftArmPivot: leftArmPivot,
            leftLegPivot: leftLegPivot,
            rightLegPivot: rightLegPivot
        };

        this.enemies.push(enemy);
        this.scene.add(group);
    }

    spawnAcrobatNinja(pos) {
        const group = new THREE.Group();
        group.position.copy(pos);

        const suitMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.45 }); // Azul cian
        const whiteClothMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 }); // Ojos dorados
        const energyBladeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8, roughness: 0.2 });

        // 1. Torso Humanoide Atlético
        const torsoGroup = new THREE.Group();
        torsoGroup.position.y = 1.25;
        group.add(torsoGroup);

        const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.28, 0.48, 14), suitMat);
        chest.position.y = 0.10;
        chest.castShadow = true;
        torsoGroup.add(chest);

        const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.25, 0.38, 14), suitMat);
        waist.position.y = -0.20;
        waist.castShadow = true;
        torsoGroup.add(waist);

        const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.12, 14), whiteClothMat);
        belt.position.y = -0.28;
        torsoGroup.add(belt);

        // 2. Cabeza Humanoide con capucha y ojos dorados
        const headGroup = new THREE.Group();
        headGroup.position.y = 0.62;
        torsoGroup.add(headGroup);

        const hoodGeom = new THREE.SphereGeometry(0.30, 14, 14);
        hoodGeom.scale(1.0, 1.12, 1.05);
        const hood = new THREE.Mesh(hoodGeom, suitMat);
        hood.castShadow = true;
        headGroup.add(hood);

        const mask = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.18, 0.26, 12), suitMat);
        mask.position.set(0, -0.1, 0.08);
        headGroup.add(mask);

        // Bandana blanca envolvente
        const headband = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.10, 14, 1, true, -Math.PI * 0.5, Math.PI), whiteClothMat);
        headband.position.y = 0.12;
        headGroup.add(headband);

        [-0.09, 0.09].forEach(eyeX => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), eyeMat);
            eye.scale.set(1.2, 0.5, 0.4);
            eye.position.set(eyeX, 0.04, 0.29);
            headGroup.add(eye);
        });

        // 3. Brazo Izquierdo Humanoide
        const leftArmPivot = new THREE.Group();
        leftArmPivot.position.set(-0.40, 0.30, 0);
        torsoGroup.add(leftArmPivot);

        const lShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), whiteClothMat);
        leftArmPivot.add(lShoulder);

        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.08, 0.36, 10), suitMat);
        lArm.position.y = -0.18;
        leftArmPivot.add(lArm);

        const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.38, 10), whiteClothMat);
        lForearm.position.y = -0.46;
        leftArmPivot.add(lForearm);

        // 4. Brazo Derecho Humanoide con doble hoja de energía
        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(0.40, 0.30, 0);
        torsoGroup.add(rightArmPivot);

        const rShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), whiteClothMat);
        rightArmPivot.add(rShoulder);

        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.08, 0.36, 10), suitMat);
        rArm.position.y = -0.18;
        rightArmPivot.add(rArm);

        const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.38, 10), whiteClothMat);
        rForearm.position.y = -0.46;
        rightArmPivot.add(rForearm);

        // Hoja luminosa ágil
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.9, 0.03), energyBladeMat);
        blade.position.set(0, -0.55, 0.22);
        blade.rotation.x = Math.PI / 4;
        rightArmPivot.add(blade);

        // 5. Piernas Humanoides
        const leftLegPivot = new THREE.Group();
        leftLegPivot.position.set(-0.16, -0.38, 0);
        torsoGroup.add(leftLegPivot);

        const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.40, 10), suitMat);
        lThigh.position.y = -0.20;
        leftLegPivot.add(lThigh);

        const lShin = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.42, 10), whiteClothMat);
        lShin.position.y = -0.54;
        leftLegPivot.add(lShin);

        const rightLegPivot = new THREE.Group();
        rightLegPivot.position.set(0.16, -0.38, 0);
        torsoGroup.add(rightLegPivot);

        const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.40, 10), suitMat);
        rThigh.position.y = -0.20;
        rightLegPivot.add(rThigh);

        const rShin = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.42, 10), whiteClothMat);
        rShin.position.y = -0.54;
        rightLegPivot.add(rShin);

        // Barra de vida
        const healthBar = this.createHealthBar(50);
        healthBar.position.y = 2.5;
        group.add(healthBar);

        const enemy = {
            mesh: group,
            type: 'acrobat',
            name: 'Ninja Acróbata Saltador',
            health: 50,
            maxHealth: 50,
            healthBar: healthBar,
            coinsDrop: 32,
            xpDrop: 55,
            damage: 6,
            speed: 10.5, // Muy veloz
            attackRange: 2.4,
            attackCooldown: 0.9,
            timer: 0,
            bodyMesh: chest,
            velocity: new THREE.Vector3(0, 0, 0),
            isGrounded: true,
            jumpTimer: 1.0 + Math.random() * 1.5,
            patrolTarget: pos.clone(),
            patrolTimer: 0,
            originalPos: pos.clone(),
            rightArmPivot: rightArmPivot,
            leftArmPivot: leftArmPivot,
            leftLegPivot: leftLegPivot,
            rightLegPivot: rightLegPivot
        };

        this.enemies.push(enemy);
        this.scene.add(group);
    }

    spawnBoss(pos) {
        if (this.bossSpawned) return;
        this.bossSpawned = true;

        const group = new THREE.Group();
        group.position.copy(pos);
        group.scale.set(1.6, 1.6, 1.6); // Jefe samurái gigante

        const armorMat = new THREE.MeshStandardMaterial({
            color: 0x881337, // Carmesí laqueado samurái
            metalness: 0.6,
            roughness: 0.3
        });
        const goldMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            metalness: 0.9,
            roughness: 0.2
        });
        const steelBladeMat = new THREE.MeshStandardMaterial({
            color: 0xfecdd3,
            metalness: 0.85,
            roughness: 0.15
        });
        const darkArmorMat = new THREE.MeshStandardMaterial({
            color: 0x18181b,
            roughness: 0.5
        });

        // 1. Torso Imponente con Armadura Samurái (Dō)
        const torsoGroup = new THREE.Group();
        torsoGroup.position.y = 1.45;
        group.add(torsoGroup);

        const cuirass = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.46, 0.75, 16), armorMat);
        cuirass.position.y = 0.18;
        cuirass.castShadow = true;
        torsoGroup.add(cuirass);

        // Cinturón y placas colgantes de la armadura (Kusazuri)
        const faulds = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.54, 0.42, 16), darkArmorMat);
        faulds.position.y = -0.28;
        faulds.castShadow = true;
        torsoGroup.add(faulds);

        // 2. Casco Tradicional Kabuto y Máscara de Guerra (Menpo)
        const headGroup = new THREE.Group();
        headGroup.position.y = 0.82;
        torsoGroup.add(headGroup);

        // Cúpula del casco Kabuto
        const kabutoDome = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), armorMat);
        kabutoDome.scale.set(1.05, 1.0, 1.15);
        headGroup.add(kabutoDome);

        // Visera del casco
        const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.08, 16, 1, true, -Math.PI * 0.4, Math.PI * 0.8), goldMat);
        visor.position.set(0, 0.05, 0.08);
        headGroup.add(visor);

        // Gran cresta frontal de luna creciente dorada (Maedate)
        const crescentHornL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.75, 6), goldMat);
        crescentHornL.position.set(-0.25, 0.5, 0.18);
        crescentHornL.rotation.z = 0.5;
        crescentHornL.rotation.x = -0.2;
        headGroup.add(crescentHornL);

        const crescentHornR = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.75, 6), goldMat);
        crescentHornR.position.set(0.25, 0.5, 0.18);
        crescentHornR.rotation.z = -0.5;
        crescentHornR.rotation.x = -0.2;
        headGroup.add(crescentHornR);

        // Máscara samurái negra (Menpo) con ojos llameantes
        const menpo = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.22, 0.32, 14), darkArmorMat);
        menpo.position.set(0, -0.15, 0.15);
        headGroup.add(menpo);

        // Ojos de fuego del samurái
        [-0.14, 0.14].forEach(eyeX => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff2222 }));
            eye.position.set(eyeX, 0.04, 0.38);
            headGroup.add(eye);
        });

        // 3. Brazo Izquierdo con Gran Hombrera Samurái (Ō-sode)
        const leftArmPivot = new THREE.Group();
        leftArmPivot.position.set(-0.66, 0.42, 0);
        torsoGroup.add(leftArmPivot);

        const lSode = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 0.38), armorMat);
        lSode.position.set(-0.10, 0.05, 0);
        lSode.rotation.z = -0.2;
        leftArmPivot.add(lSode);

        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.46, 12), darkArmorMat);
        lArm.position.y = -0.24;
        leftArmPivot.add(lArm);

        const lBracer = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.50, 12), armorMat);
        lBracer.position.y = -0.62;
        leftArmPivot.add(lBracer);

        // 4. Brazo Derecho con Hombrera y Gran Nodachi
        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(0.66, 0.42, 0);
        torsoGroup.add(rightArmPivot);

        const rSode = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 0.38), armorMat);
        rSode.position.set(0.10, 0.05, 0);
        rSode.rotation.z = 0.2;
        rightArmPivot.add(rSode);

        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.46, 12), darkArmorMat);
        rArm.position.y = -0.24;
        rightArmPivot.add(rArm);

        const rBracer = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.50, 12), armorMat);
        rBracer.position.y = -0.62;
        rightArmPivot.add(rBracer);

        // Gran Nodachi Samurái (Espada Gigante Curvada)
        const nodachi = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 0.05), steelBladeMat);
        nodachi.position.set(0, -1.0, 0.45);
        nodachi.rotation.x = Math.PI / 3;
        rightArmPivot.add(nodachi);

        // 5. Piernas Acorazadas (Haidate y Suneate)
        const leftLegPivot = new THREE.Group();
        leftLegPivot.position.set(-0.25, -0.48, 0);
        torsoGroup.add(leftLegPivot);

        const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.52, 12), darkArmorMat);
        lThigh.position.y = -0.26;
        leftLegPivot.add(lThigh);

        const lShin = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.15, 0.56, 12), armorMat);
        lShin.position.y = -0.72;
        leftLegPivot.add(lShin);

        const rightLegPivot = new THREE.Group();
        rightLegPivot.position.set(0.25, -0.48, 0);
        torsoGroup.add(rightLegPivot);

        const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.52, 12), darkArmorMat);
        rThigh.position.y = -0.26;
        rightLegPivot.add(rThigh);

        const rShin = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.15, 0.56, 12), armorMat);
        rShin.position.y = -0.72;
        rightLegPivot.add(rShin);

        // Barra de vida gigante
        const healthBar = this.createHealthBar(280);
        healthBar.scale.set(1.5, 1.5, 1.5);
        healthBar.position.y = 3.8;
        group.add(healthBar);

        const enemy = {
            mesh: group,
            type: 'boss',
            name: 'Gran Samurái de las Sombras (JEFE)',
            health: 280,
            maxHealth: 280,
            healthBar: healthBar,
            coinsDrop: 160,
            xpDrop: 220,
            damage: 16,
            speed: 6.8, // Persecución constante
            attackRange: 3.5,
            attackCooldown: 1.4,
            timer: 0,
            bodyMesh: cuirass,
            velocity: new THREE.Vector3(0, 0, 0),
            isGrounded: true,
            jumpTimer: 2.5,
            patrolTarget: pos.clone(),
            patrolTimer: 0,
            originalPos: pos.clone(),
            rightArmPivot: rightArmPivot,
            leftArmPivot: leftArmPivot,
            leftLegPivot: leftLegPivot,
            rightLegPivot: rightLegPivot
        };

        this.enemies.push(enemy);
        this.scene.add(group);
    }

    damageEnemy(enemy, amount, isCrit, hitDirection, onEnemyDefeated) {
        enemy.health = Math.max(0, enemy.health - amount);
        this.updateHealthBar(enemy.healthBar, enemy.health);

        // Sonido de golpe
        sounds.playHit(isCrit);

        // Chispas de impacto
        this.particles.createHitSparks(enemy.mesh.position.clone().add(new THREE.Vector3(0, 1.2, 0)), isCrit);

        // Destello blanco de daño
        if (enemy.bodyMesh && enemy.bodyMesh.material) {
            const originalColor = enemy.bodyMesh.material.color.getHex();
            enemy.bodyMesh.material.color.setHex(0xffffff);
            setTimeout(() => {
                if (enemy.bodyMesh && enemy.bodyMesh.material) {
                    enemy.bodyMesh.material.color.setHex(originalColor);
                }
            }, 100);
        }

        // Retroceso (knockback) y salto de dolor
        if (hitDirection && enemy.type !== 'dummy') {
            enemy.mesh.position.addScaledVector(hitDirection, isCrit ? 1.8 : 0.9);
            if (enemy.isGrounded) {
                enemy.velocity.y = isCrit ? 8.0 : 4.5;
                enemy.isGrounded = false;
            }
        }

        // Si es derrotado
        if (enemy.health <= 0) {
            this.handleEnemyDefeat(enemy, onEnemyDefeated);
        }
    }

    handleEnemyDefeat(enemy, onEnemyDefeated) {
        sounds.playPoof();

        // Efecto cómico de humo
        const scale = enemy.type === 'boss' ? 2.5 : 1.2;
        this.particles.createSmokePoof(enemy.mesh.position.clone().add(new THREE.Vector3(0, 1, 0)), scale);

        // Si era el jefe, lanzar confeti de celebración
        if (enemy.type === 'boss') {
            sounds.playLevelUp();
            this.particles.createConfetti(enemy.mesh.position);
            this.bossSpawned = false;
        }

        // Soltar lluvia de monedas doradas
        const coinCount = enemy.type === 'boss' ? 14 : (enemy.type === 'acrobat' ? 6 : 4);
        const valuePerCoin = Math.max(1, Math.round(enemy.coinsDrop / coinCount));

        for (let i = 0; i < coinCount; i++) {
            this.particles.spawnCoin(
                enemy.mesh.position.clone().add(new THREE.Vector3(0, 1.0, 0)),
                valuePerCoin
            );
        }

        if (onEnemyDefeated) {
            onEnemyDefeated(enemy);
        }

        // Quitar de la escena
        this.scene.remove(enemy.mesh);
        const index = this.enemies.indexOf(enemy);
        if (index !== -1) {
            this.enemies.splice(index, 1);
        }

        // Reaparición rápida de enemigos para mantener la arena llena de acción continua
        if (enemy.type === 'dummy') {
            setTimeout(() => {
                this.spawnDummy(enemy.originalPos);
            }, 5000);
        } else if (enemy.type !== 'boss') {
            setTimeout(() => {
                const angle = Math.random() * Math.PI * 2;
                const r = 16 + Math.random() * 12;
                const spawnPos = new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r);
                if (Math.random() < 0.5) {
                    this.spawnShadowNinja(spawnPos);
                } else {
                    this.spawnAcrobatNinja(spawnPos);
                }
            }, 4000);
        }
    }

    update(delta, player, camera) {
        const playerPos = player.mesh.position;
        const time = performance.now() * 0.012;

        this.enemies.forEach(enemy => {
            // Orientar barras de vida hacia la cámara del jugador (estilo Billboard)
            if (enemy.healthBar) {
                enemy.healthBar.quaternion.copy(camera.quaternion);
            }

            if (enemy.type === 'dummy') return;

            // 1. Física de gravedad y salto para todos los enemigos activos
            enemy.velocity.y += -26.0 * delta;
            enemy.mesh.position.y += enemy.velocity.y * delta;
            if (enemy.mesh.position.y <= 0) {
                enemy.mesh.position.y = 0;
                enemy.velocity.y = 0;
                enemy.isGrounded = true;
            }

            if (enemy.jumpTimer > 0) {
                enemy.jumpTimer -= delta;
            }

            const dist = enemy.mesh.position.distanceTo(playerPos);

            // 2. IA de Persecución y Combate Activo (hasta 45m de distancia)
            if (dist <= 45.0) {
                // Mirar al jugador directamente
                enemy.mesh.lookAt(playerPos.x, enemy.mesh.position.y, playerPos.z);

                const dir = new THREE.Vector3().subVectors(playerPos, enemy.mesh.position).normalize();

                // ¡Brincar hacia el jugador para acortar distancia o saltar en ataque!
                if (enemy.isGrounded && enemy.jumpTimer <= 0 && dist > 3.2 && dist < 22.0) {
                    const jumpStrength = enemy.type === 'acrobat' ? 14.5 : (enemy.type === 'boss' ? 15.0 : 12.0);
                    enemy.velocity.y = jumpStrength;
                    enemy.isGrounded = false;
                    enemy.jumpTimer = enemy.type === 'acrobat' ? (1.5 + Math.random() * 1.5) : (2.5 + Math.random() * 2.0);
                    sounds.playJump();
                }

                // Perseguir mientras no esté en rango de ataque cuerpo a cuerpo
                if (dist > enemy.attackRange) {
                    enemy.mesh.position.addScaledVector(dir, enemy.speed * delta);

                    // Animación de correr
                    if (enemy.leftLegPivot && enemy.rightLegPivot) {
                        const legSwing = Math.sin(time * 1.2) * 0.7;
                        enemy.leftLegPivot.rotation.x = legSwing;
                        enemy.rightLegPivot.rotation.x = -legSwing;
                    }
                    if (enemy.leftArmPivot) {
                        enemy.leftArmPivot.rotation.x = -Math.sin(time * 1.2) * 0.5;
                    }
                } else {
                    // Atacar al jugador con espada
                    enemy.timer += delta;
                    if (enemy.rightArmPivot) {
                        enemy.rightArmPivot.rotation.x = Math.PI * 0.5 + Math.sin(enemy.timer * 12) * 1.4;
                    }
                    if (enemy.timer >= enemy.attackCooldown) {
                        enemy.timer = 0;
                        player.takeDamage(enemy.damage);
                        sounds.playSlash('normal');
                    }
                }
            } else {
                // 3. Patrulla activa cuando el jugador está lejos (no se quedan congelados)
                enemy.patrolTimer -= delta;
                if (enemy.patrolTimer <= 0) {
                    const angle = Math.random() * Math.PI * 2;
                    const r = 5 + Math.random() * 10;
                    enemy.patrolTarget.set(
                        enemy.originalPos.x + Math.cos(angle) * r,
                        0,
                        enemy.originalPos.z + Math.sin(angle) * r
                    );
                    enemy.patrolTimer = 3.5 + Math.random() * 3.0;
                }

                const distToPatrol = enemy.mesh.position.distanceTo(enemy.patrolTarget);
                if (distToPatrol > 1.2) {
                    const pDir = new THREE.Vector3().subVectors(enemy.patrolTarget, enemy.mesh.position).normalize();
                    enemy.mesh.position.addScaledVector(pDir, enemy.speed * 0.45 * delta);
                    enemy.mesh.lookAt(enemy.patrolTarget.x, enemy.mesh.position.y, enemy.patrolTarget.z);

                    // Animación de trote suave
                    if (enemy.leftLegPivot && enemy.rightLegPivot) {
                        const legSwing = Math.sin(time * 0.7) * 0.4;
                        enemy.leftLegPivot.rotation.x = legSwing;
                        enemy.rightLegPivot.rotation.x = -legSwing;
                    }
                }

                // Pequeños saltos acrobáticos mientras patrullan
                if (enemy.isGrounded && enemy.jumpTimer <= 0 && enemy.type === 'acrobat') {
                    enemy.velocity.y = 9.0;
                    enemy.isGrounded = false;
                    enemy.jumpTimer = 3.0 + Math.random() * 3.0;
                }
            }

            // Límites del mapa para los enemigos
            const arenaRadius = 52.0;
            const distCenter = Math.hypot(enemy.mesh.position.x, enemy.mesh.position.z);
            if (distCenter > arenaRadius) {
                const angle = Math.atan2(enemy.mesh.position.z, enemy.mesh.position.x);
                enemy.mesh.position.x = Math.cos(angle) * arenaRadius;
                enemy.mesh.position.z = Math.sin(angle) * arenaRadius;
            }
        });
    }
}
