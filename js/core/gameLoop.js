// js/core/gameLoop.js - Motor de Bucle Principal con Timestep Fijo/Variable, Hit-Stop y Slow-Mo
export class GameLoop {
    constructor(updateCallback, renderCallback) {
        this.updateCallback = updateCallback;
        this.renderCallback = renderCallback;

        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;

        // Tasa de física fija (60 Hz = 0.01666s)
        this.fixedDelta = 1 / 60;
        this.accumulator = 0;

        // Controles cinemáticos de combate
        this.hitStopDuration = 0;
        this.slowMoDuration = 0;
        this.slowMoScale = 0.2;

        // Monitor de rendimiento integrado
        this.fps = 60;
        this.frameCount = 0;
        this.fpsTimer = 0;
        this.frameTime = 0;

        this._tick = this._tick.bind(this);
        this.animationFrameId = null;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.fpsTimer = this.lastTime;
        this.animationFrameId = requestAnimationFrame(this._tick);
    }

    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        if (!this.isPaused) return;
        this.isPaused = false;
        this.lastTime = performance.now();
    }

    triggerHitStop(duration = 0.08) {
        this.hitStopDuration = Math.max(this.hitStopDuration, duration);
    }

    triggerSlowMo(duration = 1.0, scale = 0.2) {
        this.slowMoDuration = Math.max(this.slowMoDuration, duration);
        this.slowMoScale = scale;
    }

    _tick(currentTime) {
        if (!this.isRunning) return;
        this.animationFrameId = requestAnimationFrame(this._tick);

        if (this.isPaused) return;

        // Delta time real en segundos
        let delta = (currentTime - this.lastTime) * 0.001;
        this.lastTime = currentTime;

        // Clamping para evitar "spiral of death" cuando la pestaña queda en segundo plano
        if (delta > 0.1) delta = 0.1;
        if (delta <= 0) return;

        // Medición de FPS y frame time
        this.frameCount++;
        if (currentTime - this.fpsTimer >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.fpsTimer));
            this.frameTime = (currentTime - this.fpsTimer) / this.frameCount;
            this.frameCount = 0;
            this.fpsTimer = currentTime;
        }

        // Simulación con Hit-Stop y Slow-Motion
        let simDelta = delta;
        if (this.hitStopDuration > 0) {
            this.hitStopDuration -= delta;
            simDelta = delta * 0.08; // Prácticamente congelado para impacto visceral
        } else if (this.slowMoDuration > 0) {
            this.slowMoDuration -= delta;
            simDelta = delta * this.slowMoScale;
        }

        // Ejecutar actualización de lógica
        if (this.updateCallback) {
            this.updateCallback(delta, simDelta);
        }

        // Ejecutar renderizado
        if (this.renderCallback) {
            this.renderCallback(delta);
        }
    }

    getMetrics() {
        return {
            fps: this.fps,
            frameTimeMs: this.frameTime.toFixed(2),
            isHitStop: this.hitStopDuration > 0,
            isSlowMo: this.slowMoDuration > 0
        };
    }
}
