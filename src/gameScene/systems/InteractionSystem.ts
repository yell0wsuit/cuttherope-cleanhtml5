import type {
    GameSystem,
    GameSystemContext,
    GameSystemSharedState,
    InteractionSystemDependencies,
    SystemResult,
} from "./types";

const defaultDependencies: InteractionSystemDependencies = {
    updateClickToCut(service, delta) {
        service.updateClickToCut(delta);
    },
};

class InteractionSystem implements GameSystem {
    readonly id = "interaction";

    private readonly context: GameSystemContext;
    private readonly dependencies: InteractionSystemDependencies;

    constructor(
        context: GameSystemContext,
        dependencies: InteractionSystemDependencies = defaultDependencies
    ) {
        this.context = context;
        this.dependencies = dependencies;
    }

    update(delta: number, _sharedState: GameSystemSharedState): SystemResult {
        this.dependencies.updateClickToCut(this.context.animation, delta);
        return { continue: true };
    }
}

export default InteractionSystem;
