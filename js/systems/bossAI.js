// js/systems/bossAI.js - Máquina de Estados Inteligente y Cinemática para los 10 Jefes de Colombia
import * as THREE from 'three';
import { sounds } from '../sound.js?v=20.0';
import { BOSS_CONFIGS } from '../config/bossConfig.js?v=20.0';

export class BossAISystem {
    constructor(scene, particles, soundSystem) {
        this.scene = scene;
        this.particles = particles;
        this.sound = soundSystem || sounds;

        // Anillo visual de advertencia de ataque (Telegraph Marker)
        this.telegraphGeom = new THREE.RingGeometry(0.5, 1.8, 24);
        this.telegraphMat = new THREE.MeshBasicMaterial({
            color: 0xef4444,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        this.telegraphMesh = new THREE.Mesh(this.telegraphGeom, this.telegraphMat);
        this.telegraphMesh.rotation.x = -Math.PI / 2;
        this.telegraphMesh.visible = false;
        this.scene.add(this.telegraphMesh);
    }

    initBoss(boss, worldNum = 1) {
        const config = BOSS_CONFIGS[worldNum] || BOSS_CONFIGS[1];
        boss.config = config;
        boss.isBossAI = true;
        boss.currentPhase = 1; // 1 o 2
        boss.aiState = 'IDLE'; // IDLE, TELEGRAPH, ATTACK, RECOVERY, STAGGER, PHASE_TRANSITION, DEFEATED
        boss.stateTimer = 1.2;
        boss.attackCooldownTimer = 1.0;
        boss.currentAttack = null;
        boss.attackIndex = 0;
        boss.phaseTransitionTriggered = false;
        boss.isStunned = false;

        boss.health = config.maxHealth;
        boss.maxHealth = config.maxHealth;
        boss.name = config.name;
        boss.title = config.title;

        // Aura visual de fase enfurecida
        boss.enragedAura = null;

        // Registrar en HUD si existe elemento de barra de jefe
        this._updateBossHUD(boss);
    }

    update(boss, player, delta, onPlayerDamage, onBossDefeated, onScreenShake) {
        if (!boss || boss.health <= 0 || boss.aiState === 'DEFEATED') {
            if (this.telegraphMesh.visible) this.telegraphMesh.visible = false;
            return;
        }

        const config = boss.config || BOSS_CONFIGS[boss.worldNum || 1];
        const playerPos = player.mesh.position;
        const bossPos = boss.mesh.position;
        const distToPlayer = bossPos.distanceTo(playerPos);
        const facing = playerPos.x >= bossPos.x ? 1 : -1;

        // Orientar al jefe suavemente hacia el jugador en el plano 2.5D
        if (boss.aiState !== 'ATTACK' && boss.aiState !== 'PHASE_TRANSITION') {
            boss.mesh.rotation.y = facing > 0 ? (Math.PI * 0.5) : (-Math.PI * 0.5);
        }

        // 1. CHEQUEO DE TRANSICIÓN DE FASE (100% -> 60% HP)
        const hpPercent = boss.health / boss.maxHealth;
        if (!boss.phaseTransitionTriggered && hpPercent <= (config.phase2.triggerHpPercent || 0.60)) {
            this._startPhaseTransition(boss, config, onScreenShake);
            return;
        }

        boss.stateTimer -= delta;

        // 2. MÁQUINA DE ESTADOS FINITA (FSM)
        switch (boss.aiState) {
            case 'IDLE':
                this._updateIdleState(boss, config, playerPos, distToPlayer, delta);
                break;

            case 'TELEGRAPH':
                this._updateTelegraphState(boss, config, playerPos, delta, onScreenShake);
                break;

            case 'ATTACK':
                this._updateAttackState(boss, config, player, playerPos, delta, onPlayerDamage, onScreenShake);
                break;

            case 'RECOVERY':
                this._updateRecoveryState(boss, delta);
                break;

            case 'STAGGER':
                this._updateStaggerState(boss, delta);
                break;

            case 'PHASE_TRANSITION':
                this._updatePhaseTransitionState(boss, config, delta, onScreenShake);
                break;
        }

        // Animar brazos y cuerpo del jefe
        this._animateBossKinematics(boss, delta);
        this._updateBossHUD(boss);
    }

    _startPhaseTransition(boss, config, onScreenShake) {
        boss.phaseTransitionTriggered = true;
        boss.currentPhase = 2;
        boss.aiState = 'PHASE_TRANSITION';
        boss.stateTimer = config.phase2.transitionDuration || 1.8;
        boss.speed = config.speed * (config.phase2.speedMult || 1.3);

        if (this.telegraphMesh.visible) this.telegraphMesh.visible = false;

        // Rugido sísmico y explosión de energía
        if (this.sound && this.sound.playSlash) this.sound.playSlash('heavy');
        this.particles.createShockwave(boss.mesh.position, config.colorHex, 12.0);
        this.particles.createHitSparks(boss.mesh.position, true);

        if (onScreenShake) onScreenShake(0.48, 0.35);

        // Mensaje en pantalla estilo anuncio cinemático
        this._showBannerMessage(`${boss.name}: ${config.phase2.enragedRoarText}`);
    }

    _updatePhaseTransitionState(boss, config, delta, onScreenShake) {
        // Vibración ascendente durante el rugido
        boss.mesh.position.y += Math.sin(performance.now() * 0.05) * 0.04;

        if (boss.stateTimer <= 0) {
            boss.aiState = 'IDLE';
            boss.stateTimer = 0.5;
            boss.attackCooldownTimer = 0.4; // Ataca rápidamente al entrar en Fase 2
        }
    }

    _updateIdleState(boss, config, playerPos, distToPlayer, delta) {
        const phaseConfig = boss.currentPhase === 1 ? config.phase1 : config.phase2;

        // Desplazamiento táctico hacia el rango ideal de combate
        const idealRange = 4.5;
        if (distToPlayer > idealRange + 0.5) {
            const dirX = Math.sign(playerPos.x - boss.mesh.position.x);
            boss.mesh.position.x += dirX * boss.speed * delta;
        } else if (distToPlayer < idealRange - 1.2) {
            // Retroceder si el jugador está pegado
            const dirX = Math.sign(boss.mesh.position.x - playerPos.x);
            boss.mesh.position.x += dirX * (boss.speed * 0.6) * delta;
        }

        if (boss.stateTimer <= 0) {
            // Elegir el siguiente ataque de la fase activa
            const attacks = phaseConfig.attacks;
            boss.currentAttack = attacks[Math.floor(Math.random() * attacks.length)];
            boss.aiState = 'TELEGRAPH';
            boss.stateTimer = phaseConfig.telegraphDuration || 0.75;

            // Mostrar el marcador de advertencia en el suelo
            this.telegraphMesh.position.set(boss.mesh.position.x, 0.05, 0);
            this.telegraphMesh.visible = true;
            this.telegraphMesh.scale.set(1, 1, 1);
            this.telegraphMat.opacity = 0.8;
            this.telegraphMat.color.setHex(boss.currentPhase === 2 ? 0xdc2626 : 0xf59e0b);

            if (this.sound && this.sound.playSlash) this.sound.playSlash('light');
        }
    }

    _updateTelegraphState(boss, config, playerPos, delta, onScreenShake) {
        // Pulso visual del círculo de advertencia antes de atacar (Ventana clara para reaccionar)
        const scale = 1.0 + Math.sin(performance.now() * 0.02) * 0.3;
        this.telegraphMesh.scale.set(scale, scale, 1);
        this.telegraphMesh.position.x = boss.mesh.position.x;

        if (boss.stateTimer <= 0) {
            this.telegraphMesh.visible = false;
            boss.aiState = 'ATTACK';
            boss.stateTimer = 0.65; // Duración del golpe

            // Ejecutar golpe según su tipo
            this._executeAttackEffect(boss, config, playerPos, onScreenShake);
        }
    }

    _executeAttackEffect(boss, config, playerPos, onScreenShake) {
        const atk = boss.currentAttack;
        if (!atk) return;

        const bossPos = boss.mesh.position;
        const dir = new THREE.Vector3(Math.sign(playerPos.x - bossPos.x), 0, 0);

        if (atk.type === 'shockwave') {
            this.particles.createShockwave(bossPos, config.colorHex, atk.range || 7.0);
            this.particles.createHitSparks(bossPos, true);
            if (this.sound && this.sound.playSlash) this.sound.playSlash(atk.voice || 'heavy');
            if (onScreenShake) onScreenShake(0.35, 0.18);

        } else if (atk.type === 'charge' || atk.type === 'pounce') {
            boss.chargeSpeed = (atk.speed || 15.0) * dir.x;
            boss.chargeDuration = 0.45;
            this.particles.createDodgeDust(bossPos);
            if (this.sound && this.sound.playSlash) this.sound.playSlash('heavy');
            if (onScreenShake) onScreenShake(0.25, 0.12);

        } else if (atk.type === 'projectile' || atk.type === 'barrage') {
            const spawnPos = bossPos.clone().add(new THREE.Vector3(dir.x * 1.2, 1.2, 0));
            this.particles.spawnShurikenProjectile(spawnPos, dir, Math.round(config.baseDamage * atk.damageMult), config.element);
            if (atk.type === 'barrage') {
                setTimeout(() => {
                    this.particles.spawnShurikenProjectile(spawnPos, dir.clone().add(new THREE.Vector3(0, 0.15, 0)).normalize(), Math.round(config.baseDamage * atk.damageMult), config.element);
                }, 120);
            }
        } else {
            // Melee regular
            const slashPos = bossPos.clone().add(new THREE.Vector3(dir.x * 1.4, 1.1, 0));
            this.particles.createSlashEffect(slashPos, dir, config.element, 2);
            if (this.sound && this.sound.playSlash) this.sound.playSlash(atk.voice || 'heavy');
        }
    }

    _updateAttackState(boss, config, player, playerPos, delta, onPlayerDamage, onScreenShake) {
        const atk = boss.currentAttack;
        if (!atk) {
            boss.aiState = 'RECOVERY';
            return;
        }

        // Si es una embestida o salto, desplazar con velocidad
        if (boss.chargeDuration > 0) {
            boss.chargeDuration -= delta;
            boss.mesh.position.x += boss.chargeSpeed * delta;
            if (Math.random() < 0.4) {
                this.particles.createDodgeDust(boss.mesh.position);
            }
        }

        // Chequeo de impacto con el jugador (Hitbox activa)
        const dist = boss.mesh.position.distanceTo(playerPos);
        const hitRange = atk.range || 3.8;

        if (dist <= hitRange && !boss.hasHitPlayerThisAttack) {
            boss.hasHitPlayerThisAttack = true;
            const damage = Math.round(config.baseDamage * (atk.damageMult || 1.0));
            if (onPlayerDamage) {
                onPlayerDamage(damage, boss);
            }
        }

        if (boss.stateTimer <= 0) {
            boss.hasHitPlayerThisAttack = false;
            boss.chargeDuration = 0;
            boss.aiState = 'RECOVERY';
            const phaseConfig = boss.currentPhase === 1 ? config.phase1 : config.phase2;
            boss.stateTimer = phaseConfig.recoveryDuration || 0.55; // Ventana para que el jugador castigue
        }
    }

    _updateRecoveryState(boss, delta) {
        // En Recovery el jefe está quieto y vulnerable
        if (boss.stateTimer <= 0) {
            boss.aiState = 'IDLE';
            boss.stateTimer = boss.currentPhase === 2 ? 0.9 : 1.5;
        }
    }

    _updateStaggerState(boss, delta) {
        // El jefe fue parreado o aturdido: no se mueve y recibe daño crítico
        if (boss.stateTimer <= 0) {
            boss.isStunned = false;
            boss.aiState = 'IDLE';
            boss.stateTimer = 0.8;
        }
    }

    triggerStagger(boss, duration = 1.6) {
        boss.aiState = 'STAGGER';
        boss.stateTimer = duration;
        boss.isStunned = true;
        if (this.telegraphMesh.visible) this.telegraphMesh.visible = false;
        this.particles.createHitSparks(boss.mesh.position, true);
        if (this.sound && this.sound.playParry) this.sound.playParry();
    }

    _animateBossKinematics(boss, delta) {
        const time = performance.now() * 0.01;
        const breath = Math.sin(time) * 0.05;

        if (boss.rightArmPivot) {
            if (boss.aiState === 'TELEGRAPH') {
                boss.rightArmPivot.rotation.x = -Math.PI * 0.65;
            } else if (boss.aiState === 'ATTACK') {
                boss.rightArmPivot.rotation.x = Math.PI * 0.75;
            } else if (boss.aiState === 'STAGGER') {
                boss.rightArmPivot.rotation.x = 0.5;
                boss.rightArmPivot.rotation.z = 0.6;
            } else {
                boss.rightArmPivot.rotation.x = breath;
                boss.rightArmPivot.rotation.z = 0.15;
            }
        }

        if (boss.leftArmPivot) {
            if (boss.aiState === 'TELEGRAPH') {
                boss.leftArmPivot.rotation.x = -Math.PI * 0.65;
            } else if (boss.aiState === 'ATTACK') {
                boss.leftArmPivot.rotation.x = Math.PI * 0.75;
            } else {
                boss.leftArmPivot.rotation.x = -breath;
                boss.leftArmPivot.rotation.z = -0.15;
            }
        }
    }

    _updateBossHUD(boss) {
        let hud = document.getElementById('boss-hud-overlay');
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'boss-hud-overlay';
            hud.style.position = 'fixed';
            hud.style.top = '14px';
            hud.style.left = '50%';
            hud.style.transform = 'translateX(-50%)';
            hud.style.width = 'min(90vw, 480px)';
            hud.style.zIndex = '120';
            hud.style.pointerEvents = 'none';
            hud.style.textAlign = 'center';
            hud.innerHTML = `
                <div id="boss-name" style="font-family:'Cinzel',serif;font-weight:900;font-size:15px;color:#fef08a;text-shadow:0 0 8px rgba(0,0,0,0.9);letter-spacing:1px;margin-bottom:3px;"></div>
                <div id="boss-title" style="font-size:11px;color:#94a3b8;margin-bottom:5px;"></div>
                <div style="background:rgba(15,23,42,0.85);border:2px solid #f59e0b;border-radius:12px;padding:3px;box-shadow:0 4px 14px rgba(0,0,0,0.7);overflow:hidden;">
                    <div id="boss-hp-bar" style="height:12px;background:linear-gradient(90deg,#ef4444,#f59e0b);width:100%;border-radius:8px;transition:width 0.18s ease-out;"></div>
                </div>
                <div id="boss-phase-tag" style="margin-top:3px;font-size:10px;font-weight:bold;color:#f59e0b;">FASE 1</div>
            `;
            document.body.appendChild(hud);
        }

        const nameEl = document.getElementById('boss-name');
        const titleEl = document.getElementById('boss-title');
        const barEl = document.getElementById('boss-hp-bar');
        const phaseEl = document.getElementById('boss-phase-tag');

        if (nameEl) nameEl.textContent = boss.name || 'Jefe Regional';
        if (titleEl) titleEl.textContent = boss.title || 'Guardián Ancestral';
        if (barEl) {
            const pct = Math.max(0, Math.min(100, Math.round((boss.health / boss.maxHealth) * 100)));
            barEl.style.width = `${pct}%`;
            if (boss.currentPhase === 2) {
                barEl.style.background = 'linear-gradient(90deg, #dc2626, #7f1d1d)';
            }
        }
        if (phaseEl) {
            phaseEl.textContent = boss.currentPhase === 2 ? '⚡ FASE 2: ENFURECIDO' : 'FASE 1: CONCENTRADO';
            phaseEl.style.color = boss.currentPhase === 2 ? '#ef4444' : '#f59e0b';
        }
    }

    _showBannerMessage(msg) {
        let banner = document.getElementById('boss-banner-announcement');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'boss-banner-announcement';
            banner.style.position = 'fixed';
            banner.style.top = '22%';
            banner.style.left = '50%';
            banner.style.transform = 'translateX(-50%)';
            banner.style.background = 'rgba(0,0,0,0.85)';
            banner.style.border = '2px solid #ef4444';
            banner.style.padding = '12px 24px';
            banner.style.borderRadius = '16px';
            banner.style.color = '#fef08a';
            banner.style.fontSize = '16px';
            banner.style.fontWeight = 'bold';
            banner.style.zIndex = '130';
            banner.style.pointerEvents = 'none';
            banner.style.textAlign = 'center';
            banner.style.boxShadow = '0 0 24px rgba(239,68,68,0.7)';
            banner.style.transition = 'opacity 0.4s ease';
            document.body.appendChild(banner);
        }
        banner.textContent = msg;
        banner.style.opacity = '1';
        setTimeout(() => {
            if (banner) banner.style.opacity = '0';
        }, 2200);
    }

    hideBossHUD() {
        const hud = document.getElementById('boss-hud-overlay');
        if (hud) hud.remove();
        const banner = document.getElementById('boss-banner-announcement');
        if (banner) banner.remove();
        if (this.telegraphMesh) this.telegraphMesh.visible = false;
    }
}
