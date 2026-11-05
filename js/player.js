// js/player.js - Controlador del Jugador y Animales Ninja Colombianos
import * as THREE from 'three';
import { sounds } from './sound.js?v=20.0';
import { WEAPONS } from './weapons.js?v=20.0';
import { AnimalCharacterBuilder, CHARACTERS_DATA } from './characters.js?v=20.0';
import { storage } from './storage.js?v=20.0';

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

        // Máquinas de Estado Desacopladas (Locomoción, Combate y Defensa)
        this.locomotionState = 'IDLE'; // IDLE, RUN, JUMP, FALL, WALL_SLIDE, WALL_JUMP, AIR_DASH, LIANA_SWING
        this.combatState = 'NEUTRAL'; // NEUTRAL, GROUND_COMBO_1..3, AIR_COMBO_1..3, SPIN_ATTACK, GROUND_SLAM, SHURIKEN
        this.defenseState = 'NONE'; // NONE, BLOCK, PARRY, ROLL

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

        // Combate Ninja Técnico 2.5D (Parry, Bloqueo, Rodar, Shurikens)
        this.is2DMode = true;
        this.facing = 1; // 1 = derecha (+X), -1 = izquierda (-X)
        this.isBlocking = false;
        this.parryTimer = 0; // Ventana activa de parry perfecto (0.28s)
        this.parryCooldown = 0;
        this.isRolling = false;
        this.rollTimer = 0; // Duración activa con i-frames (0.35s)
        this.rollCooldown = 0;
        this.isMoving = false;
        this.shurikenCooldown = 0;
        this.onParrySuccessCallback = null;
        this.onDodgeCallback = null;
        this.onShurikenCallback = null;

        // Nuevas Mecánicas Avanzadas del Ninja v20.0
        // 1. Air Dash (Impulso aéreo horizontal)
        this.canAirDash = true;
        this.airDashTimer = 0;
        this.onAirDashCallback = null;

        // 2. Wall Slide & Wall Jump
        this.isWallSliding = false;
        this.wallSlideDirection = 0;
        this.wallJumpLockout = 0;
        this.wallCheckProvider = null;
        this.onWallSlideCallback = null;

        // 3. Ground Slam (Ataque descendente sísmico)
        this.isGroundSlamming = false;
        this.groundSlamTimer = 0;
        this.onGroundSlamImpact = null;

        // 4. Air Combo (Combos aéreos encadenados)
        this.isAirAttacking = false;
        this.airCombo = 0;
        this.airComboTimer = 0;

        // 5. Liana Hook (Balanceo en lianas andinas)
        this.isLianaSwinging = false;
        this.lianaAnchor = null;
        this.lianaLength = 4.2;
        this.lianaAngle = 0;
        this.lianaAngularSpeed = 0;
        this.lianaCheckProvider = null;
        this.onLianaHookCallback = null;

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
        else if (this.isGroundSlamming) anim = 'slam';
        else if (this.isWallSliding) anim = 'wall_slide';
        else if (this.isLianaSwinging) anim = 'liana';
        else if (this.airDashTimer > 0) anim = 'air_dash';
        else if (this.isAttacking) anim = this.isAirAttacking ? 'air_attack' : 'attack';
        else if (this.isRolling || this.dashTimer > 0) anim = 'roll';
        else if (!this.isGrounded) anim = 'jump';
        else if (this.keys.w || this.keys.s || this.keys.a || this.keys.d || this.touchMoveVector.lengthSq() > 0.01) anim = 'run';
        return {
            x: Number(this.mesh.position.x.toFixed(2)),
            y: Number(this.mesh.position.y.toFixed(2)),
            z: Number(this.mesh.position.z.toFixed(2)),
            rot: Number(this.mesh.rotation.y.toFixed(2)),
            anim: anim,
            weapon: this.currentWeaponId,
            combo: this.attackCombo,
            state: this.locomotionState
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
            if (key === 'w' || key === 'arrowup') {
                this.keys.w = true;
                this.jump();
            }
            if (key === 's' || key === 'arrowdown') this.keys.s = true;
            if (key === 'a' || key === 'arrowleft') this.keys.a = true;
            if (key === 'd' || key === 'arrowright') this.keys.d = true;
            if (e.code === 'Space') {
                this.keys.space = true;
                this.jump();
                e.preventDefault();
            }
            if (key === 'shift' || key === 'l') {
                this.triggerDodge();
            }
            if (key === 'f' || key === 'j') {
                this.triggerAttack();
            }
            if (key === 'k') {
                this.setBlocking(true);
            }
            if (key === 'u') {
                this.triggerShuriken();
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
            if (key === 'k') {
                this.setBlocking(false);
            }
        });

        // Controles de ratón: Click izquierdo ataca, Click derecho bloquea/parry
        this.domElement.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.triggerAttack();
            } else if (e.button === 2) {
                this.setBlocking(true);
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 2) {
                this.setBlocking(false);
            }
        });

        this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
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
        // 1. Si está colgado de una liana, impulsarse en la dirección del balanceo
        if (this.isLianaSwinging) {
            this.releaseLiana(true);
            return;
        }

        // 2. Si está en Wall Slide, realizar Wall Jump despegando de la pared
        if (this.isWallSliding) {
            this.wallJump();
            return;
        }

        // 3. Si está en el aire cerca de una liana, intentar engancharse
        if (!this.isGrounded && this.tryHookLiana()) {
            return;
        }

        // 4. Salto normal desde el suelo
        if (this.isGrounded) {
            this.mesh.position.y += 0.08;
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
            this.jumpCount = 1;
            this.canAirDash = true;
            this.locomotionState = 'JUMP';
            sounds.playJump();
            if (this.onJumpCallback) this.onJumpCallback(this.mesh.position.clone());
        } else if (this.jumpCount < this.maxJumps) {
            // 5. Doble salto acrobático en el aire
            this.mesh.position.y += 0.08;
            this.velocity.y = this.jumpForce * 0.95;
            this.jumpCount = 2;
            this.canAirDash = true; // El doble salto recarga el Air Dash
            this.locomotionState = 'JUMP';
            sounds.playJump();
            if (this.onJumpCallback) this.onJumpCallback(this.mesh.position.clone());
        }
    }

    wallJump() {
        this.isWallSliding = false;
        // Invertir dirección: saltar hacia el lado opuesto de la pared
        this.facing = -this.wallSlideDirection;
        this.velocity.x = this.facing * 12.0;
        this.velocity.y = this.jumpForce * 1.05;
        this.wallJumpLockout = 0.16; // Ventana de despegue limpio
        this.locomotionState = 'WALL_JUMP';
        this.canAirDash = true; // El wall jump recarga el Air Dash
        this.jumpCount = 1;
        if (sounds && sounds.playWallJump) sounds.playWallJump(); else sounds.playJump();
        sounds.playJump();
        if (this.onJumpCallback) this.onJumpCallback(this.mesh.position.clone());
        if (this.onSpawnShadowCallback) {
            this.onSpawnShadowCallback(this.mesh.position.clone(), this.mesh.rotation.y);
        }
    }

    dash() {
        if (!this.isGrounded) {
            if (this.canAirDash && this.dashCooldown <= 0) {
                this.triggerAirDash();
            }
        } else {
            this.triggerDodge();
        }
    }

    triggerAirDash() {
        if (!this.canAirDash || this.dashCooldown > 0) return;
        this.canAirDash = false;
        this.dashCooldown = 0.45;
        this.airDashTimer = 0.22;
        this.isWallSliding = false;
        this.isLianaSwinging = false;
        this.locomotionState = 'AIR_DASH';
        this.velocity.set(this.facing * 18.5, 0, 0); // Vuelo horizontal rasante
        if (sounds && sounds.playAirDash) sounds.playAirDash(); else sounds.playDash();

        sounds.playDodgeRoll();
        if (this.onAirDashCallback) {
            this.onAirDashCallback(this.mesh.position.clone(), this.facing, this.currentWeaponId);
        }
        if (this.onSpawnShadowCallback) {
            this.onSpawnShadowCallback(this.mesh.position.clone(), this.mesh.rotation.y);
        }
    }

    triggerDodge() {
        if (!this.isGrounded) {
            return this.triggerAirDash();
        }
        if (this.rollCooldown > 0 || this.isRolling) return;
        this.isRolling = true;
        this.defenseState = 'ROLL';
        this.rollTimer = 0.35;
        this.rollCooldown = 0.52;
        this.isBlocking = false;
        this.parryTimer = 0;

        // Impulso veloz y acrobático rodando hacia adelante en el eje X
        this.velocity.x = this.facing * 16.5;
        sounds.playDodgeRoll();

        if (this.onDodgeCallback) {
            this.onDodgeCallback(this.mesh.position.clone());
        }
        if (this.onSpawnShadowCallback) {
            this.onSpawnShadowCallback(this.mesh.position.clone(), this.mesh.rotation.y);
        }
    }

    tryHookLiana() {
        if (!this.lianaCheckProvider) return false;
        const hook = this.lianaCheckProvider(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
        if (hook && hook.anchor) {
            this.isLianaSwinging = true;
            this.lianaAnchor = hook.anchor;
            this.lianaLength = hook.length || 4.2;
            this.lianaAngle = (this.facing > 0 ? -0.55 : 0.55);
            this.lianaAngularSpeed = this.facing * 3.2;
            this.locomotionState = 'LIANA_SWING';
            this.canAirDash = true;
            this.jumpCount = 0;
            if (sounds && sounds.playLianaSwing) sounds.playLianaSwing(); else sounds.playSlash('light');
            if (this.onLianaHookCallback) {
                this.onLianaHookCallback(this.lianaAnchor);
            }
            return true;
        }
        return false;
    }

    releaseLiana(withJump = false) {
        if (!this.isLianaSwinging) return;
        this.isLianaSwinging = false;
        this.locomotionState = withJump ? 'JUMP' : 'FALL';
        const launchSpeedX = Math.sign(this.lianaAngularSpeed || this.facing) * 15.0;
        const launchSpeedY = withJump ? 13.5 : 4.0;
        this.velocity.set(launchSpeedX, launchSpeedY, 0);
        this.canAirDash = true;
        this.jumpCount = withJump ? 1 : 0;
        sounds.playJump();
    }

    setBlocking(active) {
        if (this.isRolling) return;
        if (active && !this.isBlocking) {
            this.isBlocking = true;
            this.defenseState = 'BLOCK';
            this.parryTimer = 0.28; // Ventana activa de parry perfecto (280ms)
            sounds.playSlash('light');
        } else if (!active) {
            this.isBlocking = false;
            this.defenseState = 'NONE';
            this.parryTimer = 0;
        }
    }

    triggerParry() {
        this.setBlocking(true);
    }

    triggerShuriken() {
        if (this.shurikenCooldown > 0) return;
        this.shurikenCooldown = 0.42;
        this.combatState = 'SHURIKEN';
        sounds.playSlash('light');

        if (this.onShurikenCallback) {
            const spawnPos = this.mesh.position.clone().add(new THREE.Vector3(this.facing * 0.8, 1.25, 0));
            const dir = new THREE.Vector3(this.facing, 0.05, 0).normalize();
            this.onShurikenCallback(spawnPos, dir);
        }
    }

    triggerAttack() {
        if (this.attackCooldown > 0 || this.isRolling || this.airDashTimer > 0) return;

        // Si está en el aire y mantiene presionado hacia abajo (tecla S o joystick abajo): Ground Slam!
        const isHoldingDown = this.keys.s || (this.touchMoveVector && this.touchMoveVector.y < -0.45);
        if (!this.isGrounded && isHoldingDown && !this.isGroundSlamming) {
            this.triggerGroundSlam();
            return;
        }

        // Si está en el aire: Air Combo!
        if (!this.isGrounded) {
            this.triggerAirAttack();
            return;
        }

        // Combate Terrestre Normal (Ground Combo)
        this.triggerGroundAttack();
    }

    triggerGroundSlam() {
        if (this.isGroundSlamming || this.isGrounded) return;
        this.isGroundSlamming = true;
        this.combatState = 'GROUND_SLAM';
        this.locomotionState = 'FALL';
        this.isWallSliding = false;
        this.isLianaSwinging = false;
        this.velocity.set(0, -30.0, 0); // Caída sísmica vertical acelerada
        sounds.playSlash('heavy');
    }

    triggerAirAttack() {
        const best = this.findBestTarget(8.5);
        if (best && best.mesh) {
            const dx = best.mesh.position.x - this.mesh.position.x;
            if (Math.abs(dx) > 0.3) {
                this.facing = dx > 0 ? 1 : -1;
            }
        }
        this.mesh.rotation.y = this.facing > 0 ? (Math.PI * 0.5) : (-Math.PI * 0.5);

        // Suspensión aérea (Air Hang) y avance horizontal en el aire
        this.velocity.y = Math.max(-1.8, this.velocity.y * 0.2);
        this.velocity.x = this.facing * 3.8;

        const weaponData = WEAPONS[this.currentWeaponId] || WEAPONS.bokken;
        this.isAttacking = true;
        this.isAirAttacking = true;
        this.attackTimer = 0;

        const airComboCooldowns = [0.16, 0.16, 0.26];
        this.attackCooldown = airComboCooldowns[this.airCombo] || 0.2;
        this.combatState = `AIR_COMBO_${this.airCombo + 1}`;

        sounds.playSlash(weaponData.element);

        if (this.onAttackCallback) {
            this.onAttackCallback(this.currentWeaponId, this.airCombo, best ? best.target : null, true /* isAir */);
        }

        this.airCombo = (this.airCombo + 1) % 3;
        this.airComboTimer = 0.8;
    }

    triggerGroundAttack() {
        const best = this.findBestTarget(8.5);
        if (best && best.mesh) {
            const dx = best.mesh.position.x - this.mesh.position.x;
            if (Math.abs(dx) > 0.3) {
                this.facing = dx > 0 ? 1 : -1;
            }
        }
        this.mesh.rotation.y = this.facing > 0 ? (Math.PI * 0.5) : (-Math.PI * 0.5);

        // Acometida de avance con katana según combo
        const lungeImpulse = [4.2, 5.0, 7.5];
        this.velocity.x = this.facing * (lungeImpulse[this.attackCombo] || 4.2);

        const weaponData = WEAPONS[this.currentWeaponId] || WEAPONS.bokken;
        this.isAttacking = true;
        this.isAirAttacking = false;
        this.attackTimer = 0;
        this.combatState = `GROUND_COMBO_${this.attackCombo + 1}`;

        const comboCooldowns = [0.18, 0.18, 0.28];
        this.attackCooldown = comboCooldowns[this.attackCombo] || weaponData.attackSpeed;

        sounds.playSlash(weaponData.element);

        if (this.onAttackCallback) {
            this.onAttackCallback(this.currentWeaponId, this.attackCombo, best ? best.target : null, false /* isAir */);
        }

        this.attackCombo = (this.attackCombo + 1) % 3;
        this.comboResetTimer = 0.85;
    }

    // Ataque de Giro Ninja 360° estilo Crash Bandicoot
    triggerSpinAttack() {
        if (this.spinCooldown > 0 || this.isRolling) return;
        this.spinCooldown = 0.52;
        this.isSpinning = true;
        this.spinTimer = 0.35;
        this.isAttacking = true;
        this.combatState = 'SPIN_ATTACK';
        this.attackCombo = 2;

        sounds.playSlash('heavy');

        if (this.onSpinAttackCallback) {
            this.onSpinAttackCallback();
        } else if (this.onAttackCallback) {
            this.onAttackCallback(this.currentWeaponId, 2, null, false);
        }
    }

    bounceTrampoline(boostForce = 22.0) {
        this.velocity.y = boostForce;
        this.isGrounded = false;
        this.canAirDash = true; // Recarga air dash en trampolín
        this.jumpCount = 1;
        this.locomotionState = 'JUMP';
        sounds.playTrampoline();
    }

    takeDamage(amount, attacker = null) {
        // 1. Invulnerabilidad total durante rodada (i-frames) o dash / air dash ninja
        if (this.rollTimer > 0 || this.dashTimer > 0 || this.airDashTimer > 0) {
            return { parried: false, blocked: false, damage: 0 };
        }

        // 2. Perfect Parry (Ventana de 280ms de bloqueo activo)
        if (this.parryTimer > 0) {
            sounds.playParry();
            if (attacker) {
                attacker.aiState = 'stunned';
                attacker.stateTimer = 1.4;
                attacker.isStunned = true;
                if (attacker.knockbackVelocity) {
                    attacker.knockbackVelocity.set(-this.facing * 8.5, 0, 0);
                }
            }
            if (this.onParrySuccessCallback) {
                const sparkPos = this.mesh.position.clone().add(new THREE.Vector3(this.facing * 0.7, 1.25, 0));
                this.onParrySuccessCallback(sparkPos, attacker);
            }
            return { parried: true, blocked: false, damage: 0 };
        }

        // 3. Bloqueo normal (Katana en guardia) - Reduce 75% del daño recibido
        let wasBlocked = false;
        if (this.isBlocking) {
            amount = Math.max(1, Math.round(amount * 0.25));
            sounds.playBlock();
            wasBlocked = true;
            this.velocity.x = -this.facing * 4.0; // Retroceso táctico en guardia
        }

        // Escudo de Lodo de Capibú absorbe otro 60% del impacto
        if (this.mudShieldTimer > 0) {
            amount = Math.round(amount * 0.4);
        }

        this.health = Math.max(0, this.health - amount);
        if (typeof this.onDamageTaken === 'function') {
            this.onDamageTaken(amount);
        }
        if (!wasBlocked) {
            sounds.playHit(false);
        }

        if (this.health <= 0) {
            this.respawn();
        }
        return { parried: false, blocked: wasBlocked, damage: amount };
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
        // Enfriamiento de ataque, combo, giro, esquive, bloqueo y habilidad especial
        if (this.attackCooldown > 0) this.attackCooldown -= delta;
        if (this.spinCooldown > 0) this.spinCooldown -= delta;
        if (this.dashCooldown > 0) this.dashCooldown -= delta;
        if (this.specialCooldownTimer > 0) this.specialCooldownTimer -= delta;
        if (this.mudShieldTimer > 0) this.mudShieldTimer -= delta;
        if (this.parryTimer > 0) this.parryTimer -= delta;
        if (this.parryCooldown > 0) this.parryCooldown -= delta;
        if (this.rollTimer > 0) this.rollTimer -= delta;
        if (this.rollCooldown > 0) this.rollCooldown -= delta;
        if (this.shurikenCooldown > 0) this.shurikenCooldown -= delta;
        if (this.airDashTimer > 0) this.airDashTimer -= delta;
        if (this.wallJumpLockout > 0) this.wallJumpLockout -= delta;
        if (this.airComboTimer > 0) {
            this.airComboTimer -= delta;
            if (this.airComboTimer <= 0) this.airCombo = 0;
        }

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

        let isMoving = false;

        // 1. Balanceo Físico en Lianas Andinas
        if (this.isLianaSwinging && this.lianaAnchor) {
            this.lianaAngle += this.lianaAngularSpeed * delta;
            this.lianaAngularSpeed += (-16.0 / this.lianaLength) * Math.sin(this.lianaAngle) * delta;
            this.lianaAngularSpeed *= 0.993; // Amortiguación pendular

            this.mesh.position.x = this.lianaAnchor.x + Math.sin(this.lianaAngle) * this.lianaLength;
            this.mesh.position.y = this.lianaAnchor.y - Math.cos(this.lianaAngle) * this.lianaLength;
            this.mesh.position.z = 0;
            this.velocity.set(0, 0, 0);

            this.facing = this.lianaAngularSpeed >= 0 ? 1 : -1;
            this.mesh.rotation.y = this.facing > 0 ? (Math.PI * 0.5) : (-Math.PI * 0.5);
        } else {
            // 2. Movimiento lateral 2.5D Cinemático (Eje X)
            let moveX = 0;
            if (this.keys.d) moveX += 1.0;
            if (this.keys.a) moveX -= 1.0;
            if (Math.abs(this.touchMoveVector.x) > 0.05) {
                moveX += this.touchMoveVector.x;
            }
            moveX = Math.max(-1.0, Math.min(1.0, moveX));

            // Salto asistido al empujar el joystick hacia arriba en celular
            if (this.touchMoveVector.y > 0.65 && !this.wasJoystickUp) {
                this.jump();
                this.wasJoystickUp = true;
            } else if (this.touchMoveVector.y < 0.3) {
                this.wasJoystickUp = false;
            }

            isMoving = Math.abs(moveX) > 0.08 && !this.isRolling && !this.isBlocking && this.airDashTimer <= 0;
            this.isMoving = isMoving;

            if (isMoving && this.wallJumpLockout <= 0) {
                this.facing = moveX > 0 ? 1 : -1;
            }

            // Suave giro hacia la dirección que mira en el plano 2.5D
            const targetRotY = this.facing > 0 ? (Math.PI * 0.5) : (-Math.PI * 0.5);
            let diffRot = targetRotY - this.mesh.rotation.y;
            while (diffRot < -Math.PI) diffRot += Math.PI * 2;
            while (diffRot > Math.PI) diffRot -= Math.PI * 2;
            this.mesh.rotation.y += diffRot * Math.min(1.0, delta * 20.0);

            const baseSpeed = this.baseSpeed || 10.5;
            let targetVx = 0;

            if (this.airDashTimer > 0) {
                targetVx = this.facing * 18.5; // Velocidad fija de dash aéreo
            } else if (this.wallJumpLockout > 0) {
                // Conservar impulso horizontal del wall jump durante el despegue
                targetVx = this.velocity.x;
            } else if (this.isRolling) {
                const progress = Math.max(0, this.rollTimer / 0.35);
                targetVx = this.facing * (11.0 + progress * 6.5);
            } else if (this.isBlocking) {
                targetVx = moveX * (baseSpeed * 0.32);
            } else if (isMoving) {
                targetVx = moveX * baseSpeed;
            } else {
                targetVx = 0;
            }

            if (this.wallJumpLockout <= 0) {
                this.velocity.x += (targetVx - this.velocity.x) * Math.min(1.0, delta * 20.0);
            }

            // Fijar plano lateral 2D (Z = 0)
            this.velocity.z = 0;
            this.mesh.position.z += (0 - this.mesh.position.z) * Math.min(1.0, delta * 24.0);

            // 3. Gravedad y detección de suelo / paredes
            if (this.airDashTimer <= 0) {
                const fallMult = this.velocity.y < 0 ? 1.15 : 1.0;
                this.velocity.y += this.gravity * fallMult * delta;
            } else {
                this.velocity.y = 0; // Gravedad cero durante el air dash
            }

            this.mesh.position.x += this.velocity.x * delta;
            this.mesh.position.y += this.velocity.y * delta;
            this.mesh.position.z += this.velocity.z * delta;

            // Detección de Wall Slide en paredes verticales
            if (!this.isGrounded && this.velocity.y < 0 && !this.isGroundSlamming && this.airDashTimer <= 0 && this.wallCheckProvider) {
                const checkDir = (Math.abs(moveX) > 0.08) ? (moveX > 0 ? 1 : -1) : this.facing;
                const wall = this.wallCheckProvider(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z, checkDir);
                if (wall && wall.isWall) {
                    this.isWallSliding = true;
                    this.wallSlideDirection = checkDir;
                    this.locomotionState = 'WALL_SLIDE';
                    this.canAirDash = true; // Recarga air dash al deslizarse
                    if (this.velocity.y < -2.6) {
                        this.velocity.y = -2.6; // Fricción de deslizamiento
                    }
                    if (wall.wallX !== undefined) {
                        this.mesh.position.x = wall.wallX - checkDir * 0.45;
                    }
                    if (this.onWallSlideCallback) {
                        this.onWallSlideCallback(this.mesh.position.clone(), this.facing);
                    }
                    if (sounds && sounds.playWallSlide) {
                        sounds.playWallSlide();
                    }
                } else {
                    this.isWallSliding = false;
                }
            } else {
                this.isWallSliding = false;
            }

            let groundY = 0;
            if (this.groundCheckProvider) {
                groundY = this.groundCheckProvider(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
            }

            const wasAirborne = !this.isGrounded && this.velocity.y < -2.0;

            if (this.velocity.y <= 0 && this.mesh.position.y <= groundY) {
                this.mesh.position.y = groundY;
                this.velocity.y = 0;
                this.isGrounded = true;
                this.jumpCount = 0;
                this.canAirDash = true; // Recarga de air dash al tocar tierra
                this.isWallSliding = false;
                this.locomotionState = isMoving ? 'RUN' : 'IDLE';

                if (this.isGroundSlamming) {
                    this.isGroundSlamming = false;
                    this.combatState = 'NEUTRAL';
                    if (this.onGroundSlamImpact) {
                        this.onGroundSlamImpact(this.mesh.position.clone(), this.currentWeaponId);
                    }
                } else if (wasAirborne && this.onLandCallback) {
                    this.onLandCallback(this.mesh.position.clone());
                }

                // Actualizar punto de control dinámico en niveles de plataformas a lo largo del avance X
                if (this.isCampaignMode && groundY > -2.0) {
                    if (!this.lastCheckpointPos) {
                        this.lastCheckpointPos = this.mesh.position.clone();
                    } else if (this.mesh.position.x > this.lastCheckpointPos.x + 12.0) {
                        this.lastCheckpointPos.copy(this.mesh.position);
                    }
                }
            } else if (this.mesh.position.y > groundY + 0.05) {
                this.isGrounded = false;
                if (!this.isWallSliding && this.airDashTimer <= 0 && this.locomotionState !== 'WALL_JUMP') {
                    this.locomotionState = this.velocity.y > 0 ? 'JUMP' : 'FALL';
                }
            }

            // Caída al abismo en plataformas
            if (this.mesh.position.y < -12.0) {
                this.takeDamage(20);
                const respawnPoint = (this.lastCheckpointPos && this.lastCheckpointPos.clone()) || new THREE.Vector3(0, 1.5, 0);
                respawnPoint.y = Math.max(1.5, respawnPoint.y + 0.5);
                this.mesh.position.copy(respawnPoint);
                this.velocity.set(0, 0, 0);
                this.isGroundSlamming = false;
            }

            // Límites del mapa en arenas
            if (!this.isCampaignMode) {
                this.mesh.position.x = Math.max(-28, Math.min(28, this.mesh.position.x));
            }
        }

        // =====================================================================
        // 4. CINEMÁTICA ARTICULAR NATURAL Y ANIMACIONES AVANZADAS
        // =====================================================================
        const time = performance.now() * 0.013;

        if (this.isRolling) {
            // Giro acrobático 360° en voltereta ninja
            const rollProgress = Math.min(1.0, Math.max(0, 1.0 - (this.rollTimer / 0.35)));
            this.torso.position.y = 0.72;
            this.modelGroup.rotation.z = -this.facing * rollProgress * Math.PI * 2;

            if (this.rollTimer <= 0) {
                this.isRolling = false;
                this.modelGroup.rotation.z = 0;
                this.torso.position.y = 1.35;
            }
        } else if (this.airDashTimer > 0) {
            // Postura aerodinámica de Air Dash con katana trazando estela
            this.modelGroup.rotation.z = 0;
            this.torso.position.y = 1.25;
            this.torso.rotation.set(0.42, 0, 0);

            this.rightArmPivot.rotation.set(-0.35, 0, 0.45);
            this.rightElbowPivot.rotation.set(-0.2, 0, 0);
            this.leftArmPivot.rotation.set(-0.35, 0, -0.45);
            this.leftElbowPivot.rotation.set(-0.2, 0, 0);

            this.leftLegPivot.rotation.set(0.48, 0, 0);
            this.rightLegPivot.rotation.set(-0.48, 0, 0);
            this.leftKneePivot.rotation.set(0.3, 0, 0);
            this.rightKneePivot.rotation.set(0.3, 0, 0);

        } else if (this.isWallSliding) {
            // Deslizamiento en pared con apoyo de manos y flexión de piernas
            this.modelGroup.rotation.z = 0;
            this.torso.position.y = 1.28;
            this.torso.rotation.set(0.08, this.facing * 0.3, 0);

            this.rightArmPivot.rotation.set(-0.75, 0, 0.35);
            this.rightElbowPivot.rotation.set(-0.4, 0, 0);
            this.leftArmPivot.rotation.set(-0.75, 0, -0.35);
            this.leftElbowPivot.rotation.set(-0.4, 0, 0);

            this.leftLegPivot.rotation.set(0.5, 0, 0);
            this.rightLegPivot.rotation.set(0.25, 0, 0);
            this.leftKneePivot.rotation.set(0.65, 0, 0);
            this.rightKneePivot.rotation.set(0.45, 0, 0);

        } else if (this.isGroundSlamming) {
            // Caída sísmica vertical con katana hacia abajo
            this.modelGroup.rotation.z = 0;
            this.torso.position.y = 1.35;
            this.torso.rotation.set(0.25, 0, 0);

            this.rightArmPivot.rotation.set(Math.PI * 0.85, 0, 0.15);
            this.rightElbowPivot.rotation.set(-0.15, 0, 0);
            this.leftArmPivot.rotation.set(Math.PI * 0.85, 0, -0.15);
            this.leftElbowPivot.rotation.set(-0.15, 0, 0);

            this.leftLegPivot.rotation.set(-0.4, 0, 0);
            this.rightLegPivot.rotation.set(-0.4, 0, 0);
            this.leftKneePivot.rotation.set(0.2, 0, 0);
            this.rightKneePivot.rotation.set(0.2, 0, 0);

        } else if (this.isLianaSwinging) {
            // Sujeción de liana con brazos en alto oscilando con el péndulo
            this.modelGroup.rotation.z = -this.lianaAngle * 0.65;
            this.torso.position.y = 1.35;
            this.torso.rotation.set(0, 0, 0);

            this.rightArmPivot.rotation.set(-Math.PI * 0.82, 0, 0.2);
            this.rightElbowPivot.rotation.set(-0.15, 0, 0);
            this.leftArmPivot.rotation.set(-Math.PI * 0.82, 0, -0.2);
            this.leftElbowPivot.rotation.set(-0.15, 0, 0);

            this.leftLegPivot.rotation.set(0.35, 0, 0);
            this.rightLegPivot.rotation.set(0.15, 0, 0);
            this.leftKneePivot.rotation.set(0.5, 0, 0);
            this.rightKneePivot.rotation.set(0.3, 0, 0);

        } else if (this.isBlocking) {
            // Postura de guardia firme con katana cruzada
            this.modelGroup.rotation.z = 0;
            this.torso.position.y = 1.25;
            this.torso.rotation.set(0.08, this.facing * 0.25, 0);

            this.rightArmPivot.rotation.set(0.68, -0.35, 0.45);
            this.rightElbowPivot.rotation.set(-0.85, 0, 0);
            this.leftArmPivot.rotation.set(0.68, 0.35, -0.45);
            this.leftElbowPivot.rotation.set(-0.85, 0, 0);

            this.leftLegPivot.rotation.set(-0.25, 0, 0);
            this.rightLegPivot.rotation.set(0.25, 0, 0);
            this.leftKneePivot.rotation.set(0.4, 0, 0);
            this.rightKneePivot.rotation.set(0.4, 0, 0);

        } else if (this.isSpinning) {
            this.modelGroup.rotation.z = 0;
            this.spinTimer -= delta;
            if (this.spinTimer <= 0) {
                this.isSpinning = false;
                this.isAttacking = false;
            }

            // Giro 360° veloz estilo Crash Bandicoot
            this.mesh.rotation.y += delta * 24.0;
            this.torso.position.y = 1.35;
            this.torso.rotation.set(0, 0, 0);

            this.rightArmPivot.rotation.set(0, 0, Math.PI * 0.45);
            this.rightElbowPivot.rotation.set(0, 0, 0);
            this.leftArmPivot.rotation.set(0, 0, -Math.PI * 0.45);
            this.leftElbowPivot.rotation.set(0, 0, 0);

            this.leftLegPivot.rotation.set(0, 0, -0.15);
            this.rightLegPivot.rotation.set(0, 0, 0.15);
            this.leftKneePivot.rotation.set(0.3, 0, 0);
            this.rightKneePivot.rotation.set(0.3, 0, 0);

        } else if (this.isAttacking) {
            this.modelGroup.rotation.z = 0;
            this.attackTimer += delta * 8;
            if (this.attackTimer > Math.PI) {
                this.isAttacking = false;
                this.isAirAttacking = false;
                this.attackTimer = 0;
            }

            if (this.isAirAttacking) {
                // Combos Aéreos 1-2-3 con rotación dinámica y tajos acrobáticos
                if (this.airCombo === 1) {
                    // Tajo aéreo horizontal
                    this.rightArmPivot.rotation.x = Math.PI / 2 + Math.sin(this.attackTimer) * 0.8;
                    this.rightArmPivot.rotation.y = -Math.PI / 3 + Math.sin(this.attackTimer) * 1.6;
                    this.rightElbowPivot.rotation.x = -0.3;
                    this.torso.rotation.y = Math.sin(this.attackTimer) * 0.4;
                } else if (this.airCombo === 2) {
                    // Voltereta ascendente en el aire (Flip Slash)
                    this.modelGroup.rotation.z = this.facing * Math.sin(this.attackTimer) * 1.6;
                    this.rightArmPivot.rotation.x = Math.PI - Math.sin(this.attackTimer) * 2.0;
                    this.rightArmPivot.rotation.y = 0;
                } else {
                    // Remate descendente aéreo (Aerial Spike Finisher)
                    this.rightArmPivot.rotation.x = Math.PI * 0.95 - Math.sin(this.attackTimer) * 1.5;
                    this.rightArmPivot.rotation.y = 0;
                    this.torso.rotation.x = 0.35;
                }
            } else {
                // Combos Terrestres 1-2-3
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
            }

        } else {
            this.modelGroup.rotation.z = 0;
            if (!this.isGrounded) {
                // Salto natural con flexión de rodillas
                this.torso.position.y = 1.35;
                this.torso.rotation.x = 0.1;
                this.torso.rotation.y = 0;
                this.torso.rotation.z = 0;

                this.leftLegPivot.rotation.x = -0.35;
                this.rightLegPivot.rotation.x = 0.25;
                this.leftKneePivot.rotation.x = 0.85;
                this.rightKneePivot.rotation.x = 0.65;

                this.leftArmPivot.rotation.x = -Math.PI * 0.65;
                this.rightArmPivot.rotation.x = -Math.PI * 0.65;
                this.leftElbowPivot.rotation.x = -0.4;
                this.rightElbowPivot.rotation.x = -0.4;

            } else if (isMoving) {
                const swing = Math.sin(time) * 0.82;
                this.torso.position.y = 1.35 + Math.abs(Math.sin(time)) * 0.08;
                this.torso.rotation.x = 0.18;
                this.torso.rotation.y = -swing * 0.12;
                this.torso.rotation.z = 0;

                this.leftLegPivot.rotation.x = swing;
                this.rightLegPivot.rotation.x = -swing;
                this.leftKneePivot.rotation.x = Math.max(0, -swing * 1.35);
                this.rightKneePivot.rotation.x = Math.max(0, swing * 1.35);

                this.leftArmPivot.rotation.x = -swing * 0.75;
                this.rightArmPivot.rotation.x = swing * 0.75;
                this.leftArmPivot.rotation.z = -0.12;
                this.rightArmPivot.rotation.z = 0.12;

                this.leftElbowPivot.rotation.x = -0.65 - Math.max(0, -swing * 0.5);
                this.rightElbowPivot.rotation.x = -0.65 - Math.max(0, swing * 0.5);

            } else {
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

        // 4. Cámara Cinemática 2.5D lateral estilo Dead Cells / Shadow Fight / Ori
        const isMobileScreen = window.innerWidth <= 768;
        const leadX = this.facing * (isMobileScreen ? 2.2 : 3.0);
        const targetCamX = this.mesh.position.x + leadX;

        // Amortiguación vertical suave (evita vibración en saltos rápidos)
        const targetCamY = Math.max(2.2, this.mesh.position.y + 1.25);
        const camDistZ = isMobileScreen ? 12.2 : 10.8;

        this.camera.position.x += (targetCamX - this.camera.position.x) * Math.min(1.0, delta * 6.5);
        this.camera.position.y += (targetCamY - this.camera.position.y) * Math.min(1.0, delta * 4.5);
        this.camera.position.z += (camDistZ - this.camera.position.z) * Math.min(1.0, delta * 6.0);

        const lookTarget = new THREE.Vector3(
            this.mesh.position.x + this.facing * 1.2,
            Math.max(1.5, this.mesh.position.y + 1.1),
            0
        );
        if (!this.camLookTarget) {
            this.camLookTarget = lookTarget.clone();
        } else {
            this.camLookTarget.lerp(lookTarget, Math.min(1.0, delta * 8.0));
        }
        this.camera.lookAt(this.camLookTarget);
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

            // Solo colisionar horizontalmente si el jugador está a la altura física de la caja
            const dy = Math.abs(playerPos.y - cPos.y);
            if (dy > 1.35) continue;

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
