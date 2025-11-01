import Particles from "@/visual/Particles";
import Rectangle from "@/core/Rectangle";
import MathHelper from "@/utils/MathHelper";
import ImageMultiDrawer from "@/visual/ImageMultiDrawer";
import resolution from "@/resolution";

class MultiParticles extends Particles {
    /**
     * @param {number} numParticles
     * @param {Texture2D} texture
     */
    constructor(numParticles, texture) {
        super(numParticles);

        this.imageGrid = texture;
        this.drawer = new ImageMultiDrawer(texture);
        this.width = resolution.CANVAS_WIDTH;
        this.height = resolution.CANVAS_HEIGHT;
    }

    /**
     * @param {Particle} particle
     */
    initParticle(particle) {
        const texture = this.imageGrid;
        const n = MathHelper.randomRange(0, texture.rects.length - 1);
        const tquad = texture.rects[n];
        const vquad = new Rectangle(0, 0, 0, 0); // don't draw initially

        this.drawer.setTextureQuad(this.particles.length, tquad, vquad, 1);

        super.initParticle(particle);

        particle.width = tquad.w * particle.size;
        particle.height = tquad.h * particle.size;
    }

    /**
     * @param {Particle} particle
     * @param {number} index
     * @param {number} delta
     */
    updateParticle(particle, index, delta) {
        // update the current position
        this.drawer.vertices[index] = new Rectangle(
            particle.pos.x - particle.width / 2,
            particle.pos.y - particle.height / 2,
            particle.width,
            particle.height
        );

        // update the alpha in the drawer
        this.drawer.alphas[index] = particle.color.a;

        // update the color in the particle system
        this.colors[index] = particle.color;
    }

    /**
     * @param {number} index
     */
    removeParticle(index) {
        this.drawer.removeQuads(index);
        super.removeParticle(index);
    }

    draw() {
        this.preDraw();

        /* for debugging rotation: draw a line from origin at 0 degrees
             let ctx = Canvas.context;
             if (!ctx) return;
             ctx.save();
             ctx.lineWidth = 5;
             ctx.strokeStyle = "blue";
             ctx.beginPath();
             ctx.moveTo(this.drawX, this.drawY);
             ctx.lineTo(this.drawX, this.drawY - 100);
             ctx.closePath();
             ctx.stroke();
             ctx.restore();
         */

        this.drawer.draw();
        this.postDraw();
    }
}

export default MultiParticles;
