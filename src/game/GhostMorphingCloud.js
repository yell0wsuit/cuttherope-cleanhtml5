import MultiParticles from "@/visual/MultiParticles";
import ResourceMgr from "@/resources/ResourceMgr";
import ResourceId from "@/resources/ResourceId";
import MathHelper from "@/utils/MathHelper";
import Rectangle from "@/core/Rectangle";
import RGBAColor from "@/core/RGBAColor";
const CLOUD_PARTICLES = 5;
const TRANSFORM_FRAME_START = 1;
const TRANSFORM_FRAME_END = 3;
const GROWTH_MULTIPLIER = 1.025;
const SHRINK_MULTIPLIER = 0.98;
const GhostMorphingCloud = MultiParticles.extend({
    init: function () {
        const texture = ResourceMgr.getTexture(ResourceId.IMG_OBJ_GHOST);
        this._super(CLOUD_PARTICLES, texture);
        this.angle = MathHelper.randomRange(0, 360);
        this.size = 1.6;
        this.angleVar = 360;
        this.life = 0.5;
        this.duration = 1.5;
        this.speed = 30;
        this.startColor = RGBAColor.solidOpaque.copy();
        this.endColor = RGBAColor.transparent.copy();
    },
    initParticle: function (particle) {
        this.angle += 360 / this.totalParticles;
        const index = this.particles.length;
        const quadIndex = MathHelper.randomRange(TRANSFORM_FRAME_START, TRANSFORM_FRAME_END);
        const texture = this.imageGrid;
        const targetQuad = texture.rects[quadIndex];
        const emptyQuad = new Rectangle(0, 0, 0, 0);
        this.drawer.setTextureQuad(index, targetQuad, emptyQuad, 1);
        this._super(particle);
        particle.width = targetQuad.w * this.size;
        particle.height = targetQuad.h * this.size;
        particle.deltaColor.r = 0;
        particle.deltaColor.g = 0;
        particle.deltaColor.b = 0;
        particle.deltaColor.a = 0;
    },
    update: function (delta) {
        this._super(delta);
        const particles = this.particles;
        const vertices = this.drawer.vertices;
        const fadeDuration = 0.2 * this.life;
        for (let i = 0, len = particles.length; i < len; i++) {
            const particle = particles[i];
            if (particle.life <= 0) continue;
            if (particle.life > this.life - fadeDuration) {
                particle.width *= GROWTH_MULTIPLIER;
                particle.height *= GROWTH_MULTIPLIER;
            } else {
                particle.deltaColor.r = (this.endColor.r - this.startColor.r) / fadeDuration;
                particle.deltaColor.g = (this.endColor.g - this.startColor.g) / fadeDuration;
                particle.deltaColor.b = (this.endColor.b - this.startColor.b) / fadeDuration;
                particle.deltaColor.a = (this.endColor.a - this.startColor.a) / fadeDuration;
                particle.width *= SHRINK_MULTIPLIER;
                particle.height *= SHRINK_MULTIPLIER;
            }
            const vertex = vertices[i];
            if (vertex) {
                vertex.x = particle.pos.x - particle.width / 2;
                vertex.y = particle.pos.y - particle.height / 2;
                vertex.w = particle.width;
                vertex.h = particle.height;
            }
        }
    },
    startSystem: function (initialParticles) {
        this._super(initialParticles != null ? initialParticles : CLOUD_PARTICLES);
    },
});
export default GhostMorphingCloud;
