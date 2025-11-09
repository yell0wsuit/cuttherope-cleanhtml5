import { updateBungees as runUpdateBungees } from "../sceneUpdate/bungees";
import { updateCollectibles as runUpdateCollectibles } from "../sceneUpdate/collectibles";
import { updateHazards as runUpdateHazards } from "../sceneUpdate/hazards";
import { updateTargetState as runUpdateTargetState } from "../sceneUpdate/targetState";
import { updateSpecial as runUpdateSpecial } from "../sceneUpdate/special";
import * as GameSceneConstants from "../constants";

import type { GameScene } from "@/types/game-scene";
import type { CandyService, TargetUpdateResult } from "./types";

type CandySceneContext = ThisParameterType<typeof runUpdateBungees> &
    ThisParameterType<typeof runUpdateCollectibles> &
    ThisParameterType<typeof runUpdateHazards> &
    ThisParameterType<typeof runUpdateTargetState> &
    ThisParameterType<typeof runUpdateSpecial>;

class GameSceneCandyService implements CandyService {
    private readonly scene: CandySceneContext;

    constructor(scene: GameScene) {
        this.scene = scene as CandySceneContext;
    }

    updateBungees(delta: number): number {
        return runUpdateBungees.call(this.scene, delta);
    }

    updateCollectibles(delta: number): void {
        runUpdateCollectibles.call(this.scene, delta);
    }

    updateHazards(delta: number, numGrabs: number): boolean {
        return runUpdateHazards.call(this.scene, delta, numGrabs);
    }

    updateTargetState(delta: number): TargetUpdateResult {
        const shouldContinue = runUpdateTargetState.call(this.scene, delta);
        if (shouldContinue) {
            return { continue: true };
        }

        const won = this.scene.target.currentTimelineIndex === GameSceneConstants.CharAnimation.WIN;
        return { continue: false, reason: won ? "game_won" : "game_lost" };
    }

    updateSpecial(delta: number): void {
        runUpdateSpecial.call(this.scene, delta);
    }
}

export default GameSceneCandyService;
