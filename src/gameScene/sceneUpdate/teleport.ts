import Vector from "@/core/Vector";
import resolution from "@/resolution";
import Radians from "@/utils/Radians";

/**
 * @typedef {import("@/types/game-scene").GameScene} GameScene
 * @typedef {import("@/game/Sock").default} Sock
 */

/**
 * @param {GameScene} scene
 */
function teleport(scene) {
    if (!scene.targetSock) {
        return;
    }

    const sock = /** @type {Sock} */ (scene.targetSock);

    sock.light.playTimeline(0);
    sock.light.visible = true;

    const off = new Vector(0, resolution.SOCK_TELEPORT_Y);
    off.rotate(Radians.fromDegrees(sock.rotation));

    scene.star.pos.x = sock.x;
    scene.star.pos.y = sock.y;
    scene.star.pos.add(off);

    scene.star.prevPos.copyFrom(scene.star.pos);

    scene.star.v.x = 0;
    scene.star.v.y = -1;
    scene.star.v.rotate(Radians.fromDegrees(sock.rotation));
    scene.star.v.multiply(scene.savedSockSpeed);

    scene.star.posDelta.copyFrom(scene.star.v);
    scene.star.posDelta.divide(60);
    scene.star.prevPos.copyFrom(scene.star.pos);
    scene.star.prevPos.subtract(scene.star.posDelta);
    /**
     * @type {Sock | null}
     */
    scene.targetSock = null;

    //Achievements.increment(AchievementId.MAGICIAN);
}

class GameSceneTeleportDelegate {
    /**
     * @param {GameScene} scene
     */
    constructor(scene) {
        /** @type {GameScene} */
        this.scene = scene;
    }

    teleport() {
        return teleport(this.scene);
    }
}

export default GameSceneTeleportDelegate;
