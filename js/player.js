// js/player.js - Controlador del Jugador, Cinemática Articular Natural y Ataque de Giro
import * as THREE from 'three';
import { sounds } from './sound.js?v=6.0';
import { WEAPONS } from './weapons.js?v=6.0';

export class Player {
    constructor(scene, camera, domElement) {
        this.scene = scene;
        this.camera = camera;
        this.domElement = domElement;

        // Atributos de combate
        this.maxHealth = 100;
        this.health = 100;
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

        // Salto y Doble Salto (Estilo plataformas)
        this.jumpCount = 0;
        this.maxJumps = 2;
        this.jumpForce = 13.5;
        this.isGrounded = true;

        // Movimiento y física
        this.velocity = new THREE.Vector3();
        this.moveDirection = new THREE.Vector3();
        this.gravity = -26.0;

        // Cámara en 3ra persona orbital
        this.cameraDistance = 6.2;
        this.cameraHeight = 3.2;
        this.cameraPitch = 0.25;
        this.cameraYaw = 0;
        this.isDraggingMouse = false;
        this.previousMousePosition = { x: 0, y: 0 };

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

        // Construir modelo humanoide anatómico ultra-suave
        this.mesh = new THREE.Group();
        this.mesh.name = 'player';
        this.buildRealisticNinjaModel();
        this.scene.add(this.mesh);

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

    buildRealisticNinjaModel() {
        // Materiales con iluminación PBR suave y sombreado liso
        this.suitMat = new THREE.MeshStandardMaterial({
            color: this.suitColor,
            roughness: 0.45,
            metalness: 0.15
        });
        const suitMat = this.suitMat;
        const clothAccentMat = new THREE.MeshStandardMaterial({
            color: 0xd92323,
            roughness: 0.4
        });
        const skinMat = new THREE.MeshStandardMaterial({
            color: 0xfbd0a1,
            roughness: 0.35
        });
        const armorMat = new THREE.MeshStandardMaterial({
            color: 0x334155,
            metalness: 0.65,
            roughness: 0.28
        });
        const metalGoldMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            metalness: 0.85,
            roughness: 0.2
        });
        const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
        const eyeHighlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

        // 1. Torso Humanoide Anatómico (V-Taper atlético)
        this.torso = new THREE.Group();
        this.torso.position.y = 1.35;
        this.mesh.add(this.torso);

        // Pecho superior / Pectorales (Cilindro de alta resolución para curvas suaves)
        const chestGeom = new THREE.CylinderGeometry(0.42, 0.34, 0.55, 24);
        const chest = new THREE.Mesh(chestGeom, suitMat);
        chest.position.y = 0.15;
        chest.castShadow = true;
        chest.receiveShadow = true;
        this.torso.add(chest);

        // Abdomen / Cintura atlética
        const absGeom = new THREE.CylinderGeometry(0.34, 0.30, 0.45, 24);
        const abs = new THREE.Mesh(absGeom, suitMat);
        abs.position.y = -0.25;
        abs.castShadow = true;
        abs.receiveShadow = true;
        this.torso.add(abs);

        // Cinturón Shinobi Obi tradicional con hebilla dorada
        const obiGeom = new THREE.CylinderGeometry(0.32, 0.32, 0.16, 24);
        const obi = new THREE.Mesh(obiGeom, clothAccentMat);
        obi.position.y = -0.42;
        obi.castShadow = true;
        this.torso.add(obi);

