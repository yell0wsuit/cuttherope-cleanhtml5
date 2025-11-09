import * as GameSceneConstants from "@/gameScene/constants";
import type GameSceneInit from "../init";

export function resetHudStars(this: GameSceneInit): void {
    for (let i = 0; i < GameSceneConstants.HUD_STARS_COUNT; i++) {
        const hs = this.hudStars[i];
        if (!hs) {
            continue;
        }
        if (hs.currentTimeline) {
            hs.currentTimeline.stop();
        }
        hs.setTextureQuad(GameSceneConstants.IMG_HUD_STAR_Frame_1);
    }
}
