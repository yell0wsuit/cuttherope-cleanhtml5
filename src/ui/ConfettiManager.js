import RES_DATA from "@/resources/ResData";
import ResourceId from "@/resources/ResourceId";
import MathHelper from "@/utils/MathHelper";

// Frame ranges for different confetti particle types
const PARTICLE_TYPES = [
    { start: 0, end: 8 }, // particle_3
    { start: 9, end: 17 }, // particle_2
    { start: 18, end: 26 }, // particle_1
];

class ConfettiParticle {
    /**
     * @param {number} canvasWidth
     * @param {number} canvasHeight
     * @param {number} frameIndex
     * @param {{ start: number; end: number; }} frameRange
     * @param {Texture2D} texture
     */
    constructor(canvasWidth, canvasHeight, frameIndex, frameRange, texture) {
        this.frameIndex = frameIndex;
        this.frameRange = frameRange; // {start, end} for animation
        this.texture = texture;

        // Position - random X across screen width, random Y at top
        this.startX = MathHelper.randomRange(-100, canvasWidth);
        this.startY = MathHelper.randomRange(-40, 100);

        // Animation duration (2-5 seconds as in C#)
        this.duration = MathHelper.randomRange(2, 5);

        // End position - fall down 150-400 pixels
        this.endX = this.startX;
        this.endY = this.startY + MathHelper.randomRange(150, 400);

        // Current position
        this.x = this.startX;
        this.y = this.startY;

        // Rotation - from random angle to another random angle
        this.startRotation = MathHelper.randomRange(-360, 360);
        this.endRotation = MathHelper.randomRange(-360, 360);
        this.rotation = this.startRotation;

        // Scale animation - start at 0, grow to 1 over 0.3 seconds
        this.scale = 0;
        this.scaleGrowDuration = 0.3;

        // Opacity - fade from opaque to transparent
        this.opacity = 1;

        // Frame animation - cycle through frames at 0.05 delay (20 fps)
        this.frameAnimationTimer = 0;
        this.frameAnimationDelay = 0.05;
        this.currentFrameOffset = MathHelper.randomRange(0, frameRange.end - frameRange.start);

        // Lifetime
        this.age = 0;
    }

    /**
     * @param {number} delta
     */
    update(delta) {
        this.age += delta;

        // Progress through animation (0 to 1)
        const progress = Math.min(this.age / this.duration, 1);

        // Update position (linear interpolation from start to end)
        this.x = this.startX + (this.endX - this.startX) * progress;
        this.y = this.startY + (this.endY - this.startY) * progress;

        // Update rotation (linear interpolation)
        this.rotation = this.startRotation + (this.endRotation - this.startRotation) * progress;

        // Update scale (grow from 0 to 1 over first 0.3 seconds)
        if (this.age < this.scaleGrowDuration) {
            this.scale = this.age / this.scaleGrowDuration;
        } else {
            this.scale = 1;
        }

        // Update opacity (fade from 1 to 0 over entire duration)
        this.opacity = 1 - progress;

        // Update frame animation
        this.frameAnimationTimer += delta;
        if (this.frameAnimationTimer >= this.frameAnimationDelay) {
            this.frameAnimationTimer -= this.frameAnimationDelay;
            this.currentFrameOffset =
                (this.currentFrameOffset + 1) % (this.frameRange.end - this.frameRange.start + 1);
        }

        // Current frame index to draw
        this.frameIndex = this.frameRange.start + this.currentFrameOffset;

        return this.age < this.duration;
    }

    /**
     * Draws the confetti particle to the canvas
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        const frame = this.texture.rects[this.frameIndex];
        if (!frame) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.scale(this.scale, this.scale);

        // Draw the confetti piece centered
        const w = frame.w;
        const h = frame.h;
        ctx.drawImage(this.texture.image, frame.x, frame.y, w, h, -w / 2, -h / 2, w, h);

        ctx.restore();
    }
}

class ConfettiManager {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        /**
         * @type {Particles[]}
         */
        this.particles = [];
        this.active = false;
        this.animationFrame = null;
        this.lastTime = 0;
        this.emissionTimer = 0;
        this.emissionRate = 200; // particles per second
        this.duration = 1; // seconds
        this.elapsed = 0;
        this.totalParticles = 50;
        this.initialBurst = 15;
    }

    /**
     * @param {HTMLElement} containerElement
     */
    start(containerElement) {
        // Create canvas overlay
        this.canvas = document.createElement("canvas");
        this.canvas.id = "confettiCanvas";
        this.canvas.style.position = "absolute";
        this.canvas.style.top = "0";
        this.canvas.style.left = "0";
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvas.style.pointerEvents = "none";
        this.canvas.style.zIndex = "9999";

        // Get the container dimensions
        const rect = containerElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;

        containerElement.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");

        // Load confetti texture
        const resource = RES_DATA[ResourceId.IMG_CONFETTI_PARTICLES];
        this.texture = resource?.texture;

        if (!this.texture || !this.texture.image) {
            console.error("Confetti texture not loaded");
            return;
        }

        // Initialize
        this.particles = [];
        this.active = true;
        this.lastTime = performance.now();
        this.elapsed = 0;
        this.emissionTimer = 0;

        // Create initial burst (particles will spawn at random positions)
        for (let i = 0; i < this.initialBurst; i++) {
            this.createParticle();
        }

        // Start animation loop
        this.animate();
    }

    createParticle() {
        if (this.particles.length >= this.totalParticles) return;

        const typeIndex = MathHelper.randomRange(0, 2);
        const type = PARTICLE_TYPES[typeIndex];

        // Start with a random frame from the selected type
        const initialFrameIndex = MathHelper.randomRange(type.start, type.end);

        if (!this.canvas) {
            return;
        }

        this.particles.push(
            new ConfettiParticle(
                this.canvas.width,
                this.canvas.height,
                initialFrameIndex,
                type,
                this.texture
            )
        );
    }

    animate = () => {
        if (!this.active) return;

        const now = performance.now();
        const delta = (now - this.lastTime) / 1000;
        this.lastTime = now;

        // Update elapsed time
        this.elapsed += delta;
        this.emissionTimer += delta;

        // Emit new particles
        if (this.elapsed < this.duration) {
            const emissionInterval = 1 / this.emissionRate;
            while (
                this.emissionTimer >= emissionInterval &&
                this.particles.length < this.totalParticles
            ) {
                this.createParticle();
                this.emissionTimer -= emissionInterval;
            }
        }

        if (!this.ctx || !this.canvas) {
            return;
        }

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw particles
        this.particles = this.particles.filter((particle) => {
            const alive = particle.update(delta);
            if (alive) {
                particle.draw(this.ctx);
            }
            return alive;
        });

        // Continue animation if there are particles or still emitting
        if (this.particles.length > 0 || this.elapsed < this.duration) {
            this.animationFrame = requestAnimationFrame(this.animate);
        } else {
            this.stop();
        }
    };

    stop() {
        this.active = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        if (this.canvas && this.canvas.parentElement) {
            this.canvas.parentElement.removeChild(this.canvas);
        }
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
    }
}

export default ConfettiManager;
