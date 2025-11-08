import type {
    GameSystem,
    GameSystemContext,
    GameSystemSharedState,
    SpecialSystemDependencies,
    SystemResult,
} from "./types";

const defaultDependencies: SpecialSystemDependencies = {
    updateSpecial(service, delta) {
        service.updateSpecial(delta);
    },
};

class SpecialSystem implements GameSystem {
    readonly id = "special";

    private readonly context: GameSystemContext;
    private readonly dependencies: SpecialSystemDependencies;

    constructor(
        context: GameSystemContext,
        dependencies: SpecialSystemDependencies = defaultDependencies
    ) {
        this.context = context;
        this.dependencies = dependencies;
    }

    update(delta: number, _sharedState: GameSystemSharedState): SystemResult {
        this.dependencies.updateSpecial(this.context.candy, delta);
        return { continue: true };
    }
}

export default SpecialSystem;
