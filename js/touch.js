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

        // Iniciar joystick al tocar la zona izquierda
        window.addEventListener('touchstart', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                // Solo si cae en la mitad izquierda de la pantalla y no hay joystick activo
                if (this.joystickTouchId === null && touch.clientX < window.innerWidth * 0.5) {
                    // Evitar interferir con elementos de menú o modales abiertos
                    const target = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (target && (target.closest('.modal-overlay') || target.closest('.btn-hud') || target.closest('.player-card'))) {
                        continue;
                    }

                    this.joystickTouchId = touch.identifier;
                    updateBaseCenter();

                    // Si toca cerca de la esquina pero fuera del centro, podemos reposicionar suavemente
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
        // En coordenadas 3D: dy negativo (hacia arriba en pantalla) = avanzar (+Y en Three.js forward)
        const normX = clampedX / this.maxRadius;
        const normY = -clampedY / this.maxRadius;
        this.player.setTouchMovement(normX, normY);
    }

    // 2. Control Panorámico de Cámara (Aim/Look en mitad derecha)
    setupCameraTouchEvents() {
        window.addEventListener('touchstart', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                // Si toca en la mitad derecha y no hay dedo asignado a la cámara
                if (this.cameraTouchId === null && touch.clientX >= window.innerWidth * 0.45) {
                    const target = document.elementFromPoint(touch.clientX, touch.clientY);
                    // Comprobar si tocó un botón de acción táctil o del HUD
                    if (target && (target.closest('.btn-touch-action') || target.closest('.btn-hud') || target.closest('.modal-overlay') || target.closest('.hotbar-slot'))) {
                        continue;
                    }

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
                    const deltaX = touch.clientX - this.lastCameraPos.x;
                    const deltaY = touch.clientY - this.lastCameraPos.y;

                    // Rota la cámara 3ra persona con sensibilidad táctil calibrada
                    this.player.addCameraRotation(deltaX * 1.3, deltaY * 1.3);

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
