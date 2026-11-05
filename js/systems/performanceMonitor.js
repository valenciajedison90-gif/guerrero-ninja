// js/systems/performanceMonitor.js - Monitor de Rendimiento y Perfiles Gráficos Adaptativos (LOW, MEDIUM, HIGH, ULTRA)
export const GRAPHIC_PROFILES = {
    LOW: {
        id: 'LOW',
        name: 'Ahorro / Batería (30 FPS)',
        pixelRatio: 1.0,
        shadowsEnabled: false,
        shadowMapSize: 0,
        particleMultiplier: 0.35,
        maxParticles: 35,
        drawDistance: 80,
        antialias: false,
        useBloom: false
    },
    MEDIUM: {
        id: 'MEDIUM',
        name: 'Equilibrado Móvil (45 FPS)',
        pixelRatio: 1.2,
        shadowsEnabled: true,
        shadowMapSize: 512,
        particleMultiplier: 0.65,
        maxParticles: 70,
        drawDistance: 110,
        antialias: false,
        useBloom: false
    },
    HIGH: {
        id: 'HIGH',
        name: 'Alta Calidad (60 FPS)',
        pixelRatio: 1.5,
        shadowsEnabled: true,
        shadowMapSize: 1024,
        particleMultiplier: 1.0,
        maxParticles: 120,
        drawDistance: 140,
        antialias: true,
        useBloom: true
    },
    ULTRA: {
        id: 'ULTRA',
        name: 'Ultra HD Cinemático',
        pixelRatio: 2.0,
        shadowsEnabled: true,
        shadowMapSize: 2048,
        particleMultiplier: 1.35,
        maxParticles: 180,
        drawDistance: 180,
        antialias: true,
        useBloom: true
    }
};

export class PerformanceMonitor {
    constructor(renderer, scene, isMobile = false) {
        this.renderer = renderer;
        this.scene = scene;
        this.isMobile = isMobile;

        // Perfil inicial sugerido por hardware
        const defaultProfileKey = isMobile ? 'MEDIUM' : 'HIGH';
        this.currentProfileKey = defaultProfileKey;
        this.config = { ...GRAPHIC_PROFILES[defaultProfileKey] };

        // Métricas de frames
        this.fps = 60;
        this.frameTime = 16.6;
        this.frameCount = 0;
        this.lastSecondTime = performance.now();
        this.lowFpsDuration = 0;
        this.autoDegradeEnabled = true;

        this.onProfileChanged = null;

        // Aplicar perfil inicial
        this.applyProfile(this.currentProfileKey, false);
    }

    applyProfile(profileKey, triggerCallback = true) {
        const target = GRAPHIC_PROFILES[profileKey];
        if (!target) return;

        this.currentProfileKey = profileKey;
        this.config = { ...target };

        // Ajustar Pixel Ratio
        const dpr = window.devicePixelRatio || 1;
        const targetDpr = Math.min(dpr, this.config.pixelRatio);
        this.renderer.setPixelRatio(targetDpr);

        // Control de Sombras
        this.renderer.shadowMap.enabled = this.config.shadowsEnabled;
        if (this.config.shadowsEnabled) {
            this.renderer.shadowMap.type = this.isMobile ? 1 : 2; // BasicShadowMap o PCFSoftShadowMap
        }

        // Buscar luces direccionales para ajustar mapSize
        this.scene.traverse(child => {
            if (child.isDirectionalLight && child.shadow) {
                child.castShadow = this.config.shadowsEnabled;
                if (this.config.shadowsEnabled && this.config.shadowMapSize > 0) {
                    child.shadow.mapSize.width = this.config.shadowMapSize;
                    child.shadow.mapSize.height = this.config.shadowMapSize;
                    if (child.shadow.map) {
                        child.shadow.map.dispose();
                        child.shadow.map = null;
                    }
                }
            }
        });

        if (triggerCallback && this.onProfileChanged) {
            this.onProfileChanged(profileKey, this.config);
        }
    }

    update(delta) {
        const now = performance.now();
        this.frameCount++;

        if (now - this.lastSecondTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastSecondTime));
            this.frameTime = (now - this.lastSecondTime) / this.frameCount;
            this.frameCount = 0;
            this.lastSecondTime = now;

            // Degradación dinámica controlada si el FPS cae por debajo de 26 durante más de 3 segundos
            if (this.autoDegradeEnabled) {
                if (this.fps < 26) {
                    this.lowFpsDuration++;
                    if (this.lowFpsDuration >= 3) {
                        this.lowFpsDuration = 0;
                        this._degradeProfile();
                    }
                } else {
                    this.lowFpsDuration = 0;
                }
            }
        }
    }

    _degradeProfile() {
        if (this.currentProfileKey === 'ULTRA') {
            console.warn('[PerformanceMonitor] Degradando automáticamente a HIGH para mantener fluidez');
            this.applyProfile('HIGH');
        } else if (this.currentProfileKey === 'HIGH') {
            console.warn('[PerformanceMonitor] Degradando automáticamente a MEDIUM para estabilizar FPS');
            this.applyProfile('MEDIUM');
        } else if (this.currentProfileKey === 'MEDIUM') {
            console.warn('[PerformanceMonitor] Degradando automáticamente a LOW para evitar sobrecalentamiento');
            this.applyProfile('LOW');
        }
    }

    getStats() {
        const info = this.renderer.info;
        return {
            fps: this.fps,
            frameTimeMs: this.frameTime.toFixed(1),
            profile: this.currentProfileKey,
            drawCalls: info.render.calls,
            triangles: info.render.triangles,
            geometriesCount: info.memory.geometries,
            texturesCount: info.memory.textures
        };
    }
}
