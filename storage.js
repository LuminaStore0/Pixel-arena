// Gravação do progresso permanente (moedas, loja, melhor tempo)
class SaveData {
    static KEY = 'pas_save_v2';

    static SHOP = [
        { id: 'health', name: 'Vida inicial',    desc: '+10% de vida por nível',  perLevel: 0.10, baseCost: 20, maxLevel: 10 },
        { id: 'speed',  name: 'Velocidade base', desc: '+5% de velocidade por nível', perLevel: 0.05, baseCost: 25, maxLevel: 10 },
        { id: 'damage', name: 'Dano inicial',    desc: '+10% de dano por nível',  perLevel: 0.10, baseCost: 30, maxLevel: 10 }
    ];

    static data = null;

    static load() {
        let saved = null;
        try { saved = JSON.parse(localStorage.getItem(SaveData.KEY)); } catch (e) { saved = null; }

        let oldCoins = 0;
        try { oldCoins = parseInt(localStorage.getItem('pas_total_coins') || '0', 10) || 0; } catch (e) {}

        SaveData.data = {
            coins: saved && Number.isFinite(saved.coins) ? saved.coins : oldCoins,
            bestTime: saved && Number.isFinite(saved.bestTime) ? saved.bestTime : 0,
            levels: Object.assign({ health: 0, speed: 0, damage: 0 }, saved && saved.levels)
        };
        return SaveData.data;
    }

    static persist() {
        try { localStorage.setItem(SaveData.KEY, JSON.stringify(SaveData.data)); } catch (e) {}
    }

    static addCoins(amount) {
        SaveData.data.coins += amount;
        SaveData.persist();
    }

    static setBestTime(seconds) {
        if (seconds > SaveData.data.bestTime) {
            SaveData.data.bestTime = seconds;
            SaveData.persist();
        }
    }

    static cost(item) {
        return Math.round(item.baseCost * Math.pow(1.6, SaveData.data.levels[item.id]));
    }

    static buy(id) {
        const item = SaveData.SHOP.find(i => i.id === id);
        if (!item) return false;
        const level = SaveData.data.levels[id];
        const price = SaveData.cost(item);
        if (level >= item.maxLevel || SaveData.data.coins < price) return false;
        SaveData.data.coins -= price;
        SaveData.data.levels[id] = level + 1;
        SaveData.persist();
        return true;
    }

    // Bónus acumulados (ex.: 0.2 = +20%)
    static getBonuses() {
        const bonus = {};
        SaveData.SHOP.forEach(item => { bonus[item.id] = SaveData.data.levels[item.id] * item.perLevel; });
        return bonus;
    }
}
