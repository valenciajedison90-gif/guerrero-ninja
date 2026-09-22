// js/player.js - Personaje Ninja Estilo Roblox, Animaciones y Cámara en Tercera Persona
import * as THREE from 'three';
import { createWeaponMesh, WEAPONS } from './weapons.js';
import { sounds } from './sound.js';

export class Player {
    constructor(scene, camera, domElement) {
        this.scene = scene;
        this.camera = camera;
        this.domElement = domElement;

        // Estadísticas del jugador (Movilidad rápida y ágil estilo ninja)
        this.maxHealth = 100;
        this.health = 100;
        this.speed = 15.5;
        this.jumpForce = 13.5;
        this.isGrounded = true;
        this.jumpCount = 0;
        this.isAttacking = false;
        this.attackCombo = 0;
        this.attackTimer = 0;
        this.attackCooldown = 0;
        this.comboResetTimer = 0;

        // Movimiento y física
        this.velocity = new THREE.Vector3();
        this.moveDirection = new THREE.Vector3();
        this.gravity = -26.0;

        // Cámara en 3ra persona
        this.cameraDistance = 6.2;
        this.cameraHeight = 3.2;
        this.cameraPitch = 0.25; // Ángulo vertical
        this.cameraYaw = 0;     // Ángulo horizontal
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

        // Movimiento táctil móvil (joystick virtual estilo Free Fire)
        this.touchMoveVector = new THREE.Vector2(0, 0);

        // Habilidad de impulso / dash ninja
        this.dashCooldown = 0;
        this.dashTimer = 0;
        this.dashDirection = new THREE.Vector3();

        this.suitColor = 0x1e293b;

        // Construir modelo humanoide realista y anatómico
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
        if (this.isAttacking) anim = 'attack';
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
        // Materiales con iluminación PBR suave
        this.suitMat = new THREE.MeshStandardMaterial({
            color: this.suitColor,
            roughness: 0.5,
            metalness: 0.15
        });
        const suitMat = this.suitMat;
        const clothAccentMat = new THREE.MeshStandardMaterial({
            color: 0xd92323, // Rojo carmesí ninja
            roughness: 0.45
        });
        const skinMat = new THREE.MeshStandardMaterial({
            color: 0xfbd0a1, // Piel anime cálida
            roughness: 0.35
        });
        const armorMat = new THREE.MeshStandardMaterial({
            color: 0x334155,
            metalness: 0.6,
            roughness: 0.3
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

        // Pecho superior / Pectorales (Cilindro cónico redondeado)
        const chestGeom = new THREE.CylinderGeometry(0.42, 0.34, 0.55, 16);
        const chest = new THREE.Mesh(chestGeom, suitMat);
        chest.position.y = 0.15;
        chest.castShadow = true;
        chest.receiveShadow = true;
        this.torso.add(chest);

        // Abdomen / Cintura atlética
        const absGeom = new THREE.CylinderGeometry(0.34, 0.30, 0.45, 16);
        const abs = new THREE.Mesh(absGeom, suitMat);
        abs.position.y = -0.22;
        abs.castShadow = true;
        this.torso.add(abs);

        // Faja / Cinturón tradicional Shinobi (Obi)
        const beltGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.16, 16);
        const belt = new THREE.Mesh(beltGeom, clothAccentMat);
        belt.position.y = -0.32;
        this.torso.add(belt);

        // Emblema ninja dorado en el cinturón
        const buckle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.09, 0.09, 0.04, 12),
            metalGoldMat
        );
        buckle.rotation.x = Math.PI / 2;
        buckle.position.set(0, -0.32, 0.33);
        this.torso.add(buckle);

        // 2. Cabeza y Cuello (Rostro humanoide con capucha shinobi)
        const neckGeom = new THREE.CylinderGeometry(0.14, 0.16, 0.22, 12);
        const neck = new THREE.Mesh(neckGeom, skinMat);
        neck.position.y = 0.48;
        this.torso.add(neck);

        this.head = new THREE.Group();
        this.head.position.y = 0.72;
        this.torso.add(this.head);

