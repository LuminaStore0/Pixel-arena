class Projectile {
    constructor(x, y, targetX, targetY, damage) {
        this.x = x;
        this.y = y;
        this.prevX = x;
        this.prevY = y;
        this.radius = 4;
        this.speed = 420; // pixels por segundo
        this.damage = damage;
        this.active = true;

        const angle = Math.atan2(targetY - y, targetX - x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
    }

    update(dt, width, height) {
        this.prevX = this.x;
        this.prevY = this.y;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) this.active = false;
    }

    // Colisão "varrida": testa o segmento percorrido neste frame (prev -> atual),
    // por isso o projétil nunca atravessa um inimigo, mesmo com FPS baixo.
    hits(cx, cy, r) {
        const dx = this.x - this.prevX;
        const dy = this.y - this.prevY;
        const len2 = dx * dx + dy * dy;

        let t = 0;
        if (len2 > 0) {
            t = ((cx - this.prevX) * dx + (cy - this.prevY) * dy) / len2;
            t = Math.max(0, Math.min(1, t));
        }

        const px = this.prevX + dx * t;
        const py = this.prevY + dy * t;
        const reach = r + this.radius;
        return (cx - px) * (cx - px) + (cy - py) * (cy - py) < reach * reach;
    }

    draw(ctx) {
        ctx.fillStyle = '#00ffcc';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}
