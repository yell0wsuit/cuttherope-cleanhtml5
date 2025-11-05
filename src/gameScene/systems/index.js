import PhysicsSystem from "./PhysicsSystem";
import CameraSystem from "./CameraSystem";
import BungeeSystem from "./BungeeSystem";
import CollectibleSystem from "./CollectibleSystem";
import HazardSystem from "./HazardSystem";
import TargetSystem from "./TargetSystem";
import SpecialSystem from "./SpecialSystem";
import InteractionSystem from "./InteractionSystem";

/** @typedef {import("./types").GameSystemContext} GameSystemContext */
/** @typedef {import("./types").GameSystem} GameSystem */

/**
 * Creates the default ordered list of core systems that drive the scene update loop.
 *
 * @param {GameSystemContext} context
 * @returns {GameSystem[]}
 */
export const createCoreSystems = (context) => [
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
