import type {
    GameSystem,
    GameSystemContext,
    GameSystemSharedState,
    PhysicsSystemDependencies,
    SystemResult,
} from "./types";

const defaultDependencies: PhysicsSystemDependencies = {
    updateBasics(service, delta) {
        service.updateBasics(delta);
    },
};

class PhysicsSystem implements GameSystem {
    readonly id = "physics";

    private readonly context: GameSystemContext;
    private readonly dependencies: PhysicsSystemDependencies;

    constructor(
        context: GameSystemContext,
        dependencies: PhysicsSystemDependencies = defaultDependencies
    ) {
        this.context = context;
        this.dependencies = dependencies;
    }

    update(delta: number, _sharedState: GameSystemSharedState): SystemResult {
        this.dependencies.updateBasics(this.context.physics, delta);
        return { continue: true };
    }
}

export default PhysicsSystem;