        // Cráneo / Capucha redondeada
        const hoodGeom = new THREE.SphereGeometry(0.35, 16, 16);
        hoodGeom.scale(1.0, 1.15, 1.05);
        const hood = new THREE.Mesh(hoodGeom, suitMat);
        hood.castShadow = true;
        this.head.add(hood);

        // Rostro visible (piel alrededor de los ojos)
        const faceVisorGeom = new THREE.SphereGeometry(0.33, 14, 14, 0, Math.PI * 2, Math.PI * 0.28, Math.PI * 0.22);
        faceVisorGeom.scale(1.02, 1.14, 1.06);
        const faceVisor = new THREE.Mesh(faceVisorGeom, skinMat);
        this.head.add(faceVisor);

        // Máscara ninja en la parte inferior del rostro
        const maskGeom = new THREE.CylinderGeometry(0.32, 0.24, 0.32, 14);
        maskGeom.scale(1.0, 1.0, 0.85);
        const mask = new THREE.Mesh(maskGeom, suitMat);
        mask.position.set(0, -0.12, 0.08);
        this.head.add(mask);

        // Ojos estilo anime definidos
        [-0.11, 0.11].forEach((eyeX) => {
            const eyeGroup = new THREE.Group();
            eyeGroup.position.set(eyeX, 0.05, 0.33);

            // Globo ocular blanco
            const whiteMesh = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), eyeHighlightMat);
            whiteMesh.scale.set(1.1, 0.7, 0.3);
            eyeGroup.add(whiteMesh);

