import RotateableMultiParticles from "@/visual/RotateableMultiParticles";
import resolution from "@/resolution";
import MathHelper from "@/utils/MathHelper";
import Rectangle from "@/core/Rectangle";
import RES_DATA from "@/resources/ResData";
import ResourceId from "@/resources/ResourceId";

const IMG_OBJ_CANDY_01_piece_01 = 3;
const IMG_OBJ_CANDY_01_piece_02 = 4;
const IMG_OBJ_CANDY_01_piece_03 = 5;
const IMG_OBJ_CANDY_01_piece_04 = 6;
const IMG_OBJ_CANDY_01_piece_05 = 7;
const DEFAULT_PIECE_FRAME_INDICES = [
    IMG_OBJ_CANDY_01_piece_01,
    IMG_OBJ_CANDY_01_piece_02,
    IMG_OBJ_CANDY_01_piece_03,
    IMG_OBJ_CANDY_01_piece_04,
    IMG_OBJ_CANDY_01_piece_05,
];
const PADDINGTON_BREAK_FRAME_NAMES = [
    "frame_0003.png",
    "frame_0004.png",
    "frame_0005.png",
    "frame_0006.png",
    "frame_0007.png",
];

class CandyBreak extends RotateableMultiParticles {
    /**
     * @param {number} numParticles
     * @param {Texture2D} texture
     * @param {{ resourceId: number; }} options
     */
    constructor(numParticles, texture, options) {
        super(numParticles, texture);

        /**
         * @type {number[]}
         */
        this.pieceFrameIndices = this._resolvePieceFrameIndices(options.resourceId);

        // duration
        /**
         * @type {number}
         */
        this.duration = 2;

        // gravity
        this.gravity.x = 0;
        this.gravity.y = 500.0;

        // angle
        /**
         * @type {number}
         */
        this.angle = -90;
        /**
         * @type {number}
         */
        this.angleVar = 50;

        // speed of particles
        /**
         * @type {number}
         */
        this.speed = 150.0;
        /**
         * @type {number}
         */
        this.speedVar = 70.0;

        // radial
        /**
         * @type {number}
         */
        this.radialAccel = 0;
        /**
         * @type {number}
         */
        this.radialAccelVar = 1;

        // tCTRial
        /**
         * @type {number}
         */
        this.tangentialAccel = 0;
        /**
         * @type {number}
         */
        this.tangentialAccelVar = 1;

        // emitter position
        /**
         * @type {number}
         */
        this.posVar.x = 0.0;
        /**
         * @type {number}
         */
        this.posVar.y = 0.0;

        // life of particles
        /**
         * @type {number}
         */
        this.life = 2;
        /**
         * @type {number}
         */
        this.lifeVar = 0;

        // size, in pixels
        /**
         * @type {number}
         */
        this.size = 1;
        /**
         * @type {number}
         */
        this.sizeVar = 0.0;

        // emits per second
        /**
         * @type {number}
         */
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

        /**
         * @type {number}
         */
        this.rotateSpeed = 0.0;
        /**
         * @type {number}
         */
        this.rotateSpeedVar = 600;

        // additive
        /**
         * @type {boolean}
         */
        this.blendAdditive = false;
    }

    /**
     * @param {Particle} particle
     */
    initParticle(particle) {
        super.initParticle(particle);

        const texture = this.imageGrid;
        const frameIndices =
            this.pieceFrameIndices && this.pieceFrameIndices.length
                ? this.pieceFrameIndices
                : DEFAULT_PIECE_FRAME_INDICES;
        const randomIndex = MathHelper.randomRange(0, frameIndices.length - 1);
        const frameToUse = frameIndices[randomIndex];
        const tquad = texture.rects[frameToUse];
        const vquad = new Rectangle(0, 0, 0, 0); // don't draw initially

        this.drawer.setTextureQuad(this.particles.length, tquad, vquad);

        particle.width = tquad.w * this.size;
        particle.height = tquad.h * this.size;
    }

    /**
     * @param {number} resourceId
     */
    _resolvePieceFrameIndices(resourceId) {
        if (!resourceId) {
            return DEFAULT_PIECE_FRAME_INDICES.slice();
        }

        if (resourceId === ResourceId.IMG_OBJ_CANDY_PADDINGTON) {
            /**
             * @type {number[]}
             */
            const indices = this._lookupFrameIndices(resourceId, PADDINGTON_BREAK_FRAME_NAMES);
            if (indices.length) {
                return indices;
            }
        }

        return DEFAULT_PIECE_FRAME_INDICES.slice();
    }

    /**
     * @param {number} resourceId
     * @param {string[]} frameNames
     */
    _lookupFrameIndices(resourceId, frameNames) {
        /**
         * @type {ResEntry}
         */
        const resource = RES_DATA[resourceId];

        /**
         * @type {object}
         */
        const frameIndexByName = resource?.info?.frameIndexByName;

        if (!frameIndexByName) {
            return [];
        }

        return frameNames
            .map(
                (/** @type {string} */ name) =>
                    /** @type {Record<string, number>} */ (frameIndexByName)[name]
            )
            .filter((/** @type {number} */ index) => index !== undefined);
    }
}

export default CandyBreak;
