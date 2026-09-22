// js/touch.js - Controles Táctiles para Celular Estilo Free Fire
// Soporta Multi-Touch simultáneo (moverse con pulgar izquierdo mientras se rota la cámara y ataca)

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
        this.btnJump = document.getElementById('btn-touch-jump');
        this.btnDash = document.getElementById('btn-touch-dash');
        this.btnSwitch = document.getElementById('btn-touch-switch');
        this.weaponIconEl = document.getElementById('touch-weapon-icon');

        // Estado de toques
        this.joystickTouchId = null;
        this.cameraTouchId = null;
        this.lastCameraPos = { x: 0, y: 0 };
        this.attackInterval = null;

        // Configuración del joystick
        this.maxRadius = 50; // Radio máximo de desplazamiento del pomo en px
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

        // Si en cualquier momento el usuario toca la pantalla, asegurar que los controles estén visibles
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

        // Iniciar joystick al tocar la zona izquierda inferior
        window.addEventListener('touchstart', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                // Si cae en la zona izquierda y no hay joystick activo
                if (this.joystickTouchId === null && touch.clientX < window.innerWidth * 0.45 && touch.clientY > window.innerHeight * 0.2) {
                    // Evitar interferir con elementos de menú o modales abiertos
                    const target = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (target && (target.closest('.modal-overlay') || target.closest('.btn-hud') || target.closest('.player-card'))) {
                        continue;
                    }

                    this.joystickTouchId = touch.identifier;

                    // Centrar base del joystick directamente bajo el pulgar izquierdo
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

        let clampedX = dx;
        let clampedY = dy;

        if (distance > this.maxRadius) {
            clampedX = (dx / distance) * this.maxRadius;
            clampedY = (dy / distance) * this.maxRadius;
        }

        // Mover visualmente el pomo interior
        if (this.joystickKnob) {
            this.joystickKnob.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
        }

        // Pasar vector normalizado al jugador (-1 a 1)
        // dy negativo (hacia arriba en pantalla) = avanzar (+Y en dirección frontal)
        const normX = clampedX / this.maxRadius;
        const normY = -clampedY / this.maxRadius;
        this.player.setTouchMovement(normX, normY);
    }

    // 2. Control Panorámico de Cámara Estilo Free Fire (Aim / Mover vista con el dedo)
    setupCameraTouchEvents() {
        window.addEventListener('touchstart', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                // Si ya es el joystick, ignorar
                if (touch.identifier === this.joystickTouchId) continue;

                // Comprobar si tocó un botón de acción táctil o del HUD
                const target = document.elementFromPoint(touch.clientX, touch.clientY);
                if (target && (target.closest('.btn-touch-action') || target.closest('.btn-hud') || target.closest('.modal-overlay') || target.closest('.hotbar-slot') || target.closest('.player-card') || target.closest('.coin-counter'))) {
                    continue;
                }

                // Cualquier otro toque en la pantalla controla la cámara de forma inmediata
                if (this.cameraTouchId === null) {
                    this.cameraTouchId = touch.identifier;
                    this.lastCameraPos = { x: touch.clientX, y: touch.clientY };
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

                    // Limitar saltos extremos por lag de pantalla
                    const deltaX = Math.max(-90, Math.min(90, rawDeltaX));
                    const deltaY = Math.max(-90, Math.min(90, rawDeltaY));

                    // Rota la cámara y orienta suavemente al personaje
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
                    break;
                }
            }
        };

        window.addEventListener('touchend', endCamera, { passive: false });
        window.addEventListener('touchcancel', endCamera, { passive: false });
    }

    // 3. Configuración de Botones de Acción Estilo Free Fire
    setupActionButtons() {
        // A) Botón de Disparo / Ataque Principal
        if (this.btnAttack) {
            const startAttack = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.btnAttack.classList.add('pressed');
                this.player.triggerAttack();

                // Permitir ataque continuo si se mantiene presionado el botón
                clearInterval(this.attackInterval);
                this.attackInterval = setInterval(() => {
                    this.player.triggerAttack();
                }, 220);
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
            // Soporte clic mouse si se prueba en emulador
            this.btnAttack.addEventListener('mousedown', startAttack);
            this.btnAttack.addEventListener('mouseup', stopAttack);
            this.btnAttack.addEventListener('mouseleave', stopAttack);
        }

        // B) Botón de Salto
        if (this.btnJump) {
            const doJump = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.btnJump.classList.add('pressed');
                this.player.jump();
                setTimeout(() => this.btnJump.classList.remove('pressed'), 140);
            };

            this.btnJump.addEventListener('touchstart', doJump, { passive: false });
            this.btnJump.addEventListener('mousedown', doJump);
        }

        // C) Botón de Sprint / Impulso Ninja (Dash)
        if (this.btnDash) {
            const doDash = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.btnDash.classList.add('pressed');
                this.player.dash();
                setTimeout(() => this.btnDash.classList.remove('pressed'), 200);
            };

            this.btnDash.addEventListener('touchstart', doDash, { passive: false });
            this.btnDash.addEventListener('mousedown', doDash);
        }

        // D) Botón de Cambio Rápido de Arma
        if (this.btnSwitch) {
            const doSwitch = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.btnSwitch.classList.add('pressed');
                if (this.game && this.game.cycleWeaponSlot) {
                    this.game.cycleWeaponSlot();
                }
                setTimeout(() => this.btnSwitch.classList.remove('pressed'), 150);
            };

            this.btnSwitch.addEventListener('touchstart', doSwitch, { passive: false });
            this.btnSwitch.addEventListener('mousedown', doSwitch);
        }
    }

    updateWeaponIcon(icon) {
        if (this.weaponIconEl && icon) {
            this.weaponIconEl.textContent = icon;
        }
    }
}
