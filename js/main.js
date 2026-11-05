// js/main.js - Bucle Principal del Juego, Combate, Progresión de Mundos con Misiones y Renderizado HD
import * as THREE from 'three';
import { sounds } from './sound.js?v=20.0';
import { storage, clearAllCookies } from './storage.js?v=20.0';
import { WEAPONS } from './weapons.js?v=20.0';
import { ParticleSystem } from './particles.js?v=20.0';
import { World, MAPS_CONFIG } from './world.js?v=20.0';
import { Player } from './player.js?v=20.0';
import { EnemyManager } from './enemies.js?v=20.0';
import { MultiplayerManager } from './multiplayer.js?v=20.0';
import { TouchControlsManager } from './touch.js?v=20.0';
import { CHARACTERS_DATA } from './characters.js?v=20.0';
import { CAMPAIGN_WORLDS } from './campaign.js?v=20.0';
import { LevelManager } from './core/levelManager.js?v=20.0';
import { resourceManager } from './core/resourceManager.js?v=20.0';
import { PerformanceMonitor, GRAPHIC_PROFILES } from './systems/performanceMonitor.js?v=20.0';

// Limpieza automática de cookies al iniciar el juego
clearAllCookies();

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.clock = new THREE.Clock();
        this.portalVictoryTriggered = false;

        // Estado del juego: Inicia en el Menú Principal (experiencia comercial)
        this.state = 'MENU'; // 'MENU' | 'PLAYING'
        this.alivePlayers = 50;
        this.killCount = 0;
        this.safeZoneRadius = 75;
        this.battleRoyaleTimer = 0;
        this.menuOrbitAngle = 0;

        // Variables de Modo Campaña: 10 Mundos de Colombia
        this.isCampaignMode = false;
        this.campaignCurrentWorld = 1;
        this.campaignCurrentLevel = 1;
        this.campaignIsBossFight = false;
        this.campaignCollectedGems = 0;
        this.campaignStartTime = 0;

        // 1. Inicializar Three.js con antialiasing y nitidez HD
        this.setupRenderer();
        this.setupSceneAndLights();
        this.perfMonitor = new PerformanceMonitor(this.renderer, this.scene, this.isMobile);

        // 2. Inicializar subsistemas
        this.particles = new ParticleSystem(this.scene);
        this.particles.perfMonitor = this.perfMonitor;
        this.world = new World(this.scene);
        this.player = new Player(this.scene, this.camera, this.renderer.domElement);
        this.enemyManager = new EnemyManager(this.scene, this.particles);
        this.multiplayer = new MultiplayerManager(this.scene, this.particles);
        this.levelManager = new LevelManager(this);

        // Controles táctiles móviles adaptables
        this.touchControls = new TouchControlsManager(this.player, this);
        this.touchControls.setLeftHanded(storage.getSetting('leftHanded', false));
        this.touchControls.setButtonSize(storage.getSetting('buttonSize', 'normal'));

        // Accesibilidad: Alto contraste inicial
        if (storage.getSetting('highContrast', false)) {
            document.body.classList.add('high-contrast-mode');
        }

        // Perfil de rendimiento gráfico inicial
        const initialGfx = storage.getSetting('graphicsProfile', this.isMobile ? 'MEDIUM' : 'HIGH');
        if (this.perfMonitor) {
            this.perfMonitor.applyProfile(initialGfx, this.renderer, this.scene);
        }

        // Conectar proveedores de física y mecánicas ninja 2.5D
        if (this.player) {
            this.player.groundCheckProvider = (x, y, z) => this.world.getGroundHeightAt(x, y, z);
            this.player.wallCheckProvider = (x, y, z, facing) => this.world.checkWallAt(x, y, z, facing);
            this.player.lianaCheckProvider = (x, y, z) => this.world.checkLianaAt(x, y, z);
            this.player.onGroundSlamImpact = (pos, weaponId) => this.handleGroundSlamImpact(pos, weaponId);
            this.player.onAirDashCallback = (pos, facing, weaponId) => this.handleAirDashTrail(pos, facing, weaponId);
            this.player.onWallSlideCallback = (pos, facing) => this.handleWallSlideSparks(pos, facing);
            this.player.onAttackCallback = (weaponId, combo, target, isAir) => this.handlePlayerAttack(weaponId, combo, target, isAir);
            this.player.onSpinAttackCallback = () => this.handlePlayerSpinAttack();
            this.player.onSpecialSkillCallback = (charId, skill) => this.handleSpecialSkillVisuals(charId, skill);
            this.player.onDamageTaken = (dmg) => {
                this.playerDamageTakenThisLevel = (this.playerDamageTakenThisLevel || 0) + dmg;
            };
        }
        if (this.enemyManager) this.enemyManager.groundCheckProvider = (x, y, z) => this.world.getGroundHeightAt(x, y, z);

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

        // Respuesta táctil y visual suave de salto y aterrizaje (sin screen shake brusco)
        this.player.onJumpCallback = (pos) => {
            if (this.particles && this.particles.createSmokePoof) this.particles.createSmokePoof(pos, 0.5);
        };
        this.player.onLandCallback = (pos) => {
            if (this.particles && this.particles.createSmokePoof) this.particles.createSmokePoof(pos, 0.65);
            if (sounds && sounds.playStep) sounds.playStep();
        };

        // Sistemas de Game Juice (Screen Shake, Hit-Stop & Números de Daño Flotantes)
        this.screenShakeIntensity = 0;
        this.screenShakeDuration = 0;
        this.hitStopDuration = 0;
        this.slowMoDuration = 0;
        this.damagePopups = [];

        // Callbacks de Combate Ninja Técnico 2.5D
        this.player.onParrySuccessCallback = (contactPos, attacker) => {
            this.particles.createParrySparks(contactPos);
            this.triggerScreenShake(0.28, 0.14);
            this.hitStopDuration = 0.08;
            this.spawnDamagePopup(contactPos.clone().add(new THREE.Vector3(0, 0.5, 0)), '⚡ ¡PERFECT PARRY!', true);
            this.showBanner('¡PERFECT PARRY! 🛡️⚡', '¡Enemigo desestabilizado y vulnerable a contragolpe x2.5!');
        };

        this.player.onDodgeCallback = (pos) => {
            this.particles.createDodgeDust(pos);
        };

        this.player.onShurikenCallback = (spawnPos, dir) => {
            const activeWeapon = WEAPONS[storage.getActiveWeaponId()] || WEAPONS.bokken;
            this.particles.spawnShurikenProjectile(spawnPos, dir, Math.round(activeWeapon.damage * 0.9), activeWeapon.element || 'metal');
        };

        // 3. Inicializar Interfaz de Usuario, Menú y Misiones
        this.setupUI();
        this.updateHUD();
        this.updateMissionHUD();
        this.updateHeroShowcaseCard();
        this.renderCharactersGrid();
        this.renderNinjaPass();
        this.renderSkinsGrid();
        this.updateMenuModeDisplay();

        // 4. Iniciar bucle de animación
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);

        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupRenderer() {
        this.isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 900);
        this.isContextLost = false;

        // Recuperación y protección ante pérdida de contexto WebGL en celulares
        this.canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            console.warn('[WebGL] Context lost. Suspending render loop to avoid mobile crash...');
            this.isContextLost = true;
        }, false);
        this.canvas.addEventListener('webglcontextrestored', () => {
            console.log('[WebGL] Context restored.');
            this.isContextLost = false;
        }, false);

        // Renderizado optimizado: en móvil evita antialias 4x para no desbordar VRAM, usa mediump y DPR calibrado
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: !this.isMobile,
            powerPreference: 'high-performance',
            precision: this.isMobile ? 'mediump' : 'highp'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        const dpr = window.devicePixelRatio || 1;
        this.renderer.setPixelRatio(Math.min(dpr, this.isMobile ? 1.5 : 2.0));

        // Espacio de color sRGB y mapeo de tonos cinematográfico (Colores tropicales vivos estilo Pixar)
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.22;

        // Sombras suaves PCF activas en todas las plataformas
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x38bdf8);
        this.scene.fog = new THREE.FogExp2(0x38bdf8, 0.011);

        this.camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 180);
        this.camera.position.set(0, 3.8, 7.5);
    }

    setupSceneAndLights() {
        const ambientLight = new THREE.AmbientLight(0xfff8ee, 0.72);
        this.scene.add(ambientLight);

        // Luz del sol tropical colombiano con sombras calibradas (1024 en celular para evitar Out of Memory)
        const sunLight = new THREE.DirectionalLight(0xfffaed, 1.6);
        sunLight.position.set(28, 48, 24);
        sunLight.castShadow = true;
        const shadowRes = this.isMobile ? 1024 : 2048;
        sunLight.shadow.mapSize.width = shadowRes;
        sunLight.shadow.mapSize.height = shadowRes;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 145;

        const d = 48;
        sunLight.shadow.camera.left = -d;
        sunLight.shadow.camera.right = d;
        sunLight.shadow.camera.top = d;
        sunLight.shadow.camera.bottom = -d;
        sunLight.shadow.bias = -0.0003;
        sunLight.shadow.normalBias = 0.02;
        sunLight.shadow.radius = 1.8;
        this.sunLight = sunLight;
        this.scene.add(sunLight);

        // Luz hemisférica: cielo azul celeste y rebote de hierba verde esmeralda
        const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x22c55e, 0.78);
        this.scene.add(hemiLight);

        // Luz de borde (Rim Light) activa durante el juego para destacar las siluetas de los personajes
        const arenaRimLight = new THREE.DirectionalLight(0x60a5fa, 1.25);
        arenaRimLight.position.set(-22, 26, -22);
        this.scene.add(arenaRimLight);

        // Luces frontales de estudio para el Menú Principal (destacan al héroe con tonos cálidos y brillo 3D)
        this.menuKeyLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
        this.menuKeyLight.position.set(0.6, 2.8, 4.2);
        this.scene.add(this.menuKeyLight);

        this.menuRimLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
        this.menuRimLight.position.set(-2.2, 2.5, -1.8);
        this.scene.add(this.menuRimLight);
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
        if (this.damagePopups.length > (this.isMobile ? 6 : 14)) return;

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
        const factor = (typeof storage !== 'undefined' && storage.getSetting) ? storage.getSetting('screenShakeIntensity', 1.0) : 1.0;
        this.screenShakeIntensity = intensity * factor;
        this.screenShakeDuration = duration;
    }

    // =========================================================================
    // =========================================================================
    // COMBATE DEL JUGADOR CON AUTO-APUNTADO Y COMBOS FLUIDOS (TERRESTRE Y AÉREO)
    // =========================================================================
    handlePlayerAttack(weaponId, combo, target, isAir = false) {
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
        this.particles.createSlashEffect(slashPos, forward, weapon.element, combo);
        this.multiplayer.sendAttack(weaponId, combo, forward);

        let hitCount = 0;
        const range = weapon.range;

        // Bonificación de daño progresivo en combos 1-2-3 (Combos aéreos tienen multiplicador extra)
        const comboMultipliers = isAir ? [1.15, 1.45, 2.1] : [1.0, 1.25, 1.75];
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

                    // Si es el 3er golpe del combo aéreo, remata hacia abajo (Spike Finisher)
                    if (isAir && combo === 2) {
                        toEnemy.y = -0.75;
                        toEnemy.normalize();
                    }

                    this.enemyManager.damageEnemy(enemy, damage, isCrit, toEnemy, (defeatedEnemy) => {
                        this.handleEnemyDefeated(defeatedEnemy);
                    });

                    // Game Juice
                    this.triggerScreenShake(isCrit ? 0.32 : 0.16, isAir ? 0.15 : 0.12);
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
            // Hit-Stop táctil de impacto
            this.hitStopDuration = isAir ? 0.055 : 0.042;
        }
    }

    handleGroundSlamImpact(pos, weaponId) {
        const weapon = WEAPONS[weaponId] || WEAPONS.bokken;
        const elemColors = {
            wood: 0x10b981,
            steel: 0x0284c7,
            gold: 0xf59e0b,
            fire: 0xf97316,
            thunder: 0x6366f1,
            light: 0xd946ef
        };
        const color = elemColors[weapon.element] || 0xf59e0b;

        // 1. Onda de choque expansiva sónica
        this.particles.createShockwave(pos, color, 10.5);

        // 2. Chispas de impacto y humo sísmico
        this.particles.createHitSparks(pos, true);
        this.particles.createSmokePoof(pos, 1.8);

        // 3. Screen shake masivo
        this.triggerScreenShake(0.42, 0.22);
        this.hitStopDuration = 0.08;
        sounds.playSlash('heavy');

        // 4. Daño de área sísmico a enemigos cercanos
        const slamRadius = 6.2;
        const slamDamage = Math.round(weapon.damage * 2.2 + (storage.data.level - 1) * 4);

        this.enemyManager.enemies.forEach(enemy => {
            const dist = pos.distanceTo(enemy.mesh.position);
            if (dist <= slamRadius) {
                const knockDir = new THREE.Vector3().subVectors(enemy.mesh.position, pos).normalize();
                knockDir.y = 0.65;
                knockDir.normalize();

                this.enemyManager.damageEnemy(enemy, slamDamage, true, knockDir, (defeated) => {
                    this.handleEnemyDefeated(defeated);
                });
                this.spawnDamagePopup(enemy.mesh.position.clone().add(new THREE.Vector3(0, 1.4, 0)), slamDamage, true);
            }
        });

        // 5. Destrucción de cajas y obstáculos en el radio del impacto
        this.world.checkCrateHits(pos, slamRadius, (crate) => {
            this.handleCrateBroken(crate);
            this.spawnDamagePopup(crate.mesh.position.clone().add(new THREE.Vector3(0, 0.8, 0)), 60, true);
        });

        this.world.checkTotemHits(pos, slamRadius, (totem) => {
            this.handleTotemDestroyed(totem);
            this.spawnDamagePopup(totem.mesh.position.clone().add(new THREE.Vector3(0, 1.5, 0)), 80, true);
        });
    }

    handleAirDashTrail(pos, facing, weaponId) {
        this.particles.createDodgeDust(pos);
        this.particles.createHitSparks(pos, false);
        this.triggerScreenShake(0.12, 0.08);
    }

    handleWallSlideSparks(pos, facing) {
        // Chispas de fricción leves en la pared
        if (Math.random() < 0.35) {
            this.particles.createHitSparks(pos, false);
        }
    }

    // Ataque de Giro Ninja 360° estilo Crash Bandicoot
    handlePlayerSpinAttack() {
        const playerPos = this.player.mesh.position;
        const spinRadius = 3.6;

        this.particles.createSlashEffect(playerPos.clone().add(new THREE.Vector3(0, 1.2, 0)), new THREE.Vector3(1, 0, 0), 'light', 2);
        this.particles.createSlashEffect(playerPos.clone().add(new THREE.Vector3(0, 1.2, 0)), new THREE.Vector3(-1, 0, 0), 'light', 2);

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
            // Hit-Stop táctil de impacto
            this.hitStopDuration = 0.045;
        }
    }

    triggerSlowMoFinisher(victim) {
        this.slowMoDuration = 1.15;
        sounds.playSlowMoImpact();
        if (victim && victim.mesh) {
            this.particles.createParrySparks(victim.mesh.position.clone().add(new THREE.Vector3(0, 1.2, 0)));
        }
        this.triggerScreenShake(0.38, 0.22);
        this.showBanner('¡REMATE NINJA CINEMÁTICO! ⚡', '¡Impacto letal en cámara lenta!');
    }

    handleEnemyDefeated(enemy) {
        storage.incrementEnemiesDefeated();
        this.enemiesDefeatedThisLevel = (this.enemiesDefeatedThisLevel || 0) + 1;
        if (enemy.isCampaignBoss) {
            this.triggerSlowMoFinisher(enemy);
            this.handleCampaignBossDefeated(enemy);
            return;
        }

        if (enemy.type === 'boss' || (this.isCampaignMode && this.enemyManager.enemies.filter(e => e.type !== 'dummy' && e.health > 0).length <= 1)) {
            this.triggerSlowMoFinisher(enemy);
        }

        // Registrar en la misión del mundo
        if (enemy.type === 'boss') {
            storage.recordMissionBoss(this.world.currentMapId);
        } else if (enemy.type !== 'dummy') {
            storage.recordMissionEnemy(this.world.currentMapId);
        }

        // Estadísticas de Battle Royale
        if (enemy.type !== 'dummy') {
            this.killCount++;
            const killEl = document.getElementById('br-kill-count');
            if (killEl) killEl.textContent = this.killCount;

            this.alivePlayers = Math.max(1, this.alivePlayers - 1);
            const aliveEl = document.getElementById('br-alive-count');
            if (aliveEl) aliveEl.textContent = this.alivePlayers;

            if (this.alivePlayers === 1) {
                this.showBanner('¡BOOYAH! 🏆', '¡Eres el Campeón Supremo de Ninja Colombia Arena!');
                sounds.playVictoryFanfare();
            }
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
        if (this.isCampaignMode) {
            this.campaignCollectedGems = (this.campaignCollectedGems || 0) + 1;
            const cGemsEl = document.getElementById('camp-hud-gems-count');
            if (cGemsEl) cGemsEl.textContent = `${this.campaignCollectedGems} / 3`;
            const gemMarker = document.getElementById(`camp-gem-m${this.campaignCollectedGems}`);
            if (gemMarker) gemMarker.classList.add('collected');
            this.showBanner('💎 CRISTAL DE BIODIVERSIDAD 💎', `¡Recolectado! (${this.campaignCollectedGems}/3)`);
            sounds.playGemCollect();
            this.particles.createHitSparks(pos.clone().add(new THREE.Vector3(0, 0.5, 0)), true);
            // Punto de control seguro actualizado en campaña
            if (this.player) {
                this.player.lastCheckpointPos = pos.clone().add(new THREE.Vector3(0, 1.2, 0));
            }
            return;
        }

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
        const cfg = MAPS_CONFIG[worldId] || MAPS_CONFIG.selva;
        const prog = storage.getWorldProgress(worldId);

        const titleEl = document.getElementById('hud-world-name');
        if (titleEl) {
            titleEl.textContent = (cfg.badge || '🌿') + ' - ' + cfg.name.toUpperCase();
        }

        const tasksList = document.getElementById('mission-tasks-list');
        if (tasksList) {
            tasksList.innerHTML = '';

            if (worldId === 'selva' || worldId === 'forest') {
                const eDone = prog.enemiesDefeated >= prog.enemiesTarget;
                const gDone = prog.gemsCollected >= prog.gemsTarget;
                const cDone = prog.cratesBroken >= prog.cratesTarget;

                tasksList.innerHTML = `
                    <div class="mission-item ${eDone ? 'done' : ''}"><span class="m-icon">🐾</span> <span>Furtivos de la Selva: ${prog.enemiesDefeated}/${prog.enemiesTarget}</span> <span>${eDone ? '✅' : '⏳'}</span></div>
                    <div class="mission-item ${gDone ? 'done' : ''}"><span class="m-icon">💎</span> <span>Cristales Biodiversidad: ${prog.gemsCollected}/${prog.gemsTarget}</span> <span>${gDone ? '✅' : '⏳'}</span></div>
                    <div class="mission-item ${cDone ? 'done' : ''}"><span class="m-icon">📦</span> <span>Cajas Sorpresa ?: ${prog.cratesBroken}/${prog.cratesTarget}</span> <span>${cDone ? '✅' : '⏳'}</span></div>
                `;
            } else if (worldId === 'eje_cafetero' || worldId === 'volcano') {
                const eDone = prog.enemiesDefeated >= prog.enemiesTarget;
                const gDone = prog.gemsCollected >= prog.gemsTarget;
                const cDone = prog.cratesBroken >= prog.cratesTarget;

                tasksList.innerHTML = `
                    <div class="mission-item ${eDone ? 'done' : ''}"><span class="m-icon">☕</span> <span>Cazadores Cafeteros: ${prog.enemiesDefeated}/${prog.enemiesTarget}</span> <span>${eDone ? '✅' : '⏳'}</span></div>
                    <div class="mission-item ${gDone ? 'done' : ''}"><span class="m-icon">🍒</span> <span>Granos de Café Oro: ${prog.gemsCollected}/${prog.gemsTarget}</span> <span>${gDone ? '✅' : '⏳'}</span></div>
                    <div class="mission-item ${cDone ? 'done' : ''}"><span class="m-icon">📦</span> <span>Cajas Cafeteras: ${prog.cratesBroken}/${prog.cratesTarget}</span> <span>${cDone ? '✅' : '⏳'}</span></div>
                `;
            } else if (worldId === 'paramo' || worldId === 'snow') {
                const gDone = prog.gemsCollected >= prog.gemsTarget;
                const eDone = prog.enemiesDefeated >= prog.enemiesTarget;
                const bDone = prog.bossDefeated;

                tasksList.innerHTML = `
                    <div class="mission-item ${gDone ? 'done' : ''}"><span class="m-icon">❄️</span> <span>Cristales del Páramo: ${prog.gemsCollected}/${prog.gemsTarget}</span> <span>${gDone ? '✅' : '⏳'}</span></div>
                    <div class="mission-item ${eDone ? 'done' : ''}"><span class="m-icon">🌫️</span> <span>Esbirros Glaciales: ${prog.enemiesDefeated}/${prog.enemiesTarget}</span> <span>${eDone ? '✅' : '⏳'}</span></div>
                    <div class="mission-item ${bDone ? 'done' : ''}"><span class="m-icon">🐆</span> <span>El Invernal (Villano): ${bDone ? 'Derrotado' : 'Acechando'}</span> <span>${bDone ? '✅' : '⏳'}</span></div>
                `;
            } else if (worldId === 'caribe') {
                const eDone = prog.enemiesDefeated >= prog.enemiesTarget;
                const gDone = prog.gemsCollected >= prog.gemsTarget;
                const bDone = prog.bossDefeated;

                tasksList.innerHTML = `
                    <div class="mission-item ${eDone ? 'done' : ''}"><span class="m-icon">🌊</span> <span>Corsarios del Caribe: ${prog.enemiesDefeated}/${prog.enemiesTarget}</span> <span>${eDone ? '✅' : '⏳'}</span></div>
                    <div class="mission-item ${gDone ? 'done' : ''}"><span class="m-icon">💎</span> <span>Perlas del Océano: ${prog.gemsCollected}/${prog.gemsTarget}</span> <span>${gDone ? '✅' : '⏳'}</span></div>
                    <div class="mission-item ${bDone ? 'done' : ''}"><span class="m-icon">🏰</span> <span>Batalla en la Fortaleza: ${bDone ? 'Liberada' : 'Pendiente'}</span> <span>${bDone ? '✅' : '⏳'}</span></div>
                `;
            }
        }

        // Comprobar si la misión está completa para activar el Portal
        const isComplete = storage.isMissionCompleted(worldId);
        const pill = document.getElementById('portal-status-pill');
        const text = document.getElementById('portal-status-text');

        if (!this.world.portal || !this.world.portal.isActive) {
            this.world.activatePortal();
        }

        if (isComplete) {
            if (pill) pill.classList.add('unlocked');
            if (text) text.textContent = '🌟 ¡MISIÓN CUMPLIDA! CRUZA EL PORTAL ➔';
        } else {
            if (pill) pill.classList.add('unlocked');
            if (text) text.textContent = '⚡ ¡PORTAL ACTIVO! CRUZA PARA PASAR DE MUNDO';
        }
    }

    handlePortalVictory() {
        if (this.portalVictoryTriggered) return;
        this.portalVictoryTriggered = true;
        if (this.isCampaignMode) {
            this.handleCampaignPortalVictory();
            return;
        }


        const currentWorld = this.world.currentMapId;
        const cfg = MAPS_CONFIG[currentWorld] || MAPS_CONFIG.selva;

        // Guardar progreso y recompensas
        storage.completeWorld(currentWorld);
        storage.addCoins(150);
        storage.addGems(25);
        storage.addXP(200);
        sounds.playVictoryFanfare();

        // Mostrar Modal de Victoria
        const modal = document.getElementById('level-clear-modal');
        const titleEl = document.getElementById('victory-world-title');
        const nextBtn = document.getElementById('btn-next-world');

        if (titleEl) titleEl.textContent = cfg.name.toUpperCase();
        if (nextBtn) {
            if (currentWorld === 'selva' || currentWorld === 'forest') {
                nextBtn.textContent = 'CONTINUAR AL EJE CAFETERO ➔';
            } else if (currentWorld === 'eje_cafetero' || currentWorld === 'volcano') {
                nextBtn.textContent = 'CONTINUAR AL PÁRAMO ANDINO ➔';
            } else if (currentWorld === 'paramo' || currentWorld === 'snow') {
                nextBtn.textContent = 'CONTINUAR AL CARIBE COLOMBIANO ➔';
            } else {
                nextBtn.textContent = '¡VICTORIA TOTAL! REPETIR ARENA 🏆';
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

        clearTimeout(this.bannerTimeout);
        this.bannerTimeout = setTimeout(() => {
            banner.classList.remove('show');
        }, 2200);
    }

    setupUI() {
        const safeListener = (id, event, fn) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener(event, fn);
        };
        const safeText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };
        const safeStyle = (id, prop, val) => {
            const el = document.getElementById(id);
            if (el) el.style[prop] = val;
        };
        const safeClass = (id, action, cls) => {
            const el = document.getElementById(id);
            if (el) el.classList[action](cls);
        };

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

        // Tienda y Mapas
        safeListener('btn-open-shop', 'click', () => this.toggleShop());
        safeListener('btn-close-shop', 'click', () => this.closeShop());
        safeListener('btn-open-maps', 'click', () => this.toggleMaps());
        safeListener('btn-close-maps', 'click', () => this.closeMaps());

        // Botón del Modal de Victoria de Mundo
        safeListener('btn-next-world', 'click', () => {
            safeClass('level-clear-modal', 'remove', 'open');
            this.portalVictoryTriggered = false;
            const curr = this.world.currentMapId;
            if (curr === 'selva' || curr === 'forest') this.switchMap('eje_cafetero');
            else if (curr === 'eje_cafetero' || curr === 'volcano') this.switchMap('paramo');
            else if (curr === 'paramo' || curr === 'snow') this.switchMap('caribe');
            else this.switchMap('selva');
        });

        this.setupMapSelector();
        this.setupPWAInstall();

        // Sonido y Música
        safeListener('btn-toggle-sound', 'click', () => {
            sounds.enabled = !sounds.enabled;
            safeText('sound-icon', sounds.enabled ? '🔊' : '🔇');
            const quickBtn = document.getElementById('btn-quick-sound');
            if (quickBtn) quickBtn.textContent = sounds.enabled ? '🔊' : '🔇';
            if (sounds.enabled) {
                sounds.resumeMusic();
            } else {
                sounds.stopMusic();
            }
        });

        // Iniciar música en la primera interacción del usuario (política de navegadores)
        const onFirstInteraction = () => {
            sounds.init();
            if (sounds.enabled && !sounds.isMusicPlaying) {
                const track = this.state === 'PLAYING' ? (this.campaignIsBossFight ? 'boss' : 'battle') : 'menu';
                sounds.startMusic(track);
            }
            window.removeEventListener('pointerdown', onFirstInteraction);
            window.removeEventListener('keydown', onFirstInteraction);
        };
        window.addEventListener('pointerdown', onFirstInteraction, { once: true });
        window.addEventListener('keydown', onFirstInteraction, { once: true });

        // Controles táctiles
        safeListener('btn-toggle-touch', 'click', () => {
            const tc = document.getElementById('mobile-touch-controls');
            if (tc) {
                const isVisible = window.getComputedStyle(tc).display !== 'none';
                tc.style.display = isVisible ? 'none' : 'block';
                document.body.classList.toggle('touch-enabled', !isVisible);
                document.body.classList.toggle('touch-active', !isVisible);
            }
        });

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

        const startCombatNow = (e) => {
            if (e && e.cancelable) e.preventDefault();
            safeClass('multiplayer-modal', 'remove', 'open');
            sounds.init();
            this.startGame();
        };

        const btnSolo = document.getElementById('btn-start-solo');
        if (btnSolo) {
            btnSolo.addEventListener('click', startCombatNow);
            btnSolo.addEventListener('touchend', startCombatNow, { passive: false });
        }

        const btnQuick = document.getElementById('btn-quick-start');
        if (btnQuick) {
            btnQuick.addEventListener('click', startCombatNow);
            btnQuick.addEventListener('touchend', startCombatNow, { passive: false });
        }

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
                safeStyle('lobby-modes-view', 'display', 'none');
                safeStyle('lobby-join-view', 'display', 'block');
            });
        }

        const btnBack = document.getElementById('btn-back-to-modes');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                const lj = document.getElementById('lobby-join-view'); if (lj) lj.style.display = 'none';
                const lm = document.getElementById('lobby-modes-view'); if (lm) lm.style.display = 'block';
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
                safeClass('multiplayer-modal', 'add', 'open');
            });
        }

        const btnCloseLobby = document.getElementById('btn-close-lobby');
        if (btnCloseLobby) {
            btnCloseLobby.addEventListener('click', () => {
                safeClass('multiplayer-modal', 'remove', 'open');
            });
        }

        this.multiplayer.onRoomCreated = (code) => {
            safeStyle('lobby-modes-view', 'display', 'none');
            safeStyle('lobby-created-view', 'display', 'block');
            safeText('room-code-display', code);
            safeText('hud-room-code', code);
            safeStyle('hud-room-badge', 'display', 'inline-flex');
            this.showBanner('¡SALA PRIVADA CREADA! 🏠', `Código de acceso: ${code}`);
        };

        this.multiplayer.onPlayerJoined = (players) => {
            this.updateLobbyPlayersList(players);
        };

        // =====================================================================
        // CONTROLES DEL MENÚ PRINCIPAL PROFESIONAL (ESTILO REFERENCIA PITCH)
        // =====================================================================
        
        // Rotación táctil e interactiva del héroe 3D en el menú principal
        const showcaseZone = document.getElementById('hero-showcase-zone');
        if (showcaseZone) {
            let isDraggingHero = false;
            let lastMouseX = 0;
            this.heroManualRotation = 0;

            const onStart = (clientX) => {
                isDraggingHero = true;
                lastMouseX = clientX;
            };
            const onMove = (clientX) => {
                if (!isDraggingHero) return;
                const deltaX = clientX - lastMouseX;
                lastMouseX = clientX;
                this.heroManualRotation = (this.heroManualRotation || 0) + deltaX * 0.015;
            };
            const onEnd = () => { isDraggingHero = false; };

            showcaseZone.addEventListener('mousedown', (e) => onStart(e.clientX));
            window.addEventListener('mousemove', (e) => onMove(e.clientX));
            window.addEventListener('mouseup', onEnd);

            showcaseZone.addEventListener('touchstart', (e) => {
                if (e.touches && e.touches[0]) onStart(e.touches[0].clientX);
            }, { passive: true });
            window.addEventListener('touchmove', (e) => {
                if (e.touches && e.touches[0]) onMove(e.touches[0].clientX);
            }, { passive: true });
            window.addEventListener('touchend', onEnd);
        }

        const btnPlay = document.getElementById('btn-menu-play');
        if (btnPlay) {
            const onPlay = (e) => {
                if (e && e.cancelable) e.preventDefault();
                sounds.init();
                this.startGame();
            };
            btnPlay.addEventListener('click', onPlay);
            btnPlay.addEventListener('touchend', onPlay, { passive: false });
        }

        // Botón 10 MUNDOS (Campaña Aventura Ninja)
        const btnCamp = document.getElementById('btn-menu-campaign');
        if (btnCamp) {
            const onCamp = (e) => {
                if (e && e.cancelable) e.preventDefault();
                sounds.init();
                this.openCampaignWorldsModal();
            };
            btnCamp.addEventListener('click', onCamp);
            btnCamp.addEventListener('touchend', onCamp, { passive: false });
        }

        // Modales de Campaña (10 Mundos, Niveles y Pantalla de Victoria)
        safeListener('btn-close-campaign-worlds', 'click', () => {
            safeClass('campaign-worlds-modal', 'remove', 'open');
        });
        safeListener('btn-back-to-worlds', 'click', () => {
            safeClass('campaign-levels-modal', 'remove', 'open');
            this.openCampaignWorldsModal();
        });
        safeListener('btn-close-campaign-levels', 'click', () => {
            safeClass('campaign-levels-modal', 'remove', 'open');
        });

        // Victoria de Nivel / Jefe en Campaña (Reintentar, Siguiente, Volver al mapa)
        safeListener('btn-camp-retry', 'click', () => {
            safeClass('campaign-victory-modal', 'remove', 'open');
            if (this.campaignIsBossFight) {
                this.startCampaignBoss(this.campaignCurrentWorld);
            } else {
                this.startCampaignLevel(this.campaignCurrentWorld, this.campaignCurrentLevel);
            }
        });
        safeListener('btn-camp-next', 'click', () => {
            safeClass('campaign-victory-modal', 'remove', 'open');
            if (this.campaignIsBossFight) {
                if (this.campaignCurrentWorld < 10) {
                    this.startCampaignLevel(this.campaignCurrentWorld + 1, 1);
                } else {
                    this.returnToMenu();
                    this.openCampaignWorldsModal();
                }
            } else if (this.campaignCurrentLevel < 5) {
                this.startCampaignLevel(this.campaignCurrentWorld, this.campaignCurrentLevel + 1);
            } else {
                this.startCampaignBoss(this.campaignCurrentWorld);
            }
        });
        safeListener('btn-camp-map', 'click', () => {
            safeClass('campaign-victory-modal', 'remove', 'open');
            this.returnToMenu();
            this.openCampaignLevelsModal(this.campaignCurrentWorld);
        });

        // Botón Invocación de Jefe en Batalla
        safeListener('btn-spawn-boss', 'click', () => {
            if (this.enemyManager && this.player) {
                const pos = this.player.mesh.position.clone().add(new THREE.Vector3(10, 0, 10));
                this.enemyManager.spawnBoss(pos);
                this.showBanner('¡JEFE ANCESTRAL INVOCADO! ⚔️', '¡Derrota al titán con tus combos!');
            }
        });

        const btnReturnMenu = document.getElementById('btn-return-menu');
        if (btnReturnMenu) btnReturnMenu.addEventListener('click', () => this.returnToMenu());

        // Modal Personajes
        const btnChars = document.getElementById('btn-menu-characters');
        const charsModal = document.getElementById('characters-modal');
        const btnCloseChars = document.getElementById('btn-close-characters');
        if (btnChars && charsModal) {
            btnChars.addEventListener('click', () => {
                this.renderCharactersGrid();
                charsModal.classList.add('open');
            });
        }
        if (btnCloseChars && charsModal) {
            btnCloseChars.addEventListener('click', () => charsModal.classList.remove('open'));
        }

        // Modal Skins
        const btnSkins = document.getElementById('btn-menu-skins');
        const skinsModal = document.getElementById('skins-modal');
        const btnCloseSkins = document.getElementById('btn-close-skins');
        if (btnSkins && skinsModal) {
            btnSkins.addEventListener('click', () => {
                this.renderSkinsGrid();
                skinsModal.classList.add('open');
            });
        }
        if (btnCloseSkins && skinsModal) {
            btnCloseSkins.addEventListener('click', () => skinsModal.classList.remove('open'));
        }

        // Modal Pase Ninja
        const btnPass = document.getElementById('btn-menu-pass');
        const passModal = document.getElementById('ninja-pass-modal');
        const btnClosePass = document.getElementById('btn-close-pass');
        if (btnPass && passModal) {
            btnPass.addEventListener('click', () => {
                this.renderNinjaPass();
                passModal.classList.add('open');
            });
        }
        if (btnClosePass && passModal) {
            btnClosePass.addEventListener('click', () => passModal.classList.remove('open'));
        }

        // Botón Tienda desde el Menú Principal
        const btnMenuShop = document.getElementById('btn-menu-shop');
        if (btnMenuShop) btnMenuShop.addEventListener('click', () => this.toggleShop());

        // Modal Ajustes
        
        // -------------------------------------------------------------
        // Modal de Historial y Avances del Jugador
        // -------------------------------------------------------------
        const btnOpenHistory = document.getElementById('btn-menu-history');
        const btnProfile = document.getElementById('menu-profile-btn');
        if (btnOpenHistory) btnOpenHistory.addEventListener('click', () => this.openHistoryModal());
        if (btnProfile) btnProfile.addEventListener('click', () => this.openHistoryModal());

        safeListener('btn-close-history', 'click', () => {
            safeClass('history-modal', 'remove', 'open');
        });

        // Pestañas de Historial
        const tabCareer = document.getElementById('tab-btn-career');
        const tabMatches = document.getElementById('tab-btn-matches');
        const viewCareer = document.getElementById('view-career-stats');
        const viewMatches = document.getElementById('view-match-history');

        if (tabCareer && tabMatches && viewCareer && viewMatches) {
            tabCareer.addEventListener('click', () => {
                tabCareer.classList.add('active');
                tabMatches.classList.remove('active');
                viewCareer.style.display = 'block';
                viewMatches.style.display = 'none';
            });

            tabMatches.addEventListener('click', () => {
                tabMatches.classList.add('active');
                tabCareer.classList.remove('active');
                viewCareer.style.display = 'none';
                viewMatches.style.display = 'block';
            });
        }

        // Copiar y Restaurar Respaldo
        const btnCopyBackup = document.getElementById('btn-copy-backup');
        if (btnCopyBackup) {
            btnCopyBackup.addEventListener('click', () => {
                const saveJson = storage.exportSaveJson();
                navigator.clipboard.writeText(saveJson).then(() => {
                    this.showBanner('¡RESPALDO COPIADO! 📋', 'Pégalo en tus notas para guardar tus avances');
                    btnCopyBackup.textContent = '✅ ¡CÓDIGO COPIADO!';
                    setTimeout(() => { btnCopyBackup.textContent = '📋 COPIAR CÓDIGO DE RESPALDO'; }, 2500);
                }).catch(() => {
                    prompt('Copia tu código de respaldo:', saveJson);
                });
            });
        }

        const btnLoadBackup = document.getElementById('btn-load-backup');
        if (btnLoadBackup) {
            btnLoadBackup.addEventListener('click', () => {
                const input = prompt('Pega el código de respaldo guardado:');
                if (input && storage.importSaveJson(input)) {
                    this.updateHUD();
                    this.updateHeroShowcaseCard();
                    this.showBanner('¡PROGRESO RESTAURADO! 🏆', 'Tus avances han sido cargados con éxito');
                    this.openHistoryModal();
                } else if (input) {
                    alert('Código de respaldo inválido.');
                }
            });
        }

        const btnSettings = document.getElementById('btn-menu-settings');
        const settingsModal = document.getElementById('settings-modal');
        const btnCloseSettings = document.getElementById('btn-close-settings');
        if (btnSettings && settingsModal) {
            btnSettings.addEventListener('click', () => settingsModal.classList.add('open'));
        }
        if (btnCloseSettings && settingsModal) {
            btnCloseSettings.addEventListener('click', () => settingsModal.classList.remove('open'));
        }

        // Modal Selector de Modo
        const btnMenuMode = document.getElementById('btn-menu-mode');
        const modesModal = document.getElementById('modes-modal');
        const btnCloseModes = document.getElementById('btn-close-modes');
        if (btnMenuMode && modesModal) {
            btnMenuMode.addEventListener('click', () => modesModal.classList.add('open'));
        }
        if (btnCloseModes && modesModal) {
            btnCloseModes.addEventListener('click', () => modesModal.classList.remove('open'));
        }

        // Recargar Gemas
        const btnAddGems = document.getElementById('btn-add-gems');
        if (btnAddGems) {
            btnAddGems.addEventListener('click', () => {
                storage.addGems(50);
                sounds.playGemCollect();
                this.updateHUD();
                this.updateHeroShowcaseCard();
                this.showBanner('¡GEMAS RECARGADAS! 💎', '+50 Gemas de la Biodiversidad');
            });
        }

        // Alternar Sonido y Música desde el Menú
        const btnQuickSound = document.getElementById('btn-quick-sound');
        if (btnQuickSound) {
            btnQuickSound.addEventListener('click', () => {
                sounds.enabled = !sounds.enabled;
                btnQuickSound.textContent = sounds.enabled ? '🔊' : '🔇';
                const sIcon = document.getElementById('sound-icon');
                if (sIcon) sIcon.textContent = sounds.enabled ? '🔊' : '🔇';
                if (sounds.enabled) {
                    sounds.resumeMusic();
                } else {
                    sounds.stopMusic();
                }
            });
        }

        // Selección de Modos de Juego
        const modeCards = document.querySelectorAll('.mode-select-card');
        modeCards.forEach(mc => {
            mc.addEventListener('click', () => {
                const modeId = mc.getAttribute('data-mode');
                modeCards.forEach(c => c.classList.remove('active'));
                mc.classList.add('active');
                storage.setSelectedMode(modeId);
                if (modeId === 'adventure') { this.openCampaignWorldsModal(); }

                this.updateMenuModeDisplay();
                sounds.playSlash('light');
                const tEl = document.getElementById('menu-mode-title');
                this.showBanner('MODO CAMBIADO 🎮', tEl ? tEl.textContent : modeId);
                if (modesModal) modesModal.classList.remove('open');
            });
        });

        // Botones de Ajustes y Accesibilidad v20.0
        // 1. SFX
        const btnSfx = document.getElementById('btn-toggle-sfx');
        if (btnSfx) {
            const isSfx = storage.getSetting('sfxEnabled', true);
            btnSfx.textContent = isSfx ? 'ACTIVADO' : 'SILENCIADO';
            btnSfx.classList.toggle('active', isSfx);
            btnSfx.addEventListener('click', () => {
                const next = !storage.getSetting('sfxEnabled', true);
                storage.setSetting('sfxEnabled', next);
                sounds.sfxEnabled = next;
                btnSfx.textContent = next ? 'ACTIVADO' : 'SILENCIADO';
                btnSfx.classList.toggle('active', next);
                if (next && sounds.playSlash) sounds.playSlash('wood');
            });
        }

        // 2. Música
        const btnMusic = document.getElementById('btn-toggle-music');
        if (btnMusic) {
            const isMus = storage.getSetting('musicEnabled', true);
            btnMusic.textContent = isMus ? 'ACTIVADA' : 'DESACTIVADA';
            btnMusic.classList.toggle('active', isMus);
            btnMusic.addEventListener('click', () => {
                const next = !storage.getSetting('musicEnabled', true);
                storage.setSetting('musicEnabled', next);
                sounds.musicEnabled = next;
                btnMusic.textContent = next ? 'ACTIVADA' : 'DESACTIVADA';
                btnMusic.classList.toggle('active', next);
                if (next) { sounds.resumeMusic(); } else { sounds.stopMusic(); }
            });
        }

        // 3. Calidad Gráfica (Profiles: LOW, MEDIUM, HIGH, ULTRA)
        const btnGfx = document.getElementById('btn-toggle-graphics');
        if (btnGfx) {
            const profiles = ['LOW', 'MEDIUM', 'HIGH', 'ULTRA'];
            const profileLabels = {
                'LOW': 'BAJA (30 FPS)',
                'MEDIUM': 'MEDIA (45 FPS)',
                'HIGH': 'ALTA (60 FPS)',
                'ULTRA': 'ULTRA (60 FPS+)'
            };
            let curGfx = storage.getSetting('graphicsProfile', this.isMobile ? 'MEDIUM' : 'HIGH');
            btnGfx.textContent = profileLabels[curGfx] || 'ALTA (60 FPS)';
            btnGfx.addEventListener('click', () => {
                let idx = profiles.indexOf(curGfx);
                idx = (idx + 1) % profiles.length;
                curGfx = profiles[idx];
                storage.setSetting('graphicsProfile', curGfx);
                btnGfx.textContent = profileLabels[curGfx];
                if (this.perfMonitor) {
                    this.perfMonitor.applyProfile(curGfx, this.renderer, this.scene);
                }
                if (sounds && sounds.playSlash) sounds.playSlash('wood');
            });
        }

        // 4. Modo de visualización táctil
        const btnTouch = document.getElementById('btn-toggle-touch-setting');
        if (btnTouch) {
            const touchModes = ['auto', 'always', 'hidden'];
            const touchLabels = { 'auto': 'AUTO', 'always': 'SIEMPRE', 'hidden': 'OCULTO' };
            let curTouch = storage.getSetting('touchControls', 'auto');
            btnTouch.textContent = touchLabels[curTouch] || 'AUTO';
            btnTouch.addEventListener('click', () => {
                let idx = touchModes.indexOf(curTouch);
                idx = (idx + 1) % touchModes.length;
                curTouch = touchModes[idx];
                storage.setSetting('touchControls', curTouch);
                btnTouch.textContent = touchLabels[curTouch];
                const tc = document.getElementById('mobile-touch-controls');
                if (tc && this.state === 'PLAYING') {
                    const shouldShow = (curTouch === 'always') || (curTouch === 'auto' && (this.isMobile || window.innerWidth <= 900));
                    tc.style.display = shouldShow ? 'block' : 'none';
                    document.body.classList.toggle('touch-enabled', shouldShow);
                    document.body.classList.toggle('touch-active', shouldShow);
                }
                if (sounds && sounds.playSlash) sounds.playSlash('wood');
            });
        }

        // 5. Modo Zurdo
        const btnLeftHanded = document.getElementById('btn-toggle-left-handed');
        if (btnLeftHanded) {
            const isLeft = storage.getSetting('leftHanded', false);
            btnLeftHanded.textContent = isLeft ? 'ACTIVADO' : 'DESACTIVADO';
            btnLeftHanded.classList.toggle('active', isLeft);
            btnLeftHanded.addEventListener('click', () => {
                const next = !storage.getSetting('leftHanded', false);
                storage.setSetting('leftHanded', next);
                btnLeftHanded.textContent = next ? 'ACTIVADO' : 'DESACTIVADO';
                btnLeftHanded.classList.toggle('active', next);
                if (this.touchControls) this.touchControls.setLeftHanded(next);
                if (sounds && sounds.playSlash) sounds.playSlash('wood');
            });
        }

        // 6. Tamaño Botones Táctiles
        const btnSize = document.getElementById('btn-toggle-btn-size');
        if (btnSize) {
            const sizes = ['small', 'normal', 'large'];
            const sizeLabels = { 'small': 'PEQUEÑO', 'normal': 'NORMAL', 'large': 'GRANDE' };
            let curSize = storage.getSetting('buttonSize', 'normal');
            btnSize.textContent = sizeLabels[curSize] || 'NORMAL';
            btnSize.addEventListener('click', () => {
                let idx = sizes.indexOf(curSize);
                idx = (idx + 1) % sizes.length;
                curSize = sizes[idx];
                storage.setSetting('buttonSize', curSize);
                btnSize.textContent = sizeLabels[curSize];
                if (this.touchControls) this.touchControls.setButtonSize(curSize);
                if (sounds && sounds.playSlash) sounds.playSlash('wood');
            });
        }

        // 7. Vibración Háptica
        const btnVib = document.getElementById('btn-toggle-vibration');
        if (btnVib) {
            const isVib = storage.getSetting('vibrationEnabled', true);
            btnVib.textContent = isVib ? 'ACTIVADA' : 'DESACTIVADA';
            btnVib.classList.toggle('active', isVib);
            btnVib.addEventListener('click', () => {
                const next = !storage.getSetting('vibrationEnabled', true);
                storage.setSetting('vibrationEnabled', next);
                btnVib.textContent = next ? 'ACTIVADA' : 'DESACTIVADA';
                btnVib.classList.toggle('active', next);
                if (next && navigator.vibrate) navigator.vibrate(25);
                if (sounds && sounds.playSlash) sounds.playSlash('wood');
            });
        }

        // 8. Vibración de Pantalla (Screen Shake)
        const btnShake = document.getElementById('btn-toggle-screenshake');
        if (btnShake) {
            const shakes = [1.0, 0.4, 0.0];
            const shakeLabels = { '1': 'NORMAL', '0.4': 'SUAVE', '0': 'DESACTIVADO' };
            let curShake = storage.getSetting('screenShakeIntensity', 1.0);
            btnShake.textContent = shakeLabels[String(curShake)] || 'NORMAL';
            btnShake.addEventListener('click', () => {
                let idx = shakes.indexOf(curShake);
                idx = (idx + 1) % shakes.length;
                curShake = shakes[idx];
                storage.setSetting('screenShakeIntensity', curShake);
                btnShake.textContent = shakeLabels[String(curShake)];
                this.triggerScreenShake(0.25, 0.12);
                if (sounds && sounds.playSlash) sounds.playSlash('wood');
            });
        }

        // 9. Accesibilidad: Alto Contraste
        const btnHC = document.getElementById('btn-toggle-high-contrast');
        if (btnHC) {
            const isHC = storage.getSetting('highContrast', false);
            btnHC.textContent = isHC ? 'ACTIVADO' : 'DESACTIVADO';
            btnHC.classList.toggle('active', isHC);
            btnHC.addEventListener('click', () => {
                const next = !storage.getSetting('highContrast', false);
                storage.setSetting('highContrast', next);
                btnHC.textContent = next ? 'ACTIVADO' : 'DESACTIVADO';
                btnHC.classList.toggle('active', next);
                document.body.classList.toggle('high-contrast-mode', next);
                if (sounds && sounds.playSlash) sounds.playSlash('wood');
            });
        }
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
        if (!modal) return;
        if (modal.classList.contains('open')) {
            this.closeShop();
        } else {
            this.renderShopItems();
            modal.classList.add('open');
        }
    }

    closeShop() {
        const modal = document.getElementById('shop-modal');
        if (modal) modal.classList.remove('open');
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
            storage.completeWorld(this.world.currentMapId);
            if (!storage.isWorldUnlocked(mapId)) {
                storage.data.unlockedWorlds.push(mapId);
                storage.save();
            }
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
                navigator.serviceWorker.register('./sw.js?v=18.0')
                    .then(reg => {
                        console.log('PWA ServiceWorker activo:', reg.scope);
                        reg.update();
                    })
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
        const aHpFill = document.getElementById('player-health-fill');
        if (aHpFill) aHpFill.style.width = `${healthPercent}%`;
        const aHpText = document.getElementById('player-health-text');
        if (aHpText) aHpText.textContent = `${Math.ceil(this.player.health)} / ${this.player.maxHealth}`;

        const coinEl = document.getElementById('coin-count');
        if (coinEl) coinEl.textContent = storage.data.coins;

        const lvlEl = document.getElementById('player-level-badge');
        if (lvlEl) lvlEl.textContent = `NVL ${storage.data.level}`;
        const xpPercent = Math.min(100, (storage.data.xp / storage.data.xpToNext) * 100);
        const xpFill = document.getElementById('player-xp-fill');
        if (xpFill) xpFill.style.width = `${xpPercent}%`;

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
        this.renderer.setPixelRatio(Math.min(dpr, this.isMobile ? 1.5 : 2.0));
    }

    startGame() {
        if (!this.isCampaignMode) {
            const campData = storage.data.campaign || {};
            const currentWorld = campData.selectedWorld || campData.currentWorld || 1;
            const currentLevel = campData.selectedLevel || campData.currentLevel || 1;
            this.startCampaignLevel(currentWorld, currentLevel);
            return;
        }

        this.portalVictoryTriggered = false;
        this.state = 'PLAYING';
        document.body.classList.add('playing-state');
        sounds.playGameStart();
        if (this.campaignIsBossFight) {
            sounds.switchTrack('boss');
        } else {
            sounds.switchTrack('battle');
        }

        // Optimización GPU en celular: apagar luces frontales de estudio del menú en gameplay
        if (this.menuKeyLight) this.menuKeyLight.visible = false;
        if (this.menuRimLight) this.menuRimLight.visible = false;

        // 1. Ocultar Menú Principal por completo
        const menu = document.getElementById('main-menu-overlay');
        if (menu) {
            menu.classList.add('menu-hidden');
            menu.style.display = 'none';
        }

        // 2. Mostrar HUD de combate en partida activa
        const hud = document.getElementById('hud-container');
        if (hud) {
            hud.classList.add('hud-active');
            hud.style.display = 'flex';
            hud.style.opacity = '1';
            hud.style.pointerEvents = 'none';
        }

        // 3. Controles táctiles en celulares o pantallas táctiles
        const tc = document.getElementById('mobile-touch-controls');
        const touchSetting = storage.getSetting('touchControls', 'auto');
        const shouldShowTouch = touchSetting === 'always' || (touchSetting === 'auto' && (this.isMobile || window.innerWidth <= 900));
        if (tc) {
            tc.style.display = shouldShowTouch ? 'block' : 'none';
            document.body.classList.toggle('touch-enabled', shouldShowTouch);
            document.body.classList.toggle('touch-active', shouldShowTouch);
        }
        if (this.touchControls) {
            this.touchControls.player = this.player;
            this.touchControls.setLeftHanded(storage.getSetting('leftHanded', false));
            this.touchControls.setButtonSize(storage.getSetting('buttonSize', 'normal'));
        }

        if (this.campaignIsBossFight) {
            this.player.mesh.position.set(-14, 1.5, 0);
        } else {
            this.player.mesh.position.set(0, 1.5, 0);
        }
        this.player.facing = 1;
        this.player.mesh.rotation.y = Math.PI / 2;
        this.player.velocity.set(0, 0, 0);
        this.showBanner('¡NINJA COLOMBIA ARENA!', '¡A luchar con honor y proteger la biodiversidad!');
    }

    returnToMenu() {
        if (this.levelManager) this.levelManager.unloadLevel();
        this.portalVictoryTriggered = false;
        this.state = 'MENU';
        document.body.classList.remove('playing-state');
        document.body.classList.remove('campaign-active');
        this.campaignBossEnemy = null;
        this.isCampaignMode = false;
        if (this.player) this.player.isCampaignMode = false;
        sounds.switchTrack('menu');

        // Reactivar luces de estudio al volver al menú principal
        if (this.menuKeyLight) this.menuKeyLight.visible = true;
        if (this.menuRimLight) this.menuRimLight.visible = true;

        // 1. Mostrar Menú Principal
        const menu = document.getElementById('main-menu-overlay');
        if (menu) {
            menu.classList.remove('menu-hidden');
            menu.style.display = 'flex';
            menu.style.opacity = '1';
        }

        // 2. Ocultar HUD de combate
        const hud = document.getElementById('hud-container');
        if (hud) {
            hud.classList.remove('hud-active');
            hud.style.display = 'none';
            hud.style.opacity = '0';
        }

        const campHud = document.getElementById('campaign-hud');
        if (campHud) campHud.style.display = 'none';
        const missHud = document.getElementById('mission-hud');
        if (missHud) missHud.style.display = 'flex';

        // 3. Ocultar Controles Táctiles en el menú
        const tc = document.getElementById('mobile-touch-controls');
        if (tc) tc.style.display = 'none';

        this.player.mesh.position.set(0, 0, 0);
        this.updateHeroShowcaseCard();
    }

    updateHeroShowcaseCard() {
        const charId = storage.getSelectedCharacter() || 'chucho';
        const char = CHARACTERS_DATA[charId] || CHARACTERS_DATA.chucho;
        if (!char) return;

        const animalLabel = (char.animalName || char.animal || 'Fauna Colombiana').toUpperCase();
        const roleLabel = (char.role || char.archetype || 'Guerrero').toUpperCase();
        const heroName = (char.name || 'Ninja').toUpperCase();
        const avatarIcon = char.icon || char.avatar || '🐻';
        const skillName = (char.skill && char.skill.name) || char.skillName || 'Poder Ninja';

        const roleEl = document.getElementById('menu-hero-role');
        const nameEl = document.getElementById('menu-hero-name');
        const skillEl = document.getElementById('menu-hero-skill');
        const avatarEl = document.getElementById('menu-avatar-badge');
        const hudAvatar = document.getElementById('hud-mini-avatar');
        const hudPlayerName = document.getElementById('hud-player-name');
        const touchSkillIcon = document.getElementById('touch-skill-icon');

        if (roleEl) roleEl.textContent = `${animalLabel} • ${roleLabel}`;
        if (nameEl) nameEl.textContent = heroName;
        if (skillEl) skillEl.innerHTML = `<span class="skill-tag">HABILIDAD ESPECIAL</span> <span class="skill-name">💥 ${skillName}</span>`;
        if (avatarEl) avatarEl.textContent = avatarIcon;
        if (hudAvatar) hudAvatar.textContent = avatarIcon;
        if (hudPlayerName) hudPlayerName.textContent = char.name || 'Ninja';

        if (touchSkillIcon) {
            const icons = { chucho: '💥', yari: '⚡', guaca: '🪶', capibu: '🛡️', ranaik: '🐸' };
            touchSkillIcon.textContent = icons[charId] || '✨';
        }

        const spdPct = Math.min(100, Math.round(((char.stats && char.stats.speed) || 10) / 15 * 100));
        const defPct = Math.min(100, Math.round((char.stats && char.stats.defense) || 80));
        const jmpPct = Math.min(100, Math.round(((char.stats && (char.stats.jumpForce || char.stats.jump)) || 12) / 16 * 100));

        const spd = document.getElementById('bar-hero-speed');
        const def = document.getElementById('bar-hero-defense');
        const jmp = document.getElementById('bar-hero-jump');
        if (spd) spd.style.width = `${spdPct}%`;
        if (def) def.style.width = `${defPct}%`;
        if (jmp) jmp.style.width = `${jmpPct}%`;

        // Monedas y Gemas en Menú
        const mCoins = document.getElementById('menu-coin-count');
        const mGems = document.getElementById('menu-gem-count');
        if (mCoins) mCoins.textContent = (storage.data.coins || 0).toLocaleString();
        if (mGems) mGems.textContent = (storage.data.gems || 150).toLocaleString();
    }

    updateMenuModeDisplay() {
        const modeId = storage.getSelectedMode() || 'adventure';
        const titles = {
            battle_royale: 'BATTLE ROYALE (50 JUGADORES)',
            adventure: 'AVENTURA 2.5D (10 MUNDOS)',
            squads: 'EQUIPOS (4 VS 4)',
            events: 'EVENTO: FESTIVAL BIODIVERSIDAD'
        };
        const tEl = document.getElementById('menu-mode-title');
        if (tEl) tEl.textContent = titles[modeId] || titles.adventure;

        const subEl = document.getElementById('menu-mode-map-name');
        if (subEl) {
            const campData = storage.data.campaign || {};
            const worldNum = campData.selectedWorld || campData.currentWorld || 1;
            const worldMeta = CAMPAIGN_WORLDS[worldNum] || CAMPAIGN_WORLDS[1];
            subEl.textContent = `🌴 Mundo ${worldNum}: ${worldMeta.name}`;
        }
    }

    renderCharactersGrid() {
        const grid = document.getElementById('characters-grid-container');
        if (!grid) return;
        grid.innerHTML = '';

        const selectedId = storage.getSelectedCharacter() || 'chucho';

        Object.values(CHARACTERS_DATA).forEach(char => {
            if (char.id === 'el_invernal') return;

            const isSelected = char.id === selectedId;
            const card = document.createElement('div');
            card.className = `animal-char-card ${isSelected ? 'selected' : ''}`;

            const animalText = char.animalName || char.animal || 'Fauna Colombiana';
            const roleText = char.role || char.archetype || 'Guerrero';
            const iconText = char.icon || char.avatar || '🥷';
            const skillTitle = (char.skill && char.skill.name) || char.skillName || 'Poder Ninja';
            const skillDescText = (char.skill && char.skill.desc) || char.skillDesc || 'Habilidad de combate';

            const spdPct = Math.min(100, Math.round(((char.stats && char.stats.speed) || 10) / 15 * 100));
            const defPct = Math.min(100, Math.round((char.stats && char.stats.defense) || 80));
            const jmpPct = Math.min(100, Math.round(((char.stats && (char.stats.jumpForce || char.stats.jump)) || 12) / 16 * 100));

            card.innerHTML = `
                <div class="animal-card-avatar">${iconText}</div>
                <div class="animal-card-name">${char.name}</div>
                <div class="animal-card-role">${animalText} • ${roleText}</div>
                <div class="animal-card-skill-desc">⚡ <strong>${skillTitle}:</strong> ${skillDescText}</div>
                <div class="animal-stats-bars">
                    <div class="char-stat-row"><span>Velocidad</span> <div class="char-stat-track"><div style="width: ${spdPct}%;"></div></div></div>
                    <div class="char-stat-row"><span>Defensa</span> <div class="char-stat-track"><div style="width: ${defPct}%;"></div></div></div>
                    <div class="char-stat-row"><span>Salto</span> <div class="char-stat-track"><div style="width: ${jmpPct}%;"></div></div></div>
                </div>
                <button class="btn-select-char" data-char="${char.id}">${isSelected ? '✓ SELECCIONADO' : 'SELECCIONAR'}</button>
            `;

            card.addEventListener('click', () => {
                storage.setSelectedCharacter(char.id);
                this.player.switchCharacter(char.id);
                sounds.playSlash('heavy');
                this.updateHeroShowcaseCard();
                this.renderCharactersGrid();
                this.showBanner('¡HÉROE SELECCIONADO!', `${char.name} (${animalText}) listo para el combate`);
            });

            grid.appendChild(card);
        });
    }

    renderSkinsGrid() {
        const grid = document.getElementById('skins-grid-container');
        if (!grid) return;
        grid.innerHTML = '';

        const skins = [
            { id: 'chucho_guardian', name: 'Chucho Guardián del Páramo', hero: 'Chucho', icon: '🐻', cost: 'Desbloqueado', equipped: true },
            { id: 'chucho_dorado', name: 'Chucho Armadura de Oro Quimbaya', hero: 'Chucho', icon: '✨', cost: '350 Gemas', equipped: false },
            { id: 'yari_rayo', name: 'Yarí Ciber-Tigrillo Neón', hero: 'Yarí', icon: '⚡', cost: '250 Gemas', equipped: false },
            { id: 'guaca_carnaval', name: 'Guaca Plumas del Carnaval', hero: 'Guaca', icon: '🎭', cost: 'Pase Nivel 5', equipped: false },
            { id: 'capibu_cafetero', name: 'Capibú Poncho y Sombrero Vueltiao', hero: 'Capibú', icon: '🤠', cost: '180 Gemas', equipped: false },
            { id: 'ranaik_esmeralda', name: 'Ranaik Guerrero Esmeralda', hero: 'Ranaik', icon: '💚', cost: 'Pase Nivel 10', equipped: false },
        ];

        skins.forEach(s => {
            const card = document.createElement('div');
            card.className = `animal-char-card ${s.equipped ? 'selected' : ''}`;
            card.innerHTML = `
                <div class="animal-card-avatar">${s.icon}</div>
                <div class="animal-card-name">${s.name}</div>
                <div class="animal-card-role">Héroe: ${s.hero}</div>
                <div class="animal-card-skill-desc" style="min-height: 24px;">Atuendo con efectos visuales y estelas personalizadas.</div>
                <button class="btn-select-char">${s.equipped ? '✓ EQUIPADA' : s.cost}</button>
            `;
            grid.appendChild(card);
        });
    }

    renderNinjaPass() {
        const track = document.getElementById('pass-tiers-track');
        if (!track) return;
        track.innerHTML = '';

        const tiers = [
            { level: 1, name: '200 Monedas 🪙', icon: '🪙', unlocked: true },
            { level: 2, name: '30 Gemas 💎', icon: '💎', unlocked: true },
            { level: 3, name: 'Machete Dorado 🗡️', icon: '🗡️', unlocked: true },
            { level: 4, name: '50 Gemas 💎', icon: '💎', unlocked: false },
            { level: 5, name: 'Skin Guaca Carnaval 🎭', icon: '🦜', unlocked: false },
            { level: 6, name: '500 Monedas 🪙', icon: '🪙', unlocked: false },
            { level: 7, name: 'Shurikens Orquídea 🌸', icon: '🌸', unlocked: false },
            { level: 8, name: 'Skin Ranaik Esmeralda 🐸', icon: '👑', unlocked: false },
        ];

        tiers.forEach(t => {
            const card = document.createElement('div');
            card.className = `pass-tier-card ${t.unlocked ? 'unlocked' : ''}`;
            card.innerHTML = `
                <div class="pass-tier-num">NIVEL ${t.level}</div>
                <div class="pass-tier-icon">${t.icon}</div>
                <div class="pass-tier-name">${t.name}</div>
                <span class="pass-tier-badge" style="background: ${t.unlocked ? '#10b981' : '#475569'};">${t.unlocked ? '✓ RECLAMADO' : 'BLOQUEADO'}</span>
            `;
            track.appendChild(card);
        });
    }

    handleSpecialSkillVisuals(characterId, skill) {
        sounds.playSpecialSkill(characterId);
        const playerPos = this.player.mesh.position.clone();

        if (characterId === 'chucho') {
            this.triggerScreenShake(0.35, 0.25);
            this.particles.createShockwave(playerPos, 0xf59e0b, 10);
            this.enemyManager.enemies.forEach(e => {
                const dist = playerPos.distanceTo(e.mesh.position);
                if (dist < 10) {
                    const pushDir = new THREE.Vector3().subVectors(e.mesh.position, playerPos).normalize();
                    e.mesh.position.addScaledVector(pushDir, 5.0);
                    this.enemyManager.damageEnemy(e, 35, true, pushDir, (def) => this.handleEnemyDefeated(def));
                }
            });
            this.showBanner('¡RUGIDO ANDINO! 💥', '¡Onda sísmica derriba y aleja a los enemigos!');
        } else if (characterId === 'yari') {
            this.particles.createShockwave(playerPos, 0x06b6d4, 6);
            this.showBanner('¡CARRERA DEL TRUENO! ⚡', '¡Velocidad extrema y agilidad felina activadas!');
        } else if (characterId === 'guaca') {
            this.particles.createShockwave(playerPos, 0xec4899, 7);
            this.showBanner('¡PLANEO TROPICAL! 🪶', '¡Vuelo suave sobre los obstáculos y enemigos!');
        } else if (characterId === 'capibu') {
            this.particles.createShockwave(playerPos, 0xb45309, 5);
            this.showBanner('¡ARMADURA DE LODO! 🛡️', '¡Resistencia reforzada: 60% menos daño!');
        } else if (characterId === 'ranaik') {
            this.particles.createShockwave(playerPos, 0x10b981, 6);
            this.showBanner('¡SALTO ELÁSTICO! 🐸', '¡Súper salto acrobático sagrado!');
        }
    }

    updateMinimap() {
        if (!this.minimapCtx || !this.player || !this.player.mesh) return;
        const ctx = this.minimapCtx;
        const w = 120;
        const h = 120;
        const cx = w / 2;
        const cy = h / 2;
        const scale = 1.25;

        ctx.clearRect(0, 0, w, h);

        const pPos = this.player.mesh.position;

        // Círculo de Zona Segura (Tormenta Battle Royale)
        ctx.save();
        ctx.beginPath();
        const safeR = (this.safeZoneRadius || 50) * scale;
        const safeCenterX = cx + (0 - pPos.x) * scale;
        const safeCenterY = cy + (0 - pPos.z) * scale;
        ctx.arc(safeCenterX, safeCenterY, Math.max(10, safeR), 0, Math.PI * 2);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.restore();

        // Cajas Sorpresa en el radar (puntos dorados)
        if (this.world && this.world.crates) {
            ctx.fillStyle = '#f59e0b';
            this.world.crates.forEach(c => {
                if (!c || c.intact === false || c.isBroken) return;
                const cPos = c.position || (c.mesh && c.mesh.position) || (c.group && c.group.position);
                if (!cPos) return;
                const dx = (cPos.x - pPos.x) * scale;
                const dy = (cPos.z - pPos.z) * scale;
                if (Math.hypot(dx, dy) < 55) {
                    ctx.beginPath();
                    ctx.arc(cx + dx, cy + dy, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }

        // Enemigos en el radar (puntos rojos)
        if (this.enemyManager && this.enemyManager.enemies) {
            this.enemyManager.enemies.forEach(e => {
                if (e.health <= 0) return;
                const dx = (e.mesh.position.x - pPos.x) * scale;
                const dy = (e.mesh.position.z - pPos.z) * scale;
                if (Math.hypot(dx, dy) < 55) {
                    ctx.fillStyle = e.type === 'boss' ? '#ec4899' : '#ef4444';
                    ctx.beginPath();
                    ctx.arc(cx + dx, cy + dy, e.type === 'boss' ? 4 : 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }

        // Jugador en el centro (punto verde brillante)
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Flecha de orientación del jugador
        const arrowEl = document.getElementById('minimap-player-arrow');
        if (arrowEl) {
            const rotY = this.player.mesh.rotation.y;
            arrowEl.style.transform = `translate(-50%, -50%) rotate(${-rotY}rad)`;
        }
    }

    animate() {
        requestAnimationFrame(this.animate);

        // Si se perdió el contexto WebGL en el móvil, esperar a su restauración sin crashear
        if (this.isContextLost) return;

        const delta = Math.min(this.clock.getDelta(), 0.1);
        if (this.perfMonitor) this.perfMonitor.update(delta);

        // Si está en el Menú Principal, posicionar y animar cámara y héroe 3D
        if (this.state === 'MENU') {
            this.menuHoverTime = (this.menuHoverTime || 0) + delta;
            
            // Detección precisa de móvil vs escritorio / orientación
            const isMobile = window.innerWidth <= 768 || (window.innerWidth / window.innerHeight) < 1.0;

            if (isMobile) {
                // CELULARES: El héroe está completamente en el centro libre (sin tarjetas encima)
                const camFloatX = Math.sin(this.menuHoverTime * 0.4) * 0.06;
                const camFloatY = 1.40 + Math.cos(this.menuHoverTime * 0.6) * 0.03;
                this.camera.position.set(camFloatX, camFloatY, 4.40);
                this.camera.lookAt(0, 1.15, 0);

                if (this.player && this.player.mesh) {
                    this.player.mesh.position.set(0, 0.05, 0);
                    if (this.heroManualRotation !== undefined) {
                        this.player.mesh.rotation.y = this.heroManualRotation;
                    } else {
                        this.player.mesh.rotation.y = 0.10;
                    }
                    if (this.player.animateIdleMenu) {
                        this.player.animateIdleMenu(delta);
                    }
                }
            } else {
                // ESCRITORIO / PANTALLA ANCHA: El héroe se ubica en el centro-derecho
                // totalmente despejado de la barra lateral izquierda y la tarjeta de información
                const camFloatX = Math.sin(this.menuHoverTime * 0.4) * 0.10;
                const camFloatY = 1.54 + Math.cos(this.menuHoverTime * 0.6) * 0.03;
                this.camera.position.set(0.50 + camFloatX, camFloatY, 3.85);
                this.camera.lookAt(0.38, 1.22, 0);

                if (this.player && this.player.mesh) {
                    this.player.mesh.position.set(0.60, 0.20, 0);
                    if (this.heroManualRotation !== undefined) {
                        this.player.mesh.rotation.y = this.heroManualRotation;
                    } else {
                        this.player.mesh.rotation.y = 0.10;
                    }
                    if (this.player.animateIdleMenu) {
                        this.player.animateIdleMenu(delta);
                    }
                }
            }

            this.world.update(delta);
            this.renderer.render(this.scene, this.camera);
            return;
        }

        // Ralentización cinemática de remate y Hit-Stop de impacto
        let simDelta = delta;
        if (this.slowMoDuration > 0) {
            this.slowMoDuration -= delta;
            simDelta = delta * 0.16;
        } else if (this.hitStopDuration > 0) {
            this.hitStopDuration -= delta;
            simDelta = delta * 0.18;
        }

        // Simulación Battle Royale en partida
        if (storage.getSelectedMode() === 'battle_royale' && !this.isCampaignMode) {
            this.battleRoyaleTimer += delta;
            if (this.battleRoyaleTimer > 15) {
                this.battleRoyaleTimer = 0;
                if (this.alivePlayers > 3) {
                    this.alivePlayers = Math.max(3, this.alivePlayers - Math.floor(Math.random() * 3 + 1));
                    const aliveEl = document.getElementById('br-alive-count');
                    if (aliveEl) aliveEl.textContent = this.alivePlayers;
                }
                if (this.safeZoneRadius > 25) {
                    this.safeZoneRadius -= 5;
                    this.showBanner('¡LA ZONA SEGURA SE REDUCE! ⚠️', 'Permanece dentro del círculo azul');
                }
            }

            // Daño periódico de tormenta si el jugador está fuera del círculo seguro
            const pDist = Math.hypot(this.player.mesh.position.x, this.player.mesh.position.z);
            if (pDist > this.safeZoneRadius) {
                this.stormTickTimer = (this.stormTickTimer || 0) + delta;
                if (this.stormTickTimer >= 1.2) {
                    this.stormTickTimer = 0;
                    this.player.takeDamage(6);
                    this.triggerScreenShake(0.14, 0.1);
                    this.showBanner('¡TORMENTA ELÉCTRICA! ⚡', '¡Entra rápido al círculo seguro!');
                    sounds.playHit(false);
                    this.updateHUD();
                }
            } else {
                this.stormTickTimer = 0;
            }
        }
        this.updateMinimap();

        // 1. Actualizar jugador
        this.player.update(simDelta);

        // Separación física con obstáculos sólidos del mapa (cajas)
        if (this.world && this.world.crates) {
            this.player.checkObstacleCollisions(this.world.crates);
            this.enemyManager.checkObstacleCollisions(this.world.crates);
        }

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
        if (!this.portalVictoryTriggered) {
            if (this.world.checkPortalEntry(this.player.mesh.position)) {
                this.handlePortalVictory();
            } else if (!this.isCampaignMode && this.world.portal && !this.world.portal.isActive) {
                const distToPortal = Math.hypot(this.player.mesh.position.x - this.world.portal.position.x, this.player.mesh.position.z - this.world.portal.position.z);
                if (distToPortal < 3.5) {
                    const now = performance.now();
                    if (!this.lastPortalWarning || now - this.lastPortalWarning > 3500) {
                        this.lastPortalWarning = now;
                        this.showBanner('🔒 PORTAL ANCESTRAL SELLADO', '¡Cumple todos los objetivos del recuadro superior para abrirlo!');
                    }
                }
            }
        }

        
        // 6.5. Tracking del sol para sombras dinámicas fluidas en 2.5D
        if (this.sunLight && this.player && this.player.mesh) {
            this.sunLight.position.x = this.player.mesh.position.x + 20;
            this.sunLight.target.position.x = this.player.mesh.position.x;
            this.sunLight.target.updateMatrixWorld();
        }

        // Actualizar temporizador, progreso de nivel lineal y barra de jefe de campaña
        if (this.isCampaignMode && this.state === 'PLAYING') {
            const elapsedSec = Math.floor((performance.now() - this.campaignStartTime) / 1000);
            const m = Math.floor(elapsedSec / 60);
            const s = (elapsedSec % 60).toString().padStart(2, '0');
            const timerEl = document.getElementById('camp-hud-timer');
            if (timerEl) timerEl.textContent = `${m}:${s}`;

            if (!this.campaignIsBossFight && this.player && this.player.mesh) {
                const tot = (this.world && this.world.campaignTotalLength) || 110;
                const pct = Math.min(100, Math.max(0, (this.player.mesh.position.x / tot) * 100));
                const pFill = document.getElementById('camp-progress-fill');
                const pRun = document.getElementById('camp-progress-runner');
                if (pFill) pFill.style.width = `${pct}%`;
                if (pRun) pRun.style.left = `${pct}%`;
            } else if (this.campaignIsBossFight && this.campaignBossEnemy) {
                const bHp = Math.max(0, this.campaignBossEnemy.health);
                const bMax = this.campaignBossEnemy.maxHealth || 200;
                const bPct = Math.min(100, Math.max(0, (bHp / bMax) * 100));
                const bFill = document.getElementById('camp-boss-hp-fill');
                const bText = document.getElementById('camp-boss-hp-text');
                if (bFill) bFill.style.width = `${bPct}%`;
                if (bText) bText.textContent = `${Math.ceil(bHp)} / ${bMax}`;
            }
        }

        // 7. Actualizar enemigos con IA táctica
        this.enemyManager.update(simDelta, this.player, this.camera);

        // Actualizar controles táctiles móviles (cooldowns & glow)
        if (this.touchControls) {
            this.touchControls.update(this.player);
        }
        if (this.player) {
            this.maxComboAchieved = Math.max(this.maxComboAchieved || 0, this.player.comboCount || 0);
        }

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
        const aHpFill = document.getElementById('player-health-fill');
        if (aHpFill) aHpFill.style.width = `${healthPercent}%`;
        const aHpText = document.getElementById('player-health-text');
        if (aHpText) aHpText.textContent = `${Math.ceil(this.player.health)} / ${this.player.maxHealth}`;

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

    // =========================================================================
    // MÓDULO DE HISTORIAL Y AVANCES DEL JUGADOR
    // =========================================================================

    openHistoryModal() {
        const modal = document.getElementById('history-modal');
        if (!modal) return;

        const stats = storage.getCareerStats();
        const statMatches = document.getElementById('stat-matches-played');
        const statWins = document.getElementById('stat-victories');
        const statKills = document.getElementById('stat-total-kills');
        const statLevels = document.getElementById('stat-levels-completed');
        const statStars = document.getElementById('stat-stars-earned');
        const statBosses = document.getElementById('stat-bosses-defeated');

        if (statMatches) statMatches.textContent = stats.matchesPlayed || 0;
        if (statWins) statWins.textContent = stats.victories || 0;
        if (statKills) statKills.textContent = stats.totalKills || 0;
        if (statLevels) statLevels.textContent = `${stats.levelsCompleted || 0} / 50`;
        if (statStars) statStars.textContent = `${stats.starsEarned || 0} / 150`;
        if (statBosses) statBosses.textContent = `${stats.bossesDefeated || 0} / 10`;

        const listContainer = document.getElementById('matches-list-container');
        if (listContainer) {
            listContainer.innerHTML = '';
            const history = storage.getMatchHistory();
            if (!history || history.length === 0) {
                listContainer.innerHTML = '<div class="history-empty-hint">🗡️ Aún no has registrado partidas. ¡Juega en la Aventura o Battle Royale para ver tus resultados aquí!</div>';
            } else {
                history.forEach(m => {
                    const card = document.createElement('div');
                    card.className = `match-history-card ${m.isVictory ? 'is-win' : 'is-loss'}`;
                    const outcomeText = m.isVictory ? '🏆 VICTORIA' : '💀 DERROTA';
                    const dateStr = m.date || (m.timestamp ? new Date(m.timestamp).toLocaleDateString() : 'Reciente');
                    card.innerHTML = `
                        <div class="match-card-header">
                            <span class="match-mode-tag">${m.mode || 'Aventura'}</span>
                            <span class="match-outcome-badge ${m.isVictory ? 'badge-win' : 'badge-loss'}">${outcomeText}</span>
                        </div>
                        <div class="match-card-body">
                            <div class="match-map-title">${m.map || 'Colombia'}</div>
                            <div class="match-hero-info">Héroe: <strong>${m.hero || 'Chucho'}</strong> • Bajas: <strong>${m.kills || 0}</strong> • ⭐ ${m.stars || 0}</div>
                            <div class="match-rewards-row">🪙 +${m.coins || 0} | 💎 +${m.gems || 0} | ⏱️ ${m.duration ? m.duration + 's' : ''}</div>
                        </div>
                        <div class="match-card-date">${dateStr}</div>
                    `;
                    listContainer.appendChild(card);
                });
            }
        }

        modal.classList.add('open');
    }

    // =========================================================================
    // MÓDULO DE CAMPAÑA INDIVIDUAL: 10 MUNDOS DE COLOMBIA (AVENTURA NINJA)
    // =========================================================================

    openCampaignWorldsModal() {
        const modal = document.getElementById('campaign-worlds-modal');
        const grid = document.getElementById('campaign-worlds-grid');
        if (!modal || !grid) return;

        // Actualizar contadores globales de campaña
        const totalStarsEl = document.getElementById('campaign-total-stars');
        const totalLevelsEl = document.getElementById('campaign-total-levels');
        if (totalStarsEl) totalStarsEl.textContent = storage.getTotalCampaignStars();
        if (totalLevelsEl) totalLevelsEl.textContent = storage.getTotalCampaignLevelsCompleted();

        grid.innerHTML = '';

        for (let w = 1; w <= 10; w++) {
            const worldMeta = CAMPAIGN_WORLDS[w];
            const worldData = storage.getCampaignWorld(w);
            const isUnlocked = storage.isCampaignWorldUnlocked(w);

            let starsEarned = 0;
            let levelsCompleted = 0;
            if (worldData && worldData.levels) {
                Object.values(worldData.levels).forEach(lvl => {
                    if (lvl.completed) levelsCompleted++;
                    starsEarned += (lvl.stars || 0);
                });
            }

            const diffClass = 'diff-' + (worldMeta.difficulty.toLowerCase().replace(/\s+/g, '-'));

            const card = document.createElement('div');
            card.className = `camp-world-card ${isUnlocked ? 'unlocked' : 'locked'}`;

            let bossStatusPill = '';
            if (worldData && worldData.bossDefeated) {
                bossStatusPill = '<span class="camp-boss-status-pill boss-status-defeated">👑 ¡Jefe Derrotado!</span>';
            } else if (worldData && worldData.bossUnlocked) {
                bossStatusPill = '<span class="camp-boss-status-pill boss-status-ready">⚔️ ¡Jefe Disponible!</span>';
            } else {
                bossStatusPill = '<span class="camp-boss-status-pill boss-status-locked">🔒 Jefe Bloqueado</span>';
            }

            card.innerHTML = `
                <div class="camp-card-banner" style="background: linear-gradient(135deg, ${this.hexColorToRgba(worldMeta.themeColor, 0.65)}, rgba(15, 23, 42, 0.95));">
                    <span class="camp-card-emoji">${worldMeta.emoji}</span>
                    <span class="camp-difficulty-pill ${diffClass}">${worldMeta.difficulty}</span>
                </div>
                <div class="camp-card-content">
                    <div class="camp-world-num">Mundo ${w} • ${worldMeta.region}</div>
                    <div class="camp-world-name">${worldMeta.name}</div>
                    <div class="camp-world-lore">${worldMeta.lore}</div>

                    <div class="camp-world-progress-bar">
                        <div class="camp-world-progress-fill" style="width: ${(levelsCompleted / 5) * 100}%;"></div>
                    </div>

                    <div class="camp-world-meta-row">
                        <span>⭐ ${starsEarned} / 15</span>
                        <span>Niveles: ${levelsCompleted} / 5</span>
                    </div>

                    ${bossStatusPill}

                    <button class="btn-explore-world">
                        ${isUnlocked ? 'EXPLORAR MUNDO ➔' : '🔒 BLOQUEADO (Supera Mundo ' + (w - 1) + ')'}
                    </button>
                </div>
            `;

            if (isUnlocked) {
                card.addEventListener('click', () => {
                    modal.classList.remove('open');
                    this.openCampaignLevelsModal(w);
                });
            }

            grid.appendChild(card);
        }

        modal.classList.add('open');
    }

    openCampaignLevelsModal(worldNum = 1) {
        const modal = document.getElementById('campaign-levels-modal');
        const container = document.getElementById('campaign-levels-container');
        if (!modal || !container) return;

        const worldMeta = CAMPAIGN_WORLDS[worldNum] || CAMPAIGN_WORLDS[1];
        const worldData = storage.getCampaignWorld(worldNum);

        const iconEl = document.getElementById('campaign-world-icon');
        const titleEl = document.getElementById('campaign-levels-world-title');
        const subEl = document.getElementById('campaign-levels-world-sub');

        if (iconEl) iconEl.textContent = worldMeta.emoji;
        if (titleEl) titleEl.textContent = `MUNDO ${worldNum}: ${worldMeta.name.toUpperCase()}`;
        if (subEl) subEl.textContent = `${worldMeta.region} • Dificultad: ${worldMeta.difficulty}`;

        container.innerHTML = '';

        // 5 NIVELES DE PLATAFORMAS 3D
        for (let l = 1; l <= 5; l++) {
            const lvlMeta = (worldMeta.levels && worldMeta.levels[l - 1]) || { title: 'Nivel ' + l, targetTime: 60 };
            const lvlData = (worldData && worldData.levels) ? worldData.levels[l] : { unlocked: l === 1, stars: 0, completed: false };
            const isUnlocked = storage.isCampaignLevelUnlocked(worldNum, l);
            const stars = (lvlData && lvlData.stars) || 0;

            const node = document.createElement('div');
            node.className = `level-card-node ${isUnlocked ? 'unlocked' : 'locked'}`;

            let starsHtml = '';
            for (let s = 1; s <= 3; s++) {
                if (s <= stars) {
                    starsHtml += '<span class="star-earned">⭐</span>';
                } else {
                    starsHtml += '<span class="star-empty">⭐</span>';
                }
            }

            const bestTimeText = (lvlData && lvlData.bestTime) ? `⏱️ Récord: ${lvlData.bestTime}s` : `⏱️ Meta: ${lvlMeta.targetTime}s`;

            node.innerHTML = `
                <div class="level-num-badge">${l}</div>
                <div class="level-title-node">${lvlMeta.title}</div>
                <div class="level-stars-row">${starsHtml}</div>
                <div class="level-best-time">${bestTimeText}</div>
                <button class="btn-play-level-node">
                    ${isUnlocked ? (lvlData.completed ? 'JUGAR DE NUEVO' : 'JUGAR') : '🔒 BLOQUEADO'}
                </button>
            `;

            if (isUnlocked) {
                node.addEventListener('click', () => {
                    modal.classList.remove('open');
                    this.startCampaignLevel(worldNum, l);
                });
            }

            container.appendChild(node);
        }

        // NODO DEL JEFE FINAL DEL MUNDO
        const bossSpec = worldMeta.boss;
        const bossUnlocked = worldData && worldData.bossUnlocked;
        const bossDefeated = worldData && worldData.bossDefeated;

        const bossNode = document.createElement('div');
        bossNode.className = `boss-card-node ${bossUnlocked ? 'unlocked' : 'locked'}`;

        const bossHp = bossSpec.health || bossSpec.hp || 200;
        const bossDmg = bossSpec.damage || 14;

        bossNode.innerHTML = `
            <div class="boss-node-info">
                <div class="boss-node-avatar">👑</div>
                <div>
                    <div class="boss-node-title">${bossSpec.name}</div>
                    <div class="boss-node-sub">${bossSpec.title} • Vida: ${bossHp} HP • Daño: ${bossDmg}</div>
                </div>
            </div>
            <button class="btn-fight-boss-node">
                ${bossUnlocked ? (bossDefeated ? 'DERROTADO (REPETIR ⚔️)' : '¡LUCHAR CONTRA JEFE! ⚔️') : '🔒 SUPERA UN NIVEL'}
            </button>
        `;

        if (bossUnlocked) {
            bossNode.addEventListener('click', () => {
                modal.classList.remove('open');
                this.startCampaignBoss(worldNum);
            });
        }

        container.appendChild(bossNode);
        modal.classList.add('open');
    }

    startCampaignLevel(worldNum = 1, levelNum = 1) {
        if (this.levelManager) {
            return this.levelManager.startCampaignLevel(worldNum, levelNum);
        }
    }

    startCampaignBoss(worldNum = 1) {
        if (this.levelManager) {
            return this.levelManager.startCampaignBoss(worldNum);
        }
    }

    handleCampaignPortalVictory() {
        sounds.playVictoryFanfare();
        const worldNum = this.campaignCurrentWorld;
        const levelNum = this.campaignCurrentLevel;
        const worldMeta = CAMPAIGN_WORLDS[worldNum] || CAMPAIGN_WORLDS[1];
        const lvlMeta = (worldMeta.levels && worldMeta.levels[levelNum - 1]) || { title: 'Nivel ' + levelNum, targetTime: 60 };

        const elapsedSec = Math.floor((performance.now() - this.campaignStartTime) / 1000);
        const collectedGems = this.campaignCollectedGems || 0;

        // Cálculo de Estrellas
        const star1 = 1; // Llegar a la meta
        const star2 = (collectedGems >= 3) ? 1 : 0; // 3 Cristales
        const star3 = (elapsedSec <= lvlMeta.targetTime) ? 1 : 0; // Tiempo récord
        const totalStars = star1 + star2 + star3;

        // Recompensas
        const coinsReward = 50 + totalStars * 20;
        const gemsReward = totalStars >= 3 ? 5 : (totalStars >= 2 ? 3 : 1);
        const xpReward = 100 + totalStars * 40;

        // Guardar resultado con métricas avanzadas v20.0
        const resultStats = {
            stars: totalStars,
            time: elapsedSec,
            gems: collectedGems,
            maxCombo: this.maxComboAchieved || (this.player ? this.player.comboCount : 0) || 0,
            damageTaken: this.playerDamageTakenThisLevel || 0,
            enemiesDefeated: this.enemiesDefeatedThisLevel || 0
        };
        storage.recordCampaignLevelResult(worldNum, levelNum, resultStats);

        // Registrar partida en el historial
        storage.recordMatchResult({
            mode: 'Aventura Ninja',
            map: `Mundo ${worldNum}: ${worldMeta.name} — Nivel ${levelNum}`,
            hero: (CHARACTERS_DATA[storage.getSelectedCharacter()] || {}).name || 'Chucho',
            outcome: `Nivel Superado (${totalStars} ⭐)`,
            isVictory: true,
            kills: 0,
            stars: totalStars,
            time: `${elapsedSec}s`,
            coins: coinsReward,
            gems: gemsReward,
            xp: xpReward
        });

        storage.addCoins(coinsReward);
        storage.addGems(gemsReward);
        storage.addXP(xpReward);
        this.updateHUD();

        // Mostrar Modal de Victoria
        const modal = document.getElementById('campaign-victory-modal');
        if (!modal) return;

        const ribbonEl = document.getElementById('camp-victory-ribbon');
        const titleEl = document.getElementById('camp-victory-title');
        const timeEl = document.getElementById('camp-victory-time');
        const gemsEl = document.getElementById('camp-victory-gems');
        const coinsEl = document.getElementById('camp-victory-coins');
        const xpEl = document.getElementById('camp-victory-xp');

        if (ribbonEl) ribbonEl.textContent = totalStars === 3 ? '⭐⭐⭐ ¡DOMINIO PERFECTO! ⭐⭐⭐' : '⭐ ¡NIVEL COMPLETADO! ⭐';
        if (titleEl) titleEl.textContent = `MUNDO ${worldNum}: ${worldMeta.name.toUpperCase()} — NIVEL ${levelNum}`;
        if (timeEl) timeEl.textContent = `${elapsedSec}s (Meta: ${lvlMeta.targetTime}s)`;
        if (gemsEl) gemsEl.textContent = `${collectedGems} / 3`;
        if (coinsEl) coinsEl.textContent = `+${coinsReward}`;
        if (xpEl) xpEl.textContent = `+${xpReward} XP`;

        // Activar estrellas conseguidas
        const s1 = document.getElementById('camp-star-1');
        const s2 = document.getElementById('camp-star-2');
        const s3 = document.getElementById('camp-star-3');

        if (s1) { if (star1) s1.classList.add('earned'); else s1.classList.remove('earned'); }
        if (s2) { if (star2) s2.classList.add('earned'); else s2.classList.remove('earned'); }
        if (s3) { if (star3) s3.classList.add('earned'); else s3.classList.remove('earned'); }

        const btnNext = document.getElementById('btn-camp-next');
        if (btnNext) {
            btnNext.textContent = (levelNum < 5) ? 'SIGUIENTE NIVEL ➔' : '¡LUCHAR CONTRA EL JEFE! 👑';
        }

        modal.classList.add('open');
    }

    handleCampaignBossDefeated(bossEnemy) {
        sounds.playVictoryFanfare();
        const worldNum = this.campaignCurrentWorld;
        const worldMeta = CAMPAIGN_WORLDS[worldNum] || CAMPAIGN_WORLDS[1];
        const bossSpec = worldMeta.boss;

        const elapsedSec = Math.floor((performance.now() - this.campaignStartTime) / 1000);
        const coinsReward = bossSpec.rewardCoins || (250 + worldNum * 50);
        const gemsReward = bossSpec.rewardGems || (20 + worldNum * 5);
        const xpReward = 400 + worldNum * 80;

        // Registrar jefe derrotado y desbloquear siguiente mundo
        storage.recordCampaignBossDefeated(worldNum);

        // Registrar victoria contra jefe en el historial
        storage.recordMatchResult({
            mode: 'Jefe Ancestral',
            map: `Mundo ${worldNum}: ${worldMeta.name}`,
            hero: (CHARACTERS_DATA[storage.getSelectedCharacter()] || {}).name || 'Chucho',
            outcome: `¡${bossSpec.name} Vencido! 👑`,
            isVictory: true,
            kills: 1,
            stars: 3,
            time: `${elapsedSec}s`,
            coins: coinsReward,
            gems: gemsReward,
            xp: xpReward
        });

        storage.addCoins(coinsReward);
        storage.addGems(gemsReward);
        storage.addXP(xpReward);
        this.updateHUD();

        // Mostrar Modal de Victoria de Jefe
        const modal = document.getElementById('campaign-victory-modal');
        if (!modal) return;

        const ribbonEl = document.getElementById('camp-victory-ribbon');
        const titleEl = document.getElementById('camp-victory-title');
        const timeEl = document.getElementById('camp-victory-time');
        const gemsEl = document.getElementById('camp-victory-gems');
        const coinsEl = document.getElementById('camp-victory-coins');
        const xpEl = document.getElementById('camp-victory-xp');

        if (ribbonEl) ribbonEl.textContent = '👑 ¡JEFE DERROTADO CON HONOR! 👑';
        if (titleEl) titleEl.textContent = (worldNum < 10)
            ? `¡MUNDO ${worldNum} LIBERADO! EL MUNDO ${worldNum + 1} HA SIDO DESBLOQUEADO`
            : '🏆 ¡EL INVERNAL HA SIDO VENCIDO! ¡HAS SALVADO A TODA COLOMBIA!';

        if (timeEl) timeEl.textContent = `${elapsedSec}s de combate épico`;
        if (gemsEl) gemsEl.textContent = `¡Biodiversidad Protegida!`;
        if (coinsEl) coinsEl.textContent = `+${coinsReward}`;
        if (xpEl) xpEl.textContent = `+${xpReward} XP`;

        // Las 3 estrellas brillan por la victoria del jefe
        const s1 = document.getElementById('camp-star-1');
        const s2 = document.getElementById('camp-star-2');
        const s3 = document.getElementById('camp-star-3');
        if (s1) s1.classList.add('earned');
        if (s2) s2.classList.add('earned');
        if (s3) s3.classList.add('earned');

        const btnNext = document.getElementById('btn-camp-next');
        if (btnNext) {
            btnNext.textContent = (worldNum < 10) ? `IR AL MUNDO ${worldNum + 1} ➔` : 'VER MAPA DE COLOMBIA 🗺️';
        }

        modal.classList.add('open');
    }

    hexColorToRgba(hex, alpha = 1.0) {
        const r = (hex >> 16) & 255;
        const g = (hex >> 8) & 255;
        const b = hex & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
