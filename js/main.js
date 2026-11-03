// js/main.js - Bucle Principal del Juego, Combate, Progresión de Mundos con Misiones y Renderizado HD
import * as THREE from 'three';
import { sounds } from './sound.js?v=7.0';
import { storage } from './storage.js?v=7.0';
import { WEAPONS } from './weapons.js?v=7.0';
import { ParticleSystem } from './particles.js?v=7.0';
import { World, MAPS_CONFIG } from './world.js?v=7.0';
import { Player } from './player.js?v=7.0';
import { EnemyManager } from './enemies.js?v=7.0';
import { MultiplayerManager } from './multiplayer.js?v=7.0';
import { TouchControlsManager } from './touch.js?v=7.0';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.clock = new THREE.Clock();
        this.portalVictoryTriggered = false;

        // 1. Inicializar Three.js con antialiasing y nitidez HD
        this.setupRenderer();
        this.setupSceneAndLights();

        // 2. Inicializar subsistemas
        this.particles = new ParticleSystem(this.scene);
        this.world = new World(this.scene);
        this.player = new Player(this.scene, this.camera, this.renderer.domElement);
        this.enemyManager = new EnemyManager(this.scene, this.particles);
        this.multiplayer = new MultiplayerManager(this.scene, this.particles);

        // Controles táctiles móviles estilo Free Fire con botón de giro
        this.touchControls = new TouchControlsManager(this.player, this);

        // Conectar eventos de combate del jugador
        this.player.onAttackCallback = (weaponId, combo, target) => this.handlePlayerAttack(weaponId, combo, target);
        this.player.onSpinAttackCallback = () => this.handlePlayerSpinAttack();

        // Conectar proveedor de objetivos para Auto-Apuntado Asistido (Soft Aim Assist)
        this.player.setTargetsProvider(() => {
            const targets = [];
            if (this.enemyManager && this.enemyManager.enemies) {
                for (const e of this.enemyManager.enemies) {
                    if (e && e.mesh && e.health > 0) targets.push(e);
                }
            }
            if (this.world && this.world.crates) {
                for (const c of this.world.crates) {
                    if (c && c.mesh && !c.isBroken) targets.push(c);
                }
            }
            if (this.world && this.world.totems) {
                for (const t of this.world.totems) {
                    if (t && t.mesh && !t.isDestroyed) targets.push(t);
                }
            }
            return targets;
        });

        // Estelas de sombra ninja durante el dash
        this.shadowClones = [];
        this.player.setSpawnShadowCallback((pos, rotY) => {
            this.spawnShadowClone(pos, rotY);
        });

        // Sistemas de Game Juice (Screen Shake & Números de Daño Flotantes)
        this.screenShakeIntensity = 0;
        this.screenShakeDuration = 0;
        this.damagePopups = [];

        // 3. Inicializar Interfaz de Usuario y Misiones
        this.setupUI();
        this.updateHUD();
        this.updateMissionHUD();

        // 4. Iniciar bucle de animación
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);

        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupRenderer() {
        this.isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 900);

        // Antialiasing forzado para bordes hiper-nítidos sin pixelación
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: 'high-performance',
            precision: 'highp'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Resolución nativa nítida: hasta 2.0x DPI en pantallas Retina/AMOLED
        const dpr = window.devicePixelRatio || 1;
        this.renderer.setPixelRatio(Math.min(dpr, 2.0));

        this.renderer.shadowMap.enabled = !this.isMobile;
        if (!this.isMobile) {
            this.renderer.shadowMap.type = THREE.PCFShadowMap;
        }

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x7dd3fc);
        this.scene.fog = new THREE.FogExp2(0x7dd3fc, 0.015);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 160);
        this.camera.position.set(0, 4, 8);
    }

    setupSceneAndLights() {
        const ambientIntensity = this.isMobile ? 0.95 : 0.75;
        const ambientLight = new THREE.AmbientLight(0xffffff, ambientIntensity);
        this.scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xfffbeb, this.isMobile ? 1.0 : 1.3);
        sunLight.position.set(25, 40, 20);

        if (!this.isMobile) {
            sunLight.castShadow = true;
            sunLight.shadow.mapSize.width = 1024;
            sunLight.shadow.mapSize.height = 1024;
            sunLight.shadow.camera.near = 0.5;
            sunLight.shadow.camera.far = 120;

            const d = 36;
            sunLight.shadow.camera.left = -d;
            sunLight.shadow.camera.right = d;
            sunLight.shadow.camera.top = d;
            sunLight.shadow.camera.bottom = -d;
            sunLight.shadow.bias = -0.0005;
        }

        this.scene.add(sunLight);

        const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x86efac, 0.45);
        this.scene.add(hemiLight);
    }

    // =========================================================================
    // =========================================================================
    // GAME JUICE: ESTELAS DE SOMBRA, SACUDIDA DE PANTALLA Y DAÑO FLOTANTE
    // =========================================================================
    spawnShadowClone(pos, rotY) {
        const shadowGroup = new THREE.Group();
        shadowGroup.position.copy(pos);
        shadowGroup.rotation.y = rotY;

        const shadowMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.45
        });

        const ghostBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 1.2, 12), shadowMat);
        ghostBody.position.y = 1.0;
        shadowGroup.add(ghostBody);

        const ghostHead = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), shadowMat);
        ghostHead.position.y = 1.85;
        shadowGroup.add(ghostHead);

        this.scene.add(shadowGroup);
        this.shadowClones.push({ mesh: shadowGroup, mat: shadowMat, life: 0.22, maxLife: 0.22 });
    }

    spawnDamagePopup(pos, damage, isCrit = false) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        ctx.font = isCrit ? 'bold 36px sans-serif' : 'bold 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.shadowColor = isCrit ? '#f59e0b' : '#000000';
        ctx.shadowBlur = 6;
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#000000';
        const text = isCrit ? `¡${damage}! 💥` : `-${damage}`;
        ctx.strokeText(text, 64, 32);

        ctx.fillStyle = isCrit ? '#fbbf24' : '#ef4444';
        ctx.fillText(text, 64, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 1.0,
            depthTest: false
        });

        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(1.4, 0.7, 1);
        sprite.position.copy(pos).add(new THREE.Vector3((Math.random() - 0.5) * 0.4, 1.2, (Math.random() - 0.5) * 0.4));

        this.scene.add(sprite);
        this.damagePopups.push({
            sprite: sprite,
            mat: spriteMat,
            texture: texture,
            life: 0.65,
            maxLife: 0.65,
            vy: 2.2
        });
    }

    triggerScreenShake(intensity = 0.2, duration = 0.12) {
        this.screenShakeIntensity = intensity;
        this.screenShakeDuration = duration;
    }

    // =========================================================================
    // COMBATE DEL JUGADOR CON AUTO-APUNTADO Y COMBOS FLUIDOS
    // =========================================================================
    handlePlayerAttack(weaponId, combo, target) {
        const weapon = WEAPONS[weaponId] || WEAPONS.bokken;
        const playerPos = this.player.mesh.position;

        const forward = new THREE.Vector3(
            Math.sin(this.player.mesh.rotation.y),
            0,
            Math.cos(this.player.mesh.rotation.y)
        ).normalize();

        // 1. Armas a distancia (Shurikens)
        if (weapon.type === 'ranged') {
            const spawnPos = playerPos.clone().add(new THREE.Vector3(0, 1.3, 0)).addScaledVector(forward, 0.8);
            this.particles.spawnShurikenProjectile(spawnPos, forward, weapon.damage, weapon.element);
            this.multiplayer.sendAttack(weaponId, combo, forward);
            return;
        }

        // 2. Armas cuerpo a cuerpo (Espadas)
        const slashPos = playerPos.clone().add(new THREE.Vector3(0, 1.2, 0)).addScaledVector(forward, 1.2);
        this.particles.createSlashEffect(slashPos, forward, weapon.element);
        this.multiplayer.sendAttack(weaponId, combo, forward);

        let hitCount = 0;
        const range = weapon.range;

        // Bonificación de daño progresivo en combos 1-2-3
        const comboMultipliers = [1.0, 1.25, 1.75];
        const comboMult = comboMultipliers[combo] || 1.0;

        // Golpear enemigos frente al jugador
        this.enemyManager.enemies.forEach(enemy => {
            const enemyPos = enemy.mesh.position;
            const dist = playerPos.distanceTo(enemyPos);

            if (dist <= range + 1.2) {
                const toEnemy = new THREE.Vector3().subVectors(enemyPos, playerPos).normalize();
                const angle = forward.angleTo(toEnemy);

                // Ángulo de barrido generoso (140° o 360° en proximidad inmediata)
                if (angle < Math.PI * 0.75 || dist < 1.8) {
                    hitCount++;
                    const isCrit = (combo === 2) || (Math.random() < 0.25);
                    let baseDamage = weapon.damage;
                    let damage = Math.round(baseDamage * comboMult);
                    if (isCrit) damage = Math.round(damage * 1.5);
                    damage += (storage.data.level - 1) * 3;

                    this.enemyManager.damageEnemy(enemy, damage, isCrit, toEnemy, (defeatedEnemy) => {
                        this.handleEnemyDefeated(defeatedEnemy);
                    });

                    // Game Juice
                    this.triggerScreenShake(isCrit ? 0.28 : 0.15, 0.12);
                    this.spawnDamagePopup(enemy.mesh.position.clone().add(new THREE.Vector3(0, 1.2, 0)), damage, isCrit);
                }
            }
        });

        // Golpear cajas de madera destructibles
        const attackCenter = playerPos.clone().addScaledVector(forward, 1.2);
        this.world.checkCrateHits(attackCenter, range + 1.2, (crate) => {
            this.handleCrateBroken(crate);
            this.triggerScreenShake(0.2, 0.1);
            this.spawnDamagePopup(crate.mesh.position.clone().add(new THREE.Vector3(0, 0.8, 0)), 50, false);
        });

        // Golpear tótems de fuego
        this.world.checkTotemHits(attackCenter, range + 1.2, (totem) => {
            this.handleTotemDestroyed(totem);
            this.triggerScreenShake(0.22, 0.12);
            this.spawnDamagePopup(totem.mesh.position.clone().add(new THREE.Vector3(0, 1.5, 0)), 70, true);
        });

        if (hitCount > 0) {
            this.showCombo(combo);
        }
    }

    // Ataque de Giro Ninja 360° estilo Crash Bandicoot
    handlePlayerSpinAttack() {
        const playerPos = this.player.mesh.position;
        const spinRadius = 3.6;

        this.particles.createSlashEffect(playerPos.clone().add(new THREE.Vector3(0, 1.2, 0)), new THREE.Vector3(1, 0, 0), 'light');
        this.particles.createSlashEffect(playerPos.clone().add(new THREE.Vector3(0, 1.2, 0)), new THREE.Vector3(-1, 0, 0), 'light');

        let hitCount = 0;
        this.enemyManager.enemies.forEach(enemy => {
            const dist = playerPos.distanceTo(enemy.mesh.position);
            if (dist <= spinRadius) {
                hitCount++;
                const isCrit = Math.random() < 0.35;
                const toEnemy = new THREE.Vector3().subVectors(enemy.mesh.position, playerPos).normalize();
                const weapon = WEAPONS[storage.getActiveWeaponId()] || WEAPONS.bokken;
                const damage = Math.round(weapon.damage * 1.5) + (storage.data.level - 1) * 3;

                this.enemyManager.damageEnemy(enemy, damage, isCrit, toEnemy, (def) => this.handleEnemyDefeated(def));
                this.triggerScreenShake(0.24, 0.12);
                this.spawnDamagePopup(enemy.mesh.position.clone().add(new THREE.Vector3(0, 1.2, 0)), damage, isCrit);
            }
        });

        // Romper todas las cajas en radio 360°
        this.world.checkCrateHits(playerPos, spinRadius, (crate) => {
            this.handleCrateBroken(crate);
            this.triggerScreenShake(0.2, 0.1);
            this.spawnDamagePopup(crate.mesh.position.clone().add(new THREE.Vector3(0, 0.8, 0)), 50, false);
        });

        // Romper tótems en radio 360°
        this.world.checkTotemHits(playerPos, spinRadius, (totem) => {
            this.handleTotemDestroyed(totem);
            this.triggerScreenShake(0.25, 0.12);
            this.spawnDamagePopup(totem.mesh.position.clone().add(new THREE.Vector3(0, 1.5, 0)), 70, true);
        });

        if (hitCount > 0) {
            this.showCombo(2);
        }
    }

    handleEnemyDefeated(enemy) {
        storage.incrementEnemiesDefeated();

        // Registrar en la misión del mundo
        if (enemy.type === 'boss') {
            storage.recordMissionBoss(this.world.currentMapId);
        } else if (enemy.type !== 'dummy') {
            storage.recordMissionEnemy(this.world.currentMapId);
        }
        this.updateMissionHUD();

        // Añadir XP y comprobar nivel
        const xpResult = storage.addXP(enemy.xpDrop);
        this.updateHUD();

        if (xpResult.leveledUp) {
            sounds.playLevelUp();
            this.player.maxHealth += 15;
            this.player.health = this.player.maxHealth;
            this.showBanner(
                `¡SUBISTE AL NIVEL ${xpResult.newLevel}! 🎉`,
                `+15 Vida Máxima aumentada y mayor fuerza ninja`
            );
        }
    }

    handleCrateBroken(crate) {
        sounds.playCrateBreak();

        if (crate.rewardType === 'fruit') {
            this.player.heal(25);
            this.showBanner('¡FRUTA SAGRADA! 🍎', '+25 Vida restaurada');
        } else {
            storage.addCoins(15);
            sounds.playCoin();
        }

        storage.recordMissionCrate(this.world.currentMapId);
        this.updateHUD();
        this.updateMissionHUD();
    }

    handleTotemDestroyed(totem) {
        sounds.playHit(true);
        storage.recordMissionTotem(this.world.currentMapId);
        this.showBanner('¡TÓTEM DESTRUIDO! 🌋', 'Fuego apagado');
        this.updateMissionHUD();
    }

    handleGemCollected(gemId, pos) {
        sounds.playGemCollect();
        this.particles.createHitSparks(pos.clone().add(new THREE.Vector3(0, 0.5, 0)), true);
        storage.recordMissionGem(this.world.currentMapId);
        this.showBanner('¡GEMA SAGRADA OBTENIDA! 💎', '¡Objetivo de misión avanzado!');
        this.updateMissionHUD();
    }

    // =========================================================================
    // GESTIÓN DE MISIONES Y PORTAL DIMENSIONAL (CRASH BANDICOOT STYLE)
    // =========================================================================
    updateMissionHUD() {
        const worldId = this.world.currentMapId;
        const cfg = MAPS_CONFIG[worldId];
        const prog = storage.getWorldProgress(worldId);

        const titleEl = document.getElementById('hud-world-name');
        if (titleEl) {
            titleEl.textContent = cfg.badge + ' - ' + cfg.name.toUpperCase();
        }

        const tasksList = document.getElementById('mission-tasks-list');
        if (tasksList) {
            tasksList.innerHTML = '';

            if (worldId === 'forest') {
                const eDone = prog.enemiesDefeated >= prog.enemiesTarget;
                const gDone = prog.gemsCollected >= prog.gemsTarget;
                const cDone = prog.cratesBroken >= prog.cratesTarget;

                tasksList.innerHTML = `
                    <div class="mission-item ${eDone ? 'done' : ''}"><span class="m-icon">⚔️</span> <span>Ninjas: ${prog.enemiesDefeated}/${prog.enemiesTarget}</span> <span>${eDone ? '✅' : '⏳'}</span></div>
                    <div class="mission-item ${gDone ? 'done' : ''}"><span class="m-icon">💎</span> <span>Gemas Sagradas: ${prog.gemsCollected}/${prog.gemsTarget}</span> <span>${gDone ? '✅' : '⏳'}</span></div>
                    <div class="mission-item ${cDone ? 'done' : ''}"><span class="m-icon">📦</span> <span>Cajas del Dojo: ${prog.cratesBroken}/${prog.cratesTarget}</span> <span>${cDone ? '✅' : '⏳'}</span></div>
                `;
            } else if (worldId === 'volcano') {
                const eDone = prog.enemiesDefeated >= prog.enemiesTarget;
                const gDone = prog.gemsCollected >= prog.gemsTarget;
                const tDone = prog.totemsDestroyed >= prog.totemsTarget;

                tasksList.innerHTML = `
                    <div class="mission-item ${eDone ? 'done' : ''}"><span class="m-icon">⚔️</span> <span>Ninjas de Fuego: ${prog.enemiesDefeated}/${prog.enemiesTarget}</span> <span>${eDone ? '✅' : '⏳'}</span></div>
                    <div class="mission-item ${gDone ? 'done' : ''}"><span class="m-icon">💎</span> <span>Reliquias Magma: ${prog.gemsCollected}/${prog.gemsTarget}</span> <span>${gDone ? '✅' : '⏳'}</span></div>
                    <div class="mission-item ${tDone ? 'done' : ''}"><span class="m-icon">🌋</span> <span>Tótems Destruidos: ${prog.totemsDestroyed}/${prog.totemsTarget}</span> <span>${tDone ? '✅' : '⏳'}</span></div>
                `;
            } else if (worldId === 'snow') {
                const gDone = prog.gemsCollected >= prog.gemsTarget;
                const eDone = prog.enemiesDefeated >= prog.enemiesTarget;
                const bDone = prog.bossDefeated;

                tasksList.innerHTML = `
                    <div class="mission-item ${gDone ? 'done' : ''}"><span class="m-icon">💎</span> <span>Zafiros Glaciales: ${prog.gemsCollected}/${prog.gemsTarget}</span> <span>${gDone ? '✅' : '⏳'}</span></div>
                    <div class="mission-item ${eDone ? 'done' : ''}"><span class="m-icon">⚔️</span> <span>Ninjas Escarcha: ${prog.enemiesDefeated}/${prog.enemiesTarget}</span> <span>${eDone ? '✅' : '⏳'}</span></div>
                    <div class="mission-item ${bDone ? 'done' : ''}"><span class="m-icon">👹</span> <span>Gran Jefe Samurái: ${bDone ? 'Derrotado' : 'Pendiente'}</span> <span>${bDone ? '✅' : '⏳'}</span></div>
                `;
            }
        }

        // Comprobar si la misión está completa para activar el Portal
        const isComplete = storage.isMissionCompleted(worldId);
        const pill = document.getElementById('portal-status-pill');
        const text = document.getElementById('portal-status-text');

        if (isComplete) {
            if (!this.world.portal || !this.world.portal.isActive) {
                this.world.activatePortal();
                sounds.playPortalActivate();
                this.showBanner('¡PORTAL MÍSTICO ACTIVADO! ⛩️', '¡Cruza el portal para completar el mundo!');
            }
            if (pill) pill.classList.add('unlocked');
            if (text) text.textContent = '⚡ ¡PORTAL ABIERTO! CRUZA AQUÍ';
        } else {
            if (pill) pill.classList.remove('unlocked');
            if (text) text.textContent = '🔒 PORTAL SELLADO';
        }
    }

    handlePortalVictory() {
        if (this.portalVictoryTriggered) return;
        this.portalVictoryTriggered = true;

        const currentWorld = this.world.currentMapId;
        const cfg = MAPS_CONFIG[currentWorld];

        // Guardar progreso y recompensas
        storage.completeWorld(currentWorld);
        storage.addCoins(100);
        storage.addXP(150);
        sounds.playVictoryFanfare();

        // Mostrar Modal de Victoria
        const modal = document.getElementById('level-clear-modal');
        const titleEl = document.getElementById('victory-world-title');
        const nextBtn = document.getElementById('btn-next-world');

        if (titleEl) titleEl.textContent = cfg.name.toUpperCase();
        if (nextBtn) {
            if (currentWorld === 'forest') {
                nextBtn.textContent = 'CONTINUAR AL MUNDO 2: TEMPLO DEL VOLCÁN ➔';
            } else if (currentWorld === 'volcano') {
                nextBtn.textContent = 'CONTINUAR AL MUNDO 3: CUMBRES HELADAS ➔';
            } else {
                nextBtn.textContent = '¡VICTORIA TOTAL! REPETIR AVENTURA 🏆';
            }
        }

        if (modal) modal.classList.add('open');
        this.updateHUD();
    }

    // =========================================================================
    // UI Y ENLACE DE EVENTOS
    // =========================================================================
    showCombo(comboIndex) {
        const comboEl = document.getElementById('combo-display');
        if (!comboEl) return;
        const text = comboIndex === 2 ? '¡CORTE GIRATORIO x3!' : (comboIndex === 1 ? '¡GOLPE CRÍTICO x2!' : '¡IMPACTO!');
        comboEl.textContent = text;
        comboEl.classList.remove('active');
        void comboEl.offsetWidth;
        comboEl.classList.add('active');

        clearTimeout(this.comboTimeout);
        this.comboTimeout = setTimeout(() => {
            comboEl.classList.remove('active');
        }, 1100);
    }

    showBanner(title, subtitle) {
        const banner = document.getElementById('banner-notification');
        if (!banner) return;
        const tEl = document.getElementById('banner-title');
        const sEl = document.getElementById('banner-subtitle');
        if (tEl) tEl.textContent = title;
        if (sEl) sEl.textContent = subtitle;

        banner.classList.remove('show');
        void banner.offsetWidth;
        banner.classList.add('show');
    }

    setupUI() {
        const slots = document.querySelectorAll('.hotbar-slot');
        slots.forEach((slot, index) => {
            slot.addEventListener('click', () => {
                this.selectWeaponSlot(index);
            });
        });

        window.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '5') {
                const slotIndex = parseInt(e.key) - 1;
                this.selectWeaponSlot(slotIndex);
            }
            if (e.key === 't' || e.key === 'T') {
                this.toggleShop();
            }
            if (e.key === 'Escape') {
                this.closeShop();
                this.closeMaps();
            }
        });

        document.getElementById('btn-open-shop').addEventListener('click', () => this.toggleShop());
        document.getElementById('btn-close-shop').addEventListener('click', () => this.closeShop());

        const btnMaps = document.getElementById('btn-open-maps');
        if (btnMaps) btnMaps.addEventListener('click', () => this.toggleMaps());
        const btnCloseMaps = document.getElementById('btn-close-maps');
        if (btnCloseMaps) btnCloseMaps.addEventListener('click', () => this.closeMaps());

        // Botón del Modal de Victoria (Nivel Superado)
        const btnNextWorld = document.getElementById('btn-next-world');
        if (btnNextWorld) {
            btnNextWorld.addEventListener('click', () => {
                const modal = document.getElementById('level-clear-modal');
                if (modal) modal.classList.remove('open');
                this.portalVictoryTriggered = false;

                const curr = this.world.currentMapId;
                if (curr === 'forest') {
                    this.switchMap('volcano');
                } else if (curr === 'volcano') {
                    this.switchMap('snow');
                } else {
                    this.switchMap('forest');
                }
            });
        }

        this.setupMapSelector();
        this.setupPWAInstall();

        document.getElementById('btn-spawn-boss').addEventListener('click', () => {
            this.enemyManager.spawnBoss(new THREE.Vector3(0, 0, -2));
            this.showBanner('¡EL GRAN JEFE HA APARECIDO! 👹', '¡Derrótalo para ganar 160 monedas doradas!');
        });

        const soundBtn = document.getElementById('btn-toggle-sound');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                sounds.enabled = !sounds.enabled;
                document.getElementById('sound-icon').textContent = sounds.enabled ? '🔊' : '🔇';
            });
        }

        const touchBtn = document.getElementById('btn-toggle-touch');
        if (touchBtn) {
            touchBtn.addEventListener('click', () => {
                const tc = document.getElementById('mobile-touch-controls');
                if (tc) {
                    const isVisible = window.getComputedStyle(tc).display !== 'none';
                    tc.style.display = isVisible ? 'none' : 'block';
                    document.body.classList.toggle('touch-enabled', !isVisible);
                    document.body.classList.toggle('touch-active', !isVisible);
                }
            });
        }

        this.renderShopItems();

        // Multijugador
        let selectedColor = 0x1e293b;
        const nameInput = document.getElementById('input-ninja-name');
        const colorPalette = document.getElementById('color-palette');
        if (colorPalette) {
            const colorDots = colorPalette.querySelectorAll('.color-dot');
            colorDots.forEach(dot => {
                dot.addEventListener('click', () => {
                    colorDots.forEach(d => d.classList.remove('active'));
                    dot.classList.add('active');
                    selectedColor = parseInt(dot.getAttribute('data-color'), 16) || parseInt(dot.getAttribute('data-color'));
                    this.player.setSuitColor(selectedColor);
                });
            });
        }

        if (nameInput) {
            nameInput.addEventListener('input', () => {
                const cleanName = (nameInput.value || 'Ninja').trim();
                const nameDisplay = document.querySelector('.player-name');
                if (nameDisplay) nameDisplay.textContent = cleanName;
            });
        }

        const startCombatNow = () => {
            document.getElementById('multiplayer-modal').classList.remove('open');
            this.showBanner('¡DOJO NINJA LISTO! 🥷', '¡Usa el joystick y los botones para combatir!');
            document.body.classList.add('touch-enabled', 'touch-active');
            const tc = document.getElementById('mobile-touch-controls');
            if (tc) tc.style.display = 'block';
        };

        const btnSolo = document.getElementById('btn-start-solo');
        if (btnSolo) btnSolo.addEventListener('click', startCombatNow);

        const btnQuick = document.getElementById('btn-quick-start');
        if (btnQuick) btnQuick.addEventListener('click', startCombatNow);

        const btnCreate = document.getElementById('btn-create-room');
        if (btnCreate) {
            btnCreate.addEventListener('click', () => {
                const name = (nameInput ? nameInput.value : 'Ninja Pro').trim();
                this.multiplayer.createRoom(name, selectedColor);
            });
        }

        const btnGotoJoin = document.getElementById('btn-goto-join');
        if (btnGotoJoin) {
            btnGotoJoin.addEventListener('click', () => {
                document.getElementById('lobby-modes-view').style.display = 'none';
                document.getElementById('lobby-join-view').style.display = 'block';
            });
        }

        const btnBack = document.getElementById('btn-back-to-modes');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                document.getElementById('lobby-join-view').style.display = 'none';
                document.getElementById('lobby-modes-view').style.display = 'block';
            });
        }

        const btnConfirmJoin = document.getElementById('btn-confirm-join');
        if (btnConfirmJoin) {
            btnConfirmJoin.addEventListener('click', () => {
                const codeInput = document.getElementById('input-join-room-code');
                const roomCode = codeInput ? codeInput.value.trim().toUpperCase() : '';
                const name = (nameInput ? nameInput.value : 'Ninja Pro').trim();
                if (roomCode) {
                    this.multiplayer.joinRoom(roomCode, name, selectedColor);
                }
            });
        }

        const btnCopyLobby = document.getElementById('btn-copy-lobby-code');
        if (btnCopyLobby) {
            btnCopyLobby.addEventListener('click', () => {
                if (this.multiplayer.roomCode) {
                    navigator.clipboard.writeText(this.multiplayer.roomCode).then(() => {
                        btnCopyLobby.textContent = '✅ ¡Copiado!';
                        setTimeout(() => btnCopyLobby.textContent = '📋 Copiar Código', 2000);
                    });
                }
            });
        }

        const btnCopyHud = document.getElementById('btn-copy-hud-code');
        if (btnCopyHud) {
            btnCopyHud.addEventListener('click', () => {
                if (this.multiplayer.roomCode) {
                    navigator.clipboard.writeText(this.multiplayer.roomCode).then(() => {
                        btnCopyHud.textContent = '✅';
                        setTimeout(() => btnCopyHud.textContent = '📋 Copiar', 2000);
                    });
                }
            });
        }

        const btnStartPlaying = document.getElementById('btn-start-playing-room');
        if (btnStartPlaying) btnStartPlaying.addEventListener('click', startCombatNow);

        const btnOpenLobby = document.getElementById('btn-open-multiplayer');
        if (btnOpenLobby) {
            btnOpenLobby.addEventListener('click', () => {
                document.getElementById('multiplayer-modal').classList.add('open');
            });
        }

        const btnCloseLobby = document.getElementById('btn-close-lobby');
        if (btnCloseLobby) {
            btnCloseLobby.addEventListener('click', () => {
                document.getElementById('multiplayer-modal').classList.remove('open');
            });
        }

        this.multiplayer.onRoomCreated = (code) => {
            document.getElementById('lobby-modes-view').style.display = 'none';
            document.getElementById('lobby-created-view').style.display = 'block';
            document.getElementById('room-code-display').textContent = code;
            document.getElementById('hud-room-code').textContent = code;
            document.getElementById('hud-room-badge').style.display = 'inline-flex';
            this.showBanner('¡SALA PRIVADA CREADA! 🏠', `Código de acceso: ${code}`);
        };

        this.multiplayer.onPlayerJoined = (players) => {
            this.updateLobbyPlayersList(players);
        };
    }

    updateLobbyPlayersList(players) {
        const container = document.getElementById('lobby-players-list');
        if (!container) return;
        container.innerHTML = '';
        players.forEach(p => {
            const chip = document.createElement('div');
            chip.className = 'player-chip';
            const colorHex = typeof p.color === 'number' ? `#${p.color.toString(16).padStart(6, '0')}` : p.color;
            chip.innerHTML = `<span class="player-chip-color" style="background: ${colorHex};"></span><span>${p.name} ${p.isHost ? '👑' : ''}</span>`;
            container.appendChild(chip);
        });
    }

    cycleWeaponSlot() {
        const hotbar = storage.data.hotbar;
        let nextSlot = (storage.data.currentSlot + 1) % hotbar.length;
        let attempts = 0;
        while (!hotbar[nextSlot] && attempts < hotbar.length) {
            nextSlot = (nextSlot + 1) % hotbar.length;
            attempts++;
        }
        if (hotbar[nextSlot]) {
            this.selectWeaponSlot(nextSlot);
        }
    }

    selectWeaponSlot(index) {
        const weaponId = storage.data.hotbar[index];
        if (weaponId) {
            storage.setCurrentSlot(index);
            this.player.equipWeapon(weaponId);
            this.updateHotbarVisuals();
            if (this.touchControls && WEAPONS[weaponId]) {
                this.touchControls.updateWeaponIcon(WEAPONS[weaponId].icon);
            }
            sounds.playSlash('wood');
        }
    }

    updateHotbarVisuals() {
        const slots = document.querySelectorAll('.hotbar-slot');
        slots.forEach((slot, index) => {
            const weaponId = storage.data.hotbar[index];
            const iconEl = slot.querySelector('.slot-icon');
            const nameEl = slot.querySelector('.slot-name');

            if (weaponId && WEAPONS[weaponId]) {
                const w = WEAPONS[weaponId];
                iconEl.textContent = w.icon;
                nameEl.textContent = w.name.split(' ')[0];
            } else {
                iconEl.textContent = '➕';
                nameEl.textContent = 'Vacío';
            }

            if (index === storage.data.currentSlot) {
                slot.classList.add('active');
            } else {
                slot.classList.remove('active');
            }
        });
    }

    renderShopItems() {
        const grid = document.getElementById('shop-items-grid');
        if (!grid) return;
        grid.innerHTML = '';

        Object.values(WEAPONS).forEach(weapon => {
            const isUnlocked = storage.isUnlocked(weapon.id);
            const isEquipped = storage.getActiveWeaponId() === weapon.id;
            const canAfford = storage.data.coins >= weapon.cost;

            const card = document.createElement('div');
            card.className = `shop-item-card ${isEquipped ? 'equipped' : ''}`;

            card.innerHTML = `
                <div class="shop-item-icon">${weapon.icon}</div>
                <div class="shop-item-name">${weapon.name}</div>
                <div class="shop-item-desc">${weapon.description}</div>
                <div class="shop-item-stats">
                    <span>⚔️ Daño: ${weapon.damage}</span>
                    <span>⚡ Vel: ${weapon.attackSpeed}s</span>
                </div>
                <button class="btn-buy ${isEquipped ? 'equipped' : (isUnlocked ? 'equip-now' : (canAfford ? 'can-buy' : 'disabled'))}" 
                        data-weapon-id="${weapon.id}">
                    ${isEquipped ? '✓ EQUIPADA' : (isUnlocked ? 'EQUIPAR' : `🪙 ${weapon.cost}`)}
                </button>
            `;

            const btn = card.querySelector('.btn-buy');
            btn.addEventListener('click', () => this.handleWeaponAction(weapon.id));

            grid.appendChild(card);
        });
    }

    handleWeaponAction(weaponId) {
        const weapon = WEAPONS[weaponId];
        const isUnlocked = storage.isUnlocked(weaponId);

        if (isUnlocked) {
            storage.setHotbarSlot(storage.data.currentSlot, weaponId);
            this.player.equipWeapon(weaponId);
            sounds.playSlash(weapon.element);
            this.updateHotbarVisuals();
            this.renderShopItems();
        } else if (storage.spendCoins(weapon.cost)) {
            sounds.playShopBuy();
            storage.unlockWeapon(weaponId);
            this.player.equipWeapon(weaponId);
            this.updateHUD();
            this.updateHotbarVisuals();
            this.renderShopItems();
            this.showBanner(`¡NUEVA ARMA DESBLOQUEADA! 🎉`, `Has obtenido: ${weapon.name}`);
        }
    }

    toggleShop() {
        const modal = document.getElementById('shop-modal');
        if (modal.classList.contains('open')) {
            this.closeShop();
        } else {
            this.renderShopItems();
            modal.classList.add('open');
        }
    }

    closeShop() {
        document.getElementById('shop-modal').classList.remove('open');
    }

    toggleMaps() {
        const modal = document.getElementById('maps-modal');
        if (!modal) return;
        if (modal.classList.contains('open')) {
            this.closeMaps();
        } else {
            this.updateMapCardsUI();
            modal.classList.add('open');
        }
    }

    closeMaps() {
        const modal = document.getElementById('maps-modal');
        if (modal) modal.classList.remove('open');
    }

    setupMapSelector() {
        const cards = document.querySelectorAll('.map-card');
        cards.forEach(card => {
            const mapId = card.getAttribute('data-map');
            const selectBtn = card.querySelector('.btn-select-map');

            const handleSelect = () => {
                if (this.world.currentMapId === mapId) return;
                if (!storage.isWorldUnlocked(mapId)) {
                    this.showBanner('🔒 MUNDO BLOQUEADO', 'Completa la misión del mundo anterior para entrar');
                    return;
                }
                this.switchMap(mapId);
            };

            if (selectBtn) {
                selectBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleSelect();
                });
            }
            card.addEventListener('click', handleSelect);
        });
    }

    updateMapCardsUI() {
        const cards = document.querySelectorAll('.map-card');
        cards.forEach(c => {
            const cMap = c.getAttribute('data-map');
            const btn = c.querySelector('.btn-select-map');
            const isUnlocked = storage.isWorldUnlocked(cMap);

            if (!isUnlocked) {
                c.classList.add('locked');
                c.classList.remove('active');
                if (btn) btn.textContent = '🔒 BLOQUEADO';
            } else if (cMap === this.world.currentMapId) {
                c.classList.remove('locked');
                c.classList.add('active');
                if (btn) btn.textContent = '✓ EN JUEGO';
            } else {
                c.classList.remove('locked', 'active');
                if (btn) {
                    const icon = cMap === 'volcano' ? '🌋' : (cMap === 'snow' ? '❄️' : '🌸');
                    btn.textContent = `VIAJAR AHORA ${icon}`;
                }
            }
        });
    }

    switchMap(mapId) {
        if (!MAPS_CONFIG[mapId]) return;
        if (!storage.isWorldUnlocked(mapId)) {
            this.showBanner('🔒 MUNDO BLOQUEADO', 'Completa la misión anterior para desbloquearlo');
            return;
        }

        this.portalVictoryTriggered = false;
        this.world.setMap(mapId);
        this.enemyManager.spawnInitialEnemies(mapId);

        // Reposicionar al ninja
        this.player.mesh.position.set(0, 1.2, 0);
        this.player.velocity.set(0, 0, 0);

        this.updateMapCardsUI();
        this.updateMissionHUD();

        sounds.playSlash('heavy');
        this.showBanner('¡NUEVO MUNDO NINJA! 🗺️', MAPS_CONFIG[mapId].name);
        this.closeMaps();
    }

    setupPWAInstall() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(reg => console.log('PWA ServiceWorker activo:', reg.scope))
                    .catch(err => console.log('Error PWA ServiceWorker:', err));
            });
        }

        const installBtn = document.getElementById('btn-pwa-install-action');
        const laterBtn = document.getElementById('btn-pwa-close-action');
        const iosGuide = document.getElementById('pwa-ios-guide');

        let deferredPrompt = null;
        const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase()) && !window.MSStream;
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            window.deferredPwaPrompt = e;

            const hasSeenPrompt = localStorage.getItem('ninja_pwa_prompt_v6');
            if (!hasSeenPrompt && (this.isMobile || window.innerWidth <= 900)) {
                setTimeout(() => {
                    this.openPwaModal();
                }, 1600);
            }
        });

        if (isIOS && !isStandalone) {
            const hasSeenPrompt = localStorage.getItem('ninja_pwa_prompt_v6');
            if (!hasSeenPrompt) {
                setTimeout(() => {
                    if (iosGuide) iosGuide.style.display = 'block';
                    this.openPwaModal();
                }, 2000);
            }
        }

        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    if (outcome === 'accepted') {
                        localStorage.setItem('ninja_pwa_prompt_v6', 'true');
                        this.closePwaModal();
                    }
                    deferredPrompt = null;
                } else if (isIOS) {
                    if (iosGuide) iosGuide.style.display = 'block';
                } else {
                    alert('Para instalar: abre el menú (⋮) de tu navegador en el celular y selecciona "Agregar a pantalla principal"');
                    this.closePwaModal();
                }
            });
        }

        if (laterBtn) {
            laterBtn.addEventListener('click', () => {
                localStorage.setItem('ninja_pwa_prompt_v6', 'true');
                this.closePwaModal();
            });
        }
    }

    openPwaModal() {
        const m = document.getElementById('pwa-install-modal');
        if (m) m.classList.add('open');
    }

    closePwaModal() {
        const m = document.getElementById('pwa-install-modal');
        if (m) m.classList.remove('open');
    }

    updateHUD() {
        const healthPercent = Math.max(0, (this.player.health / this.player.maxHealth) * 100);
        document.getElementById('player-health-fill').style.width = `${healthPercent}%`;
        document.getElementById('player-health-text').textContent = `${Math.ceil(this.player.health)} / ${this.player.maxHealth}`;

        const coinEl = document.getElementById('coin-count');
        coinEl.textContent = storage.data.coins;

        document.getElementById('player-level-badge').textContent = `NVL ${storage.data.level}`;
        const xpPercent = Math.min(100, (storage.data.xp / storage.data.xpToNext) * 100);
        document.getElementById('player-xp-fill').style.width = `${xpPercent}%`;

        this.updateHotbarVisuals();

        const activeWeaponId = storage.getActiveWeaponId();
        if (this.touchControls && WEAPONS[activeWeaponId]) {
            this.touchControls.updateWeaponIcon(WEAPONS[activeWeaponId].icon);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        const dpr = window.devicePixelRatio || 1;
        this.renderer.setPixelRatio(Math.min(dpr, 2.0));
    }

    animate() {
        requestAnimationFrame(this.animate);

        const delta = Math.min(this.clock.getDelta(), 0.1);

        // 1. Actualizar jugador
        this.player.update(delta);

        // 2. Actualizar mundo (lava, agua, nieve, rotaciones)
        this.world.update(delta);

        // 3. Comprobar trampolines
        this.world.checkTrampolines(this.player);
        this.world.checkTrampolinesForEnemies(this.enemyManager.enemies);

        // 4. Comprobar monedas flotantes
        this.world.checkFloatingCoins(this.player.mesh.position, (coins) => {
            storage.addCoins(coins);
            sounds.playCoin();
            this.updateHUD();
        });

        // 5. Comprobar gemas sagradas de misión
        this.world.checkMissionGems(this.player.mesh.position, (gemId, pos) => {
            this.handleGemCollected(gemId, pos);
        });

        // 6. Comprobar entrada al Portal Místico (Victoria de Mundo)
        if (!this.portalVictoryTriggered && this.world.checkPortalEntry(this.player.mesh.position)) {
            this.handlePortalVictory();
        }

        // 7. Actualizar enemigos con IA táctica
        this.enemyManager.update(delta, this.player, this.camera);

        // 8. Actualizar partículas y monedas
        this.particles.update(delta, this.player.mesh.position, (coins) => {
            storage.addCoins(coins);
            this.updateHUD();
        });

        // 9. Colisiones de shurikens con enemigos, cajas y tótems
        for (const proj of this.particles.projectiles) {
            if (!proj.active) continue;

            // Con enemigos
            for (const enemy of this.enemyManager.enemies) {
                const dist = proj.mesh.position.distanceTo(enemy.mesh.position.clone().add(new THREE.Vector3(0, 1.2, 0)));
                if (dist < 1.4) {
                    proj.active = false;
                    const isCrit = Math.random() < 0.2;
                    this.enemyManager.damageEnemy(enemy, proj.damage, isCrit, proj.velocity.clone().normalize(), (def) => {
                        this.handleEnemyDefeated(def);
                    });
                    break;
                }
            }

            // Con cajas
            this.world.checkCrateHits(proj.mesh.position, 1.2, (crate) => {
                proj.active = false;
                this.handleCrateBroken(crate);
            });
        }

        // 10. Actualizar estelas de sombra ninja durante el dash
        for (let i = this.shadowClones.length - 1; i >= 0; i--) {
            const sc = this.shadowClones[i];
            sc.life -= delta;
            sc.mat.opacity = Math.max(0, (sc.life / sc.maxLife) * 0.45);
            if (sc.life <= 0) {
                this.scene.remove(sc.mesh);
                sc.mat.dispose();
                this.shadowClones.splice(i, 1);
            }
        }

        // 11. Actualizar números de daño flotantes animados
        for (let i = this.damagePopups.length - 1; i >= 0; i--) {
            const pop = this.damagePopups[i];
            pop.life -= delta;
            pop.sprite.position.y += pop.vy * delta;
            const progress = pop.life / pop.maxLife;
            pop.mat.opacity = Math.min(1.0, progress * 1.5);
            if (pop.life <= 0) {
                this.scene.remove(pop.sprite);
                pop.mat.dispose();
                pop.texture.dispose();
                this.damagePopups.splice(i, 1);
            }
        }

        // 12. Multijugador
        this.multiplayer.update(delta);
        this.multiplayer.sendLocalUpdate(this.player.getNetworkState());

        const healthPercent = Math.max(0, (this.player.health / this.player.maxHealth) * 100);
        document.getElementById('player-health-fill').style.width = `${healthPercent}%`;
        document.getElementById('player-health-text').textContent = `${Math.ceil(this.player.health)} / ${this.player.maxHealth}`;

        // 13. Micro-sacudida de pantalla (Screen Shake por impacto)
        if (this.screenShakeDuration > 0) {
            this.screenShakeDuration -= delta;
            const shakeX = (Math.random() - 0.5) * this.screenShakeIntensity;
            const shakeY = (Math.random() - 0.5) * this.screenShakeIntensity;
            this.camera.position.x += shakeX;
            this.camera.position.y += shakeY;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
