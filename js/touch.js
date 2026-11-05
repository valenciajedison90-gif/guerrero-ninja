// js/touch.js - Controles Táctiles para Celular Estilo Free Fire
import { storage } from './storage.js?v=20.1';
import { CHARACTERS_DATA } from './characters.js?v=20.1';
// Soporta Multi-Touch simultáneo, joystick responsivo con zona muerta y cámara panorámica suave

export class TouchControlsManager {
    constructor(player, game) {
        this.player = player;
        this.game = game;

        // Elementos del DOM
        this.container = document.getElementById('mobile-touch-controls');
        this.joystickZone = document.getElementById('joystick-zone');
        this.joystickBase = document.getElementById('joystick-base');
        this.joystickKnob = document.getElementById('joystick-knob');
        this.mobileActions = document.getElementById('mobile-actions');

        this.btnAttack = document.getElementById('btn-touch-attack');
        this.btnSpin = document.getElementById('btn-touch-spin');
        this.btnJump = document.getElementById('btn-touch-jump');
        this.btnDash = document.getElementById('btn-touch-dash');
        this.btnSkill = document.getElementById('btn-touch-skill');
        this.btnSwitch = document.getElementById('btn-touch-switch');
        this.btnParry = document.getElementById('btn-touch-parry');
        this.btnShuriken = document.getElementById('btn-touch-shuriken');
        this.weaponIconEl = document.getElementById('touch-weapon-icon');

        // Estado de toques
        this.joystickTouchId = null;
        this.cameraTouchId = null;
        this.lastCameraPos = { x: 0, y: 0 };
        this.attackInterval = null;

        // Configuración del joystick
        this.maxRadius = 55; // Radio máximo de desplazamiento del pomo en px
        this.deadzone = 8;   // Zona muerta mínima para evitar temblores
        this.baseCenter = { x: 0, y: 0 };

        this.isLeftHanded = storage.getSetting('leftHanded', false);
        this.buttonSize = storage.getSetting('buttonSize', 'normal');
        this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 1024);

