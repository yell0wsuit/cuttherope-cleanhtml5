import settings from "@/game/CTRSettings";
import scaleResolution from "@/config/resolutions/scale";
import res480 from "@/config/resolutions/480x270";
import res768 from "@/config/resolutions/768x432";
import res1024 from "@/config/resolutions/1024x576";
import res1920 from "@/config/resolutions/1920x1080";
import res2560 from "@/config/resolutions/2560x1440";

import type { ResolutionProfile } from "@/types/resolution";

interface ResolutionCandidate {
    profile: ResolutionProfile;
    isHd: boolean;
    minWidth: number;
    minHeight: number;
}

const resolutionCandidates: ResolutionCandidate[] = [
    { profile: res2560, isHd: true, minWidth: 2400, minHeight: 1350 },
    { profile: res1920, isHd: true, minWidth: 1600, minHeight: 900 },
    { profile: res1024, isHd: true, minWidth: 1024, minHeight: 576 },
    { profile: res768, isHd: false, minWidth: 768, minHeight: 432 },
    { profile: res480, isHd: false, minWidth: 0, minHeight: 0 },
];

const getViewportSize = (): { width: number; height: number } => {
    if (typeof window === "undefined") {
        return { width: 1920, height: 1080 };
    }

    return { width: window.innerWidth, height: window.innerHeight };
};

const selectResolution = (): ResolutionCandidate => {
    const { width, height } = getViewportSize();

    for (const candidate of resolutionCandidates) {
        if (width >= candidate.minWidth && height >= candidate.minHeight) {
            return candidate;
        }
    }

    return resolutionCandidates[resolutionCandidates.length - 1]!;
};

const candidate = selectResolution();
const resolution = scaleResolution(candidate.profile);

settings.setIsHD(candidate.isHd);

export default resolution;
