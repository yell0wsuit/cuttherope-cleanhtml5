import Bubble from "@/game/Bubble";
import ImageElement from "@/visual/ImageElement";
import ResourceId from "@/resources/ResourceId";
import Rectangle from "@/core/Rectangle";
import resolution from "@/resolution";
import Alignment from "@/core/Alignment";
import MathHelper from "@/utils/MathHelper";
import * as GameSceneConstants from "@/gameScene/constants";
import type GameSceneLoaders from "../loaders";
import type { BubbleItem } from "../MapLayerItem";

export function loadBubble(this: GameSceneLoaders, item: BubbleItem): void {
    const at = MathHelper.randomRange(
        GameSceneConstants.IMG_OBJ_BUBBLE_ATTACHED_stain_01,
        GameSceneConstants.IMG_OBJ_BUBBLE_ATTACHED_stain_03
    );
    const s = new Bubble();
    s.initTextureWithId(ResourceId.IMG_OBJ_BUBBLE_ATTACHED);
    s.setTextureQuad(at);
    s.doRestoreCutTransparency();

    s.bb = Rectangle.copy(resolution.BUBBLE_BB);
    s.x = item.x * this.PM + this.PMX;
    s.y = item.y * this.PM + this.PMY;
    s.anchor = Alignment.CENTER;
    s.popped = false;

    const bubble = new ImageElement();
    bubble.initTextureWithId(ResourceId.IMG_OBJ_BUBBLE_ATTACHED);
    bubble.setTextureQuad(GameSceneConstants.IMG_OBJ_BUBBLE_ATTACHED_bubble);
    bubble.doRestoreCutTransparency();
    bubble.parentAnchor = bubble.anchor = Alignment.CENTER;
    s.addChild(bubble);
    this.bubbles.push(s);
}
