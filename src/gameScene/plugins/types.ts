import type { GameSystem, GameSystemContext, GameSystemSharedState } from "../systems/types";

export interface GameObjectPlugin {
    createSystems?(context: GameSystemContext): GameSystem[] | void;
    onBeforeSystems?(
        context: GameSystemContext,
        delta: number,
        sharedState: GameSystemSharedState
    ): void;
    onAfterSystem?(
        context: GameSystemContext,
        system: GameSystem,
        continueProcessing: boolean,
        delta: number,
        sharedState: GameSystemSharedState
    ): void;
    onAfterSystems?(
        context: GameSystemContext,
        delta: number,
        sharedState: GameSystemSharedState
    ): void;
}
