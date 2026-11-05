// js/core/textureGenerator.js - Generador Procedural de Texturas de Alta Calidad para Guerrero Ninja
// Genera texturas estilizadas sin descargas externas, 100% offline, ligeras y con nitidez HD.
import * as THREE from 'three';

class TextureGenerator {
    constructor() {
        this.cache = new Map();
    }

    _createCanvas(w = 256, h = 256) {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        return canvas;
    }

    /**
     * Textura de plumaje estilizado para Guaca (Guacamaya Escarlata)
     */
    getFeatherTexture(primaryHex = '#dc2626', secondaryHex = '#2563eb', accentHex = '#facc15') {
        const key = `feather_${primaryHex}_${secondaryHex}_${accentHex}`;
        if (this.cache.has(key)) return this.cache.get(key);

        const canvas = this._createCanvas(256, 256);
        const ctx = canvas.getContext('2d');

        // Fondo degradado escarlata
        const grad = ctx.createLinearGradient(0, 0, 0, 256);
        grad.addColorStop(0, primaryHex);
        grad.addColorStop(0.65, secondaryHex);
        grad.addColorStop(1, accentHex);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);

        // Barbas y capas de plumas finas
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 2.0;
        for (let y = 12; y < 256; y += 18) {
            ctx.beginPath();
            ctx.arc(128, y, 64, 0.15 * Math.PI, 0.85 * Math.PI);
            ctx.stroke();

            // Puntas de pluma con brillo
            ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
            ctx.beginPath();
            ctx.arc(128, y + 16, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        this.cache.set(key, tex);
        return tex;
    }

    /**
     * Textura de pelaje suave y orgánico para Chucho (Oso) y Capibú (Capibara)
     */
    getFurTexture(baseHex = '#3d3027', highlightHex = '#5c483a') {
        const key = `fur_${baseHex}_${highlightHex}`;
        if (this.cache.has(key)) return this.cache.get(key);

        const canvas = this._createCanvas(256, 256);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = baseHex;
        ctx.fillRect(0, 0, 256, 256);

        // Mechones de pelaje suaves
        ctx.fillStyle = highlightHex;
        for (let i = 0; i < 600; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const len = 4 + Math.random() * 8;
            ctx.fillRect(x, y, 1.5, len);
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        this.cache.set(key, tex);
        return tex;
    }

    /**
     * Textura de manchas de jaguar / tigrillo para Yarí
     */
    getJaguarTexture(baseHex = '#d97706', spotHex = '#1c1917', innerHex = '#b45309') {
        const key = `jaguar_${baseHex}`;
        if (this.cache.has(key)) return this.cache.get(key);

        const canvas = this._createCanvas(256, 256);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = baseHex;
        ctx.fillRect(0, 0, 256, 256);

        // Rosetas de jaguar auténticas
        for (let i = 0; i < 28; i++) {
            const cx = (i % 5) * 52 + 20 + (Math.random() - 0.5) * 14;
            const cy = Math.floor(i / 5) * 44 + 18 + (Math.random() - 0.5) * 12;
            const r = 12 + Math.random() * 6;

            ctx.fillStyle = innerHex;
            ctx.beginPath();
            ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = spotHex;
            ctx.lineWidth = 3.5;
            for (let a = 0; a < 3; a++) {
                const start = a * (Math.PI * 2 / 3) + 0.2;
                ctx.beginPath();
                ctx.arc(cx, cy, r, start, start + 1.2);
                ctx.stroke();
            }
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        this.cache.set(key, tex);
        return tex;
    }

    /**
     * Textura de piel húmeda y brillante de rana venenosa para Ranaik
     */
    getFrogSkinTexture(baseHex = '#facc15', spotHex = '#09090b') {
        const key = `frog_${baseHex}`;
        if (this.cache.has(key)) return this.cache.get(key);

        const canvas = this._createCanvas(256, 256);
        const ctx = canvas.getContext('2d');

        const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 140);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.7, baseHex);
        grad.addColorStop(1, '#eab308');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);

        // Manchas oscuras orgánicas y poros
        ctx.fillStyle = spotHex;
        for (let i = 0; i < 22; i++) {
            const rx = Math.random() * 256;
            const ry = Math.random() * 256;
            const r = 5 + Math.random() * 8;
            ctx.beginPath();
            ctx.ellipse(rx, ry, r * 1.2, r * 0.8, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        this.cache.set(key, tex);
        return tex;
    }

    /**
     * Textura de ojos de héroe con pupila, iris de color, y brillo especular
     */
    getEyeTexture(irisColor = '#f59e0b', hasSlit = false) {
        const key = `eye_${irisColor}_${hasSlit}`;
        if (this.cache.has(key)) return this.cache.get(key);

        const canvas = this._createCanvas(128, 128);
        const ctx = canvas.getContext('2d');

        // Esclerótica blanca
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 128, 128);

        // Borde sombreado suave
        const scleraGrad = ctx.createRadialGradient(64, 64, 40, 64, 64, 64);
        scleraGrad.addColorStop(0, 'rgba(255,255,255,0)');
        scleraGrad.addColorStop(1, 'rgba(203, 213, 225, 0.45)');
        ctx.fillStyle = scleraGrad;
        ctx.fillRect(0, 0, 128, 128);

        // Iris
        const irisGrad = ctx.createRadialGradient(64, 64, 10, 64, 64, 44);
        irisGrad.addColorStop(0, irisColor);
        irisGrad.addColorStop(0.85, '#0f172a');
        irisGrad.addColorStop(1, '#020617');
        ctx.fillStyle = irisGrad;
        ctx.beginPath();
        ctx.arc(64, 64, 44, 0, Math.PI * 2);
        ctx.fill();

        // Pupila
        ctx.fillStyle = '#020617';
        if (hasSlit) {
            ctx.beginPath();
            ctx.ellipse(64, 64, 9, 36, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(64, 64, 22, 0, Math.PI * 2);
            ctx.fill();
        }

        // Destello especular de luz (Catchlight estilo anime)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(52, 48, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(76, 76, 4.5, 0, Math.PI * 2);
        ctx.fill();

        const tex = new THREE.CanvasTexture(canvas);
        this.cache.set(key, tex);
        return tex;
    }

    /**
     * Textura de piedra mística tallada para plataformas de la Selva y Templos
     */
    getAncientStoneTexture() {
        const key = 'stone_ancient';
        if (this.cache.has(key)) return this.cache.get(key);

        const canvas = this._createCanvas(256, 256);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#27272a';
        ctx.fillRect(0, 0, 256, 256);

        // Bloques de piedra tallada prehispánica
        ctx.strokeStyle = '#18181b';
        ctx.lineWidth = 4;
        for (let y = 0; y <= 256; y += 64) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(256, y);
            ctx.stroke();

            const offset = (y % 128 === 0) ? 0 : 64;
            for (let x = offset; x <= 256; x += 128) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + 64);
                ctx.stroke();
            }
        }

