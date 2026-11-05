// js/core/levelManager.js - Gestor Centralizado del Ciclo de Vida de Niveles, Transiciones y Limpieza
import * as THREE from 'three';
import { resourceManager } from './resourceManager.js';
import { CAMPAIGN_WORLDS } from '../campaign.js?v=20.0';

export class LevelManager {
    constructor(game) {
        this.game = game;
        this.currentWorldNum = 1;
        this.currentLevelNum = 1;
        this.isBossFight = false;
        this.collectedGems = 0;
        this.startTime = 0;
        this.isTransitioning = false;
        this.checkpointPos = new THREE.Vector3(0, 1.5, 0);

        // Callbacks de ciclo de vida
        this.onLevelLoaded = null;
        this.onLevelCompleted = null;
    }

    /**
     * Descarga y limpia atómicamente el nivel actual para evitar fugas de VRAM.
     */
    unloadLevel() {
        // 1. Limpiar mapa y jerarquía 3D mediante resourceManager
        if (this.game.world && this.game.world.mapRoot) {
            resourceManager.disposeHierarchy(this.game.world.mapRoot);
        }

        // 2. Limpiar enemigos y sus mallas GPU
        if (this.game.enemyManager) {
            this.game.enemyManager.clearEnemies();
        }

        // 3. Limpiar partículas y proyectiles
        if (this.game.particles) {
            this.game.particles.clear();
        }

        // 4. Limpiar clones de sombra y popups de daño
        if (this.game.shadowClones) {
            while (this.game.shadowClones.length > 0) {
                const sc = this.game.shadowClones.pop();
                if (sc.mesh) this.game.scene.remove(sc.mesh);
                if (sc.mat) sc.mat.dispose();
            }
        }

        if (this.game.damagePopups) {
            while (this.game.damagePopups.length > 0) {
                const pop = this.game.damagePopups.pop();
                if (pop.sprite) this.game.scene.remove(pop.sprite);
                if (pop.mat) pop.mat.dispose();
                if (pop.texture) pop.texture.dispose();
            }
        }

        this.game.portalVictoryTriggered = false;
        this.collectedGems = 0;
    }

    /**
     * Carga un nivel de campaña lineal 2.5D
     */
    startCampaignLevel(worldNum = 1, levelNum = 1) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        this.unloadLevel();

        this.currentWorldNum = worldNum;
        this.currentLevelNum = levelNum;
        this.isBossFight = false;
        this.collectedGems = 0;
        this.startTime = performance.now();

        const worldMeta = CAMPAIGN_WORLDS[worldNum] || CAMPAIGN_WORLDS[1];
        const lvlMeta = (worldMeta.levels && worldMeta.levels[levelNum - 1]) || { title: 'Nivel ' + levelNum, targetTime: 60 };

        // 1. Construir geometría del nivel 2.5D
        this.game.world.buildCampaignLevel(worldNum, levelNum);

        // 2. Posicionar jugador en origen 2.5D
        const player = this.game.player;
        player.isCampaignMode = true;
        this.checkpointPos.set(0, 1.5, 0);
        player.lastCheckpointPos = this.checkpointPos.clone();
        player.mesh.position.set(0, 1.5, 0);
        player.facing = 1;
        player.mesh.rotation.y = Math.PI / 2;
        player.velocity.set(0, 0, 0);
        player.health = player.maxHealth;

        // 3. Posicionar cámara cinemática 2.5D
        this.game.camera.position.set(2.4, 2.4, this.game.isMobile ? 12.0 : 10.5);
        this.game.camera.lookAt(1.0, 1.4, 0);
        player.camLookTarget = new THREE.Vector3(1.0, 1.4, 0);

        // 4. Generar enemigos en las posiciones del nivel
        this.game.enemyManager.spawnCampaignLevelEnemies(this.game.world.campaignEnemySpawns, worldNum);

        // 5. Configurar interfaz (HUD)
        document.body.classList.add('campaign-active');
        this.game.campaignBossEnemy = null;
        this.game.isCampaignMode = true;
        this.game.campaignCurrentWorld = worldNum;
        this.game.campaignCurrentLevel = levelNum;
        this.game.campaignIsBossFight = false;

        this._setupHUD(worldMeta, lvlMeta);

        this.game.startGame();
        this.game.showBanner(`¡${worldMeta.name.toUpperCase()}!`, `Nivel ${levelNum}: ${lvlMeta.title}`);

