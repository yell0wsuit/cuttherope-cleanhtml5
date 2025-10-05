import settings from "@/game/CTRSettings";
import scaleResolution from "@/config/resolutions/scale";
import res480 from "@/config/resolutions/480x270";
import res768 from "@/config/resolutions/768x432";
// decide which resolution to target
let resolution;

// Use 480px (for testing in desktop browser)
resolution = res480;

scaleResolution(resolution);
resolution.isHD = false;

export default resolution;
