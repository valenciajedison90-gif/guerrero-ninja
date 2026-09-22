// js/main.js - Bucle Principal del Juego, Combate, Lógica de Tienda y Enlace de Sistemas
import * as THREE from 'three';
import { sounds } from './sound.js?v=4.0';
import { storage } from './storage.js?v=4.0';
import { WEAPONS } from './weapons.js?v=4.0';
import { ParticleSystem } from './particles.js?v=4.0';
import { World } from './world.js?v=4.0';
import { Player } from './player.js?v=4.0';
import { EnemyManager } from './enemies.js?v=4.0';
import { MultiplayerManager } from './multiplayer.js?v=4.0';
import { TouchControlsManager } from './touch.js?v=4.0';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.clock = new THREE.Clock();

        // 1. Inicializar Three.js
        this.setupRenderer();
        this.setupSceneAndLights();

        // 2. Inicializar subsistemas
        this.particles = new ParticleSystem(this.scene);
        this.world = new World(this.scene);
        this.player = new Player(this.scene, this.camera, this.renderer.domElement);
        this.enemyManager = new EnemyManager(this.scene, this.particles);
        this.multiplayer = new MultiplayerManager(this.scene, this.particles);

        // Controles táctiles móviles estilo Free Fire
        this.touchControls = new TouchControlsManager(this.player, this);

        // Conectar eventos de combate del jugador
        this.player.onAttackCallback = (weaponId, combo) => this.handlePlayerAttack(weaponId, combo);

        // 3. Inicializar Interfaz de Usuario
        this.setupUI();
        this.updateHUD();

        // 4. Iniciar bucle de animación
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);

        // Escuchar redimensionamiento de ventana
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupRenderer() {
        this.isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 900);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: !this.isMobile,
            powerPreference: 'default',
            precision: this.isMobile ? 'mediump' : 'highp'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Clave de rendimiento móvil: pixelRatio a 1.0 en celulares evita saturar la GPU y calentar el teléfono
        this.renderer.setPixelRatio(this.isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5));

        // Sombras pesadas en tiempo real desactivadas en celulares para garantizar 60 FPS estables
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
        // En móviles, aumentamos la luz ambiental para un aspecto vibrante sin sobrecargar el procesador
        const ambientIntensity = this.isMobile ? 0.95 : 0.7;
        const ambientLight = new THREE.AmbientLight(0xffffff, ambientIntensity);
        this.scene.add(ambientLight);

        // Luz de sol brillante
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
        } else {
            sunLight.castShadow = false;
        }

        this.scene.add(sunLight);

        // Luz hemisférica (cielo azul / suelo verde suave)
        const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x86efac, 0.45);
        this.scene.add(hemiLight);
    }

    handlePlayerAttack(weaponId, combo) {
        const weapon = WEAPONS[weaponId] || WEAPONS.bokken;
        const playerPos = this.player.mesh.position;

        // Vector frontal hacia donde mira el ninja
        const forward = new THREE.Vector3(
            Math.sin(this.player.mesh.rotation.y),
            0,
            Math.cos(this.player.mesh.rotation.y)
        ).normalize();

        // 1. Si es arma arrojadiza (Shurikens)
        if (weapon.type === 'ranged') {
            const spawnPos = playerPos.clone().add(new THREE.Vector3(0, 1.3, 0)).addScaledVector(forward, 0.8);
            this.particles.spawnShurikenProjectile(spawnPos, forward, weapon.damage, weapon.element);
            this.multiplayer.sendAttack(weaponId, combo, forward);
            return;
        }

        // 2. Si es arma cuerpo a cuerpo (Espadas)
        // Efecto visual de estela de corte
        const slashPos = playerPos.clone().add(new THREE.Vector3(0, 1.2, 0)).addScaledVector(forward, 1.2);
        this.particles.createSlashEffect(slashPos, forward, weapon.element);
        this.multiplayer.sendAttack(weaponId, combo, forward);

        // Comprobar enemigos en el rango de alcance
        let hitCount = 0;
        const range = weapon.range;

        this.enemyManager.enemies.forEach(enemy => {
            const enemyPos = enemy.mesh.position;
            const dist = playerPos.distanceTo(enemyPos);

            if (dist <= range + 0.8) {
                // Comprobar si está frente al jugador (ángulo menor a 110 grados)
                const toEnemy = new THREE.Vector3().subVectors(enemyPos, playerPos).normalize();
                const angle = forward.angleTo(toEnemy);

                if (angle < Math.PI * 0.65) {
                    // Impacto acertado
                    hitCount++;
                    const isCrit = Math.random() < 0.25; // 25% crítico
                    let damage = weapon.damage;
                    if (isCrit) damage = Math.round(damage * 1.6);

                    // Bonificación por nivel del jugador
                    damage += (storage.data.level - 1) * 3;

                    this.enemyManager.damageEnemy(enemy, damage, isCrit, toEnemy, (defeatedEnemy) => {
                        this.handleEnemyDefeated(defeatedEnemy);
                    });
                }
            }
        });

        if (hitCount > 0) {
            this.showCombo(combo);
        }
    }

    handleEnemyDefeated(enemy) {
        storage.incrementEnemiesDefeated();

        // Añadir XP
        const xpResult = storage.addXP(enemy.xpDrop);
        this.updateHUD();

        if (xpResult.leveledUp) {
            sounds.playLevelUp();
            this.player.maxHealth += 15;
            this.player.health = this.player.maxHealth;
            this.showBanner(
                `¡SUBISTE AL NIVEL ${xpResult.newLevel}! 🎉`,
                `+15 Vida Máxima aumentada y más poder de ataque`
            );
        }
    }

    showCombo(comboIndex) {
        const comboEl = document.getElementById('combo-display');
        const text = comboIndex === 2 ? '¡CORTE GIRATORIO x3!' : (comboIndex === 1 ? '¡GOLPE CRÍTICO x2!' : '¡IMPACTO!');
        comboEl.textContent = text;
        comboEl.classList.remove('active');
        void comboEl.offsetWidth; // Forzar reflujo de animación
        comboEl.classList.add('active');

        clearTimeout(this.comboTimeout);
        this.comboTimeout = setTimeout(() => {
            comboEl.classList.remove('active');
        }, 1100);
    }

    showBanner(title, subtitle) {
        const banner = document.getElementById('banner-notification');
        document.getElementById('banner-title').textContent = title;
        document.getElementById('banner-subtitle').textContent = subtitle;

        banner.classList.remove('show');
        void banner.offsetWidth;
        banner.classList.add('show');
    }

    setupUI() {
        // Configurar selección de ranuras de la Hotbar
        const slots = document.querySelectorAll('.hotbar-slot');
        slots.forEach((slot, index) => {
            slot.addEventListener('click', () => {
                this.selectWeaponSlot(index);
            });
        });

        // Atajos numéricos 1 - 5 y tecla T para tienda
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
            }
        });

        // Botón Tienda
        document.getElementById('btn-open-shop').addEventListener('click', () => this.toggleShop());
        document.getElementById('btn-close-shop').addEventListener('click', () => this.closeShop());

        // Botón Jefe
        document.getElementById('btn-spawn-boss').addEventListener('click', () => {
            this.enemyManager.spawnBoss(new THREE.Vector3(0, 0, -2));
            this.showBanner('¡EL GRAN JEFE HA APARECIDO! 👹', '¡Derrótalo para ganar 160 monedas doradas!');
        });

        // Botón Sonido
        const soundBtn = document.getElementById('btn-toggle-sound');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                sounds.enabled = !sounds.enabled;
                document.getElementById('sound-icon').textContent = sounds.enabled ? '🔊' : '🔇';
            });
        }

        // Botón Alternar Controles Táctiles (Móviles / PC)
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

        // Rellenar cuadrícula de la tienda
        this.renderShopItems();

        // ---------------- MULTIJUGADOR Y SALAS ----------------
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

        // Función para cerrar lobby y comenzar inmediatamente a jugar
        const startCombatNow = () => {
            document.getElementById('multiplayer-modal').classList.remove('open');
            this.showBanner('¡DOJO NINJA LISTO! 🥷', '¡Usa el joystick y los botones para combatir!');
            document.body.classList.add('touch-enabled', 'touch-active');
            const tc = document.getElementById('mobile-touch-controls');
            if (tc) tc.style.display = 'block';
        };

        // Botón Jugar Solo
        const btnSolo = document.getElementById('btn-start-solo');
        if (btnSolo) btnSolo.addEventListener('click', startCombatNow);

        // Botón Jugar Ya (encabezado para celular)
        const btnQuick = document.getElementById('btn-quick-start');
        if (btnQuick) btnQuick.addEventListener('click', startCombatNow);

        // Botón Crear Sala
        const btnCreate = document.getElementById('btn-create-room');
        if (btnCreate) {
            btnCreate.addEventListener('click', () => {
                const name = (nameInput ? nameInput.value : 'Ninja Pro').trim();
                this.multiplayer.createRoom(name, selectedColor);
            });
        }

        // Botón Ir a Unirse
        const btnGotoJoin = document.getElementById('btn-goto-join');
        if (btnGotoJoin) {
            btnGotoJoin.addEventListener('click', () => {
                document.getElementById('lobby-modes-view').style.display = 'none';
                document.getElementById('lobby-join-view').style.display = 'block';
                document.getElementById('join-error-msg').style.display = 'none';
            });
        }

        // Botón Volver a Modos
        const btnBack = document.getElementById('btn-back-to-modes');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                document.getElementById('lobby-join-view').style.display = 'none';
                document.getElementById('lobby-modes-view').style.display = 'block';
            });
        }

        // Botón Confirmar Unirse con Código
        const btnConfirmJoin = document.getElementById('btn-confirm-join');
        if (btnConfirmJoin) {
            btnConfirmJoin.addEventListener('click', () => {
                const code = document.getElementById('input-join-room-code').value.trim();
                const name = (nameInput ? nameInput.value : 'Ninja Pro').trim();
                if (!code) {
                    const err = document.getElementById('join-error-msg');
                    err.textContent = 'Por favor escribe el código de la sala.';
                    err.style.display = 'block';
                    return;
                }
                this.multiplayer.joinRoom(code, name, selectedColor);
            });
        }

        // Botón Entrar al Dojo (después de crear sala)
        const btnStartRoom = document.getElementById('btn-start-playing-room');
        if (btnStartRoom) {
            btnStartRoom.addEventListener('click', () => {
                document.getElementById('multiplayer-modal').classList.remove('open');
                this.showBanner(`¡SALA ${this.multiplayer.roomCode} ACTIVA!`, '¡Combatan juntos contra los enemigos!');
            });
        }

        // Botón cerrar lobby
        const btnCloseLobby = document.getElementById('btn-close-lobby');
        if (btnCloseLobby) {
            btnCloseLobby.addEventListener('click', () => {
                document.getElementById('multiplayer-modal').classList.remove('open');
            });
        }

        // Botón abrir lobby desde HUD
        const btnOpenLobby = document.getElementById('btn-open-multiplayer');
        if (btnOpenLobby) {
            btnOpenLobby.addEventListener('click', () => {
                document.getElementById('multiplayer-modal').classList.add('open');
            });
        }

        // Función para copiar código al portapapeles
        const copyCode = (code, btn) => {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(code).then(() => {
                    const originalText = btn.textContent;
                    btn.textContent = '¡Copiado! ✓';
                    setTimeout(() => { btn.textContent = originalText; }, 1800);
                }).catch(() => {});
            }
        };

        const btnCopyLobby = document.getElementById('btn-copy-lobby-code');
        if (btnCopyLobby) {
            btnCopyLobby.addEventListener('click', () => {
                copyCode(this.multiplayer.roomCode || '', btnCopyLobby);
            });
        }

        const btnCopyHud = document.getElementById('btn-copy-hud-code');
        if (btnCopyHud) {
            btnCopyHud.addEventListener('click', () => {
                copyCode(this.multiplayer.roomCode || '', btnCopyHud);
            });
        }

        // Callbacks de Eventos de Red
        this.multiplayer.onRoomCreated = (roomCode, players) => {
            document.getElementById('lobby-modes-view').style.display = 'none';
            document.getElementById('lobby-created-view').style.display = 'block';
            document.getElementById('room-code-display').textContent = roomCode;

            // Mostrar badge en el HUD
            const hudBadge = document.getElementById('hud-room-badge');
            document.getElementById('hud-room-code').textContent = roomCode;
            hudBadge.style.display = 'flex';

            this.updateLobbyPlayersList(players);
            sounds.playLevelUp();
        };

        this.multiplayer.onRoomJoined = (roomCode, players) => {
            document.getElementById('multiplayer-modal').classList.remove('open');
            const hudBadge = document.getElementById('hud-room-badge');
            document.getElementById('hud-room-code').textContent = roomCode;
            hudBadge.style.display = 'flex';

            this.showBanner(`¡TE HAS UNIDO A LA SALA ${roomCode}! 🥷`, '¡Combate en equipo en el dojo!');
            sounds.playLevelUp();
        };

        this.multiplayer.onPlayerJoined = (player) => {
            sounds.playPoof();
            this.showBanner(`¡${player.name} SE UNIÓ! 🥷`, '¡Un nuevo ninja ha entrado al dojo!');
            const chipsContainer = document.getElementById('lobby-players-list');
            if (chipsContainer) {
                const chip = document.createElement('div');
                chip.className = 'player-chip';
                const colorHex = typeof player.color === 'number' ? `#${player.color.toString(16).padStart(6, '0')}` : player.color;
                chip.innerHTML = `<span class="player-chip-color" style="background: ${colorHex};"></span><span>${player.name}</span>`;
                chipsContainer.appendChild(chip);
            }
        };

        this.multiplayer.onPlayerLeft = (id, name) => {
            this.showBanner(`¡${name} HA SALIDO DEL DOJO!`, '');
        };

        this.multiplayer.onError = (message) => {
            const err = document.getElementById('join-error-msg');
            if (err) {
                err.textContent = message;
                err.style.display = 'block';
            }
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
                nameEl.textContent = w.name.split(' ')[0]; // Nombre corto
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
        grid.innerHTML = '';

        Object.values(WEAPONS).forEach(weapon => {
            const isUnlocked = storage.isUnlocked(weapon.id);
            const isEquipped = storage.getActiveWeaponId() === weapon.id;
            const canAfford = storage.data.coins >= weapon.cost;

            const card = document.createElement('div');
            card.className = `weapon-card ${isUnlocked ? 'owned' : ''}`;

            card.innerHTML = `
                <div class="weapon-card-icon">${weapon.icon}</div>
                <div class="weapon-card-name">${weapon.name}</div>
                <div class="weapon-card-desc">${weapon.desc}</div>
                <div class="weapon-stats-row">
                    <div class="stat-item">⚔️ Daño: ${weapon.damage}</div>
                    <div class="stat-item">⚡ Vel: ${weapon.attackSpeed}s</div>
                </div>
                <button class="btn-buy ${
                    isEquipped ? 'equipped' : (isUnlocked ? 'equip-now' : (canAfford ? 'can-buy' : 'disabled'))
                }" data-weapon-id="${weapon.id}">
                    ${
                        isEquipped
                            ? '✓ EQUIPADA'
                            : (isUnlocked
                                ? '⚡ EQUIPAR'
                                : `🪙 COMPRAR ${weapon.cost}`)
                    }
                </button>
            `;

            const btn = card.querySelector('.btn-buy');
            btn.addEventListener('click', () => this.handleShopAction(weapon.id));

            grid.appendChild(card);
        });
    }

    handleShopAction(weaponId) {
        const weapon = WEAPONS[weaponId];
        const isUnlocked = storage.isUnlocked(weaponId);

        if (isUnlocked) {
            // Equipar en la ranura actual
            storage.setHotbarSlot(storage.data.currentSlot, weaponId);
            this.player.equipWeapon(weaponId);
            sounds.playSlash(weapon.element);
            this.updateHotbarVisuals();
            this.renderShopItems();
        } else if (storage.spendCoins(weapon.cost)) {
            // Comprar y desbloquear
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

    updateHUD() {
        // Vida
        const healthPercent = Math.max(0, (this.player.health / this.player.maxHealth) * 100);
        document.getElementById('player-health-fill').style.width = `${healthPercent}%`;
        document.getElementById('player-health-text').textContent = `${Math.ceil(this.player.health)} / ${this.player.maxHealth}`;

        // Monedas
        const coinEl = document.getElementById('coin-count');
        coinEl.textContent = storage.data.coins;

        // Nivel y XP
        document.getElementById('player-level-badge').textContent = `NVL ${storage.data.level}`;
        const xpPercent = Math.min(100, (storage.data.xp / storage.data.xpToNext) * 100);
        document.getElementById('player-xp-fill').style.width = `${xpPercent}%`;

        // Actualizar visuales de la hotbar
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
        this.renderer.setPixelRatio(this.isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5));
    }

    animate() {
        requestAnimationFrame(this.animate);

        const delta = Math.min(this.clock.getDelta(), 0.1);

        // 1. Actualizar jugador (física, animaciones, controles)
        this.player.update(delta);

        // 2. Comprobar trampolines del mundo
        this.world.checkTrampolines(this.player);

        // 3. Comprobar monedas flotantes en el aire (parkour)
        this.world.checkFloatingCoins(this.player.mesh.position, (coins) => {
            storage.addCoins(coins);
            sounds.playCoin();
            this.updateHUD();
        });

        // 4. Actualizar enemigos
        this.enemyManager.update(delta, this.player, this.camera);

        // 5. Actualizar partículas y recoger monedas de enemigos
        this.particles.update(delta, this.player.mesh.position, (coins) => {
            storage.addCoins(coins);
            this.updateHUD();
        });

        // 6. Colisiones de proyectiles (Shurikens) con enemigos
        for (const proj of this.particles.projectiles) {
            if (!proj.active) continue;
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
        }

        // 7. Actualizar multijugador y transmitir posición de red
        this.multiplayer.update(delta);
        this.multiplayer.sendLocalUpdate(this.player.getNetworkState());

        // Actualizar barra de vida en HUD continuamente
        const healthPercent = Math.max(0, (this.player.health / this.player.maxHealth) * 100);
        document.getElementById('player-health-fill').style.width = `${healthPercent}%`;
        document.getElementById('player-health-text').textContent = `${Math.ceil(this.player.health)} / ${this.player.maxHealth}`;

        // Renderizar escena
        this.renderer.render(this.scene, this.camera);
    }
}

// Iniciar juego cuando el documento esté listo
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
