import { updateBasics as runUpdateBasics } from "../sceneUpdate/basics";

import type { GameScene } from "@/types/game-scene";
import type { PhysicsService } from "./types";

type PhysicsSceneContext = ThisParameterType<typeof runUpdateBasics>;

class GameScenePhysicsService implements PhysicsService {
    private readonly scene: PhysicsSceneContext;

    constructor(scene: GameScene) {
        this.scene = scene as PhysicsSceneContext;
    }

    updateBasics(delta: number): void {
        runUpdateBasics.call(this.scene, delta);
    }
}

export default GameScenePhysicsService;
