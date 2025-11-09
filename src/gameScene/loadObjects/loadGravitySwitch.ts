import GravityButton from "@/game/GravityButton";
import Alignment from "@/core/Alignment";
import type GameSceneLoaders from "../loaders";
import type { GravitySwitchItem } from "../MapLayerItem";

export function loadGravitySwitch(this: GameSceneLoaders, item: GravitySwitchItem): void {
    this.gravityButton = new GravityButton();
    this.gravityButton.onButtonPressed = this.onButtonPressed.bind(this);
    this.gravityButton.visible = false;
    this.gravityButton.touchable = false;
    this.addChild(this.gravityButton);
    this.gravityButton.x = item.x * this.PM + this.PMX;
    this.gravityButton.y = item.y * this.PM + this.PMY;
    this.gravityButton.anchor = Alignment.CENTER;
}
