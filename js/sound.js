// js/sound.js - Motor de Sonido y Música Procedural con Web Audio API
// No requiere descargas de audio externas; genera efectos y música ambiental en tiempo real.

// Catálogo de Pistas de Música Procedural (Ritmos tropicales, andinos y de batalla)
const TRACKS = {
    menu: {
        tempo: 104,
        steps: 32,
        bass: [
            { step: 0, f: 146.83 }, { step: 4, f: 146.83 }, { step: 8, f: 220.00 }, { step: 12, f: 196.00 },
            { step: 16, f: 196.00 }, { step: 20, f: 196.00 }, { step: 24, f: 220.00 }, { step: 28, f: 146.83 }
        ],
        drums: [
            { step: 0, type: 'kick' }, { step: 8, type: 'kick' }, { step: 16, type: 'kick' }, { step: 24, type: 'kick' },
            { step: 2, type: 'shaker' }, { step: 4, type: 'shaker' }, { step: 6, type: 'shaker' },
            { step: 10, type: 'shaker' }, { step: 12, type: 'shaker' }, { step: 14, type: 'shaker' },
            { step: 18, type: 'shaker' }, { step: 20, type: 'shaker' }, { step: 22, type: 'shaker' },
            { step: 26, type: 'shaker' }, { step: 28, type: 'shaker' }, { step: 30, type: 'shaker' }
        ],
        melody: [
            { step: 0, f: 587.33, d: 0.20 },
            { step: 3, f: 523.25, d: 0.15 },
            { step: 6, f: 440.00, d: 0.25 },
            { step: 10, f: 392.00, d: 0.20 },
            { step: 14, f: 440.00, d: 0.25 },
            { step: 16, f: 587.33, d: 0.20 },
            { step: 19, f: 659.25, d: 0.20 },
            { step: 22, f: 587.33, d: 0.25 },
            { step: 26, f: 523.25, d: 0.20 },
            { step: 29, f: 440.00, d: 0.30 }
        ]
    },
    battle: {
        tempo: 128,
        steps: 32,
        bass: [
            { step: 0, f: 146.83 }, { step: 2, f: 146.83 }, { step: 6, f: 174.61 }, { step: 8, f: 146.83 },
            { step: 10, f: 220.00 }, { step: 14, f: 196.00 },
            { step: 16, f: 196.00 }, { step: 18, f: 196.00 }, { step: 22, f: 220.00 }, { step: 24, f: 146.83 },
            { step: 28, f: 174.61 }, { step: 30, f: 146.83 }
        ],
        drums: [
            { step: 0, type: 'kick' }, { step: 4, type: 'snare' }, { step: 8, type: 'kick' }, { step: 12, type: 'snare' },
            { step: 16, type: 'kick' }, { step: 20, type: 'snare' }, { step: 24, type: 'kick' }, { step: 28, type: 'snare' },
            { step: 2, type: 'shaker' }, { step: 6, type: 'shaker' }, { step: 10, type: 'shaker' }, { step: 14, type: 'shaker' },
            { step: 18, type: 'shaker' }, { step: 22, type: 'shaker' }, { step: 26, type: 'shaker' }, { step: 30, type: 'shaker' }
        ],
        melody: [
            { step: 0, f: 440.00, d: 0.12 },
            { step: 2, f: 523.25, d: 0.12 },
            { step: 4, f: 587.33, d: 0.16 },
            { step: 7, f: 659.25, d: 0.14 },
            { step: 10, f: 587.33, d: 0.14 },
            { step: 12, f: 523.25, d: 0.14 },
            { step: 14, f: 440.00, d: 0.18 },
            { step: 16, f: 587.33, d: 0.14 },
            { step: 18, f: 659.25, d: 0.14 },
            { step: 20, f: 783.99, d: 0.18 },
            { step: 24, f: 659.25, d: 0.14 },
            { step: 27, f: 587.33, d: 0.14 },
            { step: 30, f: 523.25, d: 0.16 }
        ]
    },
    boss: {
        tempo: 136,
        steps: 32,
        bass: [
            { step: 0, f: 110.00 }, { step: 2, f: 110.00 }, { step: 4, f: 116.54 }, { step: 6, f: 110.00 },
            { step: 8, f: 130.81 }, { step: 10, f: 110.00 }, { step: 12, f: 146.83 }, { step: 14, f: 116.54 },
            { step: 16, f: 110.00 }, { step: 18, f: 110.00 }, { step: 20, f: 116.54 }, { step: 22, f: 110.00 },
            { step: 24, f: 146.83 }, { step: 26, f: 138.59 }, { step: 28, f: 130.81 }, { step: 30, f: 116.54 }
        ],
        drums: [
            { step: 0, type: 'kick' }, { step: 3, type: 'kick' }, { step: 6, type: 'snare' }, { step: 8, type: 'kick' },
            { step: 11, type: 'kick' }, { step: 14, type: 'snare' }, { step: 16, type: 'kick' }, { step: 19, type: 'kick' },
            { step: 22, type: 'snare' }, { step: 24, type: 'kick' }, { step: 27, type: 'kick' }, { step: 30, type: 'snare' },
            { step: 1, type: 'shaker' }, { step: 2, type: 'shaker' }, { step: 4, type: 'shaker' }, { step: 5, type: 'shaker' },
            { step: 7, type: 'shaker' }, { step: 9, type: 'shaker' }, { step: 10, type: 'shaker' }, { step: 12, type: 'shaker' }
        ],
        melody: [
            { step: 0, f: 440.00, d: 0.10 },
            { step: 2, f: 466.16, d: 0.10 },
            { step: 4, f: 440.00, d: 0.10 },
            { step: 6, f: 523.25, d: 0.14 },
            { step: 8, f: 587.33, d: 0.12 },
            { step: 11, f: 554.37, d: 0.12 },
            { step: 14, f: 440.00, d: 0.18 },
            { step: 16, f: 659.25, d: 0.14 },
            { step: 19, f: 587.33, d: 0.12 },
            { step: 22, f: 554.37, d: 0.12 },
            { step: 25, f: 466.16, d: 0.12 },
            { step: 28, f: 440.00, d: 0.22 }
        ]
    }
};

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.volume = 0.5;
        this.coinPitchIndex = 0;
        this.lastCoinTime = 0;

        // Propiedades de Música de Fondo Procedural (BGM)
        this.musicEnabled = true;
        this.musicVolume = 0.22;
        this.musicGain = null;
        this.currentTrack = null;
        this.musicTimer = null;
        this.currentStep = 0;
        this.nextStepTime = 0;
        this.tempo = 104;
        this.isMusicPlaying = false;
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
        if (this.ctx && !this.musicGain) {
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.setValueAtTime(this.musicVolume * (this.enabled ? 1 : 0), this.ctx.currentTime);
            this.musicGain.connect(this.ctx.destination);
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
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

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

    playStep() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(85, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.06);

        gain.gain.setValueAtTime(this.volume * 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.075);
    }

    playDash() {
        if (!this.enabled || !this.ctx) return;
        this.init();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(550, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.16);

        gain.gain.setValueAtTime(this.volume * 0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.18);
        this.playNoise(0.16, 0.28);
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

    playCrateBreak() {
        if (!this.enabled || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.16);
        gain.gain.setValueAtTime(this.volume * 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.17);
        this.playNoise(0.12, 0.35);
    }

    playGemCollect() {
        if (!this.enabled || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        [880, 1174.66, 1760].forEach((freq, idx) => {
            const t = now + idx * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(this.volume * 0.4, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.26);
        });
    }

    playPortalActivate() {
        if (!this.enabled || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(329.63, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.4);
        gain.gain.setValueAtTime(this.volume * 0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.25);
        this.playNoise(0.3, 0.2);
    }

    playGameStart() {
        if (!this.enabled || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
            const t = now + idx * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(this.volume * 0.5, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.32);
        });
    }

    playSpecialSkill(characterId = 'chucho') {
        if (!this.enabled || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;

        if (characterId === 'chucho') {
            // Rugido Andino: tono grave potente con barrido sísmico
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(160, now);
            osc.frequency.exponentialRampToValueAtTime(45, now + 0.6);
            gain.gain.setValueAtTime(this.volume * 0.8, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.65);
            this.playNoise(0.5, 0.4);
        } else if (characterId === 'yari') {
            // Carrera del Trueno: chispas eléctricas agudas
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(900, now);
            osc.frequency.exponentialRampToValueAtTime(250, now + 0.35);
            gain.gain.setValueAtTime(this.volume * 0.6, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.4);
        } else if (characterId === 'guaca') {
            // Planeo: tono dulce ascendente
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(1040, now + 0.4);
            gain.gain.setValueAtTime(this.volume * 0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.55);
        } else {
            // Capibú / Ranaik: impacto o rebote elástico
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(660, now + 0.25);
            gain.gain.setValueAtTime(this.volume * 0.6, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.35);
        }
    }

    playVictoryFanfare() {
        if (!this.enabled || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [
            { f: 523.25, t: 0.0, d: 0.15 },
            { f: 659.25, t: 0.15, d: 0.15 },
            { f: 783.99, t: 0.30, d: 0.15 },
            { f: 1046.5, t: 0.45, d: 0.45 },
            { f: 880.00, t: 0.90, d: 0.20 },
            { f: 1046.5, t: 1.10, d: 0.60 }
        ];
        notes.forEach(n => {
            const t = now + n.t;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(n.f, t);
            gain.gain.setValueAtTime(this.volume * 0.5, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + n.d + 0.05);
        });
    }

    // =========================================================================
    // MOTOR DE MÚSICA DE FONDO PROCEDURAL (BGM)
    // =========================================================================
    startMusic(trackName = 'menu') {
        if (!this.enabled || !this.musicEnabled) return;
        this.init();
        if (!this.ctx) return;

        if (this.isMusicPlaying && this.currentTrack === trackName) return;

        this.currentTrack = trackName;
        this.isMusicPlaying = true;
        this.currentStep = 0;
        this.nextStepTime = this.ctx.currentTime + 0.05;

        const trackData = TRACKS[trackName] || TRACKS.menu;
        this.tempo = trackData.tempo || 104;

        if (this.musicGain) {
            this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
            this.musicGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
            this.musicGain.gain.linearRampToValueAtTime(this.musicVolume, this.ctx.currentTime + 0.5);
        }

        if (this.musicTimer) clearInterval(this.musicTimer);
        this.musicTimer = setInterval(() => this.scheduler(), 35);
    }

    switchTrack(trackName) {
        if (this.currentTrack === trackName && this.isMusicPlaying) return;
        if (!this.isMusicPlaying) {
            this.startMusic(trackName);
            return;
        }

        if (!this.ctx || !this.musicGain) return;
        const now = this.ctx.currentTime;
        this.musicGain.gain.linearRampToValueAtTime(0.001, now + 0.25);
        setTimeout(() => {
            if (this.isMusicPlaying) {
                this.currentTrack = trackName;
                const trackData = TRACKS[trackName] || TRACKS.menu;
                this.tempo = trackData.tempo || 104;
                this.currentStep = 0;
                if (this.ctx && this.musicGain) {
                    this.nextStepTime = this.ctx.currentTime + 0.05;
                    this.musicGain.gain.linearRampToValueAtTime(this.musicVolume, this.ctx.currentTime + 0.35);
                }
            }
        }, 250);
    }

    stopMusic() {
        this.isMusicPlaying = false;
        if (this.musicTimer) {
            clearInterval(this.musicTimer);
            this.musicTimer = null;
        }
        if (this.musicGain && this.ctx) {
            this.musicGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
        }
    }

    pauseMusic() {
        this.stopMusic();
    }

    resumeMusic() {
        if (!this.enabled || !this.musicEnabled) return;
        if (this.currentTrack) {
            this.startMusic(this.currentTrack);
        } else {
            this.startMusic('menu');
        }
    }

    toggleMusic() {
        if (this.isMusicPlaying) {
            this.stopMusic();
            this.musicEnabled = false;
        } else {
            this.musicEnabled = true;
            this.resumeMusic();
        }
        return this.musicEnabled;
    }

    scheduler() {
        if (!this.ctx || !this.isMusicPlaying) return;
        const lookahead = 0.14;
        const stepTime = 60 / (this.tempo * 4);

        // Protección contra congelamiento por acumulación de tiempo en pestañas en segundo plano
        if (this.nextStepTime < this.ctx.currentTime) {
            this.nextStepTime = this.ctx.currentTime;
        }

        while (this.nextStepTime < this.ctx.currentTime + lookahead) {
            this.scheduleStep(this.currentStep, this.nextStepTime);
            this.nextStepTime += stepTime;
            const trackData = TRACKS[this.currentTrack] || TRACKS.menu;
            this.currentStep = (this.currentStep + 1) % (trackData.steps || 32);
        }
    }

    scheduleStep(step, time) {
        const track = TRACKS[this.currentTrack] || TRACKS.menu;
        if (!track) return;

        // 1. Percusión
        if (track.drums) {
            for (let i = 0; i < track.drums.length; i++) {
                const d = track.drums[i];
                if (d.step === step) {
                    this.playPercussion(d.type, time);
                }
            }
        }

        // 2. Línea de Bajo
        if (track.bass) {
            for (let i = 0; i < track.bass.length; i++) {
                const b = track.bass[i];
                if (b.step === step) {
                    this.playBassNote(b.f, time, (60 / (this.tempo * 4)) * 3.2);
                }
            }
        }

        // 3. Melodía
        if (track.melody) {
            for (let i = 0; i < track.melody.length; i++) {
                const m = track.melody[i];
                if (m.step === step) {
                    this.playMelodyNote(m.f, time, m.d || 0.18);
                }
            }
        }
    }

    playBassNote(freq, time, duration) {
        if (!this.ctx || !this.musicGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(420, time);
        filter.frequency.exponentialRampToValueAtTime(140, time + duration);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.38, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(time);
        osc.stop(time + duration + 0.05);
    }

    playMelodyNote(freq, time, duration) {
        if (!this.ctx || !this.musicGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq * 1.4, time);
        filter.Q.setValueAtTime(2.2, time);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.22, time + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(time);
        osc.stop(time + duration + 0.05);
    }

    playPercussion(type, time) {
        if (!this.ctx || !this.musicGain) return;

        if (type === 'kick') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(115, time);
            osc.frequency.exponentialRampToValueAtTime(34, time + 0.08);

            gain.gain.setValueAtTime(0.35, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.10);

            osc.connect(gain);
            gain.connect(this.musicGain);
            osc.start(time);
            osc.stop(time + 0.11);
        } else if (type === 'snare') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(190, time);
            osc.frequency.exponentialRampToValueAtTime(75, time + 0.07);

            gain.gain.setValueAtTime(0.16, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

            osc.connect(gain);
            gain.connect(this.musicGain);
            osc.start(time);
            osc.stop(time + 0.09);
            this.playNoiseAtTime(time, 0.06, 0.10);
        } else if (type === 'shaker') {
            this.playNoiseAtTime(time, 0.035, 0.045);
        }
    }

    playNoiseAtTime(time, duration, gainAmount) {
        if (!this.ctx || !this.musicGain) return;
        const bufferSize = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(3200, time);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(gainAmount, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        noise.start(time);
        noise.stop(time + duration + 0.01);
    }
}

export const sounds = new SoundEngine();
