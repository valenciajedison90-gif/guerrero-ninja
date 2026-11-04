// Función de limpieza estricta de cookies al iniciar el juego
export function clearAllCookies() {
    try {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            if (name) {
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
            }
        }
        console.log('[Ninja Colombia Arena] Cookies eliminadas exitosamente al inicio.');
    } catch (e) {
        console.warn('No se pudieron eliminar cookies:', e);
    }
}
// Ejecutar de inmediato al cargar el módulo
clearAllCookies();

// js/storage.js - Guardado y carga persistente con localStorage
// Soporte para NINJA COLOMBIA ARENA: Personajes de Fauna, Gemas de Biodiversidad y Modos de Juego

const STORAGE_KEY = 'ninja_colombia_arena_v1';

const defaultMissions = {
    selva: {
        completed: false,
        name: 'Selva Amazónica',
        enemiesDefeated: 0,
        enemiesTarget: 4,
        gemsCollected: 0,
        gemsTarget: 2,
        cratesBroken: 0,
        cratesTarget: 3
    },
    eje_cafetero: {
        completed: false,
        name: 'Eje Cafetero',
        enemiesDefeated: 0,
        enemiesTarget: 4,
        gemsCollected: 0,
        gemsTarget: 3,
        cratesBroken: 0,
        cratesTarget: 3
    },
    paramo: {
        completed: false,
        name: 'Páramo Andino',
        enemiesDefeated: 0,
        enemiesTarget: 6,
        gemsCollected: 0,
        gemsTarget: 4,
        bossDefeated: false
    },
    caribe: {
        completed: false,
        name: 'Caribe Colombiano',
        enemiesDefeated: 0,
        enemiesTarget: 6,
        gemsCollected: 0,
        gemsTarget: 5,
        bossDefeated: false
    }
};

