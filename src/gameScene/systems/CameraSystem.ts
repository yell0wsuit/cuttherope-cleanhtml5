import type {
    CameraSystemDependencies,
    GameSystem,
    GameSystemContext,
    GameSystemSharedState,
    SystemResult,
} from "./types";

const defaultDependencies: CameraSystemDependencies = {
    updateCamera(service, delta) {
        service.updateCamera(delta);
    },
};

class CameraSystem implements GameSystem {
    readonly id = "camera";

    private readonly context: GameSystemContext;
    private readonly dependencies: CameraSystemDependencies;

    constructor(
        context: GameSystemContext,
        dependencies: CameraSystemDependencies = defaultDependencies
    ) {
        this.context = context;
        this.dependencies = dependencies;
    }

    update(delta: number, _sharedState: GameSystemSharedState): SystemResult {
        this.dependencies.updateCamera(this.context.animation, delta);
        return { continue: true };
    }
}

export default CameraSystem;
