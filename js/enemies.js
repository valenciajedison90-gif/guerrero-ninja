// js/enemies.js - Enemigos Caricaturescos estilo Roblox, IA y Sistema de Oleadas
import * as THREE from 'three';
import { sounds } from './sound.js';

export class EnemyManager {
    constructor(scene, particles) {
        this.scene = scene;
        this.particles = particles;
        this.enemies = [];
        this.wave = 1;
        this.bossSpawned = false;

        // Iniciar primeros enemigos
        this.spawnInitialEnemies();
    }

    spawnInitialEnemies() {
        // 3 Muñecos de entrenamiento en el centro
        this.spawnDummy(new THREE.Vector3(-4, 0, -4));
        this.spawnDummy(new THREE.Vector3(4, 0, -4));
        this.spawnDummy(new THREE.Vector3(0, 0, -8));

        // 2 Ninjas de las sombras patrullando
        this.spawnShadowNinja(new THREE.Vector3(-15, 0, 5));
        this.spawnShadowNinja(new THREE.Vector3(15, 0, 5));
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
            respawnTimer: 0,
            originalPos: pos.clone(),
            attackCooldown: 99999, // No ataca
            bodyMesh: body
        };

        this.enemies.push(enemy);
        this.scene.add(group);
    }

    spawnShadowNinja(pos) {
        const group = new THREE.Group();
        group.position.copy(pos);

        const suitMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 }); // Púrpura oscuro / gris pizarra
        const purpleClothMat = new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.4 });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e }); // Ojos rojos amenazantes pero divertidos

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
            speed: 4.8,
            attackRange: 2.0,
            attackCooldown: 1.2,
            timer: 0,
            bodyMesh: torso
        };

        this.enemies.push(enemy);
        this.scene.add(group);
    }

    spawnBoss(pos) {
        if (this.bossSpawned) return;
        this.bossSpawned = true;

        const group = new THREE.Group();
        group.position.copy(pos);
        group.scale.set(1.7, 1.7, 1.7); // Jefe más grande

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

        // Barra de vida gigante
        const healthBar = this.createHealthBar(260);
        healthBar.scale.set(1.4, 1.4, 1.4);
        healthBar.position.y = 3.6;
        group.add(healthBar);

        const enemy = {
            mesh: group,
            type: 'boss',
            name: 'Gran Samurái de las Sombras (JEFE)',
            health: 260,
            maxHealth: 260,
            healthBar: healthBar,
            coinsDrop: 160,
            xpDrop: 200,
            damage: 18,
            speed: 3.2,
            attackRange: 3.2,
            attackCooldown: 1.8,
            timer: 0,
            bodyMesh: torso
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

        // Destello rojo de daño
        if (enemy.bodyMesh && enemy.bodyMesh.material) {
            const originalColor = enemy.bodyMesh.material.color.getHex();
            enemy.bodyMesh.material.color.setHex(0xffffff);
            setTimeout(() => {
                if (enemy.bodyMesh && enemy.bodyMesh.material) {
                    enemy.bodyMesh.material.color.setHex(originalColor);
                }
            }, 100);
        }

        // Retroceso (knockback)
        if (hitDirection && enemy.type !== 'dummy') {
            enemy.mesh.position.addScaledVector(hitDirection, isCrit ? 1.5 : 0.8);
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
        const coinCount = enemy.type === 'boss' ? 14 : (enemy.type === 'shadow_ninja' ? 5 : 3);
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

        // Si era un muñeco de práctica, programar reaparición para seguir entrenando
        if (enemy.type === 'dummy') {
            setTimeout(() => {
                this.spawnDummy(enemy.originalPos);
            }, 6000);
        } else {
            // Reaparecer ninjas sombra para mantener la diversión activa
            setTimeout(() => {
                const angle = Math.random() * Math.PI * 2;
                const r = 14 + Math.random() * 8;
                this.spawnShadowNinja(new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r));
            }, 8000);
        }
    }

    update(delta, player, camera) {
        const playerPos = player.mesh.position;

        // Orientar barras de vida hacia la cámara del jugador (estilo Billboard)
        this.enemies.forEach(enemy => {
            if (enemy.healthBar) {
                enemy.healthBar.quaternion.copy(camera.quaternion);
            }

            // IA para Ninjas Sombra y Jefe
            if (enemy.type === 'shadow_ninja' || enemy.type === 'boss') {
                const dist = enemy.mesh.position.distanceTo(playerPos);

                // Mirar al jugador
                const lookTarget = new THREE.Vector3(playerPos.x, enemy.mesh.position.y, playerPos.z);
                enemy.mesh.lookAt(lookTarget);

                // Perseguir si está dentro del radio de visión
                if (dist > enemy.attackRange && dist < 28.0) {
                    const dir = new THREE.Vector3().subVectors(playerPos, enemy.mesh.position).normalize();
                    enemy.mesh.position.addScaledVector(dir, enemy.speed * delta);

                    // Pequeña oscilación al caminar
                    enemy.mesh.position.y = Math.abs(Math.sin(performance.now() * 0.01)) * 0.15;
                } else if (dist <= enemy.attackRange) {
                    // Atacar al jugador
                    enemy.timer += delta;
                    if (enemy.timer >= enemy.attackCooldown) {
                        enemy.timer = 0;
                        player.takeDamage(enemy.damage);
                    }
                }
            }
        });
    }
}
