// js/enemies.js - Gestor de Enemigos con IA Táctica de Combate, Rodeo y Cinemática Articular
import * as THREE from 'three';
import { sounds } from './sound.js?v=20.1';
import { CAMPAIGN_WORLDS } from './campaign.js?v=20.1';
import { resourceManager } from './core/resourceManager.js';
import { BossAISystem } from './systems/bossAI.js?v=20.1';
import { BOSS_CONFIGS } from './config/bossConfig.js?v=20.1';

export class EnemyManager {
    constructor(scene, particles) {
        this.scene = scene;
        this.particles = particles;
        this.enemies = [];
        this.groundCheckProvider = null;
        this.bossAISystem = new BossAISystem(this.scene, this.particles, sounds);

        this.spawnInitialEnemies('forest');
    }

    clearEnemies() {
        if (this.bossAISystem) this.bossAISystem.hideBossHUD();
        while (this.enemies.length > 0) {
            const e = this.enemies.pop();
            if (e.mesh) {
                this.scene.remove(e.mesh);
                resourceManager.disposeHierarchy(e.mesh);
            }
        }
    }

    spawnInitialEnemies(worldId = 'selva') {
        this.clearEnemies();

        // 1. Muñeco de entrenamiento
        this.spawnDummy(new THREE.Vector3(0, 0, -9));

        if (worldId === 'selva' || worldId === 'forest') {
            // Selva Amazónica: Furtivos de la jungla y acróbatas (6 ninjas)
            this.spawnShadowNinja(new THREE.Vector3(-14, 0, 8), 0, 0x14532d);
            this.spawnShadowNinja(new THREE.Vector3(14, 0, 8), 1, 0x14532d);
            this.spawnShadowNinja(new THREE.Vector3(-16, 0, -14), 2, 0x166534);
            this.spawnShadowNinja(new THREE.Vector3(16, 0, -14), 3, 0x166534);
            this.spawnAcrobatNinja(new THREE.Vector3(-8, 0, 18), 4);
            this.spawnAcrobatNinja(new THREE.Vector3(8, 0, 18), 5);
        } else if (worldId === 'eje_cafetero' || worldId === 'volcano') {
            // Eje Cafetero: Cazadores y acróbatas con colores café/ámbar
            this.spawnShadowNinja(new THREE.Vector3(-14, 0, 8), 0, 0xb45309);
            this.spawnShadowNinja(new THREE.Vector3(14, 0, 8), 1, 0xb45309);
            this.spawnShadowNinja(new THREE.Vector3(-18, 0, -12), 2, 0xd97706);
            this.spawnShadowNinja(new THREE.Vector3(18, 0, -12), 3, 0xd97706);
            this.spawnAcrobatNinja(new THREE.Vector3(-8, 0, 20), 4);
            this.spawnAcrobatNinja(new THREE.Vector3(8, 0, 20), 5);
        } else if (worldId === 'paramo' || worldId === 'snow') {
            // Páramo Andino: Esbirros Glaciales de la Niebla y El Invernal
            this.spawnShadowNinja(new THREE.Vector3(-14, 0, 8), 0, 0x38bdf8);
            this.spawnShadowNinja(new THREE.Vector3(14, 0, 8), 1, 0x38bdf8);
            this.spawnShadowNinja(new THREE.Vector3(-16, 0, -12), 2, 0x6366f1);
            this.spawnShadowNinja(new THREE.Vector3(16, 0, -12), 3, 0x6366f1);
            this.spawnAcrobatNinja(new THREE.Vector3(-8, 0, 18), 4);
            this.spawnAcrobatNinja(new THREE.Vector3(8, 0, 18), 5);
            // El Invernal acechando en el santuario del Páramo
            this.spawnBoss(new THREE.Vector3(0, 0, -22));
        } else if (worldId === 'caribe') {
            // Caribe Colombiano: Corsarios y el Gran Jefe El Invernal en la fortaleza
            this.spawnShadowNinja(new THREE.Vector3(-14, 0, 8), 0, 0x0284c7);
            this.spawnShadowNinja(new THREE.Vector3(14, 0, 8), 1, 0x0284c7);
            this.spawnShadowNinja(new THREE.Vector3(-16, 0, -12), 2, 0x0f766e);
            this.spawnShadowNinja(new THREE.Vector3(16, 0, -12), 3, 0x0f766e);
            this.spawnAcrobatNinja(new THREE.Vector3(-8, 0, 18), 4);
            this.spawnAcrobatNinja(new THREE.Vector3(8, 0, 18), 5);
            // El Invernal acechando la fortaleza del Caribe
            this.spawnBoss(new THREE.Vector3(0, 0, -22));
        }
    }

