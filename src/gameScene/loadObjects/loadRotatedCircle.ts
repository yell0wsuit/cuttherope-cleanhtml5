import RotatedCircle from "@/game/RotatedCircle";
import Vector from "@/core/Vector";
import Alignment from "@/core/Alignment";
import Radians from "@/utils/Radians";
import type GameSceneLoaders from "../loaders";
import type { RotatedCircleItem } from "../MapLayerItem";

export function loadRotatedCircle(this: GameSceneLoaders, item: RotatedCircleItem): void {
    const px = item.x * this.PM + this.PMX;
    const py = item.y * this.PM + this.PMY;
    const size = item.size;
    const handleAngle = item.handleAngle ?? 0;
    const handleRadians = Radians.fromDegrees(handleAngle);
    const oneHandle = item.oneHandle;
    const l = new RotatedCircle();

    l.anchor = Alignment.CENTER;
    l.x = px;
    l.y = py;
    l.rotation = handleAngle;
    l.handle1 = new Vector(l.x - size * this.PM, l.y);
    l.handle2 = new Vector(l.x + size * this.PM, l.y);

    l.handle1.rotateAround(handleRadians, l.x, l.y);
    l.handle2.rotateAround(handleRadians, l.x, l.y);

    l.setSize(size);
    l.setHasOneHandle(oneHandle);

    this.rotatedCircles.push(l);
}
