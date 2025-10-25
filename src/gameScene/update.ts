import { update } from "./sceneUpdate/main";
import { GameSceneDraw } from "./sceneUpdate/draw";
import { GameSceneBubbles } from "./sceneUpdate/bubbles";
import { GameSceneTeleport } from "./sceneUpdate/teleport";
import { GameSceneLifecycle } from "./sceneUpdate/lifecycle";
import { GameSceneRopeManagement } from "./sceneUpdate/ropeManagement";
import { GameScenePumpUtils } from "./sceneUpdate/pumpUtils";
import { GameSceneBounceUtils } from "./sceneUpdate/bounceUtils";
import { GameSceneCut } from "./sceneUpdate/cut";
import { GameSceneSpiderHandlers } from "./sceneUpdate/spiderHandlers";
import { GameSceneSelection } from "./sceneUpdate/selection";

export const GameSceneUpdate = {
    update,
    ...GameSceneDraw,
    ...GameSceneBubbles,
    ...GameSceneTeleport,
    ...GameSceneLifecycle,
    ...GameSceneRopeManagement,
    ...GameScenePumpUtils,
    ...GameSceneBounceUtils,
    ...GameSceneCut,
    ...GameSceneSpiderHandlers,
    ...GameSceneSelection,
};
