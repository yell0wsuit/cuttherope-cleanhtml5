import MultiParticles from "@/visual/MultiParticles";
import Radians from "@/utils/Radians";
import MathHelper from "@/utils/MathHelper";
import Vector from "@/core/Vector";
const RotateableMultiParticles = MultiParticles.extend({
    init: function (numParticles, texture) {
        this._super(numParticles, texture);
        this.drawer.rotationAngles = [];
        this.drawer.rotationPositions = [];
    },
    initParticle: function (particle) {
        this._super(particle);
        particle.angle = 0;
        particle.deltaAngle = Radians.fromDegrees(
            this.rotateSpeed + this.rotateSpeedVar * MathHelper.randomMinus1to1()
        );

        const index = this.particles.length;
        this.drawer.rotationAngles[index] = 0;
        this.drawer.rotationPositions[index] = new Vector(0, 0);
    },
    rotatePreCalc: function (v, cosA, sinA, cx, cy) {
        v.x -= cx;
        v.y -= cy;

        const nx = v.x * cosA - v.y * sinA,
            ny = v.x * sinA + v.y * cosA;

        v.x = nx + cx;
        v.y = ny + cy;
    },
    updateParticle: function (particle, index, delta) {
        this._super(particle, index, delta);
        particle.angle += particle.deltaAngle * delta;

        // we need to save the angle and position for drawing rotation
        this.drawer.rotationAngles[index] = particle.angle;
        this.drawer.rotationPositions[index].copyFrom(particle.pos);
    },

    removeParticle: function (index) {
        this.drawer.rotationAngles.splice(index, 1);
        this.drawer.rotationPositions.splice(index, 1);
        this._super(index);
    },
});

export default RotateableMultiParticles;
