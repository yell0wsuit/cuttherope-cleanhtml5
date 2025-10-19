import resolution from "@/resolution";
import ResourceMgr from "@/resources/ResourceMgr";
import ResourceId from "@/resources/ResourceId";
import MathHelper from "@/utils/MathHelper";
import requestAnimationFrame from "@/utils/requestAnimationFrame";

const BASE_CANVAS_AREA = 1920 * 1080;
const MAX_SNOWFLAKES = 80;
const MIN_SNOWFLAKES = 30;
const RETRY_DELAY_MS = 250;
const EDGE_BUFFER = 40;
const FALL_SPEED_MIN = 30;
const FALL_SPEED_MAX = 70;
const DRIFT_SPEED_MAX = 15;
const SWING_AMPLITUDE_MIN = 8;
const SWING_AMPLITUDE_MAX = 22;
const SWING_SPEED_MIN = 0.5;
const SWING_SPEED_MAX = 1.2;
const TWINKLE_SPEED_MIN = 0.4;
const TWINKLE_SPEED_MAX = 1;

class SnowfallOverlay {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.snowflakes = [];
        this.texture = null;
        this.running = false;
        this.frameHandle = null;
        this.retryHandle = null;
        this.lastTimestamp = 0;
        this.fading = false;
        this.fadeElapsed = 0;
        this.fadeDuration = 0.6; // seconds
        this.globalAlpha = 1;
        this.tick = this.tick.bind(this);
    }

    domReady() {
        if (this.canvas) {
            return;
        }

        const gameArea = document.getElementById("gameArea");
        if (!gameArea) {
            return;
        }

        const canvas = document.createElement("canvas");
        canvas.id = "snowOverlay";
        canvas.width = resolution.CANVAS_WIDTH;
        canvas.height = resolution.CANVAS_HEIGHT;
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "80";
        canvas.style.display = "none";

        gameArea.appendChild(canvas);

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.updateCanvasSize();

        window.addEventListener("resize", () => this.updateCanvasSize());

        const fadeToBlack = document.getElementById("fadeToBlack");
        if (fadeToBlack && !fadeToBlack.style.zIndex) {
            fadeToBlack.style.zIndex = "120";
        }
    }

    updateCanvasSize() {
        if (!this.canvas) {
            return;
        }

        const width = resolution.CANVAS_WIDTH;
        const height = resolution.CANVAS_HEIGHT;

        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }

        this.canvas.style.width = width + "px";
        this.canvas.style.height = height + "px";
    }

    start() {
        if (!this.canvas) {
            this.domReady();
        }

        if (!this.canvas || !this.ctx) {
            return;
        }

        if (!this.ensureTexture()) {
            return;
        }

        this.canvas.style.display = "block";
        this.fading = false;
        this.fadeElapsed = 0;
        this.globalAlpha = 1;

        if (!this.running) {
            this.prepareSnowflakes();
            this.running = true;
            this.lastTimestamp = performance.now();
            this.frameHandle = requestAnimationFrame(this.tick);
        }
    }

    stop(immediate = false) {
        if (immediate || !this.running) {
            this._stopImmediate();
            return;
        }

        this.fading = true;
        this.fadeElapsed = 0;
    }

    ensureTexture() {
        if (this.texture) {
            return true;
        }

        const texture = ResourceMgr.getTexture(ResourceId.IMG_SNOWFLAKES);
        if (!texture) {
            if (!this.retryHandle) {
                this.retryHandle = window.setTimeout(() => {
                    this.retryHandle = null;
                    this.start();
                }, RETRY_DELAY_MS);
            }
            return false;
        }

        this.texture = texture;
        return true;
    }

    computeSnowflakeCount() {
        const scaleRatio =
            (resolution.CANVAS_WIDTH * resolution.CANVAS_HEIGHT) / BASE_CANVAS_AREA || 1;
        const scaledCount = Math.round(scaleRatio * MAX_SNOWFLAKES);
        return MathHelper.fitToBoundaries(scaledCount, MIN_SNOWFLAKES, MAX_SNOWFLAKES);
    }

    prepareSnowflakes() {
        this.snowflakes.length = 0;
        const count = this.computeSnowflakeCount();
        for (let i = 0; i < count; i++) {
            const flake = this.createSnowflake(true);
            flake.y = -Math.random() * this.canvas.height;
            this.snowflakes.push(flake);
        }
    }

    createSnowflake(populateScreen = false) {
        const frameCount = this.texture?.rects?.length || 0;
        const frameIndex = frameCount > 0 ? MathHelper.randomRange(0, frameCount - 1) : 0;

        const scale = Math.random() * 0.5 + 0.5;
        const speedY = MathHelper.randomRange(FALL_SPEED_MIN, FALL_SPEED_MAX);
        const speedX = MathHelper.randomRange(-DRIFT_SPEED_MAX, DRIFT_SPEED_MAX);
        const swingAmplitude =
            MathHelper.randomRange(SWING_AMPLITUDE_MIN * 10, SWING_AMPLITUDE_MAX * 10) / 10;
        const swingSpeed =
            MathHelper.randomRange(SWING_SPEED_MIN * 100, SWING_SPEED_MAX * 100) / 100;
        const alphaBase = Math.random() * 0.3 + 0.5;
        const alphaRange = Math.random() * 0.25 + 0.15;

        const xStart = populateScreen
            ? Math.random() * (this.canvas.width + EDGE_BUFFER * 2) - EDGE_BUFFER
            : Math.random() * this.canvas.width;

        return {
            frameIndex,
            scale,
            speedY,
            speedX,
            swingAmplitude,
            swingSpeed,
            swingPhase: Math.random() * Math.PI * 2,
            alphaBase,
            alphaRange,
            twinklePhase: Math.random() * Math.PI * 2,
            twinkleSpeed:
                MathHelper.randomRange(TWINKLE_SPEED_MIN * 100, TWINKLE_SPEED_MAX * 100) / 100,
            baseX: xStart,
            y: populateScreen ? -Math.random() * this.canvas.height : -EDGE_BUFFER,
        };
    }

    resetSnowflake(flake) {
        const replacement = this.createSnowflake(false);
        Object.assign(flake, replacement);
    }

    _stopImmediate() {
        if (this.frameHandle) {
            const cancelFrame =
                window.cancelAnimationFrame?.bind(window) || window.clearTimeout?.bind(window);
            if (cancelFrame) {
                cancelFrame(this.frameHandle);
            }
            this.frameHandle = null;
        }
        if (this.retryHandle) {
            clearTimeout(this.retryHandle);
            this.retryHandle = null;
        }

        this.running = false;
        this.fading = false;
        this.fadeElapsed = 0;
        this.globalAlpha = 0;

        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        if (this.canvas) {
            this.canvas.style.display = "none";
        }
    }

    tick(timestamp) {
        if (!this.running) {
            return;
        }

        const delta = (timestamp - this.lastTimestamp) / 1000 || 0;
        this.lastTimestamp = timestamp;

        this.updateSnowflakes(delta);

        if (this.fading) {
            this.fadeElapsed += delta;
            const progress = MathHelper.fitToBoundaries(this.fadeElapsed / this.fadeDuration, 0, 1);
            this.globalAlpha = Math.max(0, 1 - progress);
            if (progress >= 1) {
                this._stopImmediate();
                return;
            }
        }

        this.drawSnowflakes();

        if (this.running) {
            this.frameHandle = requestAnimationFrame(this.tick);
        }
    }

    updateSnowflakes(delta) {
        const width = this.canvas.width;
        const height = this.canvas.height;

        for (let i = 0, len = this.snowflakes.length; i < len; i++) {
            const flake = this.snowflakes[i];
            flake.y += flake.speedY * delta;
            flake.baseX += flake.speedX * delta;
            flake.swingPhase += flake.swingSpeed * delta;
            flake.twinklePhase += flake.twinkleSpeed * delta;

            const swingOffset = Math.sin(flake.swingPhase) * flake.swingAmplitude;

            const maxY = height + EDGE_BUFFER;
            const maxX = width + EDGE_BUFFER;
            const minX = -EDGE_BUFFER;

            const currentX = flake.baseX + swingOffset;
            if (flake.y > maxY || currentX < minX || currentX > maxX) {
                this.resetSnowflake(flake);
            }
        }
    }

    drawSnowflakes() {
        if (!this.ctx || !this.texture) {
            return;
        }

        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const rects = this.texture.rects || [];
        const offsets = this.texture.offsets || [];
        const preCutWidth = this.texture.preCutSize?.x || 0;
        const preCutHeight = this.texture.preCutSize?.y || 0;
        const image = this.texture.image;

        for (let i = 0, len = this.snowflakes.length; i < len; i++) {
            const flake = this.snowflakes[i];
            const rect = rects[flake.frameIndex];
            if (!rect) {
                continue;
            }

            const offset = offsets[flake.frameIndex] || { x: 0, y: 0 };
            const scaledWidth = rect.w * flake.scale;
            const scaledHeight = rect.h * flake.scale;
            const safePreCutWidth =
                Number.isFinite(preCutWidth) && preCutWidth > 0 && preCutWidth < 10000
                    ? preCutWidth
                    : rect.w;
            const safePreCutHeight =
                Number.isFinite(preCutHeight) && preCutHeight > 0 && preCutHeight < 10000
                    ? preCutHeight
                    : rect.h;
            const scaledPreWidth = safePreCutWidth * flake.scale;
            const scaledPreHeight = safePreCutHeight * flake.scale;
            const scaledOffsetX = offset.x * flake.scale;
            const scaledOffsetY = offset.y * flake.scale;

            const swingOffset = Math.sin(flake.swingPhase) * flake.swingAmplitude;
            const currentX = flake.baseX + swingOffset;
            const drawX = currentX - scaledPreWidth / 2 + scaledOffsetX;
            const drawY = flake.y - scaledPreHeight / 2 + scaledOffsetY;

            const alpha =
                flake.alphaBase + Math.sin(flake.twinklePhase) * flake.alphaRange;
            const finalAlpha =
                MathHelper.fitToBoundaries(alpha, 0, 1) * MathHelper.fitToBoundaries(this.globalAlpha, 0, 1);
            if (finalAlpha <= 0) {
                continue;
            }
            ctx.globalAlpha = finalAlpha;

            ctx.drawImage(
                image,
                rect.x,
                rect.y,
                rect.w,
                rect.h,
                drawX,
                drawY,
                scaledWidth,
                scaledHeight
            );
        }

        ctx.globalAlpha = 1;
    }
}

export default new SnowfallOverlay();
