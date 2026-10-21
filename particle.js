class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = Math.random() * 3 + 1;
        this.vx = (Math.random() - 0.5) * 240; // pixels por segundo
        this.vy = (Math.random() - 0.5) * 240;
        this.alpha = 1;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.alpha -= dt * 2; // desaparece em 0,5 s
    }

    draw(ctx) {
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Número de dano que sobe e desaparece
class DamageText {
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.text = String(Math.round(value));
        this.vy = -70;       // pixels por segundo (sobe)
        this.age = 0;
        this.life = 0.7;     // segundos
    }

    get alive() { return this.age < this.life; }

    update(dt) {
        this.age += dt;
        this.y += this.vy * dt;
        this.vy *= Math.exp(-dt * 3);   // abranda ao subir
    }

    draw(ctx) {
        ctx.globalAlpha = Math.max(0, 1 - this.age / this.life);
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(this.text, this.x, this.y);
        ctx.fillStyle = '#ffd166';
        ctx.fillText(this.text, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}