        // Musgo verde en las junturas
        ctx.fillStyle = 'rgba(34, 197, 94, 0.40)';
        for (let i = 0; i < 40; i++) {
            const mx = Math.random() * 256;
            const my = Math.random() * 256;
            ctx.beginPath();
            ctx.arc(mx, my, 4 + Math.random() * 8, 0, Math.PI * 2);
            ctx.fill();
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        this.cache.set(key, tex);
        return tex;
    }

    /**
     * Textura de hielo cristalino glaciar para Los Nevados (Mundo 3)
     */
    getGlacierIceTexture() {
        const key = 'ice_glacier';
        if (this.cache.has(key)) return this.cache.get(key);

        const canvas = this._createCanvas(256, 256);
        const ctx = canvas.getContext('2d');

        const grad = ctx.createLinearGradient(0, 0, 256, 256);
        grad.addColorStop(0, '#e0f2fe');
        grad.addColorStop(0.5, '#7dd3fc');
        grad.addColorStop(1, '#0284c7');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);

        // Grietas cristalinas translúcidas
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        for (let i = 0; i < 18; i++) {
            ctx.beginPath();
            let x = Math.random() * 256;
            let y = Math.random() * 256;
            ctx.moveTo(x, y);
            for (let s = 0; s < 4; s++) {
                x += (Math.random() - 0.5) * 50;
                y += (Math.random() - 0.5) * 50;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        this.cache.set(key, tex);
        return tex;
    }

    /**
     * Textura de bambú guadua auténtico para el Eje Cafetero (Mundo 2)
     */
    getBambooWoodTexture() {
        const key = 'bamboo_guadua';
        if (this.cache.has(key)) return this.cache.get(key);

        const canvas = this._createCanvas(256, 256);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#b45309';
        ctx.fillRect(0, 0, 256, 256);

        // Vetas de madera de guadua
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3;
        for (let x = 16; x < 256; x += 32) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 256);
            ctx.stroke();

            // Nudos de bambú
            ctx.fillStyle = '#451a03';
            ctx.fillRect(x - 6, 60, 12, 6);
            ctx.fillRect(x - 6, 180, 12, 6);
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        this.cache.set(key, tex);
        return tex;
    }

