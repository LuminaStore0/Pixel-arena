class Enemy {
    // difficulty: multiplicador de vida que cresce com o tempo de jogo
    constructor(x, y, type = 'normal', difficulty = 1) {
        const boss = type === 'boss';
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = boss ? 22 : 12;
        this.speed = boss ? 55 : 90;            // pixels por segundo
        this.maxHp = (boss ? 50 : 10) * difficulty;
        this.hp = this.maxHp;
        this.contactDamage = boss ? 20 : 8;     // dano por golpe (o jogador tem invulnerabilidade curta)
        this.color = boss ? '#ff0055' : '#ff3366';
        this.active = true;
    }

    update(dt, playerX, playerY) {
        const angle = Math.atan2(playerY - this.y, playerX - this.x);
        this.x += Math.cos(angle) * this.speed * dt;
        this.y += Math.sin(angle) * this.speed * dt;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        if (this.type === 'boss') {
            const w = this.radius * 2;
            ctx.fillStyle = '#222';
            ctx.fillRect(this.x - this.radius, this.y - this.radius - 8, w, 4);
            ctx.fillStyle = '#ffd166';
            ctx.fillRect(this.x - this.radius, this.y - this.radius - 8, w * Math.max(0, this.hp / this.maxHp), 4);
        }
    }
}
