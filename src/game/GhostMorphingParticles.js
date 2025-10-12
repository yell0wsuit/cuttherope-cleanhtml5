import RotateableMultiParticles from "@/visual/RotateableMultiParticles";
import ResourceMgr from "@/resources/ResourceMgr";
import ResourceId from "@/resources/ResourceId";
import MathHelper from "@/utils/MathHelper";
import Rectangle from "@/core/Rectangle";
import RGBAColor from "@/core/RGBAColor";
const TRANSFORM_FRAME_START = 1;
const TRANSFORM_FRAME_END = 3;
const PARTICLE_COUNT = 7;
const DIR_DAMPING = 0.83;
const SIZE_GROWTH = 1.015;
const GhostMorphingParticles = RotateableMultiParticles.extend({
    init: function (numParticles = PARTICLE_COUNT) {
        const texture = ResourceMgr.getTexture(ResourceId.IMG_OBJ_GHOST);
        this._super(numParticles, texture);
        this.size = 0.6;
        this.sizeVar = 0.2;
        this.angle = MathHelper.randomRange(0, 360);
        this.angleVar = 15;
        this.rotateSpeed = 0;
        this.rotateSpeedVar = 30;
        this.life = 0.4;
        this.lifeVar = 0.15;
        this.duration = 1.5;
        this.speed = 60;
        this.speedVar = 15;
        this.startColor = RGBAColor.solidOpaque.copy();
        this.endColor = RGBAColor.transparent.copy();
    },
    initParticle: function (particle) {
        const index = this.particles.length;
        const quadIndex = MathHelper.randomRange(TRANSFORM_FRAME_START, TRANSFORM_FRAME_END);
        const texture = this.imageGrid;
        const targetQuad = texture.rects[quadIndex];
        const emptyQuad = new Rectangle(0, 0, 0, 0);
        this.drawer.setTextureQuad(index, targetQuad, emptyQuad, 1);
        this._super(particle);
        const scale = this.size + MathHelper.randomMinus1to1() * this.sizeVar;
        particle.width = targetQuad.w * scale;
        particle.height = targetQuad.h * scale;
        particle.deltaColor.r = 0;
        particle.deltaColor.g = 0;
        particle.deltaColor.b = 0;
        particle.deltaColor.a = 0;
    },
    update: function (delta) {
        this._super(delta);
        const particles = this.particles;
        const vertices = this.drawer.vertices;
        const lifeThreshold = 0.7 * this.life;
        for (let i = 0, len = particles.length; i < len; i++) {
            const particle = particles[i];
            if (particle.life <= 0) continue;
            if (particle.life < lifeThreshold) {
                particle.deltaColor.r = (this.endColor.r - this.startColor.r) / lifeThreshold;
                particle.deltaColor.g = (this.endColor.g - this.startColor.g) / lifeThreshold;
                particle.deltaColor.b = (this.endColor.b - this.startColor.b) / lifeThreshold;
                particle.deltaColor.a = (this.endColor.a - this.startColor.a) / lifeThreshold;
            }
            particle.dir.multiply(DIR_DAMPING);
            particle.width *= SIZE_GROWTH;
            particle.height *= SIZE_GROWTH;
            const vertex = vertices[i];
            if (vertex) {
                vertex.x = particle.pos.x - particle.width / 2;
                vertex.y = particle.pos.y - particle.height / 2;
                vertex.w = particle.width;
                vertex.h = particle.height;
            }
        }
    },
});
GhostMorphingParticles.PARTICLE_COUNT = PARTICLE_COUNT;
export default GhostMorphingParticles;
