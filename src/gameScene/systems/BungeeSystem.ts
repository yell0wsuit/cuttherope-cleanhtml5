import type {
    BungeeSystemDependencies,
    GameSystem,
    GameSystemContext,
    GameSystemSharedState,
    SystemResult,
} from "./types";

const defaultDependencies: BungeeSystemDependencies = {
    updateBungees(service, delta) {
        return service.updateBungees(delta);
    },
};

class BungeeSystem implements GameSystem {
    readonly id = "bungees";

    private readonly context: GameSystemContext;
    private readonly dependencies: BungeeSystemDependencies;

    constructor(
        context: GameSystemContext,
        dependencies: BungeeSystemDependencies = defaultDependencies
    ) {
        this.context = context;
        this.dependencies = dependencies;
    }

    update(delta: number, sharedState: GameSystemSharedState): SystemResult {
        const numGrabs = this.dependencies.updateBungees(this.context.candy, delta);
        sharedState.numGrabs = numGrabs;
        return { continue: true };
    }
}

export default BungeeSystem;
