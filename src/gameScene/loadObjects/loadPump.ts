import Pump from "@/game/Pump";
import ResourceId from "@/resources/ResourceId";
import Rectangle from "@/core/Rectangle";
import resolution from "@/resolution";
import Alignment from "@/core/Alignment";
import Timeline from "@/visual/Timeline";
import type GameSceneLoaders from "../loaders";
import type { PumpItem } from "../MapLayerItem";

export function loadPump(this: GameSceneLoaders, item: PumpItem): void {
    const s = new Pump();
    s.initTextureWithId(ResourceId.IMG_OBJ_PUMP);
    s.doRestoreCutTransparency();
    s.addAnimationWithDelay(0.05, Timeline.LoopType.NO_LOOP, 4, [1, 2, 3, 0]);

    s.bb = Rectangle.copy(resolution.PUMP_BB);
    s.x = item.x * this.PM + this.PMX;
    s.y = item.y * this.PM + this.PMY;
    s.rotation = item.angle + 90;
    s.updateRotation();
    s.anchor = Alignment.CENTER;
    this.pumps.push(s);
}
