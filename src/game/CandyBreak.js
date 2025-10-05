import RotateableMultiParticles from "@/visual/RotateableMultiParticles";
import resolution from "@/resolution";
import MathHelper from "@/utils/MathHelper";
import Rectangle from "@/core/Rectangle";
const IMG_OBJ_CANDY_01_piece_01 = 3;
const IMG_OBJ_CANDY_01_piece_02 = 4;
const IMG_OBJ_CANDY_01_piece_03 = 5;
const IMG_OBJ_CANDY_01_piece_04 = 6;
const IMG_OBJ_CANDY_01_piece_05 = 7;

const CandyBreak = RotateableMultiParticles.extend({
    init: function (numParticles, texture) {
        this._super(numParticles, texture);

        // duration
        this.duration = 2;

        // gravity
        this.gravity.x = 0;
        this.gravity.y = 500.0;

        // angle
        this.angle = -90;
        this.angleVar = 50;

        // speed of particles
        this.speed = 150.0;
        this.speedVar = 70.0;

        // radial
        this.radialAccel = 0;
        this.radialAccelVar = 1;

        // tCTRial
        this.tangentialAccel = 0;
        this.tangentialAccelVar = 1;

        // emitter position
        this.posVar.x = 0.0;
        this.posVar.y = 0.0;

        // life of particles
        this.life = 2;
        this.lifeVar = 0;

        // size, in pixels
        this.size = 1;
        this.sizeVar = 0.0;

        // emits per second
        this.emissionRate = 100;

        // color of particles
        this.startColor.r = 1.0;
        this.startColor.g = 1.0;
        this.startColor.b = 1.0;
        this.startColor.a = 1.0;
        this.startColorVar.r = 0.0;
        this.startColorVar.g = 0.0;
        this.startColorVar.b = 0.0;
        this.startColorVar.a = 0.0;
        this.endColor.r = 1.0;
        this.endColor.g = 1.0;
        this.endColor.b = 1.0;
        this.endColor.a = 1.0;
        this.endColorVar.r = 0.0;
        this.endColorVar.g = 0.0;
        this.endColorVar.b = 0.0;
        this.endColorVar.a = 0.0;

        this.rotateSpeed = 0.0;
        this.rotateSpeedVar = 600;

        // additive
        this.blendAdditive = false;
    },
    initParticle: function (particle) {
        this._super(particle);

        const texture = this.imageGrid,
            n = MathHelper.randomRange(IMG_OBJ_CANDY_01_piece_01, IMG_OBJ_CANDY_01_piece_05),
            tquad = texture.rects[n],
            vquad = new Rectangle(0, 0, 0, 0); // don't draw initially

        this.drawer.setTextureQuad(this.particles.length, tquad, vquad);

        particle.width = tquad.w * this.size;
        particle.height = tquad.h * this.size;
    },
});

export default CandyBreak;
