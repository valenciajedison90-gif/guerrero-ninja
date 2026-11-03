// js/storage.js - Guardado y carga persistente con localStorage
// Soporte para NINJA COLOMBIA ARENA: Personajes de Fauna, Gemas de Biodiversidad y Modos de Juego

const STORAGE_KEY = 'ninja_colombia_arena_v1';

const defaultMissions = {
    selva: {
        completed: false,
        name: 'Selva Amazónica',
        enemiesDefeated: 0,
        enemiesTarget: 6,
        gemsCollected: 0,
        gemsTarget: 3,
        cratesBroken: 0,
        cratesTarget: 6
    },
    eje_cafetero: {
        completed: false,
        name: 'Eje Cafetero',
        enemiesDefeated: 0,
        enemiesTarget: 7,
        gemsCollected: 0,
        gemsTarget: 4,
        cratesBroken: 0,
        cratesTarget: 6
    },
    paramo: {
        completed: false,
        name: 'Páramo Andino',
        enemiesDefeated: 0,
        enemiesTarget: 8,
        gemsCollected: 0,
        gemsTarget: 4,
        cratesBroken: 0,
        cratesTarget: 8
    },
    caribe: {
        completed: false,
        name: 'Caribe Colombiano',
        enemiesDefeated: 0,
        enemiesTarget: 10,
        gemsCollected: 0,
        gemsTarget: 5,
        cratesBroken: 0,
        cratesTarget: 10,
        bossDefeated: false
    }
};

const defaultState = {
    playerName: 'Guardián Ninja',
    selectedCharacter: 'chucho',
    selectedSkin: 'default',
    coins: 2500, // Valores de referencia de la imagen oficial
    gems: 150,   // Gemas de la Biodiversidad
    level: 5,
    xp: 450,
    xpToNext: 800,
    ninjaPassTier: 3,
    ninjaPassXP: 180,
    unlockedCharacters: ['chucho', 'yari', 'guaca', 'capibu', 'ranaik'],
    unlockedSkins: ['chucho_default', 'yari_default', 'guaca_default', 'capibu_default', 'ranaik_default'],
    unlockedWeapons: ['bokken', 'machete_dorado', 'katana'],
    hotbar: ['bokken', 'machete_dorado', null, null, null],
    currentSlot: 0,
    selectedMode: 'battle_royale', // 'battle_royale' | 'aventura' | 'equipos' | 'eventos'
    enemiesDefeated: 12,
    soundMuted: false,
    currentWorld: 'selva',
    unlockedWorlds: ['selva', 'eje_cafetero', 'paramo', 'caribe'],
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
                        selva: { ...defaultMissions.selva, ...(parsed.worldProgress?.selva || {}) },
                        eje_cafetero: { ...defaultMissions.eje_cafetero, ...(parsed.worldProgress?.eje_cafetero || {}) },
                        paramo: { ...defaultMissions.paramo, ...(parsed.worldProgress?.paramo || {}) },
                        caribe: { ...defaultMissions.caribe, ...(parsed.worldProgress?.caribe || {}) }
                    },
                    unlockedWorlds: parsed.unlockedWorlds || defaultState.unlockedWorlds
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

    // Personajes y Skins
    getSelectedCharacter() {
        return this.data.selectedCharacter || 'chucho';
    }

    setSelectedCharacter(charId) {
        if (this.data.unlockedCharacters.includes(charId)) {
            this.data.selectedCharacter = charId;
            this.save();
            return true;
        }
        return false;
    }

    getSelectedMode() {
        return this.data.selectedMode || 'battle_royale';
    }

    setSelectedMode(modeId) {
        this.data.selectedMode = modeId;
        this.save();
    }

    // Monedas y Gemas de la Biodiversidad
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

    addGems(amount) {
        this.data.gems = Math.max(0, this.data.gems + amount);
        this.save();
        return this.data.gems;
    }

    spendGems(amount) {
        if (this.data.gems >= amount) {
            this.data.gems -= amount;
            this.save();
            return true;
        }
        return false;
    }

    // Armas e Inventario
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

    // Progreso y Niveles
    addXP(amount) {
        this.data.xp += amount;
        let leveledUp = false;
        while (this.data.xp >= this.data.xpToNext) {
            this.data.xp -= this.data.xpToNext;
            this.data.level += 1;
            this.data.xpToNext = Math.floor(this.data.xpToNext * 1.45);
            leveledUp = true;
        }
        this.save();
        return { leveledUp, newLevel: this.data.level };
    }

    addNinjaPassXP(amount) {
        this.data.ninjaPassXP += amount;
        while (this.data.ninjaPassXP >= 200 && this.data.ninjaPassTier < 50) {
            this.data.ninjaPassXP -= 200;
            this.data.ninjaPassTier += 1;
        }
        this.save();
        return this.data.ninjaPassTier;
    }

    incrementEnemiesDefeated() {
        this.data.enemiesDefeated += 1;
        this.save();
    }

    // =========================================================================
    // MISIONES Y TERRITORIOS DE COLOMBIA
    // =========================================================================
    getWorldProgress(worldId) {
        // Mapeo retrocompatible
        const mapKey = worldId === 'forest' ? 'selva' : (worldId === 'volcano' ? 'eje_cafetero' : (worldId === 'snow' ? 'paramo' : worldId));
        if (!this.data.worldProgress[mapKey]) {
            this.data.worldProgress[mapKey] = { ...(defaultMissions[mapKey] || defaultMissions.selva) };
        }
        return this.data.worldProgress[mapKey];
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
        if (prog.bossDefeated !== undefined) {
            return prog.enemiesDefeated >= prog.enemiesTarget &&
                   prog.gemsCollected >= prog.gemsTarget &&
                   prog.cratesBroken >= prog.cratesTarget &&
                   prog.bossDefeated === true;
        }
        return prog.enemiesDefeated >= prog.enemiesTarget &&
               prog.gemsCollected >= prog.gemsTarget &&
               prog.cratesBroken >= prog.cratesTarget;
    }

    completeWorld(worldId) {
        const prog = this.getWorldProgress(worldId);
        prog.completed = true;

        if (worldId === 'selva' && !this.data.unlockedWorlds.includes('eje_cafetero')) {
            this.data.unlockedWorlds.push('eje_cafetero');
        } else if (worldId === 'eje_cafetero' && !this.data.unlockedWorlds.includes('paramo')) {
            this.data.unlockedWorlds.push('paramo');
        } else if (worldId === 'paramo' && !this.data.unlockedWorlds.includes('caribe')) {
            this.data.unlockedWorlds.push('caribe');
        }
        this.save();
    }

    isWorldUnlocked(worldId) {
        const mapKey = worldId === 'forest' ? 'selva' : (worldId === 'volcano' ? 'eje_cafetero' : (worldId === 'snow' ? 'paramo' : worldId));
        return this.data.unlockedWorlds.includes(mapKey);
    }

    resetProgress() {
        this.data = JSON.parse(JSON.stringify(defaultState));
        this.save();
    }
}

export const storage = new StorageEngine();
