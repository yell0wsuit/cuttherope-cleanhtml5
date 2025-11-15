import Rocket, { ROCKET_FRAMES, ROCKET_DEFAULT_SCALE } from "@/game/Rocket";
import ResourceId from "@/resources/ResourceId";
import Alignment from "@/core/Alignment";
import ImageElement from "@/visual/ImageElement";
import type GameSceneLoaders from "../loaders";
import type { RocketItem } from "../MapLayerItem";

export function loadRocket(this: GameSceneLoaders, item: RocketItem): void {
    const rocket = new Rocket();
    rocket.initTextureWithId(ResourceId.IMG_OBJ_ROCKET);

    // For rotatable rockets, use ROCKET frame for the flying part
    // For fixed rockets, use ROCKET frame as well
    rocket.setTextureQuad(ROCKET_FRAMES.ROCKET);
    rocket.doRestoreCutTransparency();

    rocket.x = item.x * this.PM + this.PMX;
    rocket.y = item.y * this.PM + this.PMY;
    rocket.anchor = Alignment.CENTER;
    rocket.scaleX = rocket.scaleY = ROCKET_DEFAULT_SCALE;

    // Initialize the physics point position
    rocket.point.pos.x = rocket.x;
    rocket.point.pos.y = rocket.y;
    rocket.point.prevPos.x = rocket.x;
    rocket.point.prevPos.y = rocket.y;

    // Set rocket properties from item data
    rocket.impulse = item.impulse ?? 120;
    rocket.time = item.time ?? -1;
    rocket.isRotatable = item.isRotatable ?? false;
    rocket.impulseFactor = item.impulseFactor ?? 0.6;

    // For rotatable rockets, create a separate launcher base that stays in place
    if (item.isRotatable) {
        const launcher = new ImageElement();
        launcher.initTextureWithId(ResourceId.IMG_OBJ_ROCKET);
        launcher.setTextureQuad(ROCKET_FRAMES.LAUNCHER);
        launcher.doRestoreCutTransparency();
        launcher.x = rocket.x;
        launcher.y = rocket.y;
        launcher.anchor = Alignment.CENTER;
        launcher.scaleX = launcher.scaleY = ROCKET_DEFAULT_SCALE;
        rocket.launcher = launcher;
    }

    // Set rotation from angle
    if (item.angle !== undefined) {
        rocket.rotation = item.angle;
        rocket.angle = (item.angle * Math.PI) / 180;
        rocket.startRotation = item.angle;
    }

    // Initialize bounding box and setup
    rocket.setBoundingBoxFromFrame();
    rocket.finalizeSetup();

    // Sync container position and rotation
    rocket.container.x = rocket.x;
    rocket.container.y = rocket.y;
    rocket.container.rotation = rocket.rotation;

    // Update rotation to sync internal vectors
    rocket.updateRotation();

    // Ensure visibility
    rocket.visible = true;
    rocket.container.visible = true;

    this.rockets.push(rocket);
}
