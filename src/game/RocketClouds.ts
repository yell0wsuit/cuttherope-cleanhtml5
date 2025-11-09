import RocketSparks from "@/game/RocketSparks";
import type Texture2D from "@/core/Texture2D";

class RocketClouds extends RocketSparks {
    constructor(totalParticles: number, texture: Texture2D, sparkFrames: number[] | null = null) {
        super(totalParticles, texture, sparkFrames);

        this.angleVar = 15;
        this.speed = 50;
        this.speedVar = 10;
        this.radialAccel = 0;
        this.radialAccelVar = 0;
        this.tangentialAccel = 0;
        this.tangentialAccelVar = 0;
        this.posVar.x = 10;
        this.posVar.y = 10;
        this.life = 0.4;
        this.lifeVar = 0.1;
        this.size = 0.8;
        this.sizeVar = 0;
        this.emissionRate = 20;
        this.startColor.r = 1;
        this.startColor.g = 1;
        this.startColor.b = 1;
        this.startColor.a = 1;
        this.endColor.r = 0;
        this.endColor.g = 0;
        this.endColor.b = 0;
        this.endColor.a = 0;
        this.blendAdditive = true;
    }
}

export default RocketClouds;
