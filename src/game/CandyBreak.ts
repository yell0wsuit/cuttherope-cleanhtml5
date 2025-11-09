import RotateableMultiParticles from "@/visual/RotateableMultiParticles";
import resolution from "@/resolution";
import MathHelper from "@/utils/MathHelper";
import Rectangle from "@/core/Rectangle";
import RES_DATA from "@/resources/ResData";
import ResourceId from "@/resources/ResourceId";
import type Texture2D from "@/core/Texture2D";
import type { Particle } from "@/visual/Particles";
import type ResEntry from "@/resources/ResEntry";

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

interface CandyBreakOptions {
    resourceId?: number;
}

class CandyBreak extends RotateableMultiParticles {
    pieceFrameIndices: number[];

    constructor(numParticles: number, texture: Texture2D, options: CandyBreakOptions = {}) {
        super(numParticles, texture);
        this.pieceFrameIndices = this._resolvePieceFrameIndices(options.resourceId);

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
    }

    override initParticle(particle: Particle) {
        super.initParticle(particle);

        const texture = this.imageGrid;
        const frameIndices =
            this.pieceFrameIndices && this.pieceFrameIndices.length
                ? this.pieceFrameIndices
                : DEFAULT_PIECE_FRAME_INDICES;
        const randomIndex = MathHelper.randomRange(0, frameIndices.length - 1);
        const frameToUse = frameIndices[randomIndex]!;
        const tquad = texture.rects[frameToUse];
        if (!tquad) {
            return;
        }
        const vquad = new Rectangle(0, 0, 0, 0); // don't draw initially

        this.drawer.setTextureQuad(this.particles.length, tquad, vquad, undefined);

        particle.width = tquad.w * this.size;
        particle.height = tquad.h * this.size;
    }

    private _resolvePieceFrameIndices(resourceId?: number): number[] {
        if (!resourceId) {
            return DEFAULT_PIECE_FRAME_INDICES.slice();
        }

        if (resourceId === ResourceId.IMG_OBJ_CANDY_PADDINGTON) {
            const indices: number[] = this._lookupFrameIndices(
                resourceId,
                PADDINGTON_BREAK_FRAME_NAMES
            );
            if (indices.length) {
                return indices;
            }
        }

        return DEFAULT_PIECE_FRAME_INDICES.slice();
    }

    private _lookupFrameIndices(resourceId: number, frameNames: string[]): number[] {
        const resource: ResEntry | undefined = RES_DATA[resourceId];
        const info = resource?.info;
        if (!info || !("frameIndexByName" in info)) {
            return [];
        }

        const frameIndexByName = info.frameIndexByName;
        if (!frameIndexByName) {
            return [];
        }

        return frameNames
            .map((name) => frameIndexByName[name])
            .filter((index): index is number => index !== undefined);
    }
}

export default CandyBreak;
