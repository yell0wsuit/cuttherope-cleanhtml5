import Vector from "@/core/Vector";
import resolution from "@/resolution";
import Radians from "@/utils/Radians";
import type Sock from "@/game/Sock";
import type { GameScene } from "@/types/game-scene";

function teleport(scene: GameScene): void {
    const targetSock = scene.targetSock;
    if (!targetSock) {
        return;
    }

    const sock: Sock = targetSock;
    const light = sock.light;

    if (light) {
        light.playTimeline(0);
        light.visible = true;
    }

    const offset = new Vector(0, resolution.SOCK_TELEPORT_Y);
    offset.rotate(Radians.fromDegrees(sock.rotation));

    scene.star.pos.x = sock.x;
    scene.star.pos.y = sock.y;
    scene.star.pos.add(offset);

    scene.star.prevPos.copyFrom(scene.star.pos);

    scene.star.v.x = 0;
    scene.star.v.y = -1;
    scene.star.v.rotate(Radians.fromDegrees(sock.rotation));
    scene.star.v.multiply(scene.savedSockSpeed);

    scene.star.posDelta.copyFrom(scene.star.v);
    scene.star.posDelta.divide(60);
    scene.star.prevPos.copyFrom(scene.star.pos);
    scene.star.prevPos.subtract(scene.star.posDelta);

    // If there's an active rocket attached to the candy, teleport it too
    if (scene.activeRocket && scene.activeRocket.attachedStar === scene.star) {
        const rocket = scene.activeRocket;
        rocket.point.pos.x = scene.star.pos.x;
        rocket.point.pos.y = scene.star.pos.y;
        rocket.point.prevPos.copyFrom(rocket.point.pos);

        // Set rocket rotation to match exit hat direction
        // Rocket needs +90° offset because thrust is perpendicular to visual orientation
        rocket.rotation = sock.rotation + 90;
        rocket.startRotation = sock.rotation + 90;
        rocket.startCandyRotation = scene.candyMain.rotation;
        rocket.additionalAngle = 0;
        rocket.updateRotation();
    }

    scene.targetSock = null;
}

class GameSceneTeleportDelegate {
    private readonly scene: GameScene;

    constructor(scene: GameScene) {
        this.scene = scene;
    }

    teleport(): void {
        teleport(this.scene);
    }
}

export default GameSceneTeleportDelegate;
