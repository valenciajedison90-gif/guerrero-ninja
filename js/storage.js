// js/storage.js - Guardado y carga persistente con localStorage
// Soporte para Misiones por Mundo estilo Crash Bandicoot

const STORAGE_KEY = 'guerrero_ninja_save_v2';

const defaultMissions = {
    forest: {
        completed: false,
        enemiesDefeated: 0,
        enemiesTarget: 5,
        gemsCollected: 0,
        gemsTarget: 3,
        cratesBroken: 0,
        cratesTarget: 6
    },
    volcano: {
        completed: false,
        enemiesDefeated: 0,
        enemiesTarget: 6,
        gemsCollected: 0,
        gemsTarget: 3,
        totemsDestroyed: 0,
        totemsTarget: 4
    },
    snow: {
        completed: false,
        gemsCollected: 0,
        gemsTarget: 4,
        enemiesDefeated: 0,
        enemiesTarget: 8,
        bossDefeated: false
    }
};

const defaultState = {
    coins: 60,
    level: 1,
    xp: 0,
    xpToNext: 100,
    unlockedWeapons: ['bokken'],
    hotbar: ['bokken', null, null, null, null],
    currentSlot: 0,
    enemiesDefeated: 0,
    soundMuted: false,
    currentWorld: 'forest',
    unlockedWorlds: ['forest'],
    worldProgress: JSON.parse(JSON.stringify(defaultMissions))
};