        const buckleGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16);
        const buckle = new THREE.Mesh(buckleGeom, metalGoldMat);
        buckle.rotation.x = Math.PI / 2;
        buckle.position.set(0, -0.42, 0.32);
        this.torso.add(buckle);

        // 2. Cabeza Esculpida y Máscara Ninja (Cowl)
        this.head = new THREE.Group();
        this.head.position.y = 0.68;
        this.torso.add(this.head);

        // Cúpula esférica de la máscara de tela
        const cowlGeom = new THREE.SphereGeometry(0.38, 24, 20);
        cowlGeom.scale(1.0, 1.12, 1.08);
        const cowl = new THREE.Mesh(cowlGeom, suitMat);
        cowl.castShadow = true;
        this.head.add(cowl);

        // Apertura facial de piel
        const faceOpeningGeom = new THREE.CylinderGeometry(0.24, 0.22, 0.18, 16, 1, false, -Math.PI * 0.35, Math.PI * 0.7);
        const faceSkin = new THREE.Mesh(faceOpeningGeom, skinMat);
        faceSkin.position.set(0, 0.02, 0.18);
        this.head.add(faceSkin);

        // Ojos estilo anime
        [-0.10, 0.10].forEach(eyeX => {
            const eyeGroup = new THREE.Group();
            eyeGroup.position.set(eyeX, 0.04, 0.38);

            const eyeSclera = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), eyeHighlightMat);
            eyeSclera.scale.set(1.1, 0.65, 0.3);
            eyeGroup.add(eyeSclera);

            const pupil = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12), eyePupilMat);
            pupil.rotation.x = Math.PI / 2;
            pupil.position.z = 0.02;
            eyeGroup.add(pupil);

            this.head.add(eyeGroup);
        });

        // Protector de frente ninja metálico curvado (Hitai-ate)
        const plateGeom = new THREE.CylinderGeometry(0.36, 0.36, 0.14, 24, 1, true, -Math.PI * 0.32, Math.PI * 0.64);
        const plate = new THREE.Mesh(plateGeom, armorMat);
        plate.position.y = 0.16;
        this.head.add(plate);

        // Bandana roja envolvente
        const bandWrapGeom = new THREE.CylinderGeometry(0.365, 0.365, 0.16, 24, 1, true, -Math.PI * 0.55, Math.PI * 1.1);
        const bandWrap = new THREE.Mesh(bandWrapGeom, clothAccentMat);
        bandWrap.position.y = 0.16;
        this.head.add(bandWrap);

        // Emblema dorado en el centro del protector
        const emblem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12), metalGoldMat);
        emblem.rotation.x = Math.PI / 2;
        emblem.position.set(0, 0.16, 0.38);
        this.head.add(emblem);

        // Cintas de la bandana ondeando al viento
        this.bandanaTail1 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.65, 0.02), clothAccentMat);
        this.bandanaTail1.position.set(-0.08, 0.08, -0.38);
        this.bandanaTail1.rotation.x = 0.35;
        this.head.add(this.bandanaTail1);

        this.bandanaTail2 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.55, 0.02), clothAccentMat);
        this.bandanaTail2.position.set(0.08, 0.12, -0.38);
        this.bandanaTail2.rotation.x = 0.45;
        this.head.add(this.bandanaTail2);

        // 3. Brazo Izquierdo con Codo Articulado
        this.leftArmPivot = new THREE.Group();
        this.leftArmPivot.position.set(-0.48, 0.35, 0);
        this.torso.add(this.leftArmPivot);

        const lShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), armorMat);
        this.leftArmPivot.add(lShoulder);

        const lUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.38, 16), suitMat);
        lUpperArm.position.y = -0.19;
        lUpperArm.castShadow = true;
        this.leftArmPivot.add(lUpperArm);

        // Articulación del Codo Izquierdo
        this.leftElbowPivot = new THREE.Group();
        this.leftElbowPivot.position.set(0, -0.38, 0);
        this.leftArmPivot.add(this.leftElbowPivot);

        const lElbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), armorMat);
        this.leftElbowPivot.add(lElbowJoint);

        const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.38, 16), clothAccentMat);
        lForearm.position.y = -0.19;
        lForearm.castShadow = true;
        this.leftElbowPivot.add(lForearm);

        const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), skinMat);
        lHand.position.y = -0.40;
        this.leftElbowPivot.add(lHand);

        // 4. Brazo Derecho con Codo Articulado y Anclaje de Arma
        this.rightArmPivot = new THREE.Group();
        this.rightArmPivot.position.set(0.48, 0.35, 0);
        this.torso.add(this.rightArmPivot);

        const rShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), armorMat);
        this.rightArmPivot.add(rShoulder);

        const rUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.38, 16), suitMat);
        rUpperArm.position.y = -0.19;
        rUpperArm.castShadow = true;
        this.rightArmPivot.add(rUpperArm);

        // Articulación del Codo Derecho
        this.rightElbowPivot = new THREE.Group();
        this.rightElbowPivot.position.set(0, -0.38, 0);
        this.rightArmPivot.add(this.rightElbowPivot);

        const rElbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), armorMat);
        this.rightElbowPivot.add(rElbowJoint);

        const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.38, 16), clothAccentMat);
        rForearm.position.y = -0.19;
        rForearm.castShadow = true;
        this.rightElbowPivot.add(rForearm);

        const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), skinMat);
        rHand.position.y = -0.40;
        this.rightElbowPivot.add(rHand);

        // Anclaje de arma en la mano derecha
        this.weaponHolder = new THREE.Group();
        this.weaponHolder.position.set(0, -0.40, 0.08);
        this.weaponHolder.rotation.x = Math.PI / 2;
        this.rightElbowPivot.add(this.weaponHolder);

        // 5. Piernas Humanoides Anatómicas con Rodillas Articuladas
        // Pierna Izquierda
        this.leftLegPivot = new THREE.Group();
        this.leftLegPivot.position.set(-0.20, -0.45, 0);
        this.torso.add(this.leftLegPivot);

        const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.14, 0.44, 16), suitMat);
        lThigh.position.y = -0.22;
        lThigh.castShadow = true;
        this.leftLegPivot.add(lThigh);

        // Articulación de la Rodilla Izquierda
        this.leftKneePivot = new THREE.Group();
        this.leftKneePivot.position.set(0, -0.44, 0);
        this.leftLegPivot.add(this.leftKneePivot);

        const lKneeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), armorMat);
        this.leftKneePivot.add(lKneeJoint);

        const lCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.44, 16), clothAccentMat);
        lCalf.position.y = -0.22;
        lCalf.castShadow = true;
        this.leftKneePivot.add(lCalf);

        const lFoot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 }));
        lFoot.scale.set(0.9, 0.6, 1.4);
        lFoot.position.set(0, -0.44, 0.05);
        this.leftKneePivot.add(lFoot);

        // Pierna Derecha
        this.rightLegPivot = new THREE.Group();
        this.rightLegPivot.position.set(0.20, -0.45, 0);
        this.torso.add(this.rightLegPivot);

        const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.14, 0.44, 16), suitMat);
        rThigh.position.y = -0.22;
        rThigh.castShadow = true;
        this.rightLegPivot.add(rThigh);

        // Articulación de la Rodilla Derecha
        this.rightKneePivot = new THREE.Group();
        this.rightKneePivot.position.set(0, -0.44, 0);
        this.rightLegPivot.add(this.rightKneePivot);

        const rKneeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), armorMat);
        this.rightKneePivot.add(rKneeJoint);

        const rCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.44, 16), clothAccentMat);
        rCalf.position.y = -0.22;
        rCalf.castShadow = true;
        this.rightKneePivot.add(rCalf);

        const rFoot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 }));
        rFoot.scale.set(0.9, 0.6, 1.4);
        rFoot.position.set(0, -0.44, 0.05);
        this.rightKneePivot.add(rFoot);
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
            if (key === 'e' || key === 'q') {
                this.triggerSpinAttack();
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

    addCameraRotation(deltaX, deltaY) {
        this.cameraYaw -= deltaX * 0.013;
        this.cameraPitch += deltaY * 0.007;
        this.cameraPitch = Math.max(-0.15, Math.min(0.95, this.cameraPitch));
    }

    jump() {
        if (this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
            this.jumpCount = 1;
            sounds.playJump();
        } else if (this.jumpCount < this.maxJumps) {
            // Doble salto estilo Crash Bandicoot
            this.velocity.y = this.jumpForce * 0.95;
            this.jumpCount = 2;
            sounds.playJump();
        }
    }

    dash() {
        if (this.dashCooldown > 0) return;
        this.dashCooldown = 0.9;
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
    }

    triggerAttack() {
        if (this.attackCooldown > 0) return;

        this.mesh.rotation.y = this.cameraYaw + Math.PI;

        const weaponData = WEAPONS[this.currentWeaponId] || WEAPONS.bokken;
        this.isAttacking = true;
        this.attackTimer = 0;
        this.attackCooldown = weaponData.attackSpeed;

        this.attackCombo = (this.attackCombo + 1) % 3;
        this.comboResetTimer = 0.9;

        sounds.playSlash(weaponData.element);

        if (this.onAttackCallback) {
            this.onAttackCallback(this.currentWeaponId, this.attackCombo);
        }
    }

    // Ataque de Giro Ninja 360° estilo Crash Bandicoot
    triggerSpinAttack() {
        if (this.spinCooldown > 0) return;
        this.spinCooldown = 0.65;
        this.isSpinning = true;
        this.spinTimer = 0.35;
        this.isAttacking = true;
        this.attackCombo = 2;

        sounds.playSlash('heavy');

        if (this.onSpinAttackCallback) {
            this.onSpinAttackCallback();
        } else if (this.onAttackCallback) {
            this.onAttackCallback(this.currentWeaponId, 2);
        }
    }

    bounceTrampoline(boostForce = 22.0) {
        this.velocity.y = boostForce;
        this.isGrounded = false;
        this.jumpCount = 1;
        sounds.playTrampoline();
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        sounds.playHit(false);

        if (this.suitMat) {
            this.suitMat.color.setHex(0xff3333);
            setTimeout(() => {
                if (this.suitMat) this.suitMat.color.setHex(this.suitColor);
            }, 120);
        }

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
        // Enfriamiento de ataque, combo y giro
        if (this.attackCooldown > 0) this.attackCooldown -= delta;
        if (this.spinCooldown > 0) this.spinCooldown -= delta;
        if (this.dashCooldown > 0) this.dashCooldown -= delta;

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
            this.moveDirection.addScaledVector(forward, -this.touchMoveVector.y);
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
                this.mesh.rotation.y += diff * 0.22;
            }
        }

        // Velocidad de movimiento
        const baseSpeed = 10.5;
        let currentSpeed = baseSpeed;

        if (this.dashTimer > 0) {
            this.dashTimer -= delta;
            currentSpeed = 24.0;
            this.velocity.x = this.dashDirection.x * currentSpeed;
            this.velocity.z = this.dashDirection.z * currentSpeed;
        } else if (isMoving) {
            this.velocity.x = this.moveDirection.x * currentSpeed;
            this.velocity.z = this.moveDirection.z * currentSpeed;
        } else {
            this.velocity.x *= 0.65;
            this.velocity.z *= 0.65;
            if (Math.abs(this.velocity.x) < 0.05) this.velocity.x = 0;
            if (Math.abs(this.velocity.z) < 0.05) this.velocity.z = 0;
        }

        // 2. Gravedad y suelo
        this.velocity.y += this.gravity * delta;
        this.mesh.position.x += this.velocity.x * delta;
        this.mesh.position.y += this.velocity.y * delta;
        this.mesh.position.z += this.velocity.z * delta;

        if (this.mesh.position.y <= 0) {
            this.mesh.position.y = 0;
            this.velocity.y = 0;
            this.isGrounded = true;
            this.jumpCount = 0;
        }

        // Límites del mapa
        const arenaRadius = 55.0;
        const currentDist = Math.hypot(this.mesh.position.x, this.mesh.position.z);
        if (currentDist > arenaRadius) {
            const angle = Math.atan2(this.mesh.position.z, this.mesh.position.x);
            this.mesh.position.x = Math.cos(angle) * arenaRadius;
            this.mesh.position.z = Math.sin(angle) * arenaRadius;
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

        // 4. Cámara orbital suave en 3ra persona
        const targetPos = this.mesh.position.clone().add(new THREE.Vector3(0, 1.4, 0));
        const camX = targetPos.x + Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance;
        const camY = targetPos.y + Math.sin(this.cameraPitch) * this.cameraDistance + this.cameraHeight * 0.3;
        const camZ = targetPos.z + Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance;

        this.camera.position.lerp(new THREE.Vector3(camX, Math.max(0.5, camY), camZ), 0.28);
        this.camera.lookAt(targetPos);
    }
}
