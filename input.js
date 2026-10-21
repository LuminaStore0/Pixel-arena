// Entrada unificada: teclado + joystick virtual (toque ou rato).
// É criada UMA vez em main.js, por isso os listeners nunca se acumulam.
class Input {
    constructor(container, joyBase, joyKnob) {
        this.container = container;
        this.joyBase = joyBase;
        this.joyKnob = joyKnob;
        this.enabled = false;
        this.keys = {};
        this.joy = { x: 0, y: 0 };
        this.pointerId = null;
        this.origin = null;

        window.addEventListener('keydown', e => {
            const k = e.key.toLowerCase();
            this.keys[k] = true;
            if (k.startsWith('arrow')) e.preventDefault();
        });
        window.addEventListener('keyup', e => { this.keys[e.key.toLowerCase()] = false; });
        window.addEventListener('blur', () => { this.keys = {}; });

        container.addEventListener('pointerdown', e => this.onDown(e));
        window.addEventListener('pointermove', e => this.onMove(e));
        window.addEventListener('pointerup', e => this.onUp(e));
        window.addEventListener('pointercancel', e => this.onUp(e));
    }

    setEnabled(value) {
        this.enabled = value;
        if (!value) this.releaseJoystick();
    }

    onDown(e) {
        if (!this.enabled || this.pointerId !== null) return;
        if (e.target.closest('button, .upgrade-card, .shop-item')) return;

        this.pointerId = e.pointerId;
        this.origin = { x: e.clientX, y: e.clientY };

        const rect = this.container.getBoundingClientRect();
        this.joyBase.style.left = (e.clientX - rect.left) + 'px';
        this.joyBase.style.top = (e.clientY - rect.top) + 'px';
        this.joyKnob.style.transform = 'translate(0, 0)';
        this.joyBase.classList.remove('hidden');
    }

    onMove(e) {
        if (e.pointerId !== this.pointerId) return;

        const radius = this.joyBase.offsetWidth / 2;
        const dx = e.clientX - this.origin.x;
        const dy = e.clientY - this.origin.y;
        const dist = Math.hypot(dx, dy);
        if (dist === 0) { this.joy = { x: 0, y: 0 }; return; }

        const clamped = Math.min(dist, radius);
        this.joy = { x: (dx / dist) * (clamped / radius), y: (dy / dist) * (clamped / radius) };
        this.joyKnob.style.transform =
            `translate(${(dx / dist) * clamped}px, ${(dy / dist) * clamped}px)`;
    }

    onUp(e) {
        if (e.pointerId === this.pointerId) this.releaseJoystick();
    }

    releaseJoystick() {
        this.pointerId = null;
        this.origin = null;
        this.joy = { x: 0, y: 0 };
        this.joyBase.classList.add('hidden');
    }

    getVector() {
        if (!this.enabled) return { x: 0, y: 0 };

        let x = 0, y = 0;
        if (this.keys['arrowleft'] || this.keys['a']) x -= 1;
        if (this.keys['arrowright'] || this.keys['d']) x += 1;
        if (this.keys['arrowup'] || this.keys['w']) y -= 1;
        if (this.keys['arrowdown'] || this.keys['s']) y += 1;

        if (x !== 0 || y !== 0) {
            const len = Math.hypot(x, y);   // diagonal não fica mais rápida
            return { x: x / len, y: y / len };
        }
        return { x: this.joy.x, y: this.joy.y };
    }
}
