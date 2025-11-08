import PhysicsSystem from "./PhysicsSystem";
import CameraSystem from "./CameraSystem";
import BungeeSystem from "./BungeeSystem";
import CollectibleSystem from "./CollectibleSystem";
import HazardSystem from "./HazardSystem";
import TargetSystem from "./TargetSystem";
import SpecialSystem from "./SpecialSystem";
import InteractionSystem from "./InteractionSystem";

import type { GameSystem, GameSystemContext } from "./types";

export const createCoreSystems = (context: GameSystemContext): GameSystem[] => [
    new PhysicsSystem(context),
    new CameraSystem(context),
    new BungeeSystem(context),
    new CollectibleSystem(context),
    new HazardSystem(context),
    new TargetSystem(context),
    new SpecialSystem(context),
    new InteractionSystem(context),
];

export {
    PhysicsSystem,
    CameraSystem,
    BungeeSystem,
    CollectibleSystem,
    HazardSystem,
    TargetSystem,
    SpecialSystem,
    InteractionSystem,
};
