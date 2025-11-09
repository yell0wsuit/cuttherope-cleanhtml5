import Spikes from "@/game/Spikes";
import MapItem from "@/utils/MapItem";
import Constants from "@/utils/Constants";
import type GameSceneLoaders from "../loaders";
import type { SpikeItem } from "../MapLayerItem";

export function loadSpike(this: GameSceneLoaders, item: SpikeItem): void {
    const px = item.x * this.PM + this.PMX;
    const py = item.y * this.PM + this.PMY;
    const w = item.size;
    const a = item.angle ?? 0;
    const tg = item.toggled === false ? Constants.UNDEFINED : item.toggled || Constants.UNDEFINED;
    const s = new Spikes(px, py, w, a, tg);
    s.parseMover(item as Parameters<typeof s.parseMover>[0]);

    if (tg) {
        s.onButtonPressed = this.rotateAllSpikesWithId.bind(this);
    }

    if (item.name === MapItem.ELECTRO.id) {
        s.electro = true;
        s.initialDelay = item.initialDelay ?? 0;
        s.onTime = item.onTime ?? 0;
        s.offTime = item.offTime ?? 0;
        s.electroTimer = 0;

        s.turnElectroOff();
        s.electroTimer += s.initialDelay;
        s.updateRotation();
    } else {
        s.electro = false;
    }
    this.spikes.push(s);
}