            // Pupila oscura
            const pupil = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 8), eyePupilMat);
            pupil.rotation.x = Math.PI / 2;
            pupil.position.z = 0.02;
            eyeGroup.add(pupil);

            this.head.add(eyeGroup);
        });

        // Protector de frente ninja metálico curvado (Hitai-ate)
        const plateGeom = new THREE.CylinderGeometry(0.36, 0.36, 0.14, 16, 1, true, -Math.PI * 0.32, Math.PI * 0.64);
        const plate = new THREE.Mesh(plateGeom, armorMat);
        plate.position.y = 0.16;
        this.head.add(plate);

        // Bandana roja envolvente
        const bandWrapGeom = new THREE.CylinderGeometry(0.365, 0.365, 0.16, 16, 1, true, -Math.PI * 0.55, Math.PI * 1.1);
        const bandWrap = new THREE.Mesh(bandWrapGeom, clothAccentMat);
        bandWrap.position.y = 0.16;
        this.head.add(bandWrap);

        // Emblema de la aldea en el centro del protector
        const emblem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 8), metalGoldMat);
        emblem.rotation.x = Math.PI / 2;
        emblem.position.set(0, 0.16, 0.38);
        this.head.add(emblem);

        // Cintas de la bandana ondeando al viento
        this.bandanaTail1 = new THREE.Mesh(
            new THREE.BoxGeometry(0.09, 0.65, 0.02),
            clothAccentMat
        );
        this.bandanaTail1.position.set(-0.08, 0.08, -0.38);
        this.bandanaTail1.rotation.x = 0.35;
        this.head.add(this.bandanaTail1);

        this.bandanaTail2 = new THREE.Mesh(
            new THREE.BoxGeometry(0.09, 0.55, 0.02),
            clothAccentMat
        );
        this.bandanaTail2.position.set(0.08, 0.12, -0.38);
        this.bandanaTail2.rotation.x = 0.45;
        this.head.add(this.bandanaTail2);

        // 3. Brazo Izquierdo Humanoide Articulado
        this.leftArmPivot = new THREE.Group();
        this.leftArmPivot.position.set(-0.48, 0.35, 0);
        this.torso.add(this.leftArmPivot);

        // Hombro / Deltoides curvado
        const lShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), armorMat);
        this.leftArmPivot.add(lShoulder);

        // Brazo superior (Bícep)
        const lUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.42, 12), suitMat);
        lUpperArm.position.y = -0.22;
        lUpperArm.castShadow = true;
        this.leftArmPivot.add(lUpperArm);

        // Antebrazo con guantelete ninja (Kote)
        const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.44, 12), clothAccentMat);
        lForearm.position.y = -0.55;
        lForearm.castShadow = true;
        this.leftArmPivot.add(lForearm);

        // Mano izquierda cerrada
        const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), skinMat);
        lHand.position.y = -0.78;
        this.leftArmPivot.add(lHand);

        // 4. Brazo Derecho Humanoide con agarre de arma
        this.rightArmPivot = new THREE.Group();
        this.rightArmPivot.position.set(0.48, 0.35, 0);
        this.torso.add(this.rightArmPivot);

        const rShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), armorMat);
        this.rightArmPivot.add(rShoulder);

        const rUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.42, 12), suitMat);
        rUpperArm.position.y = -0.22;
        rUpperArm.castShadow = true;
        this.rightArmPivot.add(rUpperArm);

        const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.44, 12), clothAccentMat);
        rForearm.position.y = -0.55;
        rForearm.castShadow = true;
        this.rightArmPivot.add(rForearm);

        // Mano derecha
        const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), skinMat);
        rHand.position.y = -0.78;
        this.rightArmPivot.add(rHand);

        // Punto de anclaje de arma en la mano derecha
        this.weaponHolder = new THREE.Group();
        this.weaponHolder.position.set(0, -0.78, 0.08);
        this.weaponHolder.rotation.x = Math.PI / 2;
        this.rightArmPivot.add(this.weaponHolder);

        // 5. Piernas Humanoides Anatómicas
        // Pierna Izquierda
        this.leftLegPivot = new THREE.Group();
        this.leftLegPivot.position.set(-0.20, -0.45, 0);
        this.torso.add(this.leftLegPivot);

        const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.14, 0.48, 12), suitMat);
        lThigh.position.y = -0.24;
        lThigh.castShadow = true;
        this.leftLegPivot.add(lThigh);

        // Pantorrilla con polaina ninja (Kyahan)
        const lCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.48, 12), clothAccentMat);
        lCalf.position.y = -0.66;
        lCalf.castShadow = true;
        this.leftLegPivot.add(lCalf);

        // Zapato Tabi anatómico curvado
        const lFoot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
        lFoot.scale.set(0.9, 0.6, 1.4);
        lFoot.position.set(0, -0.88, 0.04);
        this.leftLegPivot.add(lFoot);

        // Pierna Derecha
        this.rightLegPivot = new THREE.Group();
        this.rightLegPivot.position.set(0.20, -0.45, 0);
        this.torso.add(this.rightLegPivot);

        const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.14, 0.48, 12), suitMat);
        rThigh.position.y = -0.24;
        rThigh.castShadow = true;
        this.rightLegPivot.add(rThigh);

        const rCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.48, 12), clothAccentMat);
        rCalf.position.y = -0.66;
        rCalf.castShadow = true;
        this.rightLegPivot.add(rCalf);

        const rFoot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
        rFoot.scale.set(0.9, 0.6, 1.4);
        rFoot.position.set(0, -0.88, 0.04);
        this.rightLegPivot.add(rFoot);
    }

    equipWeapon(weaponId) {
        this.currentWeaponId = weaponId;

        // Limpiar arma anterior
        while (this.weaponHolder.children.length > 0) {
            const child = this.weaponHolder.children[0];
            this.weaponHolder.remove(child);
        }

        // Crear nueva malla 3D
        this.weaponMesh = createWeaponMesh(weaponId);
        this.weaponHolder.add(this.weaponMesh);
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
                e.preventDefault();
            }
            if (key === 'f' || key === 'j') {
                this.triggerAttack();
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

        // Controles de mouse para cámara en 3ra persona
        this.domElement.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                // Clic izquierdo: Atacar
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

                // Limitar ángulo vertical de la cámara
                this.cameraPitch = Math.max(-0.2, Math.min(1.1, this.cameraPitch));

                this.previousMousePosition = { x: e.clientX, y: e.clientY };
            }
        });

        window.addEventListener('mouseup', () => {
            this.isDraggingMouse = false;
        });

        // Prevenir menú contextual con clic derecho
        this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

        // Zoom de cámara con rueda
        window.addEventListener('wheel', (e) => {
            this.cameraDistance = Math.max(3.5, Math.min(12.0, this.cameraDistance + e.deltaY * 0.005));
        });
    }

    setTouchMovement(x, y) {
        this.touchMoveVector.set(x, y);
    }

    addCameraRotation(deltaX, deltaY) {
        // Sensibilidad calibrada para pantalla táctil estilo Free Fire
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
        } else if (this.jumpCount === 1) {
            // Doble salto ninja acrobático
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

        // Si se está moviendo, el impulso sigue esa dirección; si no, hacia donde mira el ninja
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

        // Alinear al ninja hacia donde apunta la cámara/mira (Estilo Free Fire)
        this.mesh.rotation.y = this.cameraYaw + Math.PI;

        const weaponData = WEAPONS[this.currentWeaponId] || WEAPONS.bokken;
        this.isAttacking = true;
        this.attackTimer = 0;
        this.attackCooldown = weaponData.attackSpeed;

        // Avanzar combo 0 -> 1 -> 2 -> 0
        this.attackCombo = (this.attackCombo + 1) % 3;
        this.comboResetTimer = 0.9;

        // Sonido de ataque
        sounds.playSlash(weaponData.element);

        if (this.onAttackCallback) {
            this.onAttackCallback(this.currentWeaponId, this.attackCombo);
        }
    }

    bounceTrampoline(boostForce = 22.0) {
        this.velocity.y = boostForce;
        this.isGrounded = false;
        this.jumpCount = 1; // Permite salto extra en el aire
        sounds.playTrampoline();
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        sounds.playHit(false);

        // Destello rojo en el personaje
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

    respawn() {
        sounds.playPoof();
        this.health = this.maxHealth;
        this.mesh.position.set(0, 1.0, 0);
        this.velocity.set(0, 0, 0);
    }

    update(delta) {
        // Enfriamiento de ataque y dash
        if (this.attackCooldown > 0) {
            this.attackCooldown -= delta;
        }
        if (this.comboResetTimer > 0) {
            this.comboResetTimer -= delta;
            if (this.comboResetTimer <= 0) {
                this.attackCombo = 0;
            }
        }
        if (this.dashCooldown > 0) {
            this.dashCooldown -= delta;
        }
        if (this.dashTimer > 0) {
            this.dashTimer -= delta;
        }

        // 1. Calcular dirección de movimiento en base a la rotación de cámara
        const forward = new THREE.Vector3(-Math.sin(this.cameraYaw), 0, -Math.cos(this.cameraYaw)).normalize();
        const right = new THREE.Vector3(Math.cos(this.cameraYaw), 0, -Math.sin(this.cameraYaw)).normalize();

        this.moveDirection.set(0, 0, 0);
        if (this.keys.w) this.moveDirection.add(forward);
        if (this.keys.s) this.moveDirection.sub(forward);
        if (this.keys.d) this.moveDirection.add(right);
        if (this.keys.a) this.moveDirection.sub(right);

        // Movimiento con joystick táctil móvil (analógico suave 360°)
        if (this.touchMoveVector.lengthSq() > 0.001) {
            this.moveDirection.addScaledVector(right, this.touchMoveVector.x);
            this.moveDirection.addScaledVector(forward, this.touchMoveVector.y);
        }

        const isMoving = this.moveDirection.lengthSq() > 0.001;

        if (this.dashTimer > 0) {
            // Sprint supersónico por habilidad de Dash
            this.mesh.position.addScaledVector(this.dashDirection, this.speed * 2.6 * delta);
        } else if (isMoving) {
            this.moveDirection.normalize();
            this.mesh.position.addScaledVector(this.moveDirection, this.speed * delta);

            // Girar reactivamente el ninja hacia la dirección de avance
            const targetRotation = Math.atan2(this.moveDirection.x, this.moveDirection.z);
            let diff = targetRotation - this.mesh.rotation.y;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            this.mesh.rotation.y += diff * Math.min(1.0, delta * 24);
        } else {
            // Cuando no se mueve, orientar suavemente al ninja hacia donde apunta la cámara (Estilo Free Fire)
            const targetRotation = this.cameraYaw + Math.PI;
            let diff = targetRotation - this.mesh.rotation.y;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            this.mesh.rotation.y += diff * Math.min(1.0, delta * 16);
        }

        // 2. Salto y gravedad
        if (this.keys.space && this.isGrounded) {
            this.jump();
        }

        this.velocity.y += this.gravity * delta;
        this.mesh.position.y += this.velocity.y * delta;

        // Suelo a Y = 0
        if (this.mesh.position.y <= 0) {
            this.mesh.position.y = 0;
            this.velocity.y = 0;
            this.isGrounded = true;
            this.jumpCount = 0; // Reiniciar contador de saltos
        }

        // Límites del mapa para no caer al vacío
        const arenaRadius = 55.0;
        const currentDist = Math.hypot(this.mesh.position.x, this.mesh.position.z);
        if (currentDist > arenaRadius) {
            const angle = Math.atan2(this.mesh.position.z, this.mesh.position.x);
            this.mesh.position.x = Math.cos(angle) * arenaRadius;
            this.mesh.position.z = Math.sin(angle) * arenaRadius;
        }

        // 3. Animaciones procedurales estilo Roblox
        const time = performance.now() * 0.015;

        if (this.isAttacking) {
            this.attackTimer += delta * 8;
            if (this.attackTimer > Math.PI) {
                this.isAttacking = false;
                this.attackTimer = 0;
            }

            // Animación de corte con brazo derecho
            if (this.attackCombo === 1) {
                // Tajo horizontal
                this.rightArmPivot.rotation.x = Math.PI / 2 + Math.sin(this.attackTimer) * 0.6;
                this.rightArmPivot.rotation.y = -Math.PI / 3 + Math.sin(this.attackTimer) * 1.8;
                this.torso.rotation.y = Math.sin(this.attackTimer) * 0.5;
            } else if (this.attackCombo === 2) {
                // Tajo descendente vertical potente
                this.rightArmPivot.rotation.x = Math.PI - Math.sin(this.attackTimer) * 2.2;
                this.rightArmPivot.rotation.y = 0;
                this.torso.rotation.x = Math.sin(this.attackTimer) * 0.3;
            } else {
                // Giro 360 grados estilo torbellino
                this.rightArmPivot.rotation.x = Math.PI / 2;
                this.rightArmPivot.rotation.y = -1.2;
                this.mesh.rotation.y += delta * 25;
            }
        } else {
            this.torso.rotation.set(0, 0, 0);

            if (!this.isGrounded) {
                // Animación de salto
                this.rightArmPivot.rotation.x = -Math.PI * 0.8;
                this.leftArmPivot.rotation.x = -Math.PI * 0.8;
                this.leftLegPivot.rotation.x = 0.5;
                this.rightLegPivot.rotation.x = 0.3;
            } else if (isMoving) {
                // Animación de correr (brazos y piernas oscilan dinámicamente)
                const swing = Math.sin(time) * 0.85;
                this.leftLegPivot.rotation.x = swing;
                this.rightLegPivot.rotation.x = -swing;
                this.leftArmPivot.rotation.x = -swing * 0.7;
                this.rightArmPivot.rotation.x = swing * 0.7;
                this.rightArmPivot.rotation.z = 0.1;
                this.leftArmPivot.rotation.z = -0.1;
            } else {
                // Animación reposo (respiración suave)
                const breath = Math.sin(time * 0.3) * 0.05;
                this.leftLegPivot.rotation.set(0, 0, 0);
                this.rightLegPivot.rotation.set(0, 0, 0);
                this.leftArmPivot.rotation.set(breath, 0, -0.1);
                this.rightArmPivot.rotation.set(breath, 0, 0.1);
            }
        }

        // Ondeo de cintas de la bandana ninja con el viento
        const flutter = Math.sin(time * 1.5) * (isMoving ? 0.45 : 0.15);
        this.bandanaTail1.rotation.x = 0.35 + flutter;
        this.bandanaTail2.rotation.x = 0.45 - flutter * 0.8;

        // 4. Actualizar posición de la cámara en 3ra persona orbital
        const targetPos = this.mesh.position.clone().add(new THREE.Vector3(0, 1.4, 0));
        const camX = targetPos.x + Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance;
        const camY = targetPos.y + Math.sin(this.cameraPitch) * this.cameraDistance + this.cameraHeight * 0.3;
        const camZ = targetPos.z + Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance;

        // Movimiento de cámara suave (lerp) sin retraso perceptible
        this.camera.position.lerp(new THREE.Vector3(camX, Math.max(0.5, camY), camZ), 0.28);
        this.camera.lookAt(targetPos);
    }
}
