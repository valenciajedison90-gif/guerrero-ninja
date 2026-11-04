// js/player.js - Controlador del Jugador y Animales Ninja Colombianos
import * as THREE from 'three';
import { sounds } from './sound.js?v=6.0';
import { WEAPONS } from './weapons.js?v=6.0';
import { AnimalCharacterBuilder, CHARACTERS_DATA } from './characters.js';
import { storage } from './storage.js';

export class Player {
    constructor(scene, camera, domElement) {
        this.scene = scene;
        this.camera = camera;
        this.domElement = domElement;

        // Identidad del personaje animal colombiano
        this.characterId = storage.getSelectedCharacter() || 'chucho';
        const charData = CHARACTERS_DATA[this.characterId] || CHARACTERS_DATA.chucho;

        // Atributos de combate dinámicos por animal
        this.maxHealth = charData.stats.health;
        this.health = this.maxHealth;
        this.baseSpeed = charData.stats.speed;
        this.jumpForce = charData.stats.jumpForce;

        this.attackCooldown = 0;
        this.attackCombo = 0;
        this.comboResetTimer = 0;
        this.isAttacking = false;
        this.attackTimer = 0;
        this.isSpinning = false;
        this.spinTimer = 0;
        this.spinCooldown = 0;
        this.onAttackCallback = null;
        this.onSpinAttackCallback = null;
        this.onSpecialSkillCallback = null;

        // Habilidad Especial Única
        this.specialCooldownTimer = 0;
        this.isGliding = false;
        this.glideTimer = 0;
        this.mudShieldTimer = 0;

        // Salto y Doble Salto
        this.jumpCount = 0;
        this.maxJumps = 2;
        this.isGrounded = true;

        // Movimiento y física
        this.velocity = new THREE.Vector3();
        this.moveDirection = new THREE.Vector3();
        this.gravity = -26.0;

        // Cámara en 3ra persona orbital inmersiva estilo Crash Bandicoot / Roblox Blox Fruits
        this.cameraDistance = 4.8;
        this.cameraHeight = 2.4;
        this.cameraPitch = 0.22;
        this.cameraYaw = 0;
        this.isDraggingMouse = false;
        this.isRotatingCamera = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.runTime = 0;
        this.getTargetsCallback = null;
        this.onSpawnShadowCallback = null;
        this.onJumpCallback = null;
        this.onLandCallback = null;
        this.shadowSpawnTimer = 0;

        // Teclas activas
        this.keys = {
            w: false,
            s: false,
            a: false,
            d: false,
            space: false
        };

        // Movimiento táctil móvil
        this.touchMoveVector = new THREE.Vector2(0, 0);

        // Habilidad de impulso / dash ninja
        this.dashCooldown = 0;
        this.dashTimer = 0;
        this.dashDirection = new THREE.Vector3();

        this.suitColor = 0x1e293b;

        // Construir modelo 3D del animal colombiano seleccionado
        this.mesh = new THREE.Group();
        this.mesh.name = 'player';
        this.scene.add(this.mesh);
        this.buildAnimalModel(this.characterId);

        // Arma activa
        this.currentWeaponId = 'bokken';
        this.weaponMesh = null;
        this.equipWeapon('bokken');

        // Escuchar eventos de entrada
        this.setupInputListeners();
    }

    setSuitColor(colorHex) {
        this.suitColor = colorHex;
        if (this.suitMat) {
            this.suitMat.color.set(colorHex);
        }
    }

    getNetworkState() {
        let anim = 'idle';
        if (this.isSpinning) anim = 'spin';
        else if (this.isAttacking) anim = 'attack';
        else if (this.dashTimer > 0) anim = 'run';
        else if (!this.isGrounded) anim = 'jump';
        else if (this.keys.w || this.keys.s || this.keys.a || this.keys.d || this.touchMoveVector.lengthSq() > 0.01) anim = 'run';
        return {
            x: Number(this.mesh.position.x.toFixed(2)),
            y: Number(this.mesh.position.y.toFixed(2)),
            z: Number(this.mesh.position.z.toFixed(2)),
            rot: Number(this.mesh.rotation.y.toFixed(2)),
            anim: anim,
            weapon: this.currentWeaponId,
            combo: this.attackCombo
        };
    }

