import Drawing from "@/game/Drawing";
import MapItem from "@/utils/MapItem";
import edition from "@/config/editions/net-edition";
import type GameSceneLoaders from "../loaders";
import type { HiddenItem } from "../MapLayerItem";

export function loadHidden(this: GameSceneLoaders, item: HiddenItem): void {
    // get the hidden image index
    const v = item.name - MapItem.HIDDEN_01.id;
    const drawingId = item.drawing - 1;

    const alreadyUnlocked = false;
    if (!alreadyUnlocked && !edition.disableHiddenDrawings) {
        const s = new Drawing(v, drawingId);
        s.x = item.x * this.PM + this.PMX;
        s.y = item.y * this.PM + this.PMY;
        s.rotation = item.angle || 0;
        this.drawings.push(s);
    }
}
