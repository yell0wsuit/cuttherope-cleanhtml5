import Rectangle from "@/core/Rectangle";
import ResourceId from "@/resources/ResourceId";
import ResourceMgr from "@/resources/ResourceMgr";
import MathHelper from "@/utils/MathHelper";
import PumpDirt from "@/game/PumpDirt";
import Radians from "@/utils/Radians";
import SoundMgr from "@/game/CTRSoundMgr";
import Vector from "@/core/Vector";
import resolution from "@/resolution";
import * as GameSceneConstants from "@/gameScene/constants";

/**
 * @typedef {import("@/types/game-scene").GameScene} GameScene
 * @typedef {import("@/visual/BaseElement").default} BaseElement
 * @typedef {import("@/physics/MaterialPoint").default} MaterialPoint
 * @typedef {import("@/game/CTRGameObject").default} GameObject
 */

/**
 * @param {GameScene} scene
 * @param {BaseElement} p
 * @param {MaterialPoint} s
 * @param {GameObject} c
 * @param {number} delta
 */
function handlePumpFlow(scene, p, s, c, delta) {
    const powerRadius = resolution.PUMP_POWER_RADIUS;
    if (
        c.rectInObject(
            p.x - powerRadius,
            p.y - powerRadius,
            p.x + powerRadius,
            p.y + powerRadius
        )
    ) {
        const tn1 = new Vector(0, 0);
        const tn2 = new Vector(0, 0);
        const h = new Vector(c.x, c.y);

        tn1.x = p.x - p.bb.w / 2.0;
        tn2.x = p.x + p.bb.w / 2.0;
        tn1.y = tn2.y = p.y;

        if (p.angle != 0) {
            h.rotateAround(-p.angle, p.x, p.y);
        }

        if (
            h.y < tn1.y &&
            Rectangle.rectInRect(
                h.x - c.bb.w / 2.0,
                h.y - c.bb.h / 2.0,
                h.x + c.bb.w / 2.0,
                h.y + c.bb.h / 2.0,
                tn1.x,
                tn1.y - powerRadius,
                tn2.x,
                tn2.y
            )
        ) {
            const maxPower = powerRadius * 2.0;
            const power = (maxPower * (powerRadius - (tn1.y - h.y))) / powerRadius;
            const pumpForce = new Vector(0, -power);

            pumpForce.rotate(p.angle);
            s.applyImpulse(pumpForce, delta);
        }
    }
}

/**
 * @param {GameScene} scene
 * @param {BaseElement} pump
 * @param {number} delta
 */
function operatePump(scene, pump, delta) {
    pump.playTimeline(0);
    const soundId = MathHelper.randomRange(ResourceId.SND_PUMP_1, ResourceId.SND_PUMP_4);
    SoundMgr.playSound(soundId);

    const dirtTexture = ResourceMgr.getTexture(ResourceId.IMG_OBJ_PUMP);
    const dirt = new PumpDirt(5, dirtTexture, Radians.toDegrees(pump.angle) - 90);
    dirt.onFinished = scene.aniPool.particlesFinishedDelegate();

    const v = new Vector(pump.x + resolution.PUMP_DIRT_OFFSET, pump.y);
    v.rotateAround(pump.angle - Math.PI / 2, pump.x, pump.y);
    dirt.x = v.x;
    dirt.y = v.y;

    dirt.startSystem(5);
    scene.aniPool.addChild(dirt);

    if (!scene.noCandy) {
        scene.handlePumpFlow(pump, scene.star, scene.candy, delta);
    }

    if (scene.twoParts !== GameSceneConstants.PartsType.NONE) {
        if (!scene.noCandyL) {
            scene.handlePumpFlow(pump, scene.starL, scene.candyL, delta);
        }

        if (!scene.noCandyR) {
            scene.handlePumpFlow(pump, scene.starR, scene.candyR, delta);
        }
    }
}

class GameScenePumpUtilsDelegate {
    /**
     * @param {GameScene} scene
     */
    constructor(scene) {
        /** @type {GameScene} */
        this.scene = scene;
    }

    /**
     * @param {BaseElement} pump
     * @param {MaterialPoint} star
     * @param {GameObject} candy
     * @param {number} delta
     */
    handlePumpFlow(pump, star, candy, delta) {
        return handlePumpFlow(this.scene, pump, star, candy, delta);
    }

    /**
     * @param {BaseElement} pump
     * @param {number} delta
     */
    operatePump(pump, delta) {
        return operatePump(this.scene, pump, delta);
    }
}

export default GameScenePumpUtilsDelegate;