    buildAnimalModel(characterId = 'chucho') {
        this.characterId = characterId;
        const charData = CHARACTERS_DATA[characterId] || CHARACTERS_DATA.chucho;

        while (this.mesh.children.length > 0) {
            this.mesh.remove(this.mesh.children[0]);
        }

        const built = AnimalCharacterBuilder.build(characterId);
        this.modelGroup = built.group;
        this.torso = built.torso;
        this.head = built.head;
        this.leftArmPivot = built.leftArmPivot;
        this.leftElbowPivot = built.leftElbowPivot;
        this.rightArmPivot = built.rightArmPivot;
        this.rightElbowPivot = built.rightElbowPivot;
        this.leftLegPivot = built.leftLegPivot;
        this.leftKneePivot = built.leftKneePivot;
        this.rightLegPivot = built.rightLegPivot;
        this.rightKneePivot = built.rightKneePivot;
        this.weaponHolder = built.weaponHolder;
        this.bandanaTail1 = built.bandanaTail1;
        this.bandanaTail2 = built.bandanaTail2;

        this.mesh.add(this.modelGroup);

        this.maxHealth = charData.stats.health;
        this.health = this.maxHealth;
        this.baseSpeed = charData.stats.speed;
        this.jumpForce = charData.stats.jumpForce;

        if (this.currentWeaponId) {
            this.equipWeapon(this.currentWeaponId);
        }
    }

    switchCharacter(characterId) {
        if (!CHARACTERS_DATA[characterId]) return;
        this.buildAnimalModel(characterId);
    }

    activateSpecialSkill() {
        if (this.specialCooldownTimer > 0) return false;
        const charData = CHARACTERS_DATA[this.characterId] || CHARACTERS_DATA.chucho;
        this.specialCooldownTimer = charData.skill.cooldown;

        sounds.playSlash('heavy');

        if (this.characterId === 'chucho') {
            this.velocity.y = 5.0;
        } else if (this.characterId === 'yari') {
            this.dash();
            this.dashTimer = 0.35;
        } else if (this.characterId === 'guaca') {
            this.velocity.y = 15.0;
            this.isGliding = true;
            this.glideTimer = 3.2;
        } else if (this.characterId === 'capibu') {
            this.mudShieldTimer = 6.0;
        } else if (this.characterId === 'ranaik') {
            this.velocity.y = 20.0;
            if (this.moveDirection.lengthSq() > 0.01) {
                this.velocity.x = this.moveDirection.x * 22.0;
                this.velocity.z = this.moveDirection.z * 22.0;
            }
        }

        if (this.onSpecialSkillCallback) {
            this.onSpecialSkillCallback(this.characterId, charData.skill);
        }
        return true;
    }

