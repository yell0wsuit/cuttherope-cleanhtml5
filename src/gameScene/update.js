import { update } from "./sceneUpdate/main";
import GameSceneDraw from "./sceneUpdate/draw";
import GameSceneBubbles from "./sceneUpdate/bubbles";
import GameSceneTeleport from "./sceneUpdate/teleport";
import GameSceneLifecycle from "./sceneUpdate/lifecycle";
import GameSceneRopeManagement from "./sceneUpdate/ropeManagement";
import GameScenePumpUtils from "./sceneUpdate/pumpUtils";
import GameSceneBounceUtils from "./sceneUpdate/bounceUtils";
import GameSceneCut from "./sceneUpdate/cut";
import GameSceneSpiderHandlers from "./sceneUpdate/spiderHandlers";
import GameSceneSelection from "./sceneUpdate/selection";

class GameSceneUpdate {
    constructor(scene) {
        scene.registerDelegate("draw", new GameSceneDraw(scene));
        scene.registerDelegate("bubbles", new GameSceneBubbles(scene));
        scene.registerDelegate("teleport", new GameSceneTeleport(scene));
        scene.registerDelegate("lifecycle", new GameSceneLifecycle(scene));
        scene.registerDelegate("ropeManagement", new GameSceneRopeManagement(scene));
        scene.registerDelegate("pumpUtils", new GameScenePumpUtils(scene));
        scene.registerDelegate("bounceUtils", new GameSceneBounceUtils(scene));
        scene.registerDelegate("cutHandlers", new GameSceneCut(scene));
        scene.registerDelegate("spiderHandlers", new GameSceneSpiderHandlers(scene));
        scene.registerDelegate("selectionHandlers", new GameSceneSelection(scene));
    }

    /**
     * @param {number} delta
     */
    update(delta) {
        update.call(this, delta);
    }
}

export default GameSceneUpdate;