    createHealthBar(maxHealth) {
        const group = new THREE.Group();

        const bgMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
        const bg = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.2), bgMat);
        group.add(bg);

        const fillMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const fill = new THREE.Mesh(new THREE.PlaneGeometry(1.56, 0.16), fillMat);
        fill.position.z = 0.01;
        group.add(fill);

        group.userData = { fillMesh: fill, maxHealth: maxHealth };
        return group;
    }

    updateHealthBar(healthBarGroup, currentHealth) {
        if (!healthBarGroup || !healthBarGroup.userData) return;
        const maxH = healthBarGroup.userData.maxHealth;
        const pct = Math.max(0, Math.min(1, currentHealth / maxH));

        const fill = healthBarGroup.userData.fillMesh;
        fill.scale.x = pct;
        fill.position.x = -(1.56 * (1 - pct)) / 2;

        if (pct < 0.3) {
            fill.material.color.setHex(0xd97706);
        } else {
            fill.material.color.setHex(0xef4444);
        }
    }

    // =========================================================================
    // 1. MUÑECO DE ENTRENAMIENTO DE DOJO
    // =========================================================================
    spawnDummy(pos) {
        const group = new THREE.Group();
        group.position.copy(pos);

        const cedarMat = new THREE.MeshStandardMaterial({ color: 0x5c2b14, roughness: 0.8 });
        const strawMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 });
        const ropeMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.95 });

        const base = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, 0.25, 20), cedarMat);
        base.position.y = 0.12;
        base.receiveShadow = true;
        group.add(base);

        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 2.6, 16), cedarMat);
        post.position.y = 1.3;
        post.castShadow = true;
        group.add(post);

        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.40, 1.25, 16), strawMat);
        body.position.y = 1.55;
        body.castShadow = true;
        group.add(body);

        [-0.35, 0.0, 0.35].forEach(yOff => {
            const rope = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.04, 8, 20), ropeMat);
            rope.rotation.x = Math.PI / 2;
            rope.position.y = 1.55 + yOff;
            group.add(rope);
        });

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), strawMat);
        head.position.y = 2.45;
        head.castShadow = true;
        group.add(head);

        const crossBar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.8, 12), cedarMat);
        crossBar.rotation.z = Math.PI / 2;
        crossBar.position.y = 1.65;
        crossBar.castShadow = true;
        group.add(crossBar);

        const healthBar = this.createHealthBar(50);
        healthBar.position.y = 3.0;
        group.add(healthBar);

        const enemy = {
            mesh: group,
            type: 'dummy',
            name: 'Muñeco de Práctica',
            health: 50,
            maxHealth: 50,
            healthBar: healthBar,
            coinsDrop: 12,
            xpDrop: 20,
            damage: 0,
            speed: 0,
            attackRange: 0,
            timer: 0,
            bodyMesh: body,
            originalPos: pos.clone(),
            isGrounded: true,
            velocity: new THREE.Vector3(0, 0, 0)
        };

        this.enemies.push(enemy);
        this.scene.add(group);
    }

    // =========================================================================
    // 2. SHINOBI DE LAS SOMBRAS / FUEGO / HIELO (HUMANOIDE ARTICULADO)
    // =========================================================================
    spawnShadowNinja(pos, slotIndex = 0, themeColor = 0x6b21a8) {
        const group = new THREE.Group();
        group.position.copy(pos);

        const suitMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.45 });
        const clothMat = new THREE.MeshStandardMaterial({ color: themeColor, roughness: 0.4 });
        const steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 });

        const torsoGroup = new THREE.Group();
        torsoGroup.position.y = 1.35;
        group.add(torsoGroup);

        // Pecho atlético
        const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.32, 0.52, 20), suitMat);
        chest.position.y = 0.14;
        chest.castShadow = true;
        torsoGroup.add(chest);

        const abs = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.42, 20), suitMat);
        abs.position.y = -0.24;
        torsoGroup.add(abs);

        // Cabeza con capucha y ojos brillantes
        const headGroup = new THREE.Group();
        headGroup.position.y = 0.65;
        torsoGroup.add(headGroup);

        const hood = new THREE.Mesh(new THREE.SphereGeometry(0.35, 20, 16), suitMat);
        hood.scale.set(1.0, 1.1, 1.05);
        headGroup.add(hood);

        [-0.10, 0.10].forEach(eyeX => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: themeColor === 0x18181b ? 0xef4444 : themeColor }));
            eye.position.set(eyeX, 0.04, 0.34);
            headGroup.add(eye);
        });

        // Brazo izquierdo con codo articulado
        const leftArmPivot = new THREE.Group();
        leftArmPivot.position.set(-0.46, 0.32, 0);
        torsoGroup.add(leftArmPivot);

        const lUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.36, 16), suitMat);
        lUpperArm.position.y = -0.18;
        leftArmPivot.add(lUpperArm);

        const leftElbowPivot = new THREE.Group();
        leftElbowPivot.position.set(0, -0.36, 0);
        leftArmPivot.add(leftElbowPivot);

        const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.08, 0.36, 16), clothMat);
        lForearm.position.y = -0.18;
        leftElbowPivot.add(lForearm);

        // Brazo derecho con codo articulado y Katana
        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(0.46, 0.32, 0);
        torsoGroup.add(rightArmPivot);

        const rUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.36, 16), suitMat);
        rUpperArm.position.y = -0.18;
        rightArmPivot.add(rUpperArm);

        const rightElbowPivot = new THREE.Group();
        rightElbowPivot.position.set(0, -0.36, 0);
        rightArmPivot.add(rightElbowPivot);

        const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.08, 0.36, 16), clothMat);
        rForearm.position.y = -0.18;
        rightElbowPivot.add(rForearm);

        const katana = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.25, 0.03), steelMat);
        katana.position.set(0, -0.28, 0.45);
        katana.rotation.x = Math.PI / 3;
        rightElbowPivot.add(katana);

        // Piernas con rodillas articuladas
        const leftLegPivot = new THREE.Group();
        leftLegPivot.position.set(-0.18, -0.42, 0);
        torsoGroup.add(leftLegPivot);

        const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.42, 16), suitMat);
        lThigh.position.y = -0.21;
        leftLegPivot.add(lThigh);

        const leftKneePivot = new THREE.Group();
        leftKneePivot.position.set(0, -0.42, 0);
        leftLegPivot.add(leftKneePivot);

        const lShin = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.10, 0.42, 16), clothMat);
        lShin.position.y = -0.21;
        leftKneePivot.add(lShin);

        const rightLegPivot = new THREE.Group();
        rightLegPivot.position.set(0.18, -0.42, 0);
        torsoGroup.add(rightLegPivot);

        const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.42, 16), suitMat);
        rThigh.position.y = -0.21;
        rightLegPivot.add(rThigh);

        const rightKneePivot = new THREE.Group();
        rightKneePivot.position.set(0, -0.42, 0);
        rightLegPivot.add(rightKneePivot);

        const rShin = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.10, 0.42, 16), clothMat);
        rShin.position.y = -0.21;
        rightKneePivot.add(rShin);

        const healthBar = this.createHealthBar(65);
        healthBar.position.y = 2.6;
        group.add(healthBar);

        const enemy = {
            mesh: group,
            type: 'shadow_ninja',
            name: 'Ninja de las Sombras',
            health: 65,
            maxHealth: 65,
            healthBar: healthBar,
            coinsDrop: 28,
            xpDrop: 45,
            damage: 8,
            speed: 8.5,
            attackRange: 2.2,
            attackCooldown: 1.2,
            timer: 0,
            bodyMesh: chest,
            velocity: new THREE.Vector3(0, 0, 0),
            isGrounded: true,
            jumpTimer: 1.5 + Math.random() * 2.0,
            patrolTarget: pos.clone(),
            patrolTimer: 0,
            originalPos: pos.clone(),
            slotIndex: slotIndex,
            aiState: 'circling', // 'circling' | 'lunging' | 'retreating'
            stateTimer: Math.random() * 2.0,
            combatRadius: 4.8 + Math.random() * 1.2,
            rightArmPivot: rightArmPivot,
            rightElbowPivot: rightElbowPivot,
            leftArmPivot: leftArmPivot,
            leftElbowPivot: leftElbowPivot,
            leftLegPivot: leftLegPivot,
            leftKneePivot: leftKneePivot,
            rightLegPivot: rightLegPivot,
            rightKneePivot: rightKneePivot
        };

        this.enemies.push(enemy);
        this.scene.add(group);
    }

    // =========================================================================
    // 3. NINJA ACRÓBATA (ÁGIL, SALTOS FLANQUEADORES)
    // =========================================================================
    spawnAcrobatNinja(pos, slotIndex = 3) {
        const group = new THREE.Group();
        group.position.copy(pos);

        const suitMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
        const cyanMat = new THREE.MeshStandardMaterial({
            color: 0x06b6d4,
            emissive: 0x0891b2,
            emissiveIntensity: 0.3,
            roughness: 0.3
        });
        const energyBladeMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });

        const torsoGroup = new THREE.Group();
        torsoGroup.position.y = 1.3;
        group.add(torsoGroup);

        const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.28, 0.50, 16), suitMat);
        chest.position.y = 0.12;
        torsoGroup.add(chest);

        const headGroup = new THREE.Group();
        headGroup.position.y = 0.62;
        torsoGroup.add(headGroup);

        const hood = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), suitMat);
        headGroup.add(hood);

        [-0.09, 0.09].forEach(eyeX => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
            eye.position.set(eyeX, 0.04, 0.32);
            headGroup.add(eye);
        });

        // Brazos articulados con dobles dagas de energía
        const leftArmPivot = new THREE.Group();
        leftArmPivot.position.set(-0.42, 0.30, 0);
        torsoGroup.add(leftArmPivot);

        const leftElbowPivot = new THREE.Group();
        leftElbowPivot.position.set(0, -0.34, 0);
        leftArmPivot.add(leftElbowPivot);

        const lDagger = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.75, 0.02), energyBladeMat);
        lDagger.position.set(0, -0.25, 0.25);
        lDagger.rotation.x = Math.PI / 3;
        leftElbowPivot.add(lDagger);

        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(0.42, 0.30, 0);
        torsoGroup.add(rightArmPivot);

        const rightElbowPivot = new THREE.Group();
        rightElbowPivot.position.set(0, -0.34, 0);
        rightArmPivot.add(rightElbowPivot);

        const rDagger = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.75, 0.02), energyBladeMat);
        rDagger.position.set(0, -0.25, 0.25);
        rDagger.rotation.x = Math.PI / 3;
        rightElbowPivot.add(rDagger);

        // Piernas articuladas
        const leftLegPivot = new THREE.Group();
        leftLegPivot.position.set(-0.16, -0.38, 0);
        torsoGroup.add(leftLegPivot);

        const leftKneePivot = new THREE.Group();
        leftKneePivot.position.set(0, -0.40, 0);
        leftLegPivot.add(leftKneePivot);

        const rightLegPivot = new THREE.Group();
        rightLegPivot.position.set(0.16, -0.38, 0);
        torsoGroup.add(rightLegPivot);

        const rightKneePivot = new THREE.Group();
        rightKneePivot.position.set(0, -0.40, 0);
        rightLegPivot.add(rightKneePivot);

        const healthBar = this.createHealthBar(50);
        healthBar.position.y = 2.5;
        group.add(healthBar);

        const enemy = {
            mesh: group,
            type: 'acrobat',
            name: 'Ninja Acróbata',
            health: 50,
            maxHealth: 50,
            healthBar: healthBar,
            coinsDrop: 24,
            xpDrop: 40,
            damage: 6,
            speed: 10.5,
            attackRange: 2.0,
            attackCooldown: 0.8,
            timer: 0,
            bodyMesh: chest,
            velocity: new THREE.Vector3(0, 0, 0),
            isGrounded: true,
            jumpTimer: 1.0,
            patrolTarget: pos.clone(),
            patrolTimer: 0,
            originalPos: pos.clone(),
            slotIndex: slotIndex,
            aiState: 'circling',
            stateTimer: Math.random() * 1.5,
            combatRadius: 5.8,
            rightArmPivot: rightArmPivot,
            rightElbowPivot: rightElbowPivot,
            leftArmPivot: leftArmPivot,
            leftElbowPivot: leftElbowPivot,
            leftLegPivot: leftLegPivot,
            leftKneePivot: leftKneePivot,
            rightLegPivot: rightLegPivot,
            rightKneePivot: rightKneePivot
        };

        this.enemies.push(enemy);
        this.scene.add(group);
    }

    // =========================================================================
    // 4. VILLANO PRINCIPAL: EL INVERNAL (TRAFICANTE DE BIODIVERSIDAD)
    // =========================================================================
    spawnBoss(pos) {
        const group = new THREE.Group();
        group.position.copy(pos);
        group.scale.set(1.45, 1.45, 1.45);

        // Estética ciber-villano felino morado oscuro con energía magenta/violeta
        const armorMat = new THREE.MeshStandardMaterial({ color: 0x3b0764, metalness: 0.8, roughness: 0.25 });
        const darkArmorMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.85, roughness: 0.2 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.15 });
        const energyMat = new THREE.MeshStandardMaterial({ color: 0xd946ef, emissive: 0xa855f7, emissiveIntensity: 0.6, metalness: 0.8, roughness: 0.1 });
        const maskMat = new THREE.MeshStandardMaterial({ color: 0x581c87, roughness: 0.3 });

        const torsoGroup = new THREE.Group();
        torsoGroup.position.y = 1.45;
        group.add(torsoGroup);

        const cuirass = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.46, 0.75, 20), armorMat);
        cuirass.position.y = 0.22;
        cuirass.castShadow = true;
        torsoGroup.add(cuirass);

        // Cinturón dorado
        const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.50, 0.12, 20), goldMat);
        belt.position.y = -0.16;
        torsoGroup.add(belt);

        // Cabeza con máscara felina y cuernos de cristal de energía
        const headGroup = new THREE.Group();
        headGroup.position.y = 0.82;
        torsoGroup.add(headGroup);

        const kabutoDome = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 20), armorMat);
        kabutoDome.scale.set(1.05, 1.0, 1.15);
        headGroup.add(kabutoDome);

        // Menpo felino
        const menpo = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.32, 12), maskMat);
        menpo.rotation.x = Math.PI;
        menpo.position.set(0, -0.06, 0.28);
        headGroup.add(menpo);

        // Cuernos cristalinos de energía morada
        const crescentHornL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.75, 8), energyMat);
        crescentHornL.position.set(-0.25, 0.5, 0.18);
        crescentHornL.rotation.z = 0.5;
        headGroup.add(crescentHornL);

        const crescentHornR = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.75, 8), energyMat);
        crescentHornR.position.set(0.25, 0.5, 0.18);
        crescentHornR.rotation.z = -0.5;
        headGroup.add(crescentHornR);

        // Ojos morados fulgurantes
        [-0.14, 0.14].forEach(eyeX => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0xd946ef }));
            eye.position.set(eyeX, 0.04, 0.38);
            headGroup.add(eye);
        });

        // Brazo derecho con Katana de Energía de la Selva
        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(0.66, 0.42, 0);
        torsoGroup.add(rightArmPivot);

        const rightElbowPivot = new THREE.Group();
        rightElbowPivot.position.set(0, -0.45, 0);
        rightArmPivot.add(rightElbowPivot);

        const nodachi = new THREE.Mesh(new THREE.BoxGeometry(0.09, 2.4, 0.04), energyMat);
        nodachi.position.set(0, 0.2, 0.6);
        nodachi.rotation.x = Math.PI / 3;
        rightElbowPivot.add(nodachi);

        // Brazo izquierdo con hombrera
        const leftArmPivot = new THREE.Group();
        leftArmPivot.position.set(-0.66, 0.42, 0);
        torsoGroup.add(leftArmPivot);

        const leftElbowPivot = new THREE.Group();
        leftElbowPivot.position.set(0, -0.45, 0);
        leftArmPivot.add(leftElbowPivot);

        // Piernas con rodillas
        const leftLegPivot = new THREE.Group();
        leftLegPivot.position.set(-0.25, -0.48, 0);
        torsoGroup.add(leftLegPivot);

        const leftKneePivot = new THREE.Group();
        leftKneePivot.position.set(0, -0.52, 0);
        leftLegPivot.add(leftKneePivot);

        const rightLegPivot = new THREE.Group();
        rightLegPivot.position.set(0.25, -0.48, 0);
        torsoGroup.add(rightLegPivot);

        const rightKneePivot = new THREE.Group();
        rightKneePivot.position.set(0, -0.52, 0);
        rightLegPivot.add(rightKneePivot);

        const healthBar = this.createHealthBar(280);
        healthBar.scale.set(1.5, 1.5, 1.5);
        healthBar.position.y = 3.8;
        group.add(healthBar);

        const enemy = {
            mesh: group,
            type: 'boss',
            name: 'El Invernal (Traficante de Biodiversidad)',
            health: 280,
            maxHealth: 280,
            healthBar: healthBar,
            coinsDrop: 160,
            xpDrop: 220,
            damage: 16,
            speed: 7.2,
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
            slotIndex: 0,
            aiState: 'circling',
            stateTimer: 2.0,
            combatRadius: 4.2,
            rightArmPivot: rightArmPivot,
            rightElbowPivot: rightElbowPivot,
            leftArmPivot: leftArmPivot,
            leftElbowPivot: leftElbowPivot,
            leftLegPivot: leftLegPivot,
            leftKneePivot: leftKneePivot,
            rightLegPivot: rightLegPivot,
            rightKneePivot: rightKneePivot
        };

        this.enemies.push(enemy);
        this.scene.add(group);
    }

    damageEnemy(enemy, amount, isCrit, hitDirection, onEnemyDefeated) {
        // Contraataque crítico masivo si el enemigo está aturdido tras un Perfect Parry
        if (enemy.aiState === 'stunned' || enemy.isStunned) {
            amount = Math.round(amount * 2.5);
            isCrit = true;
        }

        enemy.health = Math.max(0, enemy.health - amount);
        this.updateHealthBar(enemy.healthBar, enemy.health);

        sounds.playHit(isCrit);
        this.particles.createHitSparks(enemy.mesh.position.clone().add(new THREE.Vector3(0, 1.2, 0)), isCrit);

        // Retroceso por impacto
        if (hitDirection) {
            enemy.knockbackVelocity = hitDirection.clone().setY(0).normalize().multiplyScalar(isCrit ? 10.5 : 6.8);
            enemy.mesh.position.addScaledVector(hitDirection, 0.35);
        }

        // Esquiva reactiva: al ser golpeado, salta hacia atrás
        if (enemy.isGrounded && enemy.type !== 'dummy') {
            enemy.velocity.y = 7.0;
            enemy.aiState = 'retreating';
            enemy.stateTimer = 0.8;
        }

        if (enemy.bodyMesh && enemy.bodyMesh.material) {
            const originalColor = enemy.bodyMesh.material.color.getHex();
            enemy.bodyMesh.material.color.setHex(0xffffff);
            setTimeout(() => {
                if (enemy.bodyMesh && enemy.bodyMesh.material) {
                    enemy.bodyMesh.material.color.setHex(originalColor);
                }
            }, 100);
        }

        if (enemy.health <= 0) {
            this.defeatEnemy(enemy, onEnemyDefeated);
        }
    }

    disposeMeshRecursive(obj) {
        if (!obj) return;
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material.dispose();
        }
        if (obj.children) {
            obj.children.forEach(c => this.disposeMeshRecursive(c));
        }
    }

    defeatEnemy(enemy, onEnemyDefeated) {
        if (enemy.isCampaignBoss && this.bossAISystem) {
            this.bossAISystem.hideBossHUD();
        }
        this.particles.createEnemyDefeatBurst(enemy.mesh.position.clone().add(new THREE.Vector3(0, 1.0, 0)));

        const coinCount = Math.min(10, Math.ceil(enemy.coinsDrop / 5));
        const valPerCoin = Math.ceil(enemy.coinsDrop / coinCount);
        for (let i = 0; i < coinCount; i++) {
            this.particles.spawnCoin(
                enemy.mesh.position.clone().add(new THREE.Vector3(0, 1.0, 0)),
                valPerCoin
            );
        }

        if (onEnemyDefeated) {
            onEnemyDefeated(enemy);
        }

        this.scene.remove(enemy.mesh);
        this.disposeMeshRecursive(enemy.mesh);
        const index = this.enemies.indexOf(enemy);
        if (index !== -1) {
            this.enemies.splice(index, 1);
        }

        // Reaparición controlada
        if (enemy.type === 'dummy') {
            setTimeout(() => {
                this.spawnDummy(enemy.originalPos);
            }, 5000);
        } else if (enemy.type !== 'boss' && !enemy.isCampaign && !enemy.isCampaignBoss) {
            setTimeout(() => {
                const angle = Math.random() * Math.PI * 2;
                const r = 16 + Math.random() * 12;
                const spawnPos = new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r);
                if (Math.random() < 0.5) {
                    this.spawnShadowNinja(spawnPos, Math.floor(Math.random() * 6));
                } else {
                    this.spawnAcrobatNinja(spawnPos, Math.floor(Math.random() * 6));
                }
            }, 4500);
        }
    }

    // =========================================================================
    // BUCLE DE ACTUALIZACIÓN CON IA TÁCTICA DE COMBATE
    // =========================================================================
    update(delta, player, camera) {
        const playerPos = player.mesh.position;
        const time = performance.now() * 0.012;

        const activeCombatEnemies = this.enemies.filter(e => e.type !== 'dummy' && e.mesh.position.distanceTo(playerPos) <= 40.0);
        const totalCombat = Math.max(1, activeCombatEnemies.length);

        this.enemies.forEach((enemy, idx) => {
            if (enemy.healthBar) {
                enemy.healthBar.quaternion.copy(camera.quaternion);
            }

            if (enemy.type === 'dummy') return;

            // Control Especializado de Jefes Regionales de Colombia
            if (enemy.isCampaignBoss && this.bossAISystem) {
                this.bossAISystem.update(
                    enemy,
                    player,
                    delta,
                    (dmg, attacker) => player.takeDamage(dmg, attacker),
                    (def) => this.defeatEnemy(def),
                    (intensity, duration) => {
                        if (player.onScreenShake) player.onScreenShake(intensity, duration);
                    }
                );
                return;
            }

            const groundY = enemy.groundY !== undefined ? enemy.groundY : (this.groundCheckProvider ? this.groundCheckProvider(enemy.mesh.position.x, enemy.mesh.position.y, enemy.mesh.position.z) : 0);
            if (enemy.mesh.position.y <= groundY) {
                enemy.mesh.position.y = groundY;
                enemy.velocity.y = 0;
                enemy.isGrounded = true;
            }

            // Fijar plano 2.5D (Z = 0)
            enemy.mesh.position.z += (0 - enemy.mesh.position.z) * Math.min(1.0, delta * 20.0);

            // Inercia de retroceso por golpe de espada (Knockback)
            if (enemy.knockbackVelocity && enemy.knockbackVelocity.lengthSq() > 0.01) {
                enemy.mesh.position.addScaledVector(enemy.knockbackVelocity, delta);
                enemy.knockbackVelocity.multiplyScalar(0.82);
            }

            // Caída al abismo para esbirros de plataformas
            if (enemy.isCampaign && enemy.mesh.position.y < -12.0) {
                this.defeatEnemy(enemy, null);
                return;
            }
            if (enemy.jumpTimer > 0) enemy.jumpTimer -= delta;
            if (enemy.timer > 0) enemy.timer -= delta;
            if (enemy.stateTimer > 0) enemy.stateTimer -= delta;

            const dist = enemy.mesh.position.distanceTo(playerPos);
            const dx = playerPos.x - enemy.mesh.position.x;

            // =================================================================
            // IA TÁCTICA 2.5D: ENFRENTAMIENTO LATERAL Y COMBATE TÉCNICO
            // =================================================================
            if (dist <= 40.0) {
                // Mirar lateralmente hacia el jugador en el plano 2.5D
                enemy.facing = dx >= 0 ? 1 : -1;
                enemy.mesh.rotation.y = enemy.facing > 0 ? (Math.PI * 0.5) : (-Math.PI * 0.5);

                // Estado de ATURDIMIENTO (Generado por Perfect Parry del Jugador)
                if (enemy.aiState === 'stunned') {
                    if (enemy.torso) enemy.torso.rotation.x = -0.35;
                    if (enemy.rightArmPivot) enemy.rightArmPivot.rotation.x = -0.6;
                    if (enemy.leftArmPivot) enemy.leftArmPivot.rotation.x = -0.6;

                    if (enemy.stateTimer <= 0) {
                        enemy.aiState = 'retreating';
                        enemy.stateTimer = 0.8;
                        enemy.isStunned = false;
                        if (enemy.torso) enemy.torso.rotation.x = 0;
                    }
                    return;
                }

                // Separación horizontal lateral entre enemigos
                let sepX = 0;
                for (let j = 0; j < this.enemies.length; j++) {
                    const other = this.enemies[j];
                    if (other === enemy || other.type === 'dummy') continue;
                    const diffX = enemy.mesh.position.x - other.mesh.position.x;
                    if (Math.abs(diffX) < 2.2 && Math.abs(diffX) > 0.01) {
                        sepX += (diffX > 0 ? 1 : -1) * (2.2 - Math.abs(diffX)) * 2.5;
                    }
                }

                // 2. Transiciones de estados de combate
                if (enemy.aiState === 'circling') {
                    // Mantener distancia táctica de acecho
                    const desiredDist = enemy.combatRadius || 4.2;
                    const targetX = playerPos.x + (idx % 2 === 0 ? desiredDist : -desiredDist);
                    const diffTargetX = targetX - enemy.mesh.position.x;

                    if (Math.abs(diffTargetX) > 0.4) {
                        const moveSign = diffTargetX > 0 ? 1 : -1;
                        enemy.mesh.position.x += (moveSign * enemy.speed * 0.85 + sepX) * delta;
                    }

                    // Señal de ataque telegráfico
                    if (enemy.stateTimer <= 0 && enemy.timer <= 0) {
                        enemy.aiState = 'telegraph';
                        enemy.stateTimer = 0.35; // 350ms con katana en alto para permitir reacción de parry
                    }

                    // Animación de acecho
                    if (enemy.leftLegPivot && enemy.rightLegPivot) {
                        const swing = Math.sin(time * 0.8) * 0.4;
                        enemy.leftLegPivot.rotation.x = swing;
                        enemy.rightLegPivot.rotation.x = -swing;
                    }
                    if (enemy.rightArmPivot) {
                        enemy.rightArmPivot.rotation.x = Math.PI * 0.35;
                    }

                } else if (enemy.aiState === 'telegraph') {
                    // ¡Katana alzada! Señal visual para que el jugador se prepare a bloquear/parrear
                    if (enemy.rightArmPivot) {
                        enemy.rightArmPivot.rotation.x = Math.PI * 0.95;
                        enemy.rightArmPivot.rotation.z = -0.25;
                    }
                    if (enemy.stateTimer <= 0) {
                        enemy.aiState = 'lunging';
                        enemy.stateTimer = 1.2;
                    }

                } else if (enemy.aiState === 'lunging') {
                    // ¡Acometida frontal con katana hacia el jugador!
                    const chargeDirX = dx > 0 ? 1 : -1;
                    enemy.mesh.position.x += (chargeDirX * enemy.speed * 1.35 + sepX) * delta;

                    // Salto acrobático en embestida si está en plataforma
                    if (enemy.isGrounded && enemy.jumpTimer <= 0 && Math.abs(dx) > 3.0 && Math.abs(dx) < 8.0) {
                        enemy.velocity.y = enemy.type === 'acrobat' ? 14.0 : 11.0;
                        enemy.isGrounded = false;
                        enemy.jumpTimer = 2.0;
                        sounds.playJump();
                    }

                    // Animación de carrera rápida
                    if (enemy.leftLegPivot && enemy.rightLegPivot) {
                        const swing = Math.sin(time * 1.6) * 0.85;
                        enemy.leftLegPivot.rotation.x = swing;
                        enemy.rightLegPivot.rotation.x = -swing;
                    }
                    if (enemy.rightArmPivot) {
                        enemy.rightArmPivot.rotation.x = Math.PI * 0.7;
                    }

                    // Rango de golpe
                    if (Math.abs(dx) <= enemy.attackRange && Math.abs(enemy.mesh.position.y - playerPos.y) < 1.8) {
                        const hitResult = player.takeDamage(enemy.damage, enemy);

                        if (hitResult && hitResult.parried) {
                            // ¡El jugador ejecutó un Perfect Parry!
                            // enemy.aiState ya fue puesto en 'stunned' por takeDamage
                        } else {
                            sounds.playSlash('normal');
                            enemy.timer = enemy.attackCooldown;
                            enemy.aiState = 'retreating';
                            enemy.stateTimer = 0.9;
                        }

                        if (enemy.rightArmPivot) {
                            enemy.rightArmPivot.rotation.x = Math.PI;
                        }
                    } else if (enemy.stateTimer <= 0) {
                        enemy.aiState = 'retreating';
                        enemy.stateTimer = 0.7;
                    }

                } else if (enemy.aiState === 'retreating') {
                    // Repliegue o salto atrás táctico
                    const retreatSign = dx > 0 ? -1 : 1;
                    enemy.mesh.position.x += (retreatSign * enemy.speed * 0.9 + sepX) * delta;

                    if (enemy.stateTimer <= 0) {
                        enemy.aiState = 'circling';
                        enemy.stateTimer = 1.4 + Math.random() * 1.6;
                    }
                }

            } else {
                // Patrulla ambiental tranquila cuando el jugador está lejos
                enemy.patrolTimer -= delta;
                if (!enemy.patrolTarget) {
                    enemy.patrolTarget = (enemy.originalPos ? enemy.originalPos.clone() : enemy.mesh.position.clone());
                }
                if (enemy.patrolTimer <= 0) {
                    if (enemy.isCampaign) {
                        // En campaña 2.5D, solo patrullar en X manteniendo Z = 0
                        const wanderX = (Math.random() - 0.5) * 5.0;
                        enemy.patrolTarget.set(enemy.originalPos.x + wanderX, enemy.groundY || 0, 0);
                    } else {
                        const angle = Math.random() * Math.PI * 2;
                        const r = 5 + Math.random() * 8;
                        enemy.patrolTarget.set(
                            enemy.originalPos.x + Math.cos(angle) * r,
                            0,
                            enemy.originalPos.z + Math.sin(angle) * r
                        );
                    }
                    enemy.patrolTimer = 3.5 + Math.random() * 3.0;
                }

                const distToPatrol = enemy.mesh.position.distanceTo(enemy.patrolTarget);
                if (distToPatrol > 0.8) {
                    const pDir = new THREE.Vector3().subVectors(enemy.patrolTarget, enemy.mesh.position).normalize();
                    enemy.mesh.position.addScaledVector(pDir, enemy.speed * 0.45 * delta);
                    if (enemy.isCampaign) {
                        enemy.facing = pDir.x >= 0 ? 1 : -1;
                        enemy.mesh.rotation.y = enemy.facing > 0 ? (Math.PI * 0.5) : (-Math.PI * 0.5);
                    } else {
                        enemy.mesh.lookAt(enemy.patrolTarget.x, enemy.mesh.position.y, enemy.patrolTarget.z);
                    }

                    if (enemy.leftLegPivot && enemy.rightLegPivot) {
                        const legSwing = Math.sin(time * 0.7) * 0.4;
                        enemy.leftLegPivot.rotation.x = legSwing;
                        enemy.rightLegPivot.rotation.x = -legSwing;
                    }
                }
            }

            // Límites del mapa (solo en arenas circulares 3D, NO en campaña 2.5D lineal)
            if (!enemy.isCampaign) {
                const arenaRadius = 52.0;
                const distCenter = Math.hypot(enemy.mesh.position.x, enemy.mesh.position.z);
                if (distCenter > arenaRadius) {
                    const angle = Math.atan2(enemy.mesh.position.z, enemy.mesh.position.x);
                    enemy.mesh.position.x = Math.cos(angle) * arenaRadius;
                    enemy.mesh.position.z = Math.sin(angle) * arenaRadius;
                }
            }
        });
    }

    // Separación física de enemigos contra cajas y obstáculos
    checkObstacleCollisions(crates) {
        if (!crates || !crates.length) return;
        const enemyRadius = 0.65;
        for (let j = 0; j < this.enemies.length; j++) {
            const enemy = this.enemies[j];
            if (!enemy || enemy.type === 'dummy' || enemy.health <= 0) continue;
            const ePos = enemy.mesh.position;

            for (let i = 0; i < crates.length; i++) {
                const crate = crates[i];
                if (!crate || crate.intact === false || crate.isBroken === true) continue;
                const cPos = crate.position || (crate.mesh && crate.mesh.position);
                if (!cPos) continue;

                const dy = Math.abs(ePos.y - cPos.y);
                if (dy > 1.35) continue;

                const dx = ePos.x - cPos.x;
                const dz = ePos.z - cPos.z;
                const distSq = dx * dx + dz * dz;
                const minDist = enemyRadius + 0.85;

                if (distSq < minDist * minDist && distSq > 0.0001) {
                    const dist = Math.sqrt(distSq);
                    const overlap = minDist - dist;
                    ePos.x += (dx / dist) * overlap;
                    ePos.z += (dz / dist) * overlap;
                }
            }
        }
    }

    // =========================================================================
    // SPAWN DE ENEMIGOS PARA NIVELES DE PLATAFORMAS (CAMPAÑA)
    // =========================================================================
    spawnCampaignLevelEnemies(spawns = [], worldNum = 1) {
        this.clearEnemies();
        const worldMeta = CAMPAIGN_WORLDS[worldNum] || CAMPAIGN_WORLDS[1];

        spawns.forEach((s, idx) => {
            const pos = (s && s.isVector3) ? s.clone() : (s && s.pos ? s.pos.clone() : new THREE.Vector3(0, 0, 0));
            const range = s.range || 5.0;
            const enemyGroup = new THREE.Group();
            enemyGroup.position.copy(pos);

            // Estilo caricaturesco adaptado al bioma del mundo
            const matTheme = new THREE.MeshStandardMaterial({ color: worldMeta.themeColor, roughness: 0.6 });
            const matDark = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.7 });
            const matSkin = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.5 });

            // Cuerpo compacto estilo ninja caricaturesco
            const bodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.32, 0.7, 12), matTheme);
            bodyMesh.position.y = 0.6;
            bodyMesh.castShadow = true;
            enemyGroup.add(bodyMesh);

            // Cabeza
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), matTheme);
            head.position.y = 1.15;
            head.castShadow = true;
            enemyGroup.add(head);

            // Cinta ninja flotante con color del bioma
            const headband = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.1, 12), matDark);
            headband.position.y = 1.18;
            enemyGroup.add(headband);

            // Ojos caricaturescos grandes
            [-0.1, 0.1].forEach(ox => {
                const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
                eye.position.set(ox, 1.2, 0.28);
                const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), new THREE.MeshBasicMaterial({ color: 0x000000 }));
                pupil.position.set(ox, 1.2, 0.33);
                enemyGroup.add(eye);
                enemyGroup.add(pupil);
            });

            // Arma según tipo (Shuriken o Daga de bambú)
            const weaponMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
            const dagger = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.08), weaponMat);
            dagger.position.set(0.42, 0.6, 0.2);
            dagger.rotation.x = Math.PI / 4;
            enemyGroup.add(dagger);

            const hp = 45 + worldNum * 10;
            const healthBar = this.createHealthBar(hp);
            healthBar.position.y = 1.8;
            enemyGroup.add(healthBar);

            const enemy = {
                mesh: enemyGroup,
                type: 'campaign_minion',
                isCampaign: true,
                groundY: pos.y,
                name: `Guardia del ${worldMeta.name}`,
                health: hp,
                maxHealth: hp,
                healthBar: healthBar,
                coinsDrop: 12 + worldNum * 3,
                xpDrop: 20 + worldNum * 5,
                damage: 8 + worldNum * 2,
                speed: 3.5 + Math.min(3.0, worldNum * 0.3),
                attackRange: 2.2,
                attackCooldown: 1.5,
                timer: 0,
                bodyMesh: bodyMesh,
                velocity: new THREE.Vector3(0, 0, 0),
                isGrounded: true,
                jumpTimer: 3.0,
                patrolOrigin: pos.clone(),
                patrolMinZ: pos.z - range,
                patrolMaxZ: pos.z + range,
                patrolDirection: (idx % 2 === 0) ? 1 : -1,
                patrolTarget: pos.clone(),
                patrolTimer: 0,
                originalPos: pos.clone(),
                slotIndex: idx % 6,
                aiState: 'circling',
                combatRadius: 3.8,
                stateTimer: 1.0 + Math.random() * 1.5
            };

            this.enemies.push(enemy);
            this.scene.add(enemyGroup);
        });
    }

    // =========================================================================
    // SPAWN DE LOS 10 JEFES FINALES DE COLOMBIA
    // =========================================================================
    spawnCampaignBoss(worldNum = 1, pos = new THREE.Vector3(0, 0, -18)) {
        this.clearEnemies();
        const worldMeta = CAMPAIGN_WORLDS[worldNum] || CAMPAIGN_WORLDS[1];
        const bossSpec = worldMeta.boss || {
            name: 'Jefe Guardián',
            health: 200,
            damage: 14,
            speed: 6.5,
            themeColor: 0x10b981
        };
        const bossHp = bossSpec.health || bossSpec.hp || 200;
        const bossThemeColor = bossSpec.color || bossSpec.themeColor || 0x10b981;

        const group = new THREE.Group();
        group.position.copy(pos);
        group.scale.set(1.5, 1.5, 1.5);

        const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
        const themeMat = new THREE.MeshStandardMaterial({ color: bossThemeColor, roughness: 0.3, metalness: 0.5 });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });
        const energyMat = new THREE.MeshStandardMaterial({
            color: bossThemeColor,
            emissive: bossThemeColor,
            emissiveIntensity: 0.65,
            roughness: 0.1
        });

        const torsoGroup = new THREE.Group();
        torsoGroup.position.y = 1.35;
        group.add(torsoGroup);

        let mainBodyMesh = null;
        let rightArmPivot = new THREE.Group();
        let rightElbowPivot = new THREE.Group();
        let leftArmPivot = new THREE.Group();
        let leftElbowPivot = new THREE.Group();
        let leftLegPivot = new THREE.Group();
        let leftKneePivot = new THREE.Group();
        let rightLegPivot = new THREE.Group();
        let rightKneePivot = new THREE.Group();

        // CONSTRUCCIÓN DEL MODELO 3D SEGÚN EL JEFE ESPECÍFICO DEL MUNDO
        if (worldNum === 1) {
            // 1. ANACONDA FURTIVA DEL AMAZONAS (Serpiente colosal esmeralda con cresta ninja)
            mainBodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 1.4, 16), themeMat);
            torsoGroup.add(mainBodyMesh);

            // Cabeza de anaconda agresiva
            const snakeHead = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.1, 12), themeMat);
            snakeHead.rotation.x = -Math.PI / 2.3;
            snakeHead.position.set(0, 0.9, 0.35);
            torsoGroup.add(snakeHead);

            // Ojos reptilianos amarillos
            [-0.32, 0.32].forEach(ox => {
                const eye = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
                eye.position.set(ox, 1.05, 0.7);
                torsoGroup.add(eye);
            });

            // Cresta de plumas amazónicas
            const crest = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.8, 6), energyMat);
            crest.position.set(0, 1.4, 0.1);
            torsoGroup.add(crest);

            // Anillos serpentinos en la base
            for (let r = 0; r < 3; r++) {
                const coil = new THREE.Mesh(new THREE.TorusGeometry(0.9 + r * 0.3, 0.22, 10, 24), themeMat);
                coil.rotation.x = Math.PI / 2;
                coil.position.y = -0.5 - r * 0.25;
                torsoGroup.add(coil);
            }
        } else if (worldNum === 2) {
            // 2. ESPANTAPÁJAROS MECÁNICO DEL CAFÉ (Sombrero aguadeño, engranajes y brazos aserrados)
            mainBodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.52, 1.1, 12), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 }));
            torsoGroup.add(mainBodyMesh);

            // Engranaje de cobre en el pecho
            const gear = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.12, 12), goldMat);
            gear.rotation.x = Math.PI / 2;
            gear.position.set(0, 0.1, 0.3);
            torsoGroup.add(gear);

            // Cabeza de calabaza/tela con sombrero de paja aguadeño
            const scHead = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 12), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
            scHead.position.y = 0.95;
            torsoGroup.add(scHead);

            const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.05, 18), new THREE.MeshStandardMaterial({ color: 0xfef08a }));
            hatBrim.position.y = 1.25;
            torsoGroup.add(hatBrim);
            const hatCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 0.35, 18), new THREE.MeshStandardMaterial({ color: 0xfef08a }));
            hatCrown.position.y = 1.45;
            torsoGroup.add(hatCrown);
        } else if (worldNum === 3) {
            // 3. CAPITÁN CORSARIO BARBACORAL (Tricornio, barba de coral caribeño, sable dorado)
            mainBodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.48, 1.0, 16), new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.6 }));
            torsoGroup.add(mainBodyMesh);

            const pirateHead = new THREE.Mesh(new THREE.SphereGeometry(0.4, 14, 14), new THREE.MeshStandardMaterial({ color: 0xfbbf24 }));
            pirateHead.position.y = 0.85;
            torsoGroup.add(pirateHead);

            // Barba de coral rojo
            const coralBeard = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.6, 8), new THREE.MeshStandardMaterial({ color: 0xf43f5e }));
            coralBeard.position.set(0, 0.55, 0.3);
            torsoGroup.add(coralBeard);

            // Tricornio pirata
            const tricorn = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.5, 0.25, 3), darkMat);
            tricorn.position.y = 1.2;
            torsoGroup.add(tricorn);
        } else if (worldNum === 4) {
            // 4. COLOSO GLACIAL DEL PÁRAMO (Hielo cristalino andino, musgo de frailejón y picos)
            mainBodyMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.8), new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8, roughness: 0.1 }));
            torsoGroup.add(mainBodyMesh);

            // Hombreras de frailejón aterciopelado
            [-0.75, 0.75].forEach(sx => {
                const mossPad = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 10), new THREE.MeshStandardMaterial({ color: 0x84cc16, roughness: 0.9 }));
                mossPad.position.set(sx, 0.6, 0);
                torsoGroup.add(mossPad);
            });

            // Cabeza de cristal de hielo
            const iceHead = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.7, 5), energyMat);
            iceHead.position.y = 1.05;
            torsoGroup.add(iceHead);
        } else if (worldNum === 5) {
            // 5. ESCORPIÓN REAL DE TATACOA (Caparazón dorado del desierto con cola de aguijón)
            mainBodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.6, 0.7, 16), new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8, roughness: 0.3 }));
            torsoGroup.add(mainBodyMesh);

            // Cola curvada de escorpión por encima
            for (let s = 0; s < 5; s++) {
                const seg = new THREE.Mesh(new THREE.SphereGeometry(0.24 - s * 0.02, 10, 10), goldMat);
                seg.position.set(0, 0.5 + s * 0.35, -0.4 - s * 0.15 + (s > 2 ? (s - 2) * 0.4 : 0));
                torsoGroup.add(seg);
            }
            const stinger = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 8), energyMat);
            stinger.position.set(0, 2.2, 0.2);
            stinger.rotation.x = Math.PI / 1.5;
            torsoGroup.add(stinger);
        } else if (worldNum === 6) {
            // 6. MONSTRUO DEL MANGLAR (Raíces marinas retorcidas, fauces y linterna abisal)
            mainBodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.8, 1.2, 14), new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.85 }));
            torsoGroup.add(mainBodyMesh);

            const lanternStalk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8), themeMat);
            lanternStalk.position.set(0, 1.2, 0.4);
            lanternStalk.rotation.x = Math.PI / 4;
            torsoGroup.add(lanternStalk);
            const anglerOrb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), energyMat);
            anglerOrb.position.set(0, 1.6, 0.8);
            torsoGroup.add(anglerOrb);
        } else if (worldNum === 7) {
            // 7. CAIMÁN TITÁN DEL LLANO (Fauces acorazadas masivas, escamas y blindaje)
            mainBodyMesh = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.9, 1.5), new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.8 }));
            torsoGroup.add(mainBodyMesh);

            // Fauces alargadas de caimán
            const snout = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.4, 1.4), new THREE.MeshStandardMaterial({ color: 0x4d7c0f }));
            snout.position.set(0, 0.1, 1.1);
            torsoGroup.add(snout);

            // Dientes afilados
            for (let t = 0; t < 6; t++) {
                const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.15, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
                tooth.position.set((t % 2 === 0 ? -0.4 : 0.4), -0.15, 0.6 + Math.floor(t / 2) * 0.35);
                tooth.rotation.x = Math.PI;
                torsoGroup.add(tooth);
            }
        } else if (worldNum === 8) {
            // 8. ESPÍRITU GUARDIÁN DE LOS 5 COLORES (Cristal iridiscente multicolor de Caño Cristales)
            mainBodyMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.85, 2), new THREE.MeshStandardMaterial({
                color: 0xf43f5e,
                emissive: 0x06b6d4,
                emissiveIntensity: 0.5,
                metalness: 0.9,
                roughness: 0.1
            }));
            torsoGroup.add(mainBodyMesh);

            // 5 orbes giratorios flotantes de los 5 colores (Rojo, Amarillo, Verde, Azul, Negro)
            const colors = [0xef4444, 0xfacc15, 0x22c55e, 0x3b82f6, 0x18181b];
            colors.forEach((col, cIdx) => {
                const ang = (cIdx / colors.length) * Math.PI * 2;
                const orb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), new THREE.MeshStandardMaterial({
                    color: col,
                    emissive: col,
                    emissiveIntensity: 0.8
                }));
                orb.position.set(Math.cos(ang) * 1.5, Math.sin(ang) * 0.5 + 0.6, Math.sin(ang) * 1.5);
                torsoGroup.add(orb);
            });
        } else if (worldNum === 9) {
            // 9. CHAMÁN SUPREMO TAYRONA (Pectoral de oro Tayrona, máscara solar y báculo místico)
            mainBodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.45, 1.1, 14), new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.5 }));
            torsoGroup.add(mainBodyMesh);

            // Pectoral dorado icónico Tayrona en el pecho
            const pectoral = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.35, 0.45, 8), goldMat);
            pectoral.rotation.x = Math.PI / 2;
            pectoral.position.set(0, 0.25, 0.26);
            torsoGroup.add(pectoral);

            // Máscara solar con rayos dorados
            const sunMask = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.08, 16), goldMat);
            sunMask.rotation.x = Math.PI / 2;
            sunMask.position.set(0, 0.95, 0.3);
            torsoGroup.add(sunMask);

            // Capa de jaguar manchado
            const jaguarCape = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.85, 1.2, 12, 1, true, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 }));
            jaguarCape.position.set(0, 0.35, -0.1);
            jaguarCape.rotation.y = Math.PI / 2;
            torsoGroup.add(jaguarCape);
        } else {
            // 10. EL INVERNAL (FORMA SUPREMA) - Villano definitivo con cuernos gigantes y espadas dobles
            mainBodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.54, 1.1, 20), new THREE.MeshStandardMaterial({ color: 0x2e1065, metalness: 0.85, roughness: 0.2 }));
            torsoGroup.add(mainBodyMesh);

            const supremeBelt = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.15, 20), goldMat);
            supremeBelt.position.y = -0.2;
            torsoGroup.add(supremeBelt);

            const supremeHead = new THREE.Mesh(new THREE.SphereGeometry(0.48, 20, 20), new THREE.MeshStandardMaterial({ color: 0x4c1d95 }));
            supremeHead.position.y = 0.95;
            torsoGroup.add(supremeHead);

            // Gran corona de cuernos oscuros de hielo
            [-0.32, 0.32].forEach((cx, cIdx) => {
                const horn = new THREE.Mesh(new THREE.ConeGeometry(0.12, 1.1, 8), energyMat);
                horn.position.set(cx, 1.5, 0.1);
                horn.rotation.z = cIdx === 0 ? 0.45 : -0.45;
                torsoGroup.add(horn);
            });

            // Ojos fulgurantes violeta
            [-0.16, 0.16].forEach(ex => {
                const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0xd946ef }));
                eye.position.set(ex, 0.95, 0.45);
                torsoGroup.add(eye);
            });
        }

        // Brazos y arma genérica si no es serpentino
        if (worldNum !== 1) {
            rightArmPivot.position.set(0.7, 0.5, 0);
            torsoGroup.add(rightArmPivot);
            rightElbowPivot.position.set(0, -0.45, 0);
            rightArmPivot.add(rightElbowPivot);

            const weapon = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.2, 0.08), energyMat);
            weapon.position.set(0, 0.3, 0.6);
            weapon.rotation.x = Math.PI / 3;
            rightElbowPivot.add(weapon);

            leftArmPivot.position.set(-0.7, 0.5, 0);
            torsoGroup.add(leftArmPivot);
            leftElbowPivot.position.set(0, -0.45, 0);
            leftArmPivot.add(leftElbowPivot);

            leftLegPivot.position.set(-0.3, -0.5, 0);
            torsoGroup.add(leftLegPivot);
            rightLegPivot.position.set(0.3, -0.5, 0);
            torsoGroup.add(rightLegPivot);
        }

        const healthBar = this.createHealthBar(bossHp);
        healthBar.scale.set(1.8, 1.8, 1.8);
        healthBar.position.y = 4.2;
        group.add(healthBar);

        const enemy = {
            mesh: group,
            type: 'boss',
            isCampaignBoss: true,
            worldNum: worldNum,
            name: `${bossSpec.name} — ${bossSpec.title || 'Guardián Regional'}`,
            health: bossHp,
            maxHealth: bossHp,
            healthBar: healthBar,
            coinsDrop: bossSpec.rewardCoins || (200 + worldNum * 50),
            xpDrop: 300 + worldNum * 60,
            gemsDrop: bossSpec.rewardGems || 20,
            damage: bossSpec.damage || (14 + worldNum * 2),
            speed: bossSpec.speed || 6.5,
            attackRange: 4.2,
            attackCooldown: 1.3,
            timer: 0,
            bodyMesh: mainBodyMesh || group.children[0],
            velocity: new THREE.Vector3(0, 0, 0),
            isGrounded: true,
            jumpTimer: 2.2,
            patrolTarget: pos.clone(),
            patrolTimer: 0,
            originalPos: pos.clone(),
            slotIndex: 0,
            aiState: 'circling',
            stateTimer: 2.0,
            combatRadius: 5.0,
            rightArmPivot: rightArmPivot,
            rightElbowPivot: rightElbowPivot,
            leftArmPivot: leftArmPivot,
            leftElbowPivot: leftElbowPivot,
            leftLegPivot: leftLegPivot,
            leftKneePivot: leftKneePivot,
            rightLegPivot: rightLegPivot,
            rightKneePivot: rightKneePivot
        };

        this.enemies.push(enemy);
        this.scene.add(group);
        if (this.bossAISystem) {
            this.bossAISystem.initBoss(enemy, worldNum);
        }
        return enemy;
    }

}
