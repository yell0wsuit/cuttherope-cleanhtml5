import { updateCamera as runUpdateCamera } from "../sceneUpdate/camera";
import { updateClickToCut as runUpdateClickToCut } from "../sceneUpdate/clickToCut";

import type { GameScene } from "@/types/game-scene";
import type { AnimationService } from "./types";

type AnimationSceneContext = ThisParameterType<typeof runUpdateCamera> &
    ThisParameterType<typeof runUpdateClickToCut>;

class GameSceneAnimationService implements AnimationService {
    private readonly scene: AnimationSceneContext;

    constructor(scene: GameScene) {
        this.scene = scene as AnimationSceneContext;
    }

    updateCamera(delta: number): void {
        runUpdateCamera.call(this.scene, delta);
    }

    updateClickToCut(delta: number): void {
        runUpdateClickToCut.call(this.scene, delta);
    }
}

export default GameSceneAnimationService;
