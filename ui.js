class UI {
    // Cada upgrade promete exatamente o que aplica (multiplicações reais)
    static UPGRADES = [
        { text: '+20% de dano',            apply: p => { p.damage *= 1.20; } },
        { text: '+15% de velocidade',      apply: p => { p.speed *= 1.15; } },
        { text: 'Disparo 15% mais rápido', apply: p => { p.attackInterval = Math.max(0.12, p.attackInterval / 1.15); } },
        { text: 'Curar 30 de vida',        apply: p => { p.hp = Math.min(p.maxHp, p.hp + 30); } },
        { text: '+20% de vida máxima',     apply: p => { const extra = p.maxHp * 0.20; p.maxHp += extra; p.hp += extra; } }
    ];

    static $(id) { return document.getElementById(id); }

    static formatTime(totalSeconds) {
        const s = Math.floor(totalSeconds);
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        return `${m}:${(s % 60).toString().padStart(2, '0')}`;
    }

    static show(id) { UI.$(id).classList.remove('hidden'); }
    static hide(id) { UI.$(id).classList.add('hidden'); }

    static setHudVisible(visible) {
        ['hud', 'pause-btn', 'xp-bar-container', 'health-bar-container'].forEach(id => {
            visible ? UI.show(id) : UI.hide(id);
        });
    }

    static refreshMenu() {
        const d = SaveData.data;
        UI.$('total-coins').textContent = d.coins;
        UI.$('shop-coins').textContent = d.coins;
        UI.$('best-time').textContent = UI.formatTime(d.bestTime);
    }

    static updateHUD(player, kills, time, coins) {
        UI.$('level-display').textContent = player.level;
        UI.$('kills-display').textContent = kills;
        UI.$('coins-display').textContent = coins;
        UI.$('time-display').textContent = UI.formatTime(time);

        const hp = Math.max(0, player.hp);
        UI.$('health-bar-fill').style.width = (hp / player.maxHp) * 100 + '%';
        UI.$('health-text').textContent = `${Math.ceil(hp)}/${Math.round(player.maxHp)}`;
        UI.$('xp-bar-fill').style.width = Math.min(100, (player.xp / player.xpToNextLevel) * 100) + '%';
    }

    static showUpgradeOptions(onSelect) {
        const container = UI.$('upgrade-options');
        container.innerHTML = '';

        // Fisher-Yates: sorteio uniforme de 3 opções
        const pool = UI.UPGRADES.slice();
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }

        pool.slice(0, 3).forEach(opt => {
            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.tabIndex = 0;
            card.textContent = opt.text;
            card.onclick = () => onSelect(opt.apply);
            card.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') onSelect(opt.apply); };
            container.appendChild(card);
        });

        UI.show('upgrade-screen');
    }

    static renderShop() {
        const list = UI.$('shop-items');
        list.innerHTML = '';

        SaveData.SHOP.forEach(item => {
            const level = SaveData.data.levels[item.id];
            const maxed = level >= item.maxLevel;
            const price = SaveData.cost(item);

            const row = document.createElement('div');
            row.className = 'shop-item';

            const info = document.createElement('div');
            const title = document.createElement('b');
            title.textContent = `${item.name} (${level}/${item.maxLevel})`;
            const desc = document.createElement('small');
            desc.textContent = item.desc;
            info.appendChild(title);
            info.appendChild(desc);

            const btn = document.createElement('button');
            btn.textContent = maxed ? 'MÁXIMO' : `Comprar (${price})`;
            btn.disabled = maxed || SaveData.data.coins < price;
            btn.onclick = () => {
                if (SaveData.buy(item.id)) {
                    UI.renderShop();
                    UI.refreshMenu();
                }
            };

            row.appendChild(info);
            row.appendChild(btn);
            list.appendChild(row);
        });
    }
}
