import GameObject from "@/visual/GameObject";
import ResourceId from "@/resources/ResourceId";
import Alignment from "@/core/Alignment";
import Rectangle from "@/core/Rectangle";
import resolution from "@/resolution";
import * as GameSceneConstants from "@/gameScene/constants";
import type GameSceneLoaders from "../loaders";
import type { CandyItem } from "../MapLayerItem";

export function loadCandyL(this: GameSceneLoaders, item: CandyItem): void {
    this.starL.pos.x = item.x * this.PM + this.PMX;
    this.starL.pos.y = item.y * this.PM + this.PMY;

    this.candyL = new GameObject();
    this.candyL.initTextureWithId(ResourceId.IMG_OBJ_CANDY_01);
    this.candyL.setTextureQuad(GameSceneConstants.IMG_OBJ_CANDY_01_part_1);
    this.candyL.scaleX = this.candyL.scaleY = 0.71;
    this.candyL.passTransformationsToChilds = false;
    this.candyL.doRestoreCutTransparency();
    this.candyL.anchor = Alignment.CENTER;
    this.candyL.x = this.starL.pos.x;
    this.candyL.y = this.starL.pos.y;
    this.candyL.bb = Rectangle.copy(resolution.CANDY_LR_BB);
}

export function loadCandyR(this: GameSceneLoaders, item: CandyItem): void {
    this.starR.pos.x = item.x * this.PM + this.PMX;
    this.starR.pos.y = item.y * this.PM + this.PMY;

    this.candyR = new GameObject();
    this.candyR.initTextureWithId(ResourceId.IMG_OBJ_CANDY_01);
    this.candyR.setTextureQuad(GameSceneConstants.IMG_OBJ_CANDY_01_part_2);
    this.candyR.scaleX = this.candyR.scaleY = 0.71;
    this.candyR.passTransformationsToChilds = false;
    this.candyR.doRestoreCutTransparency();
    this.candyR.anchor = Alignment.CENTER;
    this.candyR.x = this.starR.pos.x;
    this.candyR.y = this.starR.pos.y;
    this.candyR.bb = Rectangle.copy(resolution.CANDY_LR_BB);
}

export function loadCandy(this: GameSceneLoaders, item: CandyItem): void {
    this.star.pos.x = item.x * this.PM + this.PMX;
    this.star.pos.y = item.y * this.PM + this.PMY;
}
