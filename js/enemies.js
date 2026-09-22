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
        const blackMat = new THREE.MeshBasicMaterial({ color: 0x1f2937 });

        // Poste central de madera
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.8, 8), woodMat);
        post.position.y = 0.9;
        post.castShadow = true;
        group.add(post);

        // Torso acolchado de paja
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.5), strawMat);
        body.position.y = 1.35;
        body.castShadow = true;
        group.add(body);

        // Cabeza con cara graciosa
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), strawMat);
        head.position.y = 2.0;
        head.castShadow = true;
        group.add(head);

        // Ojos en cruz (X X) cómicos
        const eye1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.02), blackMat);
        eye1.position.set(-0.12, 2.02, 0.34);
        eye1.rotation.z = Math.PI / 4;
        const eye2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.02), blackMat);
        eye2.position.set(0.12, 2.02, 0.34);
        eye2.rotation.z = -Math.PI / 4;
        group.add(eye1);
        group.add(eye2);

        // Brazos de entrenamiento horizontales
        const crossArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.6, 8), woodMat);
        crossArm.rotation.z = Math.PI / 2;
        crossArm.position.y = 1.35;
        group.add(crossArm);

        // Barra de vida
        const healthBar = this.createHealthBar(35);
        healthBar.position.y = 2.6;
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

        const suitMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
        const purpleClothMat = new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.4 });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
        const katanaBladeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 });

        // Torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.0, 0.4), suitMat);
        torso.position.y = 1.25;
        torso.castShadow = true;
        group.add(torso);

        // Cinturón púrpura
        const belt = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.18, 0.42), purpleClothMat);
        belt.position.y = 0.95;
        group.add(belt);

        // Cabeza
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), suitMat);
        head.position.y = 1.95;
        head.castShadow = true;
        group.add(head);

        // Ojos brillantes
        const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.02), eyeMat);
        eyeL.position.set(-0.14, 1.98, 0.31);
        const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.02), eyeMat);
        eyeR.position.set(0.14, 1.98, 0.31);
        group.add(eyeL);
        group.add(eyeR);

        // Brazo derecho articulado con Katana
        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(0.55, 1.55, 0);
        const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.3), suitMat);
        rArm.position.y = -0.35;
        rightArmPivot.add(rArm);

        // Katana del ninja enemigo
        const sword = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.2, 0.04), katanaBladeMat);
        sword.position.set(0, -0.65, 0.3);
        sword.rotation.x = Math.PI / 3;
        rightArmPivot.add(sword);
        group.add(rightArmPivot);

        // Brazo izquierdo articulado
        const leftArmPivot = new THREE.Group();
        leftArmPivot.position.set(-0.55, 1.55, 0);
        const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.3), suitMat);
        lArm.position.y = -0.35;
        leftArmPivot.add(lArm);
        group.add(leftArmPivot);

        // Piernas
        const leftLegPivot = new THREE.Group();
        leftLegPivot.position.set(-0.2, 0.75, 0);
        const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.75, 0.32), suitMat);
        lLeg.position.y = -0.35;
        leftLegPivot.add(lLeg);
        group.add(leftLegPivot);

        const rightLegPivot = new THREE.Group();
        rightLegPivot.position.set(0.2, 0.75, 0);
        const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.75, 0.32), suitMat);
        rLeg.position.y = -0.35;
        rightLegPivot.add(rLeg);
        group.add(rightLegPivot);

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
            bodyMesh: torso,
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

        const suitMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 }); // Azul cian brillante
        const whiteClothMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 }); // Ojos amarillos brillantes
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.7, roughness: 0.2 });

        // Torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.95, 0.38), suitMat);
        torso.position.y = 1.2;
        torso.castShadow = true;
        group.add(torso);

        // Cinturón blanco
        const belt = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.16, 0.4), whiteClothMat);
        belt.position.y = 0.92;
        group.add(belt);

        // Cabeza
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.58, 0.58), suitMat);
        head.position.y = 1.88;
        head.castShadow = true;
        group.add(head);

        // Bandana blanca
        const headband = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.6), whiteClothMat);
        headband.position.y = 2.02;
        group.add(headband);

        // Ojos
        const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.02), eyeMat);
        eyeL.position.set(-0.13, 1.9, 0.3);
        const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.02), eyeMat);
        eyeR.position.set(0.13, 1.9, 0.3);
        group.add(eyeL);
        group.add(eyeR);

        // Brazos articulados
        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(0.52, 1.5, 0);
        const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.75, 0.28), suitMat);
        rArm.position.y = -0.32;
        rightArmPivot.add(rArm);

        // Cuchilla luminosa
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.0, 0.04), bladeMat);
        blade.position.set(0, -0.6, 0.25);
        blade.rotation.x = Math.PI / 4;
        rightArmPivot.add(blade);
        group.add(rightArmPivot);

        const leftArmPivot = new THREE.Group();
        leftArmPivot.position.set(-0.52, 1.5, 0);
        const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.75, 0.28), suitMat);
        lArm.position.y = -0.32;
        leftArmPivot.add(lArm);
        group.add(leftArmPivot);

        // Piernas
        const leftLegPivot = new THREE.Group();
        leftLegPivot.position.set(-0.18, 0.72, 0);
        const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.72, 0.3), suitMat);
        lLeg.position.y = -0.32;
        leftLegPivot.add(lLeg);
        group.add(leftLegPivot);

        const rightLegPivot = new THREE.Group();
        rightLegPivot.position.set(0.18, 0.72, 0);
        const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.72, 0.3), suitMat);
        rLeg.position.y = -0.32;
        rightLegPivot.add(rLeg);
        group.add(rightLegPivot);

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
            bodyMesh: torso,
            velocity: new THREE.Vector3(0, 0, 0),
            isGrounded: true,
            jumpTimer: 1.0 + Math.random() * 1.5, // Brinca con gran frecuencia
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
        group.scale.set(1.7, 1.7, 1.7); // Jefe gigante

        const armorMat = new THREE.MeshStandardMaterial({
            color: 0x7c2d12, // Armadura samurái roja fuego
            metalness: 0.5,
            roughness: 0.3
        });
        const goldMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            metalness: 0.9,
            roughness: 0.2
        });
        const bladeMat = new THREE.MeshStandardMaterial({
            color: 0xf87171,
            metalness: 0.8,
            roughness: 0.2
        });

        // Torso robusto
        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.7), armorMat);
        torso.position.y = 1.5;
        torso.castShadow = true;
        group.add(torso);

        // Cabeza con casco de samurái
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.85), armorMat);
        head.position.y = 2.5;
        head.castShadow = true;
        group.add(head);

        // Cuernos dorados del casco
        const hornGeom = new THREE.ConeGeometry(0.15, 0.8, 4);
        const hornL = new THREE.Mesh(hornGeom, goldMat);
        hornL.position.set(-0.4, 3.1, 0.1);
        hornL.rotation.z = 0.5;
        const hornR = new THREE.Mesh(hornGeom, goldMat);
        hornR.position.set(0.4, 3.1, 0.1);
        hornR.rotation.z = -0.5;
        group.add(hornL);
        group.add(hornR);

        // Brazo derecho con Gran Espada Samurái
        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(0.9, 1.9, 0);
        const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.1, 0.45), armorMat);
        rArm.position.y = -0.5;
        rightArmPivot.add(rArm);

        // Espada gigante
        const bigSword = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.2, 0.08), bladeMat);
        bigSword.position.set(0, -1.1, 0.5);
        bigSword.rotation.x = Math.PI / 3;
        rightArmPivot.add(bigSword);
        group.add(rightArmPivot);

        const leftArmPivot = new THREE.Group();
        leftArmPivot.position.set(-0.9, 1.9, 0);
        const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.1, 0.45), armorMat);
        lArm.position.y = -0.5;
        leftArmPivot.add(lArm);
        group.add(leftArmPivot);

        // Piernas
        const leftLegPivot = new THREE.Group();
        leftLegPivot.position.set(-0.35, 0.8, 0);
        const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.48, 1.0, 0.48), armorMat);
        lLeg.position.y = -0.45;
        leftLegPivot.add(lLeg);
        group.add(leftLegPivot);

        const rightLegPivot = new THREE.Group();
        rightLegPivot.position.set(0.35, 0.8, 0);
        const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.48, 1.0, 0.48), armorMat);
        rLeg.position.y = -0.45;
        rightLegPivot.add(rLeg);
        group.add(rightLegPivot);

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
            bodyMesh: torso,
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
