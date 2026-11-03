// js/enemies.js - Gestor de Enemigos con IA Táctica de Combate, Rodeo y Cinemática Articular
import * as THREE from 'three';
import { sounds } from './sound.js?v=6.0';

export class EnemyManager {
    constructor(scene, particles) {
        this.scene = scene;
        this.particles = particles;
        this.enemies = [];

        this.spawnInitialEnemies('forest');
    }

    clearEnemies() {
        while (this.enemies.length > 0) {
            const e = this.enemies.pop();
            this.scene.remove(e.mesh);
        }
    }

    spawnInitialEnemies(worldId = 'forest') {
        this.clearEnemies();

        // 1. Muñeco de entrenamiento
        this.spawnDummy(new THREE.Vector3(0, 0, -9));

        if (worldId === 'forest') {
            // Mundo 1: Ninjas de las Sombras y Acróbatas
            this.spawnShadowNinja(new THREE.Vector3(-14, 0, 8), 0);
            this.spawnShadowNinja(new THREE.Vector3(14, 0, 8), 1);
            this.spawnShadowNinja(new THREE.Vector3(0, 0, -18), 2);
            this.spawnAcrobatNinja(new THREE.Vector3(-18, 0, -14), 3);
            this.spawnAcrobatNinja(new THREE.Vector3(18, 0, -14), 4);
        } else if (worldId === 'volcano') {
            // Mundo 2: Ninjas Ígneos de Fuego y Acróbatas
            this.spawnShadowNinja(new THREE.Vector3(-14, 0, 8), 0, 0xff3b00);
            this.spawnShadowNinja(new THREE.Vector3(14, 0, 8), 1, 0xff3b00);
            this.spawnShadowNinja(new THREE.Vector3(-18, 0, -12), 2, 0xff3b00);
            this.spawnShadowNinja(new THREE.Vector3(18, 0, -12), 3, 0xff3b00);
            this.spawnAcrobatNinja(new THREE.Vector3(-8, 0, 20), 4);
            this.spawnAcrobatNinja(new THREE.Vector3(8, 0, 20), 5);
        } else if (worldId === 'snow') {
            // Mundo 3: Guerreros Glaciales y el Gran Jefe Samurái Warlord
            this.spawnShadowNinja(new THREE.Vector3(-14, 0, 8), 0, 0x38bdf8);
            this.spawnShadowNinja(new THREE.Vector3(14, 0, 8), 1, 0x38bdf8);
            this.spawnShadowNinja(new THREE.Vector3(-16, 0, -12), 2, 0x38bdf8);
            this.spawnShadowNinja(new THREE.Vector3(16, 0, -12), 3, 0x38bdf8);
            this.spawnAcrobatNinja(new THREE.Vector3(-8, 0, 18), 4);
            this.spawnAcrobatNinja(new THREE.Vector3(8, 0, 18), 5);
            // Gran Jefe en el templo
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
    // 4. GRAN JEFE SAMURÁI WARLORD (MUNDO 3)
    // =========================================================================
    spawnBoss(pos) {
        const group = new THREE.Group();
        group.position.copy(pos);
        group.scale.set(1.45, 1.45, 1.45);

        const armorMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, metalness: 0.7, roughness: 0.25 });
        const darkArmorMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8, roughness: 0.3 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.15 });
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.95, roughness: 0.1 });

        const torsoGroup = new THREE.Group();
        torsoGroup.position.y = 1.45;
        group.add(torsoGroup);

        const cuirass = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.46, 0.75, 20), armorMat);
        cuirass.position.y = 0.22;
        cuirass.castShadow = true;
        torsoGroup.add(cuirass);

        // Casco Kabuto tradicional con cresta dorada
        const headGroup = new THREE.Group();
        headGroup.position.y = 0.82;
        torsoGroup.add(headGroup);

        const kabutoDome = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 20), armorMat);
        kabutoDome.scale.set(1.05, 1.0, 1.15);
        headGroup.add(kabutoDome);

        const crescentHornL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.75, 8), goldMat);
        crescentHornL.position.set(-0.25, 0.5, 0.18);
        crescentHornL.rotation.z = 0.5;
        headGroup.add(crescentHornL);

        const crescentHornR = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.75, 8), goldMat);
        crescentHornR.position.set(0.25, 0.5, 0.18);
        crescentHornR.rotation.z = -0.5;
        headGroup.add(crescentHornR);

        // Ojos de fuego
        [-0.14, 0.14].forEach(eyeX => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff2222 }));
            eye.position.set(eyeX, 0.04, 0.38);
            headGroup.add(eye);
        });

        // Brazo derecho con Nodachi de 2.4 metros
        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(0.66, 0.42, 0);
        torsoGroup.add(rightArmPivot);

        const rightElbowPivot = new THREE.Group();
        rightElbowPivot.position.set(0, -0.45, 0);
        rightArmPivot.add(rightElbowPivot);

        const nodachi = new THREE.Mesh(new THREE.BoxGeometry(0.09, 2.4, 0.04), bladeMat);
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
            name: 'Gran Samurái de las Sombras (JEFE)',
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

    defeatEnemy(enemy, onEnemyDefeated) {
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
        const index = this.enemies.indexOf(enemy);
        if (index !== -1) {
            this.enemies.splice(index, 1);
        }

        // Reaparición controlada
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

            // Física y gravedad
            enemy.velocity.y += -26.0 * delta;
            enemy.mesh.position.y += enemy.velocity.y * delta;
            if (enemy.mesh.position.y <= 0) {
                enemy.mesh.position.y = 0;
                enemy.velocity.y = 0;
                enemy.isGrounded = true;
            }

            // Inercia de retroceso por golpe de espada (Knockback)
            if (enemy.knockbackVelocity && enemy.knockbackVelocity.lengthSq() > 0.01) {
                enemy.mesh.position.addScaledVector(enemy.knockbackVelocity, delta);
                enemy.knockbackVelocity.multiplyScalar(0.82);
            }

            if (enemy.jumpTimer > 0) enemy.jumpTimer -= delta;
            if (enemy.timer > 0) enemy.timer -= delta;
            if (enemy.stateTimer > 0) enemy.stateTimer -= delta;

            const dist = enemy.mesh.position.distanceTo(playerPos);

            // =================================================================
            // IA TÁCTICA: RODEO EN ANILLO PERIMÉTRICO (SIN FILA INDIA)
            // =================================================================
            if (dist <= 40.0) {
                // Mirar siempre hacia el jugador
                enemy.mesh.lookAt(playerPos.x, enemy.mesh.position.y, playerPos.z);

                // 1. Fuerza de repulsión entre enemigos (Anti-amontonamiento / Boids)
                const separation = new THREE.Vector3();
                for (let j = 0; j < this.enemies.length; j++) {
                    const other = this.enemies[j];
                    if (other === enemy || other.type === 'dummy') continue;
                    const d = enemy.mesh.position.distanceTo(other.mesh.position);
                    if (d < 2.5 && d > 0.01) {
                        const rep = new THREE.Vector3().subVectors(enemy.mesh.position, other.mesh.position).normalize();
                        separation.addScaledVector(rep, (2.5 - d) * 3.5);
                    }
                }

                // 2. Transiciones de estados de combate
                if (enemy.aiState === 'circling') {
                    // Posición asignada en el anillo perimétrico alrededor del ninja
                    const slotAngle = (idx / totalCombat) * Math.PI * 2 + time * 0.15;
                    const targetX = playerPos.x + Math.cos(slotAngle) * enemy.combatRadius;
                    const targetZ = playerPos.z + Math.sin(slotAngle) * enemy.combatRadius;
                    const targetPos = new THREE.Vector3(targetX, enemy.mesh.position.y, targetZ);

                    const moveDir = new THREE.Vector3().subVectors(targetPos, enemy.mesh.position);
                    const distToSlot = moveDir.length();

                    if (distToSlot > 0.4) {
                        moveDir.normalize();
                        moveDir.addScaledVector(separation, delta * 2.0).normalize();
                        enemy.mesh.position.addScaledVector(moveDir, enemy.speed * 0.85 * delta);
                    }

                    // Si está listo para embestir y se le acaba el temporizador de acecho
                    if (enemy.stateTimer <= 0 && enemy.timer <= 0) {
                        enemy.aiState = 'lunging';
                        enemy.stateTimer = 1.4; // Tiempo máximo de embestida
                    }

                    // Animación de acecho lateral
                    if (enemy.leftLegPivot && enemy.rightLegPivot) {
                        const swing = Math.sin(time * 0.8) * 0.5;
                        enemy.leftLegPivot.rotation.x = swing;
                        enemy.rightLegPivot.rotation.x = -swing;
                        if (enemy.leftKneePivot) enemy.leftKneePivot.rotation.x = Math.max(0, -swing * 0.8);
                        if (enemy.rightKneePivot) enemy.rightKneePivot.rotation.x = Math.max(0, swing * 0.8);
                    }
                    if (enemy.rightArmPivot) {
                        enemy.rightArmPivot.rotation.x = Math.PI * 0.35; // Guardia de espada en alto
                    }

                } else if (enemy.aiState === 'lunging') {
                    // ¡EMBESTIDA TELEGRÁFICA HACIA EL JUGADOR!
                    const chargeDir = new THREE.Vector3().subVectors(playerPos, enemy.mesh.position).normalize();
                    chargeDir.addScaledVector(separation, delta).normalize();
                    enemy.mesh.position.addScaledVector(chargeDir, enemy.speed * 1.35 * delta);

                    // Salto acrobático en embestida
                    if (enemy.isGrounded && enemy.jumpTimer <= 0 && dist > 3.0 && dist < 12.0) {
                        enemy.velocity.y = enemy.type === 'acrobat' ? 14.0 : 11.5;
                        enemy.isGrounded = false;
                        enemy.jumpTimer = 2.0;
                        sounds.playJump();
                    }

                    // Animación de carrera rápida con flexión
                    if (enemy.leftLegPivot && enemy.rightLegPivot) {
                        const swing = Math.sin(time * 1.6) * 0.85;
                        enemy.leftLegPivot.rotation.x = swing;
                        enemy.rightLegPivot.rotation.x = -swing;
                        if (enemy.leftKneePivot) enemy.leftKneePivot.rotation.x = Math.max(0, -swing * 1.3);
                        if (enemy.rightKneePivot) enemy.rightKneePivot.rotation.x = Math.max(0, swing * 1.3);
                    }
                    if (enemy.rightArmPivot) {
                        enemy.rightArmPivot.rotation.x = Math.PI * 0.65;
                    }

                    // Si llega a rango de golpe
                    if (dist <= enemy.attackRange) {
                        // Conectar golpe
                        player.takeDamage(enemy.damage);
                        sounds.playSlash('normal');
                        enemy.timer = enemy.attackCooldown;

                        // Animación de tajo
                        if (enemy.rightArmPivot) {
                            enemy.rightArmPivot.rotation.x = Math.PI;
                        }

                        // Cambiar inmediatamente a repliegue táctico
                        enemy.aiState = 'retreating';
                        enemy.stateTimer = 0.9;
                    } else if (enemy.stateTimer <= 0) {
                        // Se acabó el tiempo de embestida sin alcanzar al jugador
                        enemy.aiState = 'retreating';
                        enemy.stateTimer = 0.7;
                    }

                } else if (enemy.aiState === 'retreating') {
                    // Salto o paso atrás evasivo para recuperar distancia
                    const retreatDir = new THREE.Vector3().subVectors(enemy.mesh.position, playerPos).normalize();
                    enemy.mesh.position.addScaledVector(retreatDir, enemy.speed * 0.9 * delta);

                    if (enemy.stateTimer <= 0) {
                        enemy.aiState = 'circling';
                        enemy.stateTimer = 1.5 + Math.random() * 2.0;
                    }
                }

            } else {
                // Patrulla ambiental tranquila cuando el jugador está lejos
                enemy.patrolTimer -= delta;
                if (enemy.patrolTimer <= 0) {
                    const angle = Math.random() * Math.PI * 2;
                    const r = 5 + Math.random() * 8;
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

                    if (enemy.leftLegPivot && enemy.rightLegPivot) {
                        const legSwing = Math.sin(time * 0.7) * 0.4;
                        enemy.leftLegPivot.rotation.x = legSwing;
                        enemy.rightLegPivot.rotation.x = -legSwing;
                    }
                }
            }

            // Límites del mapa
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
