class Game {
    static WIDTH = 960;        // resolução lógica HORIZONTAL (16:9); o CSS ajusta ao ecrã
    static HEIGHT = 540;
    static MAX_ENEMIES = 120;

    constructor(canvas, input) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.W = Game.WIDTH;
        this.H = Game.HEIGHT;

        // Nitidez em ecrãs de alta densidade (limitado a 2x para poupar bateria)
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = this.W * dpr;
        canvas.height = this.H * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        this.input = input;
        this.rafId = null;
        this.isRunning = false;
        this.manualPause = false;   // pausa pedida pelo jogador
        this.upgradeOpen = false;   // pausa automática do ecrã de upgrades
    }

    get isPaused() { return this.manualPause || this.upgradeOpen; }

    // Prepara uma partida nova (o objeto Game e os listeners são reutilizados)
    start() {
        if (this.rafId) cancelAnimationFrame(this.rafId);

        this.player = new Player(this.W / 2, this.H / 2, SaveData.getBonuses());
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.texts = [];
        this.shake = 0;

        this.kills = 0;
        this.coinsCollected = 0;
        this.time = 0;
        this.spawnTimer = 0;
        this.nextBossAt = 45;
        this.pendingUpgrades = 0;

        this.isRunning = true;
        this.manualPause = false;
        this.upgradeOpen = false;
        this.lastFrame = null;

        UI.hide('pause-screen');
        this.input.setEnabled(true);
        UI.setHudVisible(true);
        UI.updateHUD(this.player, 0, 0, 0);

        this.rafId = requestAnimationFrame(t => this.loop(t));
    }

    // Loop com Delta Time: a velocidade é igual em 60, 120 ou 144 Hz
    loop(now) {
        if (!this.isRunning) return;

        if (this.lastFrame === null) this.lastFrame = now;
        const dt = Math.min((now - this.lastFrame) / 1000, 0.05); // limite evita saltos ao voltar de outra aba
        this.lastFrame = now;

        // O tremor de ecrã diminui sozinho (mesmo em pausa)
        this.shake *= Math.exp(-dt * 8);
        if (this.shake < 0.3) this.shake = 0;

        this.update(dt);
        this.draw();

        this.rafId = requestAnimationFrame(t => this.loop(t));
    }

    // ---------- Pausa ----------
    pause() {
        if (!this.isRunning || this.isPaused) return;
        this.manualPause = true;
        this.input.setEnabled(false);
        UI.show('pause-screen');
    }

    resume() {
        if (!this.isRunning || !this.manualPause) return;
        this.manualPause = false;
        this.lastFrame = null;
        this.input.setEnabled(true);
        UI.hide('pause-screen');
    }

    togglePause() {
        this.manualPause ? this.resume() : this.pause();
    }

    // Sai da partida a meio: guarda as moedas ganhas e o melhor tempo
    quit() {
        if (!this.isRunning) return;
        this.finishRun();
        UI.hide('pause-screen');
    }

    // ---------- Lógica ----------
    spawnEnemy(type = 'normal') {
        if (this.enemies.length >= Game.MAX_ENEMIES) return;

        // Ponto aleatório no perímetro do ecrã (fora da área visível)
        const margin = 20;
        let r = Math.random() * 2 * (this.W + this.H);
        let x, y;
        if (r < this.W)                    { x = r;          y = -margin; }
        else if ((r -= this.W) < this.H)   { x = this.W + margin; y = r; }
        else if ((r -= this.H) < this.W)   { x = r;          y = this.H + margin; }
        else { r -= this.W;                  x = -margin;    y = r; }

        const difficulty = 1 + (this.time / 60) * 0.5;
        this.enemies.push(new Enemy(x, y, type, difficulty));
    }

    autoAttack(dt) {
        this.player.cooldown -= dt;
        if (this.player.cooldown > 0 || this.enemies.length === 0) return;

        let nearest = null, minDist = Infinity;
        for (const enemy of this.enemies) {
            const dist = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
            if (dist < minDist) { minDist = dist; nearest = enemy; }
        }

        this.projectiles.push(new Projectile(this.player.x, this.player.y, nearest.x, nearest.y, this.player.damage));
        this.player.cooldown = this.player.attackInterval;
        Sfx.shoot();
    }

    // Separação: empurra suavemente inimigos sobrepostos para não ficarem num só ponto
    separateEnemies(dt) {
        const k = 1 - Math.exp(-dt * 12);   // suavização independente do FPS
        const list = this.enemies;

        for (let i = 0; i < list.length; i++) {
            const a = list[i];
            for (let j = i + 1; j < list.length; j++) {
                const b = list[j];
                const minDist = a.radius + b.radius;
                let dx = b.x - a.x;
                let dy = b.y - a.y;
                if (Math.abs(dx) > minDist || Math.abs(dy) > minDist) continue; // descarte rápido

                let dist = Math.hypot(dx, dy);
                if (dist >= minDist) continue;

                if (dist < 0.001) {              // exatamente no mesmo ponto: direção aleatória
                    const angle = Math.random() * Math.PI * 2;
                    dx = Math.cos(angle); dy = Math.sin(angle); dist = 1;
                }

                const push = (minDist - dist) * 0.5 * k;
                const nx = dx / dist, ny = dy / dist;
                a.x -= nx * push; a.y -= ny * push;
                b.x += nx * push; b.y += ny * push;
            }
        }
    }

    update(dt) {
        if (this.isPaused) return;

        this.time += dt;
        this.player.update(dt);
        this.player.move(this.input.getVector(), dt, this.W, this.H);

        // Spawn: cada vez mais rápido, e um boss a cada 45 s
        this.spawnTimer += dt;
        const interval = Math.max(0.35, 1.2 - this.time * 0.008);
        while (this.spawnTimer >= interval) {
            this.spawnTimer -= interval;
            this.spawnEnemy();
        }
        if (this.time >= this.nextBossAt) {
            this.nextBossAt += 45;
            this.spawnEnemy('boss');
        }

        this.autoAttack(dt);

        this.projectiles.forEach(p => p.update(dt, this.W, this.H));
        this.particles.forEach(p => p.update(dt));
        this.texts.forEach(t => t.update(dt));
        this.enemies.forEach(e => e.update(dt, this.player.x, this.player.y));
        this.separateEnemies(dt);

        // Inimigo -> jogador (golpe único + invulnerabilidade curta)
        for (const enemy of this.enemies) {
            if (Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y) < enemy.radius + this.player.radius) {
                if (this.player.takeDamage(enemy.contactDamage)) {
                    for (let i = 0; i < 6; i++) this.particles.push(new Particle(this.player.x, this.player.y, '#ff3366'));
                    this.shake = Math.max(this.shake, 6);
                    Sfx.hurt();
                }
            }
        }

        // Projétil -> inimigo (colisão varrida, não atravessa em quedas de FPS)
        for (const proj of this.projectiles) {
            for (const enemy of this.enemies) {
                if (!enemy.active || !proj.active) continue;
                if (!proj.hits(enemy.x, enemy.y, enemy.radius)) continue;

                enemy.hp -= proj.damage;
                proj.active = false;
                for (let i = 0; i < 4; i++) this.particles.push(new Particle(proj.x, proj.y, '#00ffcc'));
                this.texts.push(new DamageText(enemy.x + (Math.random() - 0.5) * 12, enemy.y - enemy.radius, proj.damage));

                if (enemy.hp <= 0) {
                    enemy.active = false;
                    this.kills++;
                    this.coinsCollected += enemy.type === 'boss' ? 10 : 1;
                    for (let i = 0; i < 8; i++) this.particles.push(new Particle(enemy.x, enemy.y, enemy.color));
                    Sfx.explosion(enemy.type === 'boss');
                    Sfx.coin();
                    if (enemy.type === 'boss') this.shake = Math.max(this.shake, 12);
                    if (this.player.addXp(enemy.type === 'boss' ? 25 : 5)) this.pendingUpgrades++;
                }
            }
        }

        this.enemies = this.enemies.filter(e => e.active);
        this.projectiles = this.projectiles.filter(p => p.active);
        this.particles = this.particles.filter(p => p.alpha > 0);
        this.texts = this.texts.filter(t => t.alive);

        UI.updateHUD(this.player, this.kills, this.time, this.coinsCollected);

        if (this.player.hp <= 0) { this.gameOver(); return; }
        if (this.pendingUpgrades > 0) this.triggerUpgrade();
    }

    triggerUpgrade() {
        this.upgradeOpen = true;
        this.input.setEnabled(false);
        UI.showUpgradeOptions(applyUpgrade => {
            applyUpgrade(this.player);
            this.pendingUpgrades--;
            UI.hide('upgrade-screen');
            UI.updateHUD(this.player, this.kills, this.time, this.coinsCollected);

            if (this.pendingUpgrades > 0) {
                this.triggerUpgrade();      // subiu mais de um nível de uma vez
            } else {
                this.upgradeOpen = false;
                this.lastFrame = null;
                this.input.setEnabled(true);
            }
        });
    }

    // Encerra a partida: guarda moedas/recorde e limpa o HUD
    finishRun() {
        this.isRunning = false;
        cancelAnimationFrame(this.rafId);
        this.input.setEnabled(false);

        SaveData.addCoins(this.coinsCollected);
        SaveData.setBestTime(this.time);

        UI.setHudVisible(false);
        UI.refreshMenu();
    }

    gameOver() {
        this.finishRun();

        UI.$('final-time').textContent = UI.formatTime(this.time);
        UI.$('final-kills').textContent = this.kills;
        UI.$('final-coins').textContent = this.coinsCollected;
        UI.show('game-over-screen');
    }

    draw() {
        const ctx = this.ctx, w = this.W, h = this.H;
        ctx.clearRect(0, 0, w, h);

        ctx.save();
        if (this.shake > 0) {
            ctx.translate((Math.random() - 0.5) * this.shake * 2, (Math.random() - 0.5) * this.shake * 2);
        }

        // Grelha de fundo
        ctx.strokeStyle = '#1a1f2c';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 50) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
        for (let y = 0; y <= h; y += 50) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
        ctx.stroke();

        this.particles.forEach(p => p.draw(ctx));
        this.projectiles.forEach(p => p.draw(ctx));
        this.enemies.forEach(e => e.draw(ctx));
        this.player.draw(ctx);
        this.texts.forEach(t => t.draw(ctx));

        ctx.restore();
    }
}
