// js/touch.js - Controles Táctiles para Celular Estilo Free Fire
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
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                // Lado izquierdo de la pantalla (excluyendo zona de menús)
                if (this.joystickTouchId === null && touch.clientX < window.innerWidth * 0.48 && touch.clientY > window.innerHeight * 0.15) {
                    const target = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (target && (target.closest('.modal-overlay') || target.closest('.btn-hud') || target.closest('.player-card') || target.closest('#mission-hud'))) {
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
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === this.joystickTouchId) continue;

                // Si tocó un botón de acción táctil o elemento interactivo del HUD
                const target = document.elementFromPoint(touch.clientX, touch.clientY);
                if (target && (target.closest('.btn-touch-action') || target.closest('.btn-hud') || target.closest('.modal-overlay') || target.closest('.hotbar-slot') || target.closest('.player-card') || target.closest('#mission-hud'))) {
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
                if ('vibrate' in navigator) navigator.vibrate(18);
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
            const doSpin = (e) => {
                e.preventDefault();
                e.stopPropagation();
                vibrateShort();
                this.btnSpin.classList.add('pressed');
                this.player.triggerSpinAttack();
                setTimeout(() => this.btnSpin.classList.remove('pressed'), 240);
            };

            this.btnSpin.addEventListener('touchstart', doSpin, { passive: false });
            this.btnSpin.addEventListener('mousedown', doSpin);
        }

        // C) Botón de Salto / Doble Salto
        if (this.btnJump) {
            const doJump = (e) => {
                e.preventDefault();
                e.stopPropagation();
                vibrateShort();
                this.btnJump.classList.add('pressed');
                this.player.jump();
                setTimeout(() => this.btnJump.classList.remove('pressed'), 130);
            };

            this.btnJump.addEventListener('touchstart', doJump, { passive: false });
            this.btnJump.addEventListener('mousedown', doJump);
        }

        // D) Botón de Esquive / Dash de Sombras Ninja
        if (this.btnDash) {
            const doDash = (e) => {
                e.preventDefault();
                e.stopPropagation();
                vibrateShort();
                this.btnDash.classList.add('pressed');
                this.player.dash();
                setTimeout(() => this.btnDash.classList.remove('pressed'), 180);
            };

            this.btnDash.addEventListener('touchstart', doDash, { passive: false });
            this.btnDash.addEventListener('mousedown', doDash);
        }

        // E) Botón de Cambio Rápido de Arma
        if (this.btnSwitch) {
            const doSwitch = (e) => {
                e.preventDefault();
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

        // F) Botón de Habilidad Especial del Personaje Animal Colombiano (Rugido, Trueno, Planeo, Escudo, Salto)
        if (this.btnSkill) {
            const doSkill = (e) => {
                e.preventDefault();
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

    updateWeaponIcon(icon) {
        if (this.weaponIconEl && icon) {
            this.weaponIconEl.textContent = icon;
        }
    }
}
