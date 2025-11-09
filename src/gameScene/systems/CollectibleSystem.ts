import type {
    CollectibleSystemDependencies,
    GameSystem,
    GameSystemContext,
    GameSystemSharedState,
    SystemResult,
} from "./types";

const defaultDependencies: CollectibleSystemDependencies = {
    updateCollectibles(service, delta) {
        service.updateCollectibles(delta);
    },
};

class CollectibleSystem implements GameSystem {
    readonly id = "collectibles";

    private readonly context: GameSystemContext;
    private readonly dependencies: CollectibleSystemDependencies;

    constructor(
        context: GameSystemContext,
        dependencies: CollectibleSystemDependencies = defaultDependencies
    ) {
        this.context = context;
        this.dependencies = dependencies;
    }

    update(delta: number, _sharedState: GameSystemSharedState): SystemResult {
        this.dependencies.updateCollectibles(this.context.candy, delta);
        return { continue: true };
    }
}

export default CollectibleSystem;
