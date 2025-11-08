import Rectangle from "@/core/Rectangle";
import Vector from "@/core/Vector";
import Constants from "@/utils/Constants";
import resolution from "@/resolution";
import type { GameScene } from "@/types/game-scene";

type SceneGrab = GameScene["bungees"][number];

type SceneBungee = NonNullable<SceneGrab["rope"]>;

function resetBungeeHighlight(scene: GameScene): void {
    for (const grab of scene.bungees) {
        const rope = grab.rope;
        if (!rope || rope.cut !== Constants.UNDEFINED) {
            continue;
        }
        rope.highlighted = false;
    }
}

function getNearestBungeeGrabByBezierPoints(
    scene: GameScene,
    s: Vector,
    tx: number,
    ty: number
): SceneGrab | null {
    const searchRadius = resolution.CLICK_TO_CUT_SEARCH_RADIUS;
    let nearestGrab: SceneGrab | null = null;
    let minDistance = searchRadius;
    const targetVector = new Vector(tx, ty);

    for (const grab of scene.bungees) {
        const rope = grab.rope;

        if (!rope) {
            continue;
        }

        for (const drawPoint of rope.drawPts) {
            const distance = drawPoint.distance(targetVector);
            if (distance < searchRadius && distance < minDistance) {
                minDistance = distance;
                nearestGrab = grab;
                s.copyFrom(drawPoint);
            }
        }
    }

    return nearestGrab;
}

function getNearestBungeeSegmentByConstraints(
    _scene: GameScene,
    s: Vector,
    grab: SceneGrab
): SceneBungee | null {
    const searchRadius = Number.MAX_VALUE;
    let nearestBungee: SceneBungee | null = null;
    let minDistance = searchRadius;
    const original = s.copy();
    const rope = grab.rope;

    if (!rope || rope.cut !== Constants.UNDEFINED) {
        return null;
    }

    const grabWheelRadius = resolution.GRAB_WHEEL_RADIUS;
    const grabWheelDiameter = grabWheelRadius * 2;
    const parts = rope.parts;

    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!part) {
            continue;
        }

        const distance = part.pos.distance(original);
        if (distance >= minDistance) {
            continue;
        }

        const withinWheel =
            !grab.wheel ||
            Rectangle.pointInRect(
                part.pos.x,
                part.pos.y,
                grab.x - grabWheelRadius,
                grab.y - grabWheelRadius,
                grabWheelDiameter,
                grabWheelDiameter
            );

        if (!withinWheel) {
            continue;
        }

        minDistance = distance;
        nearestBungee = rope;
        s.copyFrom(part.pos);
    }

    return nearestBungee;
}

class GameSceneSelectionDelegate {
    private readonly scene: GameScene;

    constructor(scene: GameScene) {
        this.scene = scene;
    }

    resetBungeeHighlight(): void {
        resetBungeeHighlight(this.scene);
    }

    getNearestBungeeGrabByBezierPoints(s: Vector, tx: number, ty: number): SceneGrab | null {
        return getNearestBungeeGrabByBezierPoints(this.scene, s, tx, ty);
    }

    getNearestBungeeSegmentByConstraints(s: Vector, grab: SceneGrab): SceneBungee | null {
        return getNearestBungeeSegmentByConstraints(this.scene, s, grab);
    }
}

export default GameSceneSelectionDelegate;