function createDefaultCampaign() {
    const worlds = {};
    for (let w = 1; w <= 10; w++) {
        worlds[w] = {
            unlocked: w === 1,
            bossUnlocked: false,
            bossDefeated: false,
            levels: {
                1: { completed: false, stars: 0, bestTime: 0, gemsCollected: 0, unlocked: true },
                2: { completed: false, stars: 0, bestTime: 0, gemsCollected: 0, unlocked: false },
                3: { completed: false, stars: 0, bestTime: 0, gemsCollected: 0, unlocked: false },
                4: { completed: false, stars: 0, bestTime: 0, gemsCollected: 0, unlocked: false },
                5: { completed: false, stars: 0, bestTime: 0, gemsCollected: 0, unlocked: false }
            }
        };
    }
    return {
        selectedWorld: 1,
        selectedLevel: 1,
        worlds: worlds
    };
}

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
    selectedMode: 'battle_royale', // 'battle_royale' | 'adventure' | 'squads' | 'events'
    enemiesDefeated: 12,
    soundMuted: false,
    currentWorld: 'selva',
    unlockedWorlds: ['selva', 'eje_cafetero', 'paramo', 'caribe'],
    worldProgress: JSON.parse(JSON.stringify(defaultMissions)),
    campaign: createDefaultCampaign()
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
                const defaultCamp = createDefaultCampaign();
                const savedCamp = parsed.campaign || {};
                
                // Asegurar que los 10 mundos existen
                const mergedWorlds = {};
                for (let w = 1; w <= 10; w++) {
                    const defW = defaultCamp.worlds[w];
                    const savW = savedCamp.worlds?.[w] || {};
                    const lvl1 = { ...defW.levels[1], ...(savW.levels?.[1] || {}) };
                    const isW1Done = w === 1 && (lvl1.completed || savW.bossDefeated);
                    mergedWorlds[w] = {
                        unlocked: w === 1 ? true : (savW.unlocked !== undefined ? savW.unlocked : (w === 2 && isW1Done ? true : defW.unlocked)),
                        bossUnlocked: (w === 1) ? true : (savW.bossUnlocked !== undefined ? savW.bossUnlocked : defW.bossUnlocked),
                        bossDefeated: savW.bossDefeated !== undefined ? savW.bossDefeated : defW.bossDefeated,
                        levels: {
                            1: lvl1,
                            2: { ...defW.levels[2], ...(savW.levels?.[2] || {}) },
                            3: { ...defW.levels[3], ...(savW.levels?.[3] || {}) },
                            4: { ...defW.levels[4], ...(savW.levels?.[4] || {}) },
                            5: { ...defW.levels[5], ...(savW.levels?.[5] || {}) }
                        }
                    };
                }

                return {
                    ...defaultState,
                    ...parsed,
                    worldProgress: {
                        selva: { ...defaultMissions.selva, ...(parsed.worldProgress?.selva || {}), enemiesTarget: 4, gemsTarget: 2, cratesTarget: 3 },
                        eje_cafetero: { ...defaultMissions.eje_cafetero, ...(parsed.worldProgress?.eje_cafetero || {}), enemiesTarget: 4, gemsTarget: 3, cratesTarget: 3 },
                        paramo: { ...defaultMissions.paramo, ...(parsed.worldProgress?.paramo || {}) },
                        caribe: { ...defaultMissions.caribe, ...(parsed.worldProgress?.caribe || {}) }
                    },
                    unlockedWorlds: parsed.unlockedWorlds || defaultState.unlockedWorlds,
                    campaign: {
                        selectedWorld: savedCamp.selectedWorld || 1,
                        selectedLevel: savedCamp.selectedLevel || 1,
                        worlds: mergedWorlds
                    }
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
        const prog = this.data.worldProgress[mapKey];
        const def = defaultMissions[mapKey] || defaultMissions.selva;
        // Sincronizar dinámicamente metas para no bloquear partidas existentes
        prog.enemiesTarget = def.enemiesTarget;
        prog.gemsTarget = def.gemsTarget;
        if (def.cratesTarget !== undefined) prog.cratesTarget = def.cratesTarget;
        if (def.bossDefeated !== undefined && prog.bossDefeated === undefined) prog.bossDefeated = false;
        return prog;
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
        if (prog.totemsDestroyed === undefined) {
            prog.totemsDestroyed = 0;
        }
        prog.totemsDestroyed += 1;
        this.save();
        return this.isMissionCompleted(worldId);
    }

    recordMissionBoss(worldId) {
        const prog = this.getWorldProgress(worldId);
        prog.bossDefeated = true;
        this.save();
        return this.isMissionCompleted(worldId);
    }

    isMissionCompleted(worldId) {
        const mapKey = worldId === 'forest' ? 'selva' : (worldId === 'volcano' ? 'eje_cafetero' : (worldId === 'snow' ? 'paramo' : worldId));
        const prog = this.getWorldProgress(mapKey);
        if (prog.completed) return true;

        // Reglas de juego claras y accesibles para pasar de mundo:
        // Si derrota al menos 2 enemigos O recoge al menos 1 gema O rompe 2 cajas O vence al jefe
        const enemies = prog.enemiesDefeated || 0;
        const gems = prog.gemsCollected || 0;
        const crates = prog.cratesBroken || 0;
        return enemies >= 2 || gems >= 1 || crates >= 2 || prog.bossDefeated === true;
    }

    completeWorld(worldId) {
        const mapKey = worldId === 'forest' ? 'selva' : (worldId === 'volcano' ? 'eje_cafetero' : (worldId === 'snow' ? 'paramo' : worldId));
        const prog = this.getWorldProgress(mapKey);
        prog.completed = true;

        if (mapKey === 'selva' && !this.data.unlockedWorlds.includes('eje_cafetero')) {
            this.data.unlockedWorlds.push('eje_cafetero');
        } else if (mapKey === 'eje_cafetero' && !this.data.unlockedWorlds.includes('paramo')) {
            this.data.unlockedWorlds.push('paramo');
        } else if (mapKey === 'paramo' && !this.data.unlockedWorlds.includes('caribe')) {
            this.data.unlockedWorlds.push('caribe');
        }
        this.save();
    }

    isWorldUnlocked(worldId) {
        const mapKey = worldId === 'forest' ? 'selva' : (worldId === 'volcano' ? 'eje_cafetero' : (worldId === 'snow' ? 'paramo' : worldId));
        return this.data.unlockedWorlds.includes(mapKey);
    }

    // =========================================================================
    // MÓDULO: CAMPAÑA INDIVIDUAL "AVENTURA NINJA" (10 MUNDOS & 50 NIVELES)
    // =========================================================================
    getCampaign() {
        if (!this.data.campaign) {
            this.data.campaign = createDefaultCampaign();
            this.save();
        }
        return this.data.campaign;
    }

    getCampaignWorld(worldNum) {
        const camp = this.getCampaign();
        return camp.worlds[worldNum] || null;
    }

    isCampaignWorldUnlocked(worldNum) {
        if (worldNum === 1) return true;
        const w = this.getCampaignWorld(worldNum);
        return w ? w.unlocked : false;
    }

    isCampaignLevelUnlocked(worldNum, levelNum) {
        if (!this.isCampaignWorldUnlocked(worldNum)) return false;
        if (levelNum === 1) return true;
        const w = this.getCampaignWorld(worldNum);
        if (!w || !w.levels[levelNum]) return false;
        return w.levels[levelNum].unlocked === true;
    }

    getCampaignLevel(worldNum, levelNum) {
        const w = this.getCampaignWorld(worldNum);
        return (w && w.levels) ? w.levels[levelNum] : null;
    }

    recordCampaignLevelResult(worldNum, levelNum, stars, time, gems) {
        const camp = this.getCampaign();
        const w = camp.worlds[worldNum];
        if (!w) return;

        const lvl = w.levels[levelNum];
        if (lvl) {
            lvl.completed = true;
            lvl.stars = Math.max(lvl.stars || 0, Math.min(3, stars));
            lvl.bestTime = (lvl.bestTime === 0 || time < lvl.bestTime) ? Math.round(time) : lvl.bestTime;
            lvl.gemsCollected = Math.max(lvl.gemsCollected || 0, gems || 0);

            // Desbloquear el siguiente nivel del mundo
            if (levelNum < 5 && w.levels[levelNum + 1]) {
                w.levels[levelNum + 1].unlocked = true;
            }
            // Al superar un nivel, se habilita el combate contra el jefe
            w.bossUnlocked = true;

            // Al superar el nivel o derrotar al jefe, desbloquear el siguiente mundo de Colombia
            if (worldNum < 10 && camp.worlds[worldNum + 1]) {
                camp.worlds[worldNum + 1].unlocked = true;
            }
        }

        // Recompensas inmediatas
        this.addCoins(stars * 25);
        this.addGems(stars >= 2 ? 5 : 2);
        this.addXP(stars * 40);

        this.save();
    }

    recordCampaignBossDefeated(worldNum) {
        const camp = this.getCampaign();
        const w = camp.worlds[worldNum];
        if (!w) return;

        w.bossDefeated = true;

        // Desbloquear el siguiente mundo
        if (worldNum < 10 && camp.worlds[worldNum + 1]) {
            camp.worlds[worldNum + 1].unlocked = true;
        }

        // Gran recompensa por vencer al jefe del mundo
        this.addCoins(250);
        this.addGems(35);
        this.addXP(400);

        this.save();
    }

    getTotalCampaignStars() {
        const camp = this.getCampaign();
        let total = 0;
        for (let w = 1; w <= 10; w++) {
            const world = camp.worlds[w];
            if (world && world.levels) {
                for (let l = 1; l <= 5; l++) {
                    total += (world.levels[l]?.stars || 0);
                }
            }
        }
        return total;
    }

    getTotalCampaignLevelsCompleted() {
        const camp = this.getCampaign();
        let count = 0;
        for (let w = 1; w <= 10; w++) {
            const world = camp.worlds[w];
            if (world && world.levels) {
                for (let l = 1; l <= 5; l++) {
                    if (world.levels[l]?.completed) count++;
                }
            }
        }
        return count;
    }

    resetProgress() {
        this.data = JSON.parse(JSON.stringify(defaultState));
        this.save();
    }

    // =========================================================================
    // HISTORIAL DE PARTIDAS Y AVANCES PERSISTENTES (CELULAR Y NAVEGADOR)
    // =========================================================================

    recordMatchResult(match) {
        if (!this.data.history) this.data.history = [];
        if (!this.data.careerStats) {
            this.data.careerStats = {
                matchesPlayed: 0,
                victories: 0,
                totalKills: 0,
                levelsCompleted: 0,
                starsEarned: 0,
                bossesDefeated: 0,
                totalCoinsEarned: 0,
                totalGemsEarned: 0
            };
        }

        const matchRecord = {
            id: Date.now(),
            date: new Date().toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }),
            mode: match.mode || 'Battle Royale',
            map: match.map || 'Selva Amazónica',
            hero: match.hero || 'Chucho',
            outcome: match.outcome || 'Finalizada',
            kills: match.kills || 0,
            time: match.time || '0:00',
            stars: match.stars || 0,
            coins: match.coins || 0,
            gems: match.gems || 0,
            xp: match.xp || 0
        };

        // Guardar en la cima del historial (máximo 30 partidas para no saturar memoria)
        this.data.history.unshift(matchRecord);
        if (this.data.history.length > 30) {
            this.data.history.pop();
        }

        // Actualizar estadísticas de carrera
        this.data.careerStats.matchesPlayed = (this.data.careerStats.matchesPlayed || 0) + 1;
        if (match.isVictory) {
            this.data.careerStats.victories = (this.data.careerStats.victories || 0) + 1;
        }
        this.data.careerStats.totalKills = (this.data.careerStats.totalKills || 0) + (match.kills || 0);
        this.data.careerStats.totalCoinsEarned = (this.data.careerStats.totalCoinsEarned || 0) + (match.coins || 0);
        this.data.careerStats.totalGemsEarned = (this.data.careerStats.totalGemsEarned || 0) + (match.gems || 0);

        this.save();
        return matchRecord;
    }

    getMatchHistory() {
        return this.data.history || [];
    }

    getCareerStats() {
        const stats = this.data.careerStats || {
            matchesPlayed: 0,
            victories: 0,
            totalKills: 0,
            levelsCompleted: 0,
            starsEarned: 0,
            bossesDefeated: 0,
            totalCoinsEarned: 0,
            totalGemsEarned: 0
        };
        stats.levelsCompleted = this.getTotalCampaignLevelsCompleted();
        stats.starsEarned = this.getTotalCampaignStars();
        return stats;
    }

    clearMatchHistory() {
        this.data.history = [];
        this.save();
    }

    exportSaveJson() {
        return JSON.stringify(this.data, null, 2);
    }

    importSaveJson(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (parsed && typeof parsed === 'object') {
                this.data = Object.assign(this.data, parsed);
                this.save();
                return true;
            }
        } catch (e) {
            console.error('Error importando partida:', e);
        }
        return false;
    }

}

export const storage = new StorageEngine();