    /**
     * Textura de arenisca roja y cañón para Chicamocha y Tatacoa (Mundo 5 y 6)
     */
    getRedCanyonTexture() {
        const key = 'canyon_sandstone';
        if (this.cache.has(key)) return this.cache.get(key);

        const canvas = this._createCanvas(256, 256);
        const ctx = canvas.getContext('2d');

        const grad = ctx.createLinearGradient(0, 0, 0, 256);
        grad.addColorStop(0, '#9a3412');
        grad.addColorStop(0.3, '#ea580c');
        grad.addColorStop(0.6, '#c2410c');
        grad.addColorStop(1, '#7c2d12');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);

        // Estratos geológicos horizontales
        ctx.strokeStyle = 'rgba(67, 20, 7, 0.45)';
        ctx.lineWidth = 3;
        for (let y = 14; y < 256; y += 22) {
            ctx.beginPath();
            ctx.moveTo(0, y + (Math.sin(y) * 4));
            ctx.lineTo(256, y + (Math.cos(y) * 4));
            ctx.stroke();
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        this.cache.set(key, tex);
        return tex;
    }

    /**
     * Textura de algas multicolores líquidas para Caño Cristales (Mundo 9)
     */
    getRainbowAlgaeTexture() {
        const key = 'algae_cristales';
        if (this.cache.has(key)) return this.cache.get(key);

        const canvas = this._createCanvas(256, 256);
        const ctx = canvas.getContext('2d');

        const grad = ctx.createLinearGradient(0, 0, 256, 256);
        grad.addColorStop(0, '#ec4899'); // Magenta fucsia característico
        grad.addColorStop(0.35, '#eab308'); // Amarillo brillante
        grad.addColorStop(0.7, '#06b6d4'); // Turquesa cristalino
        grad.addColorStop(1, '#10b981'); // Verde esmeralda
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);

        // Ondulaciones líquidas
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.40)';
        ctx.lineWidth = 2.5;
        for (let y = 16; y < 256; y += 28) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            for (let x = 0; x <= 256; x += 32) {
                ctx.lineTo(x, y + Math.sin(x * 0.08) * 8);
            }
            ctx.stroke();
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        this.cache.set(key, tex);
        return tex;
    }

    /**
     * Textura de oro precolombino tallado con glifos solares para El Dorado (Mundo 10)
     */
    getElDoradoGoldTexture() {
        const key = 'eldorado_gold';
        if (this.cache.has(key)) return this.cache.get(key);

        const canvas = this._createCanvas(256, 256);
        const ctx = canvas.getContext('2d');

        const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 140);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.6, '#facc15');
        grad.addColorStop(1, '#b45309');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);

        // Glifos y espirales precolombinas Quimbaya
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3.5;

        // Rombo central
        ctx.beginPath();
        ctx.moveTo(128, 48);
        ctx.lineTo(208, 128);
        ctx.lineTo(128, 208);
        ctx.lineTo(48, 128);
        ctx.closePath();
        ctx.stroke();

        // Espiral solar
        ctx.beginPath();
        ctx.arc(128, 128, 28, 0, Math.PI * 1.5);
        ctx.stroke();

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        this.cache.set(key, tex);
        return tex;
    }
}

export const textureGen = new TextureGenerator();
