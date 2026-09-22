// js/player.js - Personaje Ninja Estilo Roblox, Animaciones y Cámara en Tercera Persona
import * as THREE from 'three';
import { createWeaponMesh, WEAPONS } from './weapons.js';
import { sounds } from './sound.js';

export class Player {
    constructor(scene, camera, domElement) {
        this.scene = scene;
        this.camera = camera;
        this.domElement = domElement;

        // Estadísticas del jugador
        this.maxHealth = 100;
        this.health = 100;
        this.speed = 9.5;
        this.jumpForce = 12.0;
        this.isGrounded = true;
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

        // Construir modelo de bloques estilo Roblox
        this.mesh = new THREE.Group();
        this.mesh.name = 'player';
        this.buildRobloxNinjaModel();
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

    buildRobloxNinjaModel() {
        // Materiales
        this.suitMat = new THREE.MeshStandardMaterial({
            color: this.suitColor, // Color personalizable
            roughness: 0.6
        });
        const suitMat = this.suitMat;
        const redClothMat = new THREE.MeshStandardMaterial({
            color: 0xd92323, // Rojo ninja brillante
            roughness: 0.5
        });
        const skinMat = new THREE.MeshStandardMaterial({
            color: 0xf6d8ae, // Piel anime
            roughness: 0.4
        });
        const metalMat = new THREE.MeshStandardMaterial({
            color: 0xd4d4d8,
            metalness: 0.8,
            roughness: 0.2
        });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

        // 1. Torso (Cuerpo de bloque Roblox)
        const torsoGeom = new THREE.BoxGeometry(0.85, 1.1, 0.45);
        this.torso = new THREE.Mesh(torsoGeom, suitMat);
        this.torso.position.y = 1.35;
        this.torso.castShadow = true;
        this.torso.receiveShadow = true;
        this.mesh.add(this.torso);

        // Cinturón rojo de ninja (Obi)
        const beltGeom = new THREE.BoxGeometry(0.88, 0.2, 0.48);
        const belt = new THREE.Mesh(beltGeom, redClothMat);
        belt.position.y = -0.35;
        this.torso.add(belt);

        // Hebilla de oro / emblema ninja
        const buckleGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 8);
        const buckle = new THREE.Mesh(buckleGeom, new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 }));
        buckle.rotation.x = Math.PI / 2;
        buckle.position.set(0, -0.35, 0.25);
        this.torso.add(buckle);

        // 2. Cabeza (Cubo Roblox)
        const headGeom = new THREE.BoxGeometry(0.65, 0.65, 0.65);
        this.head = new THREE.Mesh(headGeom, skinMat);
        this.head.position.y = 0.9;
        this.head.castShadow = true;
        this.torso.add(this.head);

        // Máscara ninja en la parte inferior de la cara
        const maskGeom = new THREE.BoxGeometry(0.66, 0.32, 0.66);
        const mask = new THREE.Mesh(maskGeom, suitMat);
        mask.position.y = -0.15;
        this.head.add(mask);

        // Ojos grandes estilo anime/Roblox
        const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.02), eyeMat);
        eyeL.position.set(-0.16, 0.1, 0.33);
        const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.02), eyeMat);
        eyeR.position.set(0.16, 0.1, 0.33);
        this.head.add(eyeL);
        this.head.add(eyeR);

        // Bandana roja en la frente
        const headbandGeom = new THREE.BoxGeometry(0.67, 0.16, 0.67);
        const headband = new THREE.Mesh(headbandGeom, redClothMat);
        headband.position.y = 0.22;
        this.head.add(headband);

        // Placa metálica de la aldea
        const plateGeom = new THREE.BoxGeometry(0.24, 0.1, 0.02);
        const plate = new THREE.Mesh(plateGeom, metalMat);
        plate.position.set(0, 0.22, 0.34);
        this.head.add(plate);

        // Cintas traseras de la bandana que ondean
        this.bandanaTail1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.03), redClothMat);
        this.bandanaTail1.position.set(-0.1, 0.05, -0.36);
        this.bandanaTail1.rotation.x = 0.3;
        this.head.add(this.bandanaTail1);

        this.bandanaTail2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.03), redClothMat);
        this.bandanaTail2.position.set(0.1, 0.1, -0.36);
        this.bandanaTail2.rotation.x = 0.4;
        this.head.add(this.bandanaTail2);

        // 3. Brazo Izquierdo (Pivote de hombro)
        this.leftArmPivot = new THREE.Group();
        this.leftArmPivot.position.set(-0.62, 0.45, 0);
        this.torso.add(this.leftArmPivot);

        const armGeom = new THREE.BoxGeometry(0.38, 1.0, 0.38);
        this.leftArm = new THREE.Mesh(armGeom, suitMat);
        this.leftArm.position.y = -0.45;
        this.leftArm.castShadow = true;
        this.leftArmPivot.add(this.leftArm);

        // Manopla / guante
        const gloveL = new THREE.Mesh(new THREE.BoxGeometry(0.39, 0.25, 0.39), redClothMat);
        gloveL.position.y = -0.38;
        this.leftArm.add(gloveL);

        // 4. Brazo Derecho (Pivote de hombro con montaje de arma)
        this.rightArmPivot = new THREE.Group();
        this.rightArmPivot.position.set(0.62, 0.45, 0);
        this.torso.add(this.rightArmPivot);

        this.rightArm = new THREE.Mesh(armGeom, suitMat);
        this.rightArm.position.y = -0.45;
        this.rightArm.castShadow = true;
        this.rightArmPivot.add(this.rightArm);

        const gloveR = new THREE.Mesh(new THREE.BoxGeometry(0.39, 0.25, 0.39), redClothMat);
        gloveR.position.y = -0.38;
        this.rightArm.add(gloveR);

        // Punto de montaje en la mano derecha para armas
        this.weaponHolder = new THREE.Group();
        this.weaponHolder.position.set(0, -0.45, 0.18);
        this.weaponHolder.rotation.x = Math.PI / 2;
        this.rightArm.add(this.weaponHolder);

        // 5. Piernas (Pivotes de caderas)
        const legGeom = new THREE.BoxGeometry(0.4, 0.9, 0.4);

        this.leftLegPivot = new THREE.Group();
        this.leftLegPivot.position.set(-0.23, -0.55, 0);
        this.torso.add(this.leftLegPivot);

        this.leftLeg = new THREE.Mesh(legGeom, suitMat);
        this.leftLeg.position.y = -0.4;
        this.leftLeg.castShadow = true;
        this.leftLegPivot.add(this.leftLeg);

        this.rightLegPivot = new THREE.Group();
        this.rightLegPivot.position.set(0.23, -0.55, 0);
        this.torso.add(this.rightLegPivot);

        this.rightLeg = new THREE.Mesh(legGeom, suitMat);
        this.rightLeg.position.y = -0.4;
        this.rightLeg.castShadow = true;
        this.rightLegPivot.add(this.rightLeg);

        // Vendas blancas en los pies (tabi)
        const tabiMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9 });
        const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.41, 0.22, 0.41), tabiMat);
        shoeL.position.y = -0.35;
        this.leftLeg.add(shoeL);
        const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.41, 0.22, 0.41), tabiMat);
        shoeR.position.y = -0.35;
        this.rightLeg.add(shoeR);
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
        this.cameraYaw -= deltaX * 0.007;
        this.cameraPitch += deltaY * 0.005;
        this.cameraPitch = Math.max(-0.2, Math.min(1.1, this.cameraPitch));
    }

    jump() {
        if (this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
            sounds.playJump();
        }
    }

    dash() {
        if (this.dashCooldown > 0) return;
        this.dashCooldown = 1.2;
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
        sounds.playTrampoline();
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        sounds.playHit(false);

        // Destello rojo en el personaje
        this.torso.material.color.setHex(0xff3333);
        setTimeout(() => {
            this.torso.material.color.setHex(0x1e293b);
        }, 120);

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
            this.mesh.position.addScaledVector(this.dashDirection, this.speed * 2.5 * delta);
        } else if (isMoving) {
            this.moveDirection.normalize();
            this.mesh.position.addScaledVector(this.moveDirection, this.speed * delta);

            // Girar suavemente el ninja hacia la dirección de avance
            const targetRotation = Math.atan2(this.moveDirection.x, this.moveDirection.z);
            let diff = targetRotation - this.mesh.rotation.y;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            this.mesh.rotation.y += diff * Math.min(1.0, delta * 15);
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
        const time = performance.now() * 0.009;

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
                // Animación de correr (brazos y piernas oscilan)
                const swing = Math.sin(time) * 0.75;
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

        // Movimiento de cámara suave (lerp)
        this.camera.position.lerp(new THREE.Vector3(camX, Math.max(0.5, camY), camZ), 0.15);
        this.camera.lookAt(targetPos);
    }
}
