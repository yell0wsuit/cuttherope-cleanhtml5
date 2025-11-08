import type { GameSystem, GameSystemContext, GameSystemSharedState } from "../systems/types";
import type { GameObjectPlugin } from "./types";

class GameObjectPluginManager {
    private readonly context: GameSystemContext;
    private readonly plugins: GameObjectPlugin[];

    constructor(context: GameSystemContext) {
        this.context = context;
        this.plugins = [];
    }

    register(plugin: GameObjectPlugin): GameSystem[] {
        this.plugins.push(plugin);
        const systems = plugin.createSystems?.(this.context);
        return Array.isArray(systems) ? systems : [];
    }

    beforeUpdate(delta: number, sharedState: GameSystemSharedState): void {
        for (const plugin of this.plugins) {
            plugin.onBeforeSystems?.(this.context, delta, sharedState);
        }
    }

    afterSystem(
        system: GameSystem,
        continueProcessing: boolean,
        delta: number,
        sharedState: GameSystemSharedState
    ): void {
        for (const plugin of this.plugins) {
            plugin.onAfterSystem?.(this.context, system, continueProcessing, delta, sharedState);
        }
    }

    afterUpdate(delta: number, sharedState: GameSystemSharedState): void {
        for (const plugin of this.plugins) {
            plugin.onAfterSystems?.(this.context, delta, sharedState);
        }
    }
}

export default GameObjectPluginManager;
