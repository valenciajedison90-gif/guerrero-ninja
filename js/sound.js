// js/sound.js - Motor de Sonido Procedural con Web Audio API
// No requiere descargas de audio externas; genera sonidos en tiempo real con latencia cero.

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.volume = 0.5;
        this.coinPitchIndex = 0;
        this.lastCoinTime = 0;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playSlash(element = 'wood') {
        if (!this.enabled || !this.ctx) return;
        this.init();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        if (element === 'fire') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(450, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.18);
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1200, now);
            filter.frequency.linearRampToValueAtTime(300, now + 0.18);
        } else if (element === 'thunder') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(2000, now);
        } else if (element === 'gold') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(180, now + 0.25);
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2500, now);
        } else {
            // Bokken o acero estándar
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(380, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.14);
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(900, now);
        }

        gain.gain.setValueAtTime(this.volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);

        // Añadir toque de ruido blanco para el roce del aire
        this.playNoise(0.08, 0.2);
    }

    playNoise(duration = 0.1, gainMultiplier = 0.15) {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(this.volume * gainMultiplier, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        noise.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
    }

    playHit(isCrit = false) {
        if (!this.enabled || !this.ctx) return;
        this.init();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = isCrit ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(isCrit ? 320 : 200, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + (isCrit ? 0.2 : 0.12));

        gain.gain.setValueAtTime(this.volume * (isCrit ? 0.6 : 0.4), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (isCrit ? 0.22 : 0.13));

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
        this.playNoise(isCrit ? 0.12 : 0.06, 0.25);
    }

    playShurikenThrow() {
        if (!this.enabled || !this.ctx) return;
        this.init();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.exponentialRampToValueAtTime(250, now + 0.1);

        gain.gain.setValueAtTime(this.volume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    playCoin() {
        if (!this.enabled || !this.ctx) return;
        this.init();

        const now = this.ctx.currentTime;
        // Si se recogen varias monedas seguidas en menos de 0.5s, sube la escala musical
        if (now - this.lastCoinTime < 0.6) {
            this.coinPitchIndex = (this.coinPitchIndex + 1) % 6;
        } else {
            this.coinPitchIndex = 0;
        }
        this.lastCoinTime = now;

        const frequencies = [987.77, 1174.66, 1318.51, 1567.98, 1760.0, 2093.0]; // Escala alegre B5, D6, E6, G6, A6, C7
        const freq = frequencies[this.coinPitchIndex];

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.setValueAtTime(freq * 1.5, now + 0.05);

        gain.gain.setValueAtTime(this.volume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.26);
    }

    playJump() {
        if (!this.enabled || !this.ctx) return;
        this.init();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.18);

        gain.gain.setValueAtTime(this.volume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.21);
    }

    playTrampoline() {
        if (!this.enabled || !this.ctx) return;
        this.init();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.3);

        gain.gain.setValueAtTime(this.volume * 0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.36);
    }

    playPoof() {
        if (!this.enabled || !this.ctx) return;
        this.init();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);

        gain.gain.setValueAtTime(this.volume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
        this.playNoise(0.2, 0.25);
    }

    playShopBuy() {
        if (!this.enabled || !this.ctx) return;
        this.init();

        const now = this.ctx.currentTime;
        // Acorde alegre de campanillas C - E - G - C
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + idx * 0.07;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(this.volume * 0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.32);
        });
    }

    playLevelUp() {
        if (!this.enabled || !this.ctx) return;
        this.init();

        const now = this.ctx.currentTime;
        // Fanfarria triunfal ascendente
        const melody = [
            { f: 523.25, d: 0.12 }, // C5
            { f: 659.25, d: 0.12 }, // E5
            { f: 783.99, d: 0.12 }, // G5
            { f: 1046.50, d: 0.4 }  // C6 sostenido
        ];

        let cursor = now;
        melody.forEach(item => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(item.f, cursor);

            gain.gain.setValueAtTime(this.volume * 0.45, cursor);
            gain.gain.exponentialRampToValueAtTime(0.001, cursor + item.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(cursor);
            osc.stop(cursor + item.d + 0.05);

            cursor += item.d * 0.9;
        });
    }
}

export const sounds = new SoundEngine();