        this.isTransitioning = false;
        if (this.onLevelLoaded) this.onLevelLoaded(worldNum, levelNum, false);
    }

    /**
     * Carga la arena de combate para el Jefe Ancestral del Mundo
     */
    startCampaignBoss(worldNum = 1) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        this.unloadLevel();

        this.currentWorldNum = worldNum;
        this.currentLevelNum = 6;
        this.isBossFight = true;
        this.startTime = performance.now();

        const worldMeta = CAMPAIGN_WORLDS[worldNum] || CAMPAIGN_WORLDS[1];
        const bossSpec = worldMeta.boss || { name: 'Jefe Guardián', health: 250 };

        // 1. Construir arena 2.5D
        this.game.world.buildCampaignBossArena(worldNum);

        // 2. Posicionar jugador en el flanco izquierdo
        const player = this.game.player;
        player.isCampaignMode = true;
        player.mesh.position.set(-14, 1.5, 0);
        player.facing = 1;
        player.mesh.rotation.y = Math.PI / 2;
        player.velocity.set(0, 0, 0);
        player.health = player.maxHealth;

        // 3. Posicionar cámara en arena
        this.game.camera.position.set(-6, 2.8, this.game.isMobile ? 12.5 : 11.0);
        this.game.camera.lookAt(0, 1.5, 0);
        player.camLookTarget = new THREE.Vector3(0, 1.5, 0);

        // 4. Generar Jefe Final
        const bossEnemy = this.game.enemyManager.spawnCampaignBoss(worldNum, new THREE.Vector3(12, 0, 0));
        this.game.campaignBossEnemy = bossEnemy;

        // 5. Configurar interfaz para combate contra jefe
        document.body.classList.add('campaign-active');
        this.game.isCampaignMode = true;
        this.game.campaignCurrentWorld = worldNum;
        this.game.campaignCurrentLevel = 6;
        this.game.campaignIsBossFight = true;

        this._setupBossHUD(worldMeta, bossSpec, bossEnemy);

        this.game.startGame();
        this.game.showBanner(`👑 ¡BATALLA CONTRA JEFE!`, `¡Derrota a ${bossSpec.name} para liberar este territorio!`);

        this.isTransitioning = false;
        if (this.onLevelLoaded) this.onLevelLoaded(worldNum, 6, true);
    }

    _setupHUD(worldMeta, lvlMeta) {
        const campHud = document.getElementById('campaign-hud');
        const missHud = document.getElementById('mission-hud');
        if (campHud) campHud.style.display = 'flex';
        if (missHud) missHud.style.display = 'none';

        const progressBarWrap = document.getElementById('camp-progress-bar-wrap');
        const bossBarWrap = document.getElementById('camp-boss-bar-wrap');
        if (progressBarWrap) progressBarWrap.style.display = 'flex';
        if (bossBarWrap) bossBarWrap.style.display = 'none';

        const pFill = document.getElementById('camp-progress-fill');
        const pRun = document.getElementById('camp-progress-runner');
        if (pFill) pFill.style.width = '0%';
        if (pRun) pRun.style.left = '0%';

        for (let i = 1; i <= 3; i++) {
            const gm = document.getElementById(`camp-gem-m${i}`);
            if (gm) gm.classList.remove('collected');
        }

        const badgeEl = document.getElementById('camp-hud-world-badge');
        const titleEl = document.getElementById('camp-hud-level-title');
        const gemsEl = document.getElementById('camp-hud-gems-count');
        const targetEl = document.getElementById('camp-hud-target-time');
        const bossWrap = document.getElementById('camp-hud-boss-wrap');
        const gemsWrap = document.getElementById('camp-obj-gems-wrap');

        if (badgeEl) badgeEl.textContent = `MUNDO ${this.currentWorldNum}`;
        if (titleEl) titleEl.textContent = `${worldMeta.name.toUpperCase()} • NIVEL ${this.currentLevelNum}`;
        if (gemsEl) gemsEl.textContent = `0 / 3`;
        if (targetEl) targetEl.textContent = `(Meta: ${lvlMeta.targetTime}s)`;
        if (bossWrap) bossWrap.style.display = 'none';
        if (gemsWrap) gemsWrap.style.display = 'flex';
    }

    _setupBossHUD(worldMeta, bossSpec, bossEnemy) {
        const campHud = document.getElementById('campaign-hud');
        const missHud = document.getElementById('mission-hud');
        if (campHud) campHud.style.display = 'flex';
        if (missHud) missHud.style.display = 'none';

        const progressBarWrap = document.getElementById('camp-progress-bar-wrap');
        const bossBarWrap = document.getElementById('camp-boss-bar-wrap');
        if (progressBarWrap) progressBarWrap.style.display = 'none';
        if (bossBarWrap) bossBarWrap.style.display = 'flex';

        const bName = document.getElementById('camp-boss-name');
        if (bName) bName.textContent = bossSpec.name;
        const bIcon = document.getElementById('camp-boss-icon');
        if (bIcon) bIcon.textContent = bossSpec.icon || '👑';
        const bFill = document.getElementById('camp-boss-hp-fill');
        const bText = document.getElementById('camp-boss-hp-text');
        const maxHp = (bossEnemy && bossEnemy.maxHealth) || bossSpec.health || 250;
        if (bFill) bFill.style.width = '100%';
        if (bText) bText.textContent = `${maxHp} / ${maxHp}`;

        const badgeEl = document.getElementById('camp-hud-world-badge');
        const titleEl = document.getElementById('camp-hud-level-title');
        const bossWrap = document.getElementById('camp-hud-boss-wrap');
        const gemsWrap = document.getElementById('camp-obj-gems-wrap');

        if (badgeEl) badgeEl.textContent = `MUNDO ${this.currentWorldNum} — JEFE`;
        if (titleEl) titleEl.textContent = bossSpec.name.toUpperCase();
        if (bossWrap) bossWrap.style.display = 'flex';
        if (gemsWrap) gemsWrap.style.display = 'none';
    }
}
