class Player {
    // bonus: bónus permanentes da loja, ex.: { health: 0.2, speed: 0.1, damage: 0.3 }
    constructor(x, y, bonus) {
        this.x = x;
        this.y = y;
        this.radius = 14;
        this.speed = 170 * (1 + bonus.speed);        // pixels por segundo
        this.maxHp = Math.round(100 * (1 + bonus.health));
        this.hp = this.maxHp;
        this.damage = 5 * (1 + bonus.damage);
        this.attackInterval = 0.5;                   // segundos entre disparos
        this.cooldown = 0;
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 10;

        this.invulnTime = 0.6;                       // segundos de proteção após levar dano
        this.invuln = 0;
    }

    update(dt) {
        if (this.invuln > 0) this.invuln = Math.max(0, this.invuln - dt);
    }

    // Devolve true se o dano foi aplicado (false se estava protegido)
    takeDamage(amount) {
        if (this.invuln > 0) return false;
        this.hp -= amount;
        this.invuln = this.invulnTime;
        return true;
    }

    // vec: direção com módulo máximo 1 (teclado ou joystick)
    move(vec, dt, width, height) {
        this.x += vec.x * this.speed * dt;
        this.y += vec.y * this.speed * dt;
        this.x = Math.min(width - this.radius, Math.max(this.radius, this.x));
        this.y = Math.min(height - this.radius, Math.max(this.radius, this.y));
    }

    addXp(amount) {
        this.xp += amount;
        if (this.xp >= this.xpToNextLevel) {
            this.xp -= this.xpToNextLevel;
            this.level++;
            this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
            return true;
        }
        return false;
    }

    draw(ctx) {
        // Pisca enquanto está protegido
        if (this.invuln > 0 && Math.floor(this.invuln / 0.08) % 2 === 0) return;

        ctx.fillStyle = '#00ffcc';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}
