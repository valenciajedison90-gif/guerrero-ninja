// js/storage.js - Guardado y carga persistente con localStorage

const STORAGE_KEY = 'guerrero_ninja_save_v1';

const defaultState = {
    coins: 60, // Regalo de bienvenida para que el niño pueda comprar pronto su primera mejora
    level: 1,
    xp: 0,
    xpToNext: 100,
    unlockedWeapons: ['bokken'],
    hotbar: ['bokken', null, null, null, null],
    currentSlot: 0,
    enemiesDefeated: 0,
    soundMuted: false
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
                return { ...defaultState, ...parsed };
            }
        } catch (e) {
            console.warn('No se pudo acceder a localStorage, usando valores por defecto.', e);
        }
        return { ...defaultState };
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

            // Si hay un espacio libre en la hotbar, colocarla automáticamente
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

    resetProgress() {
        this.data = { ...defaultState };
        this.save();
    }
}

export const storage = new StorageEngine();
