import Bouncer from "@/game/Bouncer";
import type GameSceneLoaders from "../loaders";
import type { BouncerItem } from "../MapLayerItem";

export function loadBouncer(this: GameSceneLoaders, item: BouncerItem): void {
    const px = item.x * this.PM + this.PMX;
    const py = item.y * this.PM + this.PMY;
    const w = item.size;
    const a = item.angle;
    const bouncer = new Bouncer(px, py, w, a);
    bouncer.parseMover(item as Parameters<typeof bouncer.parseMover>[0]);
    this.bouncers.push(bouncer);
}
