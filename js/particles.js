// js/particles.js - Sistema de Partículas, Estelas y Monedas Recolectables
import * as THREE from 'three';
import { sounds } from './sound.js';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.coins = [];
        this.projectiles = []; // Shurikens arrojados
        this.floatingTexts = [];

        // Geometría y materiales reutilizables (evita GC y sobrecalentamiento móvil)
        this.sparkGeom = new THREE.BoxGeometry(0.08, 0.08, 0.08);
        this.smokeGeom = new THREE.DodecahedronGeometry(0.25, 0);
        this.coinGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.06, 10);
        this.coinMat = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.8,
            roughness: 0.3,
            emissive: 0xd97706,
            emissiveIntensity: 0.3
        });

        // Materiales estáticos compartidos para cero asignaciones por frame
        this.materials = {
            wood: new THREE.MeshBasicMaterial({ color: 0xf5f5f5, transparent: true, opacity: 0.9 }),
            fire: new THREE.MeshBasicMaterial({ color: 0xff5500, transparent: true, opacity: 0.9 }),
            thunder: new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.9 }),
            gold: new THREE.MeshBasicMaterial({ color: 0xffe600, transparent: true, opacity: 0.9 }),
            critSpark: new THREE.MeshBasicMaterial({ color: 0xffea00, transparent: true, opacity: 1 }),
            hitSpark: new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 1 }),
            smoke: new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.65 })
        };
    }

    createSlashEffect(position, direction, element = 'wood') {
        const count = 7;
        const mat = this.materials[element] || this.materials.wood;

        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(this.sparkGeom, mat);
            mesh.position.copy(position);

            const angle = (i / count - 0.5) * Math.PI * 0.7;
            const spreadDir = direction.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
            const speed = 2.5 + Math.random() * 3.5;

            this.particles.push({
                mesh: mesh,
                velocity: spreadDir.multiplyScalar(speed).add(new THREE.Vector3(0, (Math.random() - 0.3) * 1.5, 0)),
                life: 0.22 + Math.random() * 0.12,
                maxLife: 0.35,
                gravity: 0,
                shrink: true
            });
            this.scene.add(mesh);
        }
    }

    createHitSparks(position, isCrit = false) {
        const count = isCrit ? 10 : 6;
        const mat = isCrit ? this.materials.critSpark : this.materials.hitSpark;

        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(this.sparkGeom, mat);
            mesh.position.copy(position);

            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 4.5,
                Math.random() * 3.5 + 1.2,
                (Math.random() - 0.5) * 4.5
            );

            this.particles.push({
                mesh: mesh,
                velocity: vel,
                life: 0.3 + Math.random() * 0.15,
                maxLife: 0.45,
                gravity: -9.8,
                shrink: true
            });
            this.scene.add(mesh);
        }
    }

    createSmokePoof(position, scale = 1.0) {
        const count = 5;
        const mat = this.materials.smoke;

        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(this.smokeGeom, mat);
            mesh.position.copy(position);
            mesh.scale.setScalar(scale * (0.6 + Math.random() * 0.6));

            const angle = Math.random() * Math.PI * 2;
            const horizontalSpeed = Math.random() * 2.2 * scale;
            const vel = new THREE.Vector3(
                Math.cos(angle) * horizontalSpeed,
                Math.random() * 1.8 * scale + 0.4,
                Math.sin(angle) * horizontalSpeed
            );

            this.particles.push({
                mesh: mesh,
                velocity: vel,
                life: 0.4 + Math.random() * 0.25,
                maxLife: 0.65,
                gravity: 0.5,
                grow: true
            });
            this.scene.add(mesh);
        }
    }

    createConfetti(position) {
        const colors = [0xff0055, 0x00ffcc, 0xffcc00, 0x9900ff, 0x00ff00, 0xff7700];
        for (let i = 0; i < 40; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const mat = new THREE.MeshBasicMaterial({ color: color });
            const mesh = new THREE.Mesh(this.sparkGeom, mat);
            mesh.position.copy(position).add(new THREE.Vector3(0, 1.5, 0));

            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 6,
                Math.random() * 7 + 4,
                (Math.random() - 0.5) * 6
            );

            this.particles.push({
                mesh: mesh,
                velocity: vel,
                life: 1.5 + Math.random() * 0.8,
                maxLife: 2.3,
                gravity: -6.0,
                shrink: false
            });
            this.scene.add(mesh);
        }
    }

    spawnCoin(position, value = 5) {
        const coinMesh = new THREE.Mesh(this.coinGeom, this.coinMat);
        coinMesh.position.copy(position);
        coinMesh.rotation.x = Math.PI / 2;
        coinMesh.castShadow = true;

        const vel = new THREE.Vector3(
            (Math.random() - 0.5) * 3,
            Math.random() * 3.5 + 2.5,
            (Math.random() - 0.5) * 3
        );

        const coinObj = {
            mesh: coinMesh,
            velocity: vel,
            value: value,
            magnetized: false,
            timeAlive: 0,
            groundY: 0.3
        };

        this.coins.push(coinObj);
        this.scene.add(coinMesh);
    }

    spawnShurikenProjectile(startPos, direction, damage, element) {
        const starGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.05, 4);
        const starMat = new THREE.MeshStandardMaterial({
            color: 0x4a5568,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x00f0ff,
            emissiveIntensity: 0.4
        });
        const mesh = new THREE.Mesh(starGeom, starMat);
        mesh.position.copy(startPos);
        mesh.rotation.x = Math.PI / 2;

        const speed = 26.0;
        const vel = direction.clone().normalize().multiplyScalar(speed);

        this.projectiles.push({
            mesh: mesh,
            velocity: vel,
            damage: damage,
            element: element,
            life: 1.8,
            active: true
        });
        this.scene.add(mesh);
        sounds.playShurikenThrow();
    }

    update(delta, playerPos, onCoinCollect) {
        // 1. Actualizar partículas generales
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= delta;

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                p.mesh.geometry.dispose();
                if (Array.isArray(p.mesh.material)) p.mesh.material.forEach(m => m.dispose());
                else p.mesh.material.dispose();
                this.particles.splice(i, 1);
                continue;
            }

            p.velocity.y += p.gravity * delta;
            p.mesh.position.addScaledVector(p.velocity, delta);

            const progress = p.life / p.maxLife;
            if (p.shrink) {
                p.mesh.scale.setScalar(Math.max(0.01, progress));
            }
            if (p.grow) {
                p.mesh.scale.setScalar(Math.max(0.1, (1 - progress) * 1.5));
            }
            if (p.mesh.material.transparent) {
                p.mesh.material.opacity = Math.max(0, progress);
            }
        }

        // 2. Actualizar monedas (física, rebote y atracción magnética)
        const magnetRadius = 6.5;
        const collectRadius = 1.2;

        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            coin.timeAlive += delta;

            // Giro continuo
            coin.mesh.rotation.z += delta * 6;

            const distToPlayer = coin.mesh.position.distanceTo(playerPos);

            if (distToPlayer < collectRadius) {
                // Moneda recogida
                sounds.playCoin();
                if (onCoinCollect) onCoinCollect(coin.value, coin.mesh.position);
                this.scene.remove(coin.mesh);
                this.coins.splice(i, 1);
                continue;
            }

            if (distToPlayer < magnetRadius || coin.magnetized) {
                // Atraer magnéticamente hacia el jugador
                coin.magnetized = true;
                const dirToPlayer = new THREE.Vector3().subVectors(playerPos, coin.mesh.position).normalize();
                const magnetSpeed = Math.min(22, 6.0 + (magnetRadius - distToPlayer) * 3.5);
                coin.mesh.position.addScaledVector(dirToPlayer, magnetSpeed * delta);
            } else {
                // Física normal de salto y gravedad en el suelo
                if (coin.mesh.position.y > coin.groundY) {
                    coin.velocity.y -= 9.8 * delta;
                    coin.mesh.position.addScaledVector(coin.velocity, delta);
                    if (coin.mesh.position.y <= coin.groundY) {
                        coin.mesh.position.y = coin.groundY;
                        coin.velocity.y *= -0.45; // Rebote elástico
                        coin.velocity.x *= 0.6;
                        coin.velocity.z *= 0.6;
                    }
                }
            }
        }

        // 3. Actualizar proyectiles (Shurikens)
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.life -= delta;

            if (proj.life <= 0 || !proj.active) {
                this.scene.remove(proj.mesh);
                this.projectiles.splice(i, 1);
                continue;
            }

            proj.mesh.position.addScaledVector(proj.velocity, delta);
            proj.mesh.rotation.z += delta * 25; // Rotación super rápida de estrella ninja
        }
    }
}
