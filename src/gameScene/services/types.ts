export interface PhysicsService {
    updateBasics(delta: number): void;
}

export type TargetUpdateResult =
    | { continue: true }
    | { continue: false; reason: "game_won" | "game_lost" };

export interface CandyService {
    updateBungees(delta: number): number;
    updateCollectibles(delta: number): void;
    updateHazards(delta: number, numGrabs: number): boolean;
    updateTargetState(delta: number): TargetUpdateResult;
    updateSpecial(delta: number): void;
}

export interface AnimationService {
    updateCamera(delta: number): void;
    updateClickToCut(delta: number): void;
}
