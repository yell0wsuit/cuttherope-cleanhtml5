import type GameObjectPluginManager from "../plugins/GameObjectPluginManager";
import type {
    AnimationService,
    CandyService,
    PhysicsService,
    TargetUpdateResult,
} from "../services/types";

export interface GameSystemContext {
    physics: PhysicsService;
    candy: CandyService;
    animation: AnimationService;
    pluginManager: GameObjectPluginManager;
}

export interface GameSystemSharedState {
    numGrabs?: number;
}

export type SystemResult =
    | { continue: true }
    | { continue: false; reason: "game_won" | "game_lost" };

export interface GameSystem {
    id: string;
    update(delta: number, sharedState: GameSystemSharedState): SystemResult;
}

export interface PhysicsSystemDependencies {
    updateBasics(service: PhysicsService, delta: number): void;
}

export interface CameraSystemDependencies {
    updateCamera(service: AnimationService, delta: number): void;
}

export interface BungeeSystemDependencies {
    updateBungees(service: CandyService, delta: number): number;
}

export interface CollectibleSystemDependencies {
    updateCollectibles(service: CandyService, delta: number): void;
}

export interface HazardSystemDependencies {
    updateHazards(service: CandyService, delta: number, numGrabs: number): boolean;
}

export interface TargetSystemDependencies {
    updateTargetState(service: CandyService, delta: number): TargetUpdateResult;
}

export interface SpecialSystemDependencies {
    updateSpecial(service: CandyService, delta: number): void;
}

export interface InteractionSystemDependencies {
    updateClickToCut(service: AnimationService, delta: number): void;
}