        this.init();
    }

    init() {
        if (!this.container) return;

        // Añadir clase indicando soporte táctil
        document.body.classList.add('touch-enabled');

        this.setupJoystickEvents();
        this.setupCameraTouchEvents();
        this.setupActionButtons();
        this.setLeftHanded(this.isLeftHanded);
        this.setButtonSize(this.buttonSize);

        // Al tocar por primera vez, asegurar activación de clases visuales
        window.addEventListener('touchstart', () => {
            document.body.classList.add('touch-active');
        }, { once: true, passive: true });
    }

    // 1. Manejo del Joystick Virtual Izquierdo
    setupJoystickEvents() {
        const updateBaseCenter = () => {
            if (this.joystickBase) {
                const rect = this.joystickBase.getBoundingClientRect();
                this.baseCenter = {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                };
            }
        };

        window.addEventListener('resize', updateBaseCenter);
        setTimeout(updateBaseCenter, 200);

        // Iniciar joystick al tocar la mitad izquierda de la pantalla
        window.addEventListener('touchstart', (e) => {
            // SOLO activo durante partida en juego ('PLAYING')
            if (!this.game || this.game.state !== 'PLAYING') return;

            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                // Lado izquierdo de la pantalla (excluyendo zona de menús o modales)
                const isLeftZone = touch.clientX < window.innerWidth * 0.48;
                const isRightZone = touch.clientX > window.innerWidth * 0.52;
                const isInJoyZone = this.isLeftHanded ? isRightZone : isLeftZone;
                if (this.joystickTouchId === null && isInJoyZone && touch.clientY > window.innerHeight * 0.15) {
                    const target = touch.target || e.target;
                    if (target && target.closest && (
                        target.closest('#main-menu-overlay') ||
                        target.closest('.modal-overlay') ||
                        target.closest('.menu-side-nav') ||
                        target.closest('.btn-hud') ||
                        target.closest('.player-card') ||
                        target.closest('#mission-hud') ||
                        target.closest('.btn-touch-action')
                    )) {
                        continue;
                    }

                    this.joystickTouchId = touch.identifier;

                    // Centrar visualmente el joystick bajo el pulgar
                    if (this.joystickZone) {
                        this.joystickZone.style.left = `${touch.clientX - 65}px`;
                        this.joystickZone.style.top = `${touch.clientY - 65}px`;
                        this.joystickZone.style.bottom = 'auto';
                    }
                    this.baseCenter = { x: touch.clientX, y: touch.clientY };

                    this.handleJoystickMove(touch.clientX, touch.clientY);
                    if (this.joystickBase) this.joystickBase.classList.add('active');
                    break;
                }
            }
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (this.joystickTouchId === null) return;
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === this.joystickTouchId) {
                    this.handleJoystickMove(touch.clientX, touch.clientY);
                    e.preventDefault();
                    break;
                }
            }
        }, { passive: false });

        const endJoystick = (e) => {
            if (this.joystickTouchId === null) return;
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === this.joystickTouchId) {
                    this.joystickTouchId = null;
                    if (this.joystickKnob) {
                        this.joystickKnob.style.transform = 'translate(0px, 0px)';
                    }
                    if (this.joystickBase) {
                        this.joystickBase.classList.remove('active');
                    }
                    if (this.joystickZone) {
                        this.joystickZone.style.left = '';
                        this.joystickZone.style.top = '';
                        this.joystickZone.style.bottom = '';
                    }
                    this.player.setTouchMovement(0, 0);
                    break;
                }
            }
        };

        window.addEventListener('touchend', endJoystick, { passive: false });
        window.addEventListener('touchcancel', endJoystick, { passive: false });
    }

    handleJoystickMove(clientX, clientY) {
        if (!this.game || this.game.state !== 'PLAYING') return;
        const dx = clientX - this.baseCenter.x;
        const dy = clientY - this.baseCenter.y;
        const distance = Math.hypot(dx, dy);

        if (distance < this.deadzone) {
            if (this.joystickKnob) this.joystickKnob.style.transform = 'translate(0px, 0px)';
            this.player.setTouchMovement(0, 0);
            return;
        }

        let clampedX = dx;
        let clampedY = dy;

        if (distance > this.maxRadius) {
            clampedX = (dx / distance) * this.maxRadius;
            clampedY = (dy / distance) * this.maxRadius;
        }

        // Mover pomo visualmente
        if (this.joystickKnob) {
            this.joystickKnob.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
        }

        // normX: -1 (izq) a +1 (der)
        // normY: hacia arriba (dy negativo) = +1 (avanzar al frente)
        const effectiveDist = (Math.min(distance, this.maxRadius) - this.deadzone) / (this.maxRadius - this.deadzone);
        const angle = Math.atan2(dy, dx);
        const normX = Math.cos(angle) * effectiveDist;
        const normY = -Math.sin(angle) * effectiveDist;

        this.player.setTouchMovement(normX, normY);
    }

    // 2. Control Panorámico de Cámara Estilo Free Fire
    setupCameraTouchEvents() {
        window.addEventListener('touchstart', (e) => {
            // SOLO activo durante partida en juego ('PLAYING') y si NO es campaña 2.5D
            if (!this.game || this.game.state !== 'PLAYING') return;
            if (this.player && this.player.isCampaignMode) return;

            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === this.joystickTouchId) continue;

                // Si tocó un botón de acción táctil o elemento interactivo del HUD o menú
                const target = touch.target || e.target;
                if (target && target.closest && (
                    target.closest('#main-menu-overlay') ||
                    target.closest('.btn-touch-action') ||
                    target.closest('.btn-hud') ||
                    target.closest('.modal-overlay') ||
                    target.closest('.hotbar-slot') ||
                    target.closest('.player-card') ||
                    target.closest('#mission-hud')
                )) {
                    continue;
                }

                // Mitad derecha o centro libre: control de rotación de cámara
                if (this.cameraTouchId === null && touch.clientX > window.innerWidth * 0.35) {
                    this.cameraTouchId = touch.identifier;
                    this.lastCameraPos = { x: touch.clientX, y: touch.clientY };
                    if (this.player && this.player.setRotatingCamera) {
                        this.player.setRotatingCamera(true);
                    }
                    break;
                }
            }
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (this.cameraTouchId === null) return;
            if (!this.game || this.game.state !== 'PLAYING') return;
            if (this.player && this.player.isCampaignMode) return;
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === this.cameraTouchId) {
                    const rawDeltaX = touch.clientX - this.lastCameraPos.x;
                    const rawDeltaY = touch.clientY - this.lastCameraPos.y;

                    // Suavizado y limitador para evitar tirones
                    const deltaX = Math.max(-80, Math.min(80, rawDeltaX));
                    const deltaY = Math.max(-80, Math.min(80, rawDeltaY));

                    this.player.addCameraRotation(deltaX, deltaY);

                    this.lastCameraPos = { x: touch.clientX, y: touch.clientY };
                    e.preventDefault();
                    break;
                }
            }
        }, { passive: false });

        const endCamera = (e) => {
            if (this.cameraTouchId === null) return;
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === this.cameraTouchId) {
                    this.cameraTouchId = null;
                    if (this.player && this.player.setRotatingCamera) {
                        this.player.setRotatingCamera(false);
                    }
                    break;
                }
            }
        };

        window.addEventListener('touchend', endCamera, { passive: false });
        window.addEventListener('touchcancel', endCamera, { passive: false });
    }

    // 3. Configuración de Botones de Acción Estilo Free Fire
    setupActionButtons() {
        const vibrateShort = () => {
            try {
                if (storage.getSetting('vibrationEnabled', true) && 'vibrate' in navigator) navigator.vibrate(18);
            } catch (_) {}
        };

        // A) Botón de Disparo / Ataque Principal
        if (this.btnAttack) {
            const startAttack = (e) => {
                e.preventDefault();
                e.stopPropagation();
                vibrateShort();
                this.btnAttack.classList.add('pressed');
                this.player.triggerAttack();

                clearInterval(this.attackInterval);
                this.attackInterval = setInterval(() => {
                    this.player.triggerAttack();
                }, 190);
            };

            const stopAttack = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.btnAttack.classList.remove('pressed');
                clearInterval(this.attackInterval);
            };

            this.btnAttack.addEventListener('touchstart', startAttack, { passive: false });
            this.btnAttack.addEventListener('touchend', stopAttack, { passive: false });
            this.btnAttack.addEventListener('touchcancel', stopAttack, { passive: false });
            this.btnAttack.addEventListener('mousedown', startAttack);
            this.btnAttack.addEventListener('mouseup', stopAttack);
            this.btnAttack.addEventListener('mouseleave', stopAttack);
        }

        // B) Botón de Giro Ninja 360° (Estilo Crash Bandicoot)
        if (this.btnSpin) {
            let lastSpinTime = 0;
            const doSpin = (e) => {
                const now = performance.now();
                if (now - lastSpinTime < 220) return;
                lastSpinTime = now;
                if (e.cancelable) e.preventDefault();
                e.stopPropagation();
                vibrateShort();
                this.btnSpin.classList.add('pressed');
                this.player.triggerSpinAttack();
                setTimeout(() => this.btnSpin.classList.remove('pressed'), 240);
            };

            this.btnSpin.addEventListener('touchstart', doSpin, { passive: false });
            this.btnSpin.addEventListener('mousedown', doSpin);
        }

        // C) Botón de Salto / Doble Salto (Debounced contra doble disparo táctil)
        if (this.btnJump) {
            let lastJumpTime = 0;
            const doJump = (e) => {
                const now = performance.now();
                if (now - lastJumpTime < 160) return;
                lastJumpTime = now;
                if (e.cancelable) e.preventDefault();
                e.stopPropagation();
                vibrateShort();
                this.btnJump.classList.add('pressed');
                this.player.jump();
                setTimeout(() => this.btnJump.classList.remove('pressed'), 130);
            };

            this.btnJump.addEventListener('touchstart', doJump, { passive: false });
            this.btnJump.addEventListener('mousedown', doJump);
        }

        // D) Botón de Esquive / Rodada Ninja (i-frames)
        if (this.btnDash) {
            let lastDashTime = 0;
            const doDash = (e) => {
                const now = performance.now();
                if (now - lastDashTime < 220) return;
                lastDashTime = now;
                if (e.cancelable) e.preventDefault();
                e.stopPropagation();
                vibrateShort();
                this.btnDash.classList.add('pressed');
                this.player.triggerDodge();
                setTimeout(() => this.btnDash.classList.remove('pressed'), 180);
            };

            this.btnDash.addEventListener('touchstart', doDash, { passive: false });
            this.btnDash.addEventListener('mousedown', doDash);
        }

        // E) Botón de Bloqueo y Perfect Parry
        if (this.btnParry) {
            const startBlock = (e) => {
                if (e.cancelable) e.preventDefault();
                e.stopPropagation();
                vibrateShort();
                this.btnParry.classList.add('pressed');
                this.player.setBlocking(true);
            };

            const endBlock = (e) => {
                if (e.cancelable) e.preventDefault();
                e.stopPropagation();
                this.btnParry.classList.remove('pressed');
                this.player.setBlocking(false);
            };

            this.btnParry.addEventListener('touchstart', startBlock, { passive: false });
            this.btnParry.addEventListener('touchend', endBlock, { passive: false });
            this.btnParry.addEventListener('touchcancel', endBlock, { passive: false });
            this.btnParry.addEventListener('mousedown', startBlock);
            this.btnParry.addEventListener('mouseup', endBlock);
            this.btnParry.addEventListener('mouseleave', endBlock);
        }

        // F) Botón de Lanzamiento de Shuriken
        if (this.btnShuriken) {
            let lastShurikenTime = 0;
            const doShuriken = (e) => {
                const now = performance.now();
                if (now - lastShurikenTime < 200) return;
                lastShurikenTime = now;
                if (e.cancelable) e.preventDefault();
                e.stopPropagation();
                vibrateShort();
                this.btnShuriken.classList.add('pressed');
                this.player.triggerShuriken();
                setTimeout(() => this.btnShuriken.classList.remove('pressed'), 140);
            };

            this.btnShuriken.addEventListener('touchstart', doShuriken, { passive: false });
            this.btnShuriken.addEventListener('mousedown', doShuriken);
        }

        // G) Botón de Cambio Rápido de Arma
        if (this.btnSwitch) {
            let lastSwitchTime = 0;
            const doSwitch = (e) => {
                const now = performance.now();
                if (now - lastSwitchTime < 180) return;
                lastSwitchTime = now;
                if (e.cancelable) e.preventDefault();
                e.stopPropagation();
                this.btnSwitch.classList.add('pressed');
                if (this.game && this.game.cycleWeaponSlot) {
                    this.game.cycleWeaponSlot();
                }
                setTimeout(() => this.btnSwitch.classList.remove('pressed'), 140);
            };

            this.btnSwitch.addEventListener('touchstart', doSwitch, { passive: false });
            this.btnSwitch.addEventListener('mousedown', doSwitch);
        }

        // H) Botón de Habilidad Especial del Personaje Animal Colombiano
        if (this.btnSkill) {
            let lastSkillTime = 0;
            const doSkill = (e) => {
                const now = performance.now();
                if (now - lastSkillTime < 250) return;
                lastSkillTime = now;
                if (e.cancelable) e.preventDefault();
                e.stopPropagation();
                vibrateShort();
                this.btnSkill.classList.add('pressed');
                if (this.player && this.player.activateSpecialSkill) {
                    this.player.activateSpecialSkill();
                }
                setTimeout(() => this.btnSkill.classList.remove('pressed'), 200);
            };

            this.btnSkill.addEventListener('touchstart', doSkill, { passive: false });
            this.btnSkill.addEventListener('mousedown', doSkill);
        }
    }

    setLeftHanded(enabled) {
        this.isLeftHanded = !!enabled;
        if (this.container) {
            this.container.classList.toggle('controls-left-handed', this.isLeftHanded);
        }
        if (this.joystickZone) {
            if (this.isLeftHanded) {
                this.joystickZone.style.right = '30px';
                this.joystickZone.style.left = 'auto';
            } else {
                this.joystickZone.style.left = '30px';
                this.joystickZone.style.right = 'auto';
            }
            this.joystickZone.style.bottom = '30px';
            this.joystickZone.style.top = 'auto';
        }
    }

    setButtonSize(size = 'normal') {
        this.buttonSize = size;
        if (!this.container) return;
        this.container.classList.remove('touch-size-small', 'touch-size-normal', 'touch-size-large');
        this.container.classList.add(`touch-size-${size}`);
    }

    update(player) {
        if (!player) return;

        // Feedback visual del botón de Habilidad Especial y Cooldown
        if (this.btnSkill) {
            const overlay = document.getElementById('skill-cooldown-overlay');
            if (player.specialCooldownTimer > 0) {
                this.btnSkill.classList.remove('skill-ready-glow');
                if (overlay) {
                    const charData = CHARACTERS_DATA[player.characterId] || CHARACTERS_DATA.chucho;
                    const maxCd = (charData && charData.skill && charData.skill.cooldown) || 5.0;
                    const pct = Math.min(100, Math.round((player.specialCooldownTimer / maxCd) * 100));
                    overlay.style.height = `${pct}%`;
                    overlay.style.display = 'block';
                }
            } else {
                this.btnSkill.classList.add('skill-ready-glow');
                if (overlay) overlay.style.display = 'none';
            }
        }

        // Feedback visual en botón de Dash / Air Dash
        if (this.btnDash) {
            if (player.dashCooldown > 0 || (!player.isGrounded && !player.canAirDash)) {
                this.btnDash.style.opacity = '0.55';
            } else {
                this.btnDash.style.opacity = '1.0';
            }
        }
    }

    updateWeaponIcon(icon) {
        if (this.weaponIconEl && icon) {
            this.weaponIconEl.textContent = icon;
        }
    }
}