class StorageEngine {
    constructor() {
        this.data = this.load();
    }

    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                return {
                    ...defaultState,
                    ...parsed,
                    worldProgress: {
                        forest: { ...defaultMissions.forest, ...(parsed.worldProgress?.forest || {}) },
                        volcano: { ...defaultMissions.volcano, ...(parsed.worldProgress?.volcano || {}) },
                        snow: { ...defaultMissions.snow, ...(parsed.worldProgress?.snow || {}) }
                    },
                    unlockedWorlds: parsed.unlockedWorlds || ['forest']
                };
            }
        } catch (e) {
            console.warn('No se pudo acceder a localStorage, usando valores por defecto.', e);
        }
        return JSON.parse(JSON.stringify(defaultState));
    }

    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.warn('Error al guardar datos en localStorage.', e);
        }
    }

    addCoins(amount) {
        this.data.coins = Math.max(0, this.data.coins + amount);
        this.save();
        return this.data.coins;
    }

    spendCoins(amount) {
        if (this.data.coins >= amount) {
            this.data.coins -= amount;
            this.save();
            return true;
        }
        return false;
    }

    unlockWeapon(weaponId) {
        if (!this.data.unlockedWeapons.includes(weaponId)) {
            this.data.unlockedWeapons.push(weaponId);

            const freeSlot = this.data.hotbar.findIndex(slot => slot === null);
            if (freeSlot !== -1) {
                this.data.hotbar[freeSlot] = weaponId;
                this.data.currentSlot = freeSlot;
            }
            this.save();
            return true;
        }
        return false;
    }

    isUnlocked(weaponId) {
        return this.data.unlockedWeapons.includes(weaponId);
    }

    setHotbarSlot(slotIndex, weaponId) {
        if (slotIndex >= 0 && slotIndex < 5) {
            this.data.hotbar[slotIndex] = weaponId;
            this.save();
        }
    }

    setCurrentSlot(slotIndex) {
        if (slotIndex >= 0 && slotIndex < 5 && this.data.hotbar[slotIndex]) {
            this.data.currentSlot = slotIndex;
            this.save();
            return this.data.hotbar[slotIndex];
        }
        return null;
    }

    getActiveWeaponId() {
        return this.data.hotbar[this.data.currentSlot] || 'bokken';
    }

    addXP(amount) {
        this.data.xp += amount;
        let leveledUp = false;
        while (this.data.xp >= this.data.xpToNext) {
            this.data.xp -= this.data.xpToNext;
            this.data.level += 1;
            this.data.xpToNext = Math.floor(this.data.xpToNext * 1.5);
            leveledUp = true;
        }
        this.save();
        return { leveledUp, newLevel: this.data.level };
    }

    incrementEnemiesDefeated() {
        this.data.enemiesDefeated += 1;
        this.save();
    }

    // =========================================================================
    // GESTIÓN DE MISIONES Y MUNDOS ESTILO CRASH BANDICOOT
    // =========================================================================
    getWorldProgress(worldId) {
        if (!this.data.worldProgress[worldId]) {
            this.data.worldProgress[worldId] = { ...(defaultMissions[worldId] || defaultMissions.forest) };
        }
        return this.data.worldProgress[worldId];
    }

    recordMissionEnemy(worldId) {
        const prog = this.getWorldProgress(worldId);
        if (prog.enemiesDefeated < prog.enemiesTarget) {
            prog.enemiesDefeated += 1;
            this.save();
        }
        return this.isMissionCompleted(worldId);
    }

    recordMissionGem(worldId) {
        const prog = this.getWorldProgress(worldId);
        if (prog.gemsCollected < prog.gemsTarget) {
            prog.gemsCollected += 1;
            this.save();
        }
        return this.isMissionCompleted(worldId);
    }

    recordMissionCrate(worldId) {
        const prog = this.getWorldProgress(worldId);
        if (prog.cratesBroken !== undefined && prog.cratesBroken < prog.cratesTarget) {
            prog.cratesBroken += 1;
            this.save();
        }
        return this.isMissionCompleted(worldId);
    }

    recordMissionTotem(worldId) {
        const prog = this.getWorldProgress(worldId);
        if (prog.totemsDestroyed !== undefined && prog.totemsDestroyed < prog.totemsTarget) {
            prog.totemsDestroyed += 1;
            this.save();
        }
        return this.isMissionCompleted(worldId);
    }

    recordMissionBoss(worldId) {
        const prog = this.getWorldProgress(worldId);
        if (prog.bossDefeated !== undefined) {
            prog.bossDefeated = true;
            this.save();
        }
        return this.isMissionCompleted(worldId);
    }

    isMissionCompleted(worldId) {
        const prog = this.getWorldProgress(worldId);
        if (worldId === 'forest') {
            return prog.enemiesDefeated >= prog.enemiesTarget &&
                   prog.gemsCollected >= prog.gemsTarget &&
                   prog.cratesBroken >= prog.cratesTarget;
        } else if (worldId === 'volcano') {
            return prog.enemiesDefeated >= prog.enemiesTarget &&
                   prog.gemsCollected >= prog.gemsTarget &&
                   prog.totemsDestroyed >= prog.totemsTarget;
        } else if (worldId === 'snow') {
            return prog.gemsCollected >= prog.gemsTarget &&
                   prog.enemiesDefeated >= prog.enemiesTarget &&
                   prog.bossDefeated === true;
        }
        return false;
    }

    completeWorld(worldId) {
        const prog = this.getWorldProgress(worldId);
        prog.completed = true;

        // Desbloquear el siguiente mundo
        if (worldId === 'forest' && !this.data.unlockedWorlds.includes('volcano')) {
            this.data.unlockedWorlds.push('volcano');
        } else if (worldId === 'volcano' && !this.data.unlockedWorlds.includes('snow')) {
            this.data.unlockedWorlds.push('snow');
        }
        this.save();
    }

    isWorldUnlocked(worldId) {
        return this.data.unlockedWorlds.includes(worldId);
    }

    unlockWorld(worldId) {
        if (!this.data.unlockedWorlds.includes(worldId)) {
            this.data.unlockedWorlds.push(worldId);
            this.save();
        }
    }

    resetProgress() {
        this.data = JSON.parse(JSON.stringify(defaultState));
        this.save();
    }
}

export const storage = new StorageEngine();