    equipWeapon(weaponId) {
        this.currentWeaponId = weaponId;

        while (this.weaponHolder.children.length > 0) {
            const child = this.weaponHolder.children[0];
            this.weaponHolder.remove(child);
        }

        const weaponGroup = new THREE.Group();
        const data = WEAPONS[weaponId] || WEAPONS.bokken;

        // Mango de agarre con cinta tsuka-ito
        const hilt = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.045, 0.45, 12),
            new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8 })
        );
        hilt.position.y = -0.2;
        weaponGroup.add(hilt);

        // Guardia de la espada (Tsuba)
        const guard = new THREE.Mesh(
            new THREE.CylinderGeometry(0.13, 0.13, 0.04, 16),
            new THREE.MeshStandardMaterial({ color: data.glowColor || 0xf59e0b, metalness: 0.8, roughness: 0.3 })
        );
        guard.position.y = 0.04;
        weaponGroup.add(guard);

        // Hoja de la espada
        const bladeMat = new THREE.MeshStandardMaterial({
            color: data.color || 0xe2e8f0,
            metalness: 0.85,
            roughness: 0.2,
            emissive: data.glowColor || 0x000000,
            emissiveIntensity: data.glowColor ? 0.6 : 0.0
        });

        const blade = new THREE.Mesh(
            new THREE.BoxGeometry(0.07, 1.4, 0.03),
            bladeMat
        );
        blade.position.y = 0.74;
        blade.castShadow = true;
        weaponGroup.add(blade);

        this.weaponHolder.add(weaponGroup);
        this.weaponMesh = weaponGroup;
    }

    setupInputListeners() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'w' || key === 'arrowup') this.keys.w = true;
            if (key === 's' || key === 'arrowdown') this.keys.s = true;
            if (key === 'a' || key === 'arrowleft') this.keys.a = true;
            if (key === 'd' || key === 'arrowright') this.keys.d = true;
            if (e.code === 'Space') {
                this.keys.space = true;
                this.jump();
                e.preventDefault();
            }
            if (key === 'shift') {
                this.dash();
            }
            if (key === 'f' || key === 'j') {
                this.triggerAttack();
            }
            if (key === 'e') {
                this.triggerSpinAttack();
            }
            if (key === 'q' || key === 'r') {
                this.activateSpecialSkill();
            }
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'w' || key === 'arrowup') this.keys.w = false;
            if (key === 's' || key === 'arrowdown') this.keys.s = false;
            if (key === 'a' || key === 'arrowleft') this.keys.a = false;
            if (key === 'd' || key === 'arrowright') this.keys.d = false;
            if (e.code === 'Space') this.keys.space = false;
        });

        // Controles de ratón para apuntado y cámara
        this.domElement.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.triggerAttack();
            }
            if (e.button === 2 || e.button === 0) {
                this.isDraggingMouse = true;
                this.previousMousePosition = { x: e.clientX, y: e.clientY };
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isDraggingMouse) {
                const deltaX = e.clientX - this.previousMousePosition.x;
                const deltaY = e.clientY - this.previousMousePosition.y;

                this.cameraYaw -= deltaX * 0.007;
                this.cameraPitch += deltaY * 0.005;
                this.cameraPitch = Math.max(-0.2, Math.min(1.1, this.cameraPitch));

                this.previousMousePosition = { x: e.clientX, y: e.clientY };
            }
        });

        window.addEventListener('mouseup', () => {
            this.isDraggingMouse = false;
        });

        this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

        window.addEventListener('wheel', (e) => {
            this.cameraDistance = Math.max(3.5, Math.min(12.0, this.cameraDistance + e.deltaY * 0.005));
        });
    }

    setTouchMovement(x, y) {
        this.touchMoveVector.set(x, y);
    }

    setRotatingCamera(isRotating) {
        this.isRotatingCamera = isRotating;
    }

    setTargetsProvider(callback) {
        this.getTargetsCallback = callback;
    }

    setSpawnShadowCallback(callback) {
        this.onSpawnShadowCallback = callback;
    }

    addCameraRotation(deltaX, deltaY) {
        // Sensibilidad calibrada para giros suaves y directos estilo Free Fire
        this.cameraYaw -= deltaX * 0.009;
        this.cameraPitch += deltaY * 0.005;
        this.cameraPitch = Math.max(-0.15, Math.min(0.95, this.cameraPitch));
    }

    findBestTarget(maxDistance = 8.5) {
        if (!this.getTargetsCallback) return null;
        const targets = this.getTargetsCallback();
        if (!targets || !targets.length) return null;

        let bestTarget = null;
        let minScore = Infinity;

        const playerPos = this.mesh.position;
        const currentHeading = this.moveDirection.lengthSq() > 0.01
            ? Math.atan2(this.moveDirection.x, this.moveDirection.z)
            : this.mesh.rotation.y;

        for (const t of targets) {
            if (!t) continue;
            const targetMesh = t.mesh || t;
            if (!targetMesh || !targetMesh.position) continue;
            if (t.isDead || (t.health !== undefined && t.health <= 0)) continue;

            const tPos = targetMesh.position;
            const dist = Math.hypot(tPos.x - playerPos.x, tPos.z - playerPos.z);
            if (dist > maxDistance) continue;

            const angleToTarget = Math.atan2(tPos.x - playerPos.x, tPos.z - playerPos.z);
            let angleDiff = Math.abs(angleToTarget - currentHeading);
            while (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

            // Prioriza enemigos más cercanos y que estén dentro del ángulo de vista
            const score = dist * (1.0 + angleDiff * 0.5);
            if (score < minScore) {
                minScore = score;
                bestTarget = { target: t, mesh: targetMesh, dist, angleToTarget };
            }
        }
        return bestTarget;
    }

    jump() {
        if (this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
            this.jumpCount = 1;
            sounds.playJump();
            if (this.onJumpCallback) this.onJumpCallback(this.mesh.position.clone());
        } else if (this.jumpCount < this.maxJumps) {
            // Doble salto estilo plataformas
            this.velocity.y = this.jumpForce * 0.95;
            this.jumpCount = 2;
            sounds.playJump();
            if (this.onJumpCallback) this.onJumpCallback(this.mesh.position.clone());
        }
    }

    dash() {
        if (this.dashCooldown > 0) return;
        this.dashCooldown = 0.55; // Esquive ágil y rápido
        this.dashTimer = 0.22;
        sounds.playDash();

        if (this.moveDirection.lengthSq() > 0.001) {
            this.dashDirection.copy(this.moveDirection).normalize();
        } else {
            this.dashDirection.set(
                Math.sin(this.mesh.rotation.y),
                0,
                Math.cos(this.mesh.rotation.y)
            ).normalize();
        }

        if (this.onSpawnShadowCallback) {
            this.onSpawnShadowCallback(this.mesh.position.clone(), this.mesh.rotation.y);
        }
    }

    triggerAttack() {
        if (this.attackCooldown > 0) return;

        // Auto-Apuntado Asistido (Soft Aim Assist estilo Free Fire / Brawl Stars)
        const best = this.findBestTarget(8.5);
        if (best) {
            this.mesh.rotation.y = best.angleToTarget;
            // Paso de acometida magnético hacia el objetivo
            if (best.dist > 1.3) {
                const lungeDist = Math.min(2.0, best.dist - 1.0);
                this.mesh.position.x += Math.sin(best.angleToTarget) * lungeDist;
                this.mesh.position.z += Math.cos(best.angleToTarget) * lungeDist;
            }
        } else if (this.moveDirection.lengthSq() > 0.01) {
            this.mesh.rotation.y = Math.atan2(this.moveDirection.x, this.moveDirection.z);
        } else {
            this.mesh.rotation.y = this.cameraYaw + Math.PI;
        }

        const weaponData = WEAPONS[this.currentWeaponId] || WEAPONS.bokken;
        this.isAttacking = true;
        this.attackTimer = 0;

        // Cadena de combo rápida (Hit 1: 0.18s, Hit 2: 0.18s, Hit 3 Finisher: 0.28s)
        const comboCooldowns = [0.18, 0.18, 0.28];
        this.attackCooldown = comboCooldowns[this.attackCombo] || weaponData.attackSpeed;

        sounds.playSlash(weaponData.element);

        if (this.onAttackCallback) {
            this.onAttackCallback(this.currentWeaponId, this.attackCombo, best ? best.target : null);
        }

        this.attackCombo = (this.attackCombo + 1) % 3;
        this.comboResetTimer = 0.85;
    }

    // Ataque de Giro Ninja 360° estilo Crash Bandicoot
    triggerSpinAttack() {
        if (this.spinCooldown > 0) return;
        this.spinCooldown = 0.52;
        this.isSpinning = true;
        this.spinTimer = 0.35;
        this.isAttacking = true;
        this.attackCombo = 2;

        const best = this.findBestTarget(6.5);
        if (best && best.dist > 1.2) {
            const lungeDist = Math.min(1.4, best.dist - 0.8);
            this.mesh.position.x += Math.sin(best.angleToTarget) * lungeDist;
            this.mesh.position.z += Math.cos(best.angleToTarget) * lungeDist;
        }

        sounds.playSlash('heavy');

        if (this.onSpinAttackCallback) {
            this.onSpinAttackCallback();
        } else if (this.onAttackCallback) {
            this.onAttackCallback(this.currentWeaponId, 2, best ? best.target : null);
        }
    }

    bounceTrampoline(boostForce = 22.0) {
        this.velocity.y = boostForce;
        this.isGrounded = false;
        this.jumpCount = 1;
        sounds.playTrampoline();
    }

    takeDamage(amount) {
        // Invulnerabilidad (i-frames) durante el dash ninja
        if (this.dashTimer > 0) return;

        // Escudo de Lodo de Capibú absorbe 60% del impacto
        if (this.mudShieldTimer > 0) {
            amount = Math.round(amount * 0.4);
        }

        this.health = Math.max(0, this.health - amount);
        sounds.playHit(false);

        if (this.health <= 0) {
            this.respawn();
        }
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    respawn() {
        this.health = this.maxHealth;
        this.mesh.position.set(0, 1.5, 0);
        this.velocity.set(0, 0, 0);
        this.isGrounded = true;
        this.jumpCount = 0;
    }

    update(delta) {
        // Enfriamiento de ataque, combo, giro y habilidad especial
        if (this.attackCooldown > 0) this.attackCooldown -= delta;
        if (this.spinCooldown > 0) this.spinCooldown -= delta;
        if (this.dashCooldown > 0) this.dashCooldown -= delta;
        if (this.specialCooldownTimer > 0) this.specialCooldownTimer -= delta;
        if (this.mudShieldTimer > 0) this.mudShieldTimer -= delta;

        // Planeo de Guaca
        if (this.isGliding) {
            this.glideTimer -= delta;
            this.velocity.y = Math.max(-1.6, this.velocity.y);
            if (this.glideTimer <= 0) this.isGliding = false;
        }

        if (this.comboResetTimer > 0) {
            this.comboResetTimer -= delta;
            if (this.comboResetTimer <= 0) {
                this.attackCombo = 0;
            }
        }

        // 1. Vector de movimiento relativo a la cámara
        const forward = new THREE.Vector3(
            -Math.sin(this.cameraYaw),
            0,
            -Math.cos(this.cameraYaw)
        ).normalize();

        const right = new THREE.Vector3(
            Math.cos(this.cameraYaw),
            0,
            -Math.sin(this.cameraYaw)
        ).normalize();

        this.moveDirection.set(0, 0, 0);

        if (this.keys.w) this.moveDirection.add(forward);
        if (this.keys.s) this.moveDirection.sub(forward);
        if (this.keys.d) this.moveDirection.add(right);
        if (this.keys.a) this.moveDirection.sub(right);

        if (this.touchMoveVector.lengthSq() > 0.01) {
            this.moveDirection.addScaledVector(forward, this.touchMoveVector.y);
            this.moveDirection.addScaledVector(right, this.touchMoveVector.x);
        }

        const isMoving = this.moveDirection.lengthSq() > 0.001;

        if (isMoving) {
            this.moveDirection.normalize();
            if (!this.isAttacking && !this.isSpinning) {
                const targetRotation = Math.atan2(this.moveDirection.x, this.moveDirection.z);
                let diff = targetRotation - this.mesh.rotation.y;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;
                this.mesh.rotation.y += diff * 0.25;
            }

            // Auto-alineación suave de la cámara al correr estilo Free Fire
            this.runTime += delta;
            if (this.runTime > 0.35 && !this.isRotatingCamera && !this.isAttacking && !this.isSpinning) {
                const moveAngle = Math.atan2(this.moveDirection.x, this.moveDirection.z);
                const desiredYaw = moveAngle - Math.PI;
                let diffYaw = desiredYaw - this.cameraYaw;
                while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;
                while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;
                this.cameraYaw += diffYaw * Math.min(1.0, delta * 3.2);
            }
        } else {
            this.runTime = 0;
        }

        // Velocidad de movimiento según atributos únicos del animal seleccionado
        const baseSpeed = this.baseSpeed || 10.5;
        let currentSpeed = baseSpeed;

        if (this.dashTimer > 0) {
            this.dashTimer -= delta;
            currentSpeed = baseSpeed * 2.3;
            const targetVx = this.dashDirection.x * currentSpeed;
            const targetVz = this.dashDirection.z * currentSpeed;
            this.velocity.x += (targetVx - this.velocity.x) * Math.min(1.0, delta * 24.0);
            this.velocity.z += (targetVz - this.velocity.z) * Math.min(1.0, delta * 24.0);

            this.shadowSpawnTimer += delta;
            if (this.shadowSpawnTimer > 0.05 && this.onSpawnShadowCallback) {
                this.shadowSpawnTimer = 0;
                this.onSpawnShadowCallback(this.mesh.position.clone(), this.mesh.rotation.y);
            }
        } else if (isMoving) {
            const targetVx = this.moveDirection.x * currentSpeed;
            const targetVz = this.moveDirection.z * currentSpeed;
            // Aceleración reactiva y fluida estilo consola
            this.velocity.x += (targetVx - this.velocity.x) * Math.min(1.0, delta * 18.0);
            this.velocity.z += (targetVz - this.velocity.z) * Math.min(1.0, delta * 18.0);
        } else {
            // Desaceleración atlética suave
            this.velocity.x += (0 - this.velocity.x) * Math.min(1.0, delta * 14.0);
            this.velocity.z += (0 - this.velocity.z) * Math.min(1.0, delta * 14.0);
            if (Math.abs(this.velocity.x) < 0.04) this.velocity.x = 0;
            if (Math.abs(this.velocity.z) < 0.04) this.velocity.z = 0;
        }

        // 2. Gravedad y suelo
        // Caída más rápida para saltos contundentes (snappy jump gravity)
        const fallMult = this.velocity.y < 0 ? 1.35 : 1.0;
        this.velocity.y += this.gravity * fallMult * delta;
        this.mesh.position.x += this.velocity.x * delta;
        this.mesh.position.y += this.velocity.y * delta;
        this.mesh.position.z += this.velocity.z * delta;

        let groundY = 0;
        if (this.groundCheckProvider) {
            groundY = this.groundCheckProvider(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
        }

        const wasAirborne = !this.isGrounded && this.velocity.y < -2.0;

        if (this.mesh.position.y <= groundY) {
            this.mesh.position.y = groundY;
            this.velocity.y = 0;
            if (wasAirborne && this.onLandCallback) {
                this.onLandCallback(this.mesh.position.clone());
            }
            this.isGrounded = true;
            this.jumpCount = 0;

            // Actualizar punto de control dinámico en niveles de plataformas
            if (this.isCampaignMode && groundY > -2.0) {
                if (!this.lastCheckpointPos) {
                    this.lastCheckpointPos = this.mesh.position.clone();
                } else if (this.mesh.position.z < this.lastCheckpointPos.z - 12.0) {
                    this.lastCheckpointPos.copy(this.mesh.position);
                }
            }
        }

        // Caida al abismo en niveles de plataformas
        if (this.mesh.position.y < -12.0) {
            this.takeDamage(20);
            const respawnPoint = (this.lastCheckpointPos && this.lastCheckpointPos.clone()) || new THREE.Vector3(0, 1.5, 0);
            respawnPoint.y = Math.max(1.5, respawnPoint.y + 0.5);
            this.mesh.position.copy(respawnPoint);
            this.velocity.set(0, 0, 0);
        }

        // Límites del mapa
        if (!this.isCampaignMode) {
            const arenaRadius = 55.0;
            const currentDist = Math.hypot(this.mesh.position.x, this.mesh.position.z);
            if (currentDist > arenaRadius) {
                const angle = Math.atan2(this.mesh.position.z, this.mesh.position.x);
                this.mesh.position.x = Math.cos(angle) * arenaRadius;
                this.mesh.position.z = Math.sin(angle) * arenaRadius;
            }
        } else {
            // Limites laterales en el circuito de campana
            this.mesh.position.x = Math.max(-26, Math.min(26, this.mesh.position.x));
            if (this.mesh.position.z > 12) this.mesh.position.z = 12;
        }

        // =====================================================================
        // 3. CINEMÁTICA ARTICULAR NATURAL Y ANIMACIONES
        // =====================================================================
        const time = performance.now() * 0.013;

        if (this.isSpinning) {
            this.spinTimer -= delta;
            if (this.spinTimer <= 0) {
                this.isSpinning = false;
                this.isAttacking = false;
            }

            // Giro 360° veloz estilo Crash Bandicoot
            this.mesh.rotation.y += delta * 24.0;
            this.torso.position.y = 1.35;
            this.torso.rotation.set(0, 0, 0);

            // Brazos abiertos con espada horizontal
            this.rightArmPivot.rotation.set(0, 0, Math.PI * 0.45);
            this.rightElbowPivot.rotation.set(0, 0, 0);
            this.leftArmPivot.rotation.set(0, 0, -Math.PI * 0.45);
            this.leftElbowPivot.rotation.set(0, 0, 0);

            this.leftLegPivot.rotation.set(0, 0, -0.15);
            this.rightLegPivot.rotation.set(0, 0, 0.15);
            this.leftKneePivot.rotation.set(0.3, 0, 0);
            this.rightKneePivot.rotation.set(0.3, 0, 0);

        } else if (this.isAttacking) {
            this.attackTimer += delta * 8;
            if (this.attackTimer > Math.PI) {
                this.isAttacking = false;
                this.attackTimer = 0;
            }

            if (this.attackCombo === 1) {
                // Tajo horizontal fluido
                this.rightArmPivot.rotation.x = Math.PI / 2 + Math.sin(this.attackTimer) * 0.6;
                this.rightArmPivot.rotation.y = -Math.PI / 3 + Math.sin(this.attackTimer) * 1.8;
                this.rightElbowPivot.rotation.x = -0.3 + Math.sin(this.attackTimer) * 0.4;
                this.torso.rotation.y = Math.sin(this.attackTimer) * 0.5;
            } else if (this.attackCombo === 2) {
                // Tajo descendente potente
                this.rightArmPivot.rotation.x = Math.PI - Math.sin(this.attackTimer) * 2.2;
                this.rightArmPivot.rotation.y = 0;
                this.rightElbowPivot.rotation.x = -0.6;
                this.torso.rotation.x = Math.sin(this.attackTimer) * 0.3;
            } else {
                // Estocada frontal con torsión de torso
                this.rightArmPivot.rotation.x = Math.PI * 0.5;
                this.rightArmPivot.rotation.y = Math.sin(this.attackTimer) * 0.8;
                this.rightElbowPivot.rotation.x = -0.2;
                this.torso.rotation.y = -Math.sin(this.attackTimer) * 0.3;
            }

        } else {
            if (!this.isGrounded) {
                // Salto natural con flexión de rodillas
                this.torso.position.y = 1.35;
                this.torso.rotation.x = 0.1;
                this.torso.rotation.y = 0;
                this.torso.rotation.z = 0;

                this.leftLegPivot.rotation.x = -0.35;
                this.rightLegPivot.rotation.x = 0.25;
                // Rodillas flexionadas en el aire
                this.leftKneePivot.rotation.x = 0.85;
                this.rightKneePivot.rotation.x = 0.65;

                // Brazos elevados en equilibrio
                this.leftArmPivot.rotation.x = -Math.PI * 0.65;
                this.rightArmPivot.rotation.x = -Math.PI * 0.65;
                this.leftElbowPivot.rotation.x = -0.4;
                this.rightElbowPivot.rotation.x = -0.4;

            } else if (isMoving) {
                // Carrera orgánica: balanceo de cadera + flexión de rodillas y codos
                const swing = Math.sin(time) * 0.82;

                // 1. Rebote rítmico vertical de la pelvis (bobbing)
                this.torso.position.y = 1.35 + Math.abs(Math.sin(time)) * 0.08;

                // 2. Inclinación hacia adelante atlética
                this.torso.rotation.x = 0.18;
                this.torso.rotation.y = -swing * 0.12; // Suave torsión de pecho
                this.torso.rotation.z = 0;

                // 3. Piernas con flexión activa de rodillas
                this.leftLegPivot.rotation.x = swing;
                this.rightLegPivot.rotation.x = -swing;

                // Rodilla se dobla hacia atrás cuando la pierna va hacia atrás
                this.leftKneePivot.rotation.x = Math.max(0, -swing * 1.35);
                this.rightKneePivot.rotation.x = Math.max(0, swing * 1.35);

                // 4. Brazos flexionados en ángulo de carrera (45-70°)
                this.leftArmPivot.rotation.x = -swing * 0.75;
                this.rightArmPivot.rotation.x = swing * 0.75;
                this.leftArmPivot.rotation.z = -0.12;
                this.rightArmPivot.rotation.z = 0.12;

                this.leftElbowPivot.rotation.x = -0.65 - Math.max(0, -swing * 0.5);
                this.rightElbowPivot.rotation.x = -0.65 - Math.max(0, swing * 0.5);

            } else {
                // Postura de reposo (respiración suave y relajada)
                const breath = Math.sin(time * 0.35) * 0.04;
                this.torso.position.y = 1.35 + breath;
                this.torso.rotation.set(0, 0, 0);

                this.leftLegPivot.rotation.set(0, 0, -0.05);
                this.rightLegPivot.rotation.set(0, 0, 0.05);
                this.leftKneePivot.rotation.set(0.08, 0, 0);
                this.rightKneePivot.rotation.set(0.08, 0, 0);

                this.leftArmPivot.rotation.set(breath * 1.5, 0, -0.12);
                this.rightArmPivot.rotation.set(breath * 1.5, 0, 0.12);
                this.leftElbowPivot.rotation.set(-0.35, 0, 0);
                this.rightElbowPivot.rotation.set(-0.35, 0, 0);
            }
        }

        // Cintas de la bandana ondeando al viento
        const flutter = Math.sin(time * 1.6) * (isMoving ? 0.45 : 0.15);
        this.bandanaTail1.rotation.x = 0.35 + flutter;
        this.bandanaTail2.rotation.x = 0.45 - flutter * 0.8;

        // 4. Cámara orbital suave en 3ra persona inmersiva y cinematográfica
        const isMobileScreen = window.innerWidth <= 768;
        const targetDist = this.dashTimer > 0 ? (this.cameraDistance * 1.15) : (isMoving ? this.cameraDistance : (this.cameraDistance * 0.94));
        const targetPos = this.mesh.position.clone().add(new THREE.Vector3(0, isMobileScreen ? 1.1 : 1.35, 0));
        const camX = targetPos.x + Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * targetDist;
        const camY = targetPos.y + Math.sin(this.cameraPitch) * targetDist + this.cameraHeight * 0.35;
        const camZ = targetPos.z + Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * targetDist;

        this.camera.position.lerp(new THREE.Vector3(camX, Math.max(0.5, camY), camZ), 0.28);
        this.camera.lookAt(targetPos);
    }

    // =========================================================================
    // ANIMACIÓN HEROICA VIVA PARA EL MENÚ PRINCIPAL (ESTILO FREE FIRE / CRASH)
    // =========================================================================
    animateIdleMenu(delta) {
        if (!this.torso) return;
        const time = performance.now() * 0.003;
        const breath = Math.sin(time) * 0.035;

        // Torso respirando suavemente
        this.torso.position.y = 1.35 + breath;
        this.torso.rotation.set(0.04, Math.sin(time * 0.5) * 0.03, 0);

        // Cabeza atenta mirando al jugador
        if (this.head) {
            this.head.rotation.y = Math.sin(time * 0.7) * 0.05;
            this.head.rotation.x = -0.02 + Math.cos(time * 0.5) * 0.02;
        }

        // Brazo derecho: Pose relajada heroica con pulgar al frente / empuñando arma
        if (this.rightArmPivot) {
            this.rightArmPivot.rotation.set(0.1 + breath, 0, 0.18);
            if (this.rightElbowPivot) this.rightElbowPivot.rotation.set(-0.5, 0, 0);
        }

        // Brazo izquierdo: En jarra / equilibrio heroico
        if (this.leftArmPivot) {
            this.leftArmPivot.rotation.set(-0.05 - breath, 0, -0.22);
            if (this.leftElbowPivot) this.leftElbowPivot.rotation.set(-0.65, 0, 0);
        }

        // Piernas firmes sobre el pedestal con peso equilibrado
        if (this.leftLegPivot) this.leftLegPivot.rotation.set(0, 0, -0.08);
        if (this.rightLegPivot) this.rightLegPivot.rotation.set(0, 0, 0.08);
        if (this.leftKneePivot) this.leftKneePivot.rotation.set(0.06, 0, 0);
        if (this.rightKneePivot) this.rightKneePivot.rotation.set(0.06, 0, 0);

        // Bandana ondeando suavemente en la brisa tropical
        const flutter = Math.sin(time * 2.2) * 0.18;
        if (this.bandanaTail1) this.bandanaTail1.rotation.x = 0.35 + flutter;
        if (this.bandanaTail2) this.bandanaTail2.rotation.x = 0.45 - flutter * 0.85;
    }

    // Separación física contra obstáculos sólidos (cajas y tótems)
    checkObstacleCollisions(crates) {
        if (!crates || !crates.length) return;
        const playerPos = this.mesh.position;
        const playerRadius = 0.65;

        for (let i = 0; i < crates.length; i++) {
            const crate = crates[i];
            if (!crate || crate.intact === false || crate.isBroken === true) continue;
            const cPos = crate.position || (crate.mesh && crate.mesh.position);
            if (!cPos) continue;

            const dx = playerPos.x - cPos.x;
            const dz = playerPos.z - cPos.z;
            const distSq = dx * dx + dz * dz;
            const minDist = playerRadius + 0.85;

            if (distSq < minDist * minDist && distSq > 0.0001) {
                const dist = Math.sqrt(distSq);
                const overlap = minDist - dist;
                playerPos.x += (dx / dist) * overlap;
                playerPos.z += (dz / dist) * overlap;
            }
        }
    }
}
