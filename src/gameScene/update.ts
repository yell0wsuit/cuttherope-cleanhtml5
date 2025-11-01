import { update } from "./sceneUpdate/main";
import GameSceneDrawDelegate from "./sceneUpdate/draw";
import GameSceneBubblesDelegate from "./sceneUpdate/bubbles";
import GameSceneTeleportDelegate from "./sceneUpdate/teleport";
import GameSceneLifecycleDelegate from "./sceneUpdate/lifecycle";
import GameSceneRopeManagementDelegate from "./sceneUpdate/ropeManagement";
import GameScenePumpUtilsDelegate from "./sceneUpdate/pumpUtils";
import GameSceneBounceUtilsDelegate from "./sceneUpdate/bounceUtils";
import GameSceneCutDelegate from "./sceneUpdate/cut";
import GameSceneSpiderHandlersDelegate from "./sceneUpdate/spiderHandlers";
import GameSceneSelectionDelegate from "./sceneUpdate/selection";
import GameSceneCharacter from "./character";

/**
 * @template {Record<string, (...args: any[]) => any>} T
 * @param {GameSceneUpdate} scene
 * @param {T} delegate
 * @param {(keyof T & string)[]} methods
 */
const bindDelegate = <T>(scene: GameSceneUpdate, delegate: T, methods: (keyof T & string)[]) => {
    for (const method of methods) {
        scene[method] = /** @type {any} */ delegate[method].bind(delegate);
    }
};

class GameSceneUpdate extends GameSceneCharacter {
    drawDelegate: GameSceneDrawDelegate;
    bubblesDelegate: GameSceneBubblesDelegate;
    teleportDelegate: GameSceneTeleportDelegate;
    lifecycleDelegate: GameSceneLifecycleDelegate;
    ropeManagementDelegate: GameSceneRopeManagementDelegate;
    pumpUtilsDelegate: GameScenePumpUtilsDelegate;
    bounceUtilsDelegate: GameSceneBounceUtilsDelegate;
    cutDelegate: GameSceneCutDelegate;
    spiderHandlersDelegate: GameSceneSpiderHandlersDelegate;
    selectionDelegate: GameSceneSelectionDelegate;

    constructor() {
        super();

        this.drawDelegate = new GameSceneDrawDelegate(this);
        bindDelegate(this, this.drawDelegate, ["draw"]);

        this.bubblesDelegate = new GameSceneBubblesDelegate(this);
        bindDelegate(this, this.bubblesDelegate, [
            "isBubbleCapture",
            "popCandyBubble",
            "popBubble",
            "handleBubbleTouch",
        ]);

        this.teleportDelegate = new GameSceneTeleportDelegate(this);
        bindDelegate(this, this.teleportDelegate, ["teleport"]);

        this.lifecycleDelegate = new GameSceneLifecycleDelegate(this);
        bindDelegate(this, this.lifecycleDelegate, [
            "animateLevelRestart",
            "isFadingIn",
            "calculateScore",
            "gameWon",
            "gameLost",
        ]);

        this.ropeManagementDelegate = new GameSceneRopeManagementDelegate(this);
        bindDelegate(this, this.ropeManagementDelegate, [
            "releaseAllRopes",
            "attachCandy",
            "detachCandy",
        ]);

        this.pumpUtilsDelegate = new GameScenePumpUtilsDelegate(this);
        bindDelegate(this, this.pumpUtilsDelegate, ["handlePumpFlow", "operatePump"]);

        this.bounceUtilsDelegate = new GameSceneBounceUtilsDelegate(this);
        bindDelegate(this, this.bounceUtilsDelegate, ["handleBounce"]);

        this.cutDelegate = new GameSceneCutDelegate(this);
        bindDelegate(this, this.cutDelegate, ["cut"]);

        this.spiderHandlersDelegate = new GameSceneSpiderHandlersDelegate(this);
        bindDelegate(this, this.spiderHandlersDelegate, ["spiderBusted", "spiderWon"]);

        this.selectionDelegate = new GameSceneSelectionDelegate(this);
        bindDelegate(this, this.selectionDelegate, [
            "resetBungeeHighlight",
            "getNearestBungeeGrabByBezierPoints",
            "getNearestBungeeSegmentByConstraints",
        ]);
    }

    /**
     * @param {number} delta
     */
    override update(delta: number) {
        update.call(this, delta);
    }
}

export default GameSceneUpdate;
