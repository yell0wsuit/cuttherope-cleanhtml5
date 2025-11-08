import type {
    GameSystem,
    GameSystemContext,
    GameSystemSharedState,
    HazardSystemDependencies,
    SystemResult,
} from "./types";

const defaultDependencies: HazardSystemDependencies = {
    updateHazards(service, delta, numGrabs) {
        return service.updateHazards(delta, numGrabs);
    },
};

class HazardSystem implements GameSystem {
    readonly id = "hazards";

    private readonly context: GameSystemContext;
    private readonly dependencies: HazardSystemDependencies;

    constructor(
        context: GameSystemContext,
        dependencies: HazardSystemDependencies = defaultDependencies
    ) {
        this.context = context;
        this.dependencies = dependencies;
    }

    update(delta: number, sharedState: GameSystemSharedState): SystemResult {
        const numGrabs = sharedState.numGrabs ?? 0;
        const shouldContinue = this.dependencies.updateHazards(this.context.candy, delta, numGrabs);

        return shouldContinue ? { continue: true } : { continue: false, reason: "game_lost" };
    }
}

export default HazardSystem;
