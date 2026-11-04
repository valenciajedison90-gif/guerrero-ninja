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
        this.slashArcGeom = new THREE.RingGeometry(1.2, 2.4, 22, 1, -Math.PI * 0.45, Math.PI * 0.9);
        this.slashCoreGeom = new THREE.RingGeometry(1.5, 2.0, 16, 1, -Math.PI * 0.35, Math.PI * 0.7);
        this.shockwaveGeom = new THREE.RingGeometry(0.6, 1.4, 22);
        this.shurikenGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.05, 4);
        this.shurikenMat = new THREE.MeshStandardMaterial({
            color: 0x4a5568,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x00f0ff,
            emissiveIntensity: 0.4
        });
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

    createSlashEffect(position, direction, element = 'wood', combo = 0) {
        // 1. Arco de Corte Creciente Luminoso (Crescent Slash Ribbon estilo Anime)
        const slashGroup = new THREE.Group();
        slashGroup.position.copy(position);

        const angleY = Math.atan2(direction.x, direction.z);
        slashGroup.rotation.y = angleY;

        const elemColors = {
            wood: { main: 0xfef08a, emissive: 0xd97706 },
            steel: { main: 0xe0f2fe, emissive: 0x38bdf8 },
            gold: { main: 0xfacc15, emissive: 0xf59e0b },
            fire: { main: 0xffedd5, emissive: 0xff4500 },
            thunder: { main: 0xecfeff, emissive: 0x00f5ff },
            light: { main: 0xffffff, emissive: 0xa855f7 }
        };
        const ec = elemColors[element] || elemColors.steel;

        const arcMat = new THREE.MeshBasicMaterial({
            color: ec.main,
            transparent: true,
            opacity: 0.95,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const arcMesh = new THREE.Mesh(this.slashArcGeom, arcMat);
        const tilt = combo === 1 ? -0.35 : (combo === 2 ? 0.35 : 0);
        arcMesh.rotation.x = Math.PI / 2 + tilt;
        slashGroup.add(arcMesh);

        // Núcleo brillante blanco central
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1.0,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const coreMesh = new THREE.Mesh(this.slashCoreGeom, coreMat);
        coreMesh.rotation.x = arcMesh.rotation.x;
        slashGroup.add(coreMesh);

        this.scene.add(slashGroup);

        this.particles.push({
            group: slashGroup,
            isSlashArc: true,
            life: 0.16,
            maxLife: 0.16,
            arcMat: arcMat,
            coreMat: coreMat,
            update: (d, pct) => {
                const scale = 0.8 + (1 - pct) * 0.55;
                slashGroup.scale.set(scale, scale, scale);
                arcMat.opacity = pct * 0.95;
                coreMat.opacity = pct;
            }
        });

        // 2. Chispas direccionales en abanico
        const count = 9;
        const mat = this.materials[element] || this.materials.wood;

        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(this.sparkGeom, mat);
            mesh.position.copy(position);

            const angle = (i / count - 0.5) * Math.PI * 0.8;
            const spreadDir = direction.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
            const speed = 3.5 + Math.random() * 4.5;

            this.particles.push({
                mesh: mesh,
                velocity: spreadDir.multiplyScalar(speed).add(new THREE.Vector3(0, (Math.random() - 0.3) * 1.5, 0)),
                life: 0.22 + Math.random() * 0.12,
                maxLife: 0.35,
                gravity: -4.0,
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

    createParrySparks(position) {
        // Destello radial de choque de espadas (Parry Perfecto)
        const goldSparkMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
        const cyanSparkMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

        for (let i = 0; i < 18; i++) {
            const isGold = i % 2 === 0;
            const mesh = new THREE.Mesh(this.sparkGeom, isGold ? goldSparkMat : cyanSparkMat);
            mesh.position.copy(position);
            mesh.scale.set(1.6, 1.6, 1.6);

            const angle = (i / 18) * Math.PI * 2;
            const speed = 7.0 + Math.random() * 3.5;
            const vel = new THREE.Vector3(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed * 0.75 + 1.5,
                (Math.random() - 0.5) * 1.5
            );

            this.particles.push({
                mesh: mesh,
                velocity: vel,
                life: 0.4 + Math.random() * 0.15,
                maxLife: 0.55,
                gravity: -6.0,
                shrink: true
            });
            this.scene.add(mesh);
        }

        // Anillo de choque de energía
        this.createShockwave(position, 0x38bdf8, 4.0);
    }

    createDodgeDust(position) {
        const count = 3;
        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(this.smokeGeom, this.materials.smoke);
            mesh.position.set(
                position.x + (Math.random() - 0.5) * 0.4,
                position.y + 0.15,
                position.z + (Math.random() - 0.5) * 0.2
            );
            mesh.scale.set(0.6, 0.6, 0.6);

            this.particles.push({
                mesh: mesh,
                velocity: new THREE.Vector3((Math.random() - 0.5) * 1.2, 0.5 + Math.random() * 0.4, 0),
                life: 0.25,
                maxLife: 0.25,
                gravity: 0,
                scaleSpeed: 1.8,
                fade: true
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
                shrink: false,
                isCustomMat: true
            });
            this.scene.add(mesh);
        }
    }

    createEnemyDefeatBurst(position) {
        this.createSmokePoof(position, 1.5);
        this.createHitSparks(position, true);
        if (sounds && sounds.playPoof) sounds.playPoof();
    }

    createShockwave(position, colorHex = 0xffffff, maxRadius = 8) {
        const ringMat = new THREE.MeshBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const ringMesh = new THREE.Mesh(this.shockwaveGeom, ringMat);
        ringMesh.position.copy(position);
        ringMesh.position.y = 0.15;
        ringMesh.rotation.x = Math.PI / 2;
        this.scene.add(ringMesh);

        this.particles.push({
            group: ringMesh,
            isSlashArc: true,
            life: 0.35,
            maxLife: 0.35,
            arcMat: ringMat,
            coreMat: ringMat,
            update: (d, pct) => {
                const scale = 1.0 + (1 - pct) * (maxRadius * 0.7);
                ringMesh.scale.set(scale, scale, 1);
                ringMat.opacity = pct * 0.9;
            }
        });

        // Chispas radiales circulares
        for (let i = 0; i < 14; i++) {
            const angle = (i / 14) * Math.PI * 2;
            const mesh = new THREE.Mesh(this.sparkGeom, this.materials.critSpark);
            mesh.position.copy(position).add(new THREE.Vector3(0, 0.25, 0));
            const speed = 4.0 + Math.random() * 3.0;
            this.particles.push({
                mesh: mesh,
                velocity: new THREE.Vector3(Math.cos(angle) * speed, 1.6 + Math.random(), Math.sin(angle) * speed),
                life: 0.28,
                maxLife: 0.28,
                gravity: -4.5,
                shrink: true
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
        const mesh = new THREE.Mesh(this.shurikenGeom, this.shurikenMat);
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

            if (p.isSlashArc) {
                p.life -= delta;
                const pct = Math.max(0, p.life / p.maxLife);
                p.update(delta, pct);
                if (p.life <= 0) {
                    this.scene.remove(p.group);
                    p.arcMat.dispose();
                    p.coreMat.dispose();
                    this.particles.splice(i, 1);
                }
                continue;
            }

            p.life -= delta;

            if (p.life <= 0) {
                if (p.mesh) {
                    this.scene.remove(p.mesh);
                    if (p.isCustomMat && p.mesh.material) {
                        if (Array.isArray(p.mesh.material)) p.mesh.material.forEach(m => m.dispose());
                        else p.mesh.material.dispose();
                    }
                }
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
