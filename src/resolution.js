import settings from "@/game/CTRSettings";
import scaleResolution from "@/config/resolutions/scale";
import res480 from "@/config/resolutions/480x270";
import res768 from "@/config/resolutions/768x432";
import res1024 from "@/config/resolutions/1024x576";

// decide which resolution to target
let resolution;

resolution = res1024;

scaleResolution(resolution);
resolution.isHD = true;

export default resolution;
