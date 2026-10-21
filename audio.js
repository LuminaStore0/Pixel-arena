// Efeitos sonoros gerados por código (Web Audio API): sem ficheiros de áudio.
class Sfx {
    static ctx = null;
    static muted = false;
    static last = {};

    static init() {
        try { Sfx.muted = localStorage.getItem('pas_muted') === '1'; } catch (e) {}
    }

    // Os navegadores só permitem áudio depois de um toque/clique do jogador
    static unlock() {
        if (!Sfx.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            Sfx.ctx = new AC();
        }
        if (Sfx.ctx.state === 'suspended') Sfx.ctx.resume();
    }

    static toggleMute() {
        Sfx.muted = !Sfx.muted;
        try { localStorage.setItem('pas_muted', Sfx.muted ? '1' : '0'); } catch (e) {}
        return Sfx.muted;
    }

    // Evita dezenas de sons iguais no mesmo instante
    static canPlay(name, minGap) {
        if (Sfx.muted || !Sfx.ctx) return false;
        const now = Sfx.ctx.currentTime;
        if (Sfx.last[name] !== undefined && now - Sfx.last[name] < minGap) return false;
        Sfx.last[name] = now;
        return true;
    }

    static tone(freqStart, freqEnd, duration, type, volume, delay = 0) {
        const c = Sfx.ctx;
        const t = c.currentTime + delay;
        const osc = c.createOscillator();
        const gain = c.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freqStart, t);
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t + duration);
        gain.gain.setValueAtTime(volume, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(t);
        osc.stop(t + duration + 0.02);
    }

    static noise(duration, volume) {
        const c = Sfx.ctx;
        const length = Math.floor(c.sampleRate * duration);
        const buffer = c.createBuffer(1, length, c.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);

        const source = c.createBufferSource();
        source.buffer = buffer;
        const filter = c.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1400;
        const gain = c.createGain();
        gain.gain.value = volume;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(c.destination);
        source.start();
    }

    static shoot() {
        if (!Sfx.canPlay('shoot', 0.05)) return;
        Sfx.tone(900, 300, 0.08, 'square', 0.04);
    }

    static explosion(big = false) {
        if (!Sfx.canPlay('boom', 0.04)) return;
        Sfx.noise(big ? 0.45 : 0.16, big ? 0.3 : 0.16);
        Sfx.tone(big ? 120 : 160, 40, big ? 0.4 : 0.14, 'sawtooth', 0.07);
    }

    static coin() {
        if (!Sfx.canPlay('coin', 0.06)) return;
        Sfx.tone(988, 988, 0.07, 'square', 0.04, 0.05);
        Sfx.tone(1319, 1319, 0.12, 'square', 0.04, 0.12);
    }

    static hurt() {
        if (!Sfx.canPlay('hurt', 0.1)) return;
        Sfx.tone(220, 80, 0.2, 'sawtooth', 0.1);
    }
}
