import ResourceId from "@/resources/ResourceId";
const GhostSpriteIndex = {
    BODY: 0,
    TRAIL: 1,
    FACE: 2,
    CLOUD_SMALL: 3,
    CLOUD_MEDIUM: 4,
    CLOUD_MEDIUM_ALT: 5,
    CLOUD_LARGE: 6,
};
const LEGACY_CLOUD_SLICES = [
    GhostSpriteIndex.CLOUD_SMALL,
    GhostSpriteIndex.CLOUD_MEDIUM,
    GhostSpriteIndex.CLOUD_MEDIUM_ALT,
    GhostSpriteIndex.CLOUD_LARGE,
    GhostSpriteIndex.TRAIL,
];
function getGhostCloudSlice(legacyIndex) {
    if (legacyIndex >= 0 && legacyIndex < LEGACY_CLOUD_SLICES.length) {
        return LEGACY_CLOUD_SLICES[legacyIndex];
    }
    return GhostSpriteIndex.CLOUD_MEDIUM;
}
const CLOUD_SLICES_FOR_PARTICLES = [
    getGhostCloudSlice(2),
    getGhostCloudSlice(3),
    getGhostCloudSlice(4),
];
function getGhostTexture() {
    return ResourceId.IMG_OBJ_GHOST;
}
export { GhostSpriteIndex, CLOUD_SLICES_FOR_PARTICLES, getGhostCloudSlice, getGhostTexture };
