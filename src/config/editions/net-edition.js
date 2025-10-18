import boxes from "@/boxes";
import JsonLoader from "@/resources/JsonLoader";
import ResourcePacks from "@/resources/ResourcePacks";
import ResourceId from "@/resources/ResourceId";
import BoxType from "@/ui/BoxType";
import LangId from "@/resources/LangId";

const IS_PADDINGTON = new Date().getMonth() === 0;

// Lazy getter for normalized box metadata
let cachedNormalizedMetadata = null;
const getNormalizedBoxMetadata = () => {
    if (cachedNormalizedMetadata) {
        return cachedNormalizedMetadata;
    }

    const boxMetadata = JsonLoader.getBoxMetadata() || [];
    cachedNormalizedMetadata = boxMetadata.map((box) => {
        let modifiedBox = {
            ...box,
            boxType: BoxType[box.boxType] ?? box.boxType,
            levelBackgroundId:
                box.levelBackgroundId == null ? null : ResourceId[box.levelBackgroundId],
            levelOverlayId: box.levelOverlayId == null ? null : ResourceId[box.levelOverlayId],
        };

        if (IS_PADDINGTON && box.id === "holidaygiftbox") {
            modifiedBox = {
                ...modifiedBox,
                boxDoor: "levelbgpad.webp",
                levelBackgroundId: ResourceId.IMG_BGR_PADDINGTON,
                levelOverlayId: ResourceId.IMG_BGR_PADDINGTON,
            };
        }

        return modifiedBox;
    });

    return cachedNormalizedMetadata;
};

const netEdition = {
    siteUrl: "http://www.cuttherope.net",

    // no hidden drawings yet
    disableHiddenDrawings: true,

    // the text to display on the box in the box selector
    get boxText() {
        return getNormalizedBoxMetadata().map(({ boxText }) => boxText);
    },

    // !LANG
    languages: [
        LangId.EN,
        LangId.FR,
        LangId.IT,
        LangId.DE,
        LangId.NL,
        LangId.RU,
        LangId.ES,
        LangId.BR,
        LangId.CA,
        LangId.KO,
        LangId.ZH,
        LangId.JA,
    ],

    // the background image to use for the box in the box selector
    get boxImages() {
        return getNormalizedBoxMetadata().map(({ boxImage }) => boxImage);
    },

    // no box borders in Chrome theme
    boxBorders: [],

    // images used for the sliding door transitions
    get boxDoors() {
        return (
            getNormalizedBoxMetadata()
                .map(({ boxDoor }) => boxDoor)
                // omit placeholders so resource preloaders only receive valid assets
                .filter((boxDoor) => boxDoor != null)
        );
    },

    // the type of box to create
    get boxTypes() {
        return getNormalizedBoxMetadata().map(({ boxType }) => boxType);
    },

    // how many stars are required to unlock each box
    get unlockStars() {
        return getNormalizedBoxMetadata().map(({ unlockStars }) => unlockStars);
    },

    // the index of the quad for the support OmNom sits on
    get supports() {
        return getNormalizedBoxMetadata().map(({ support }) => support);
    },

    // determines whether the earth animation is shown
    get showEarth() {
        return getNormalizedBoxMetadata().map(({ showEarth }) => showEarth);
    },

    menuSoundIds: ResourcePacks.StandardMenuSounds,

    gameSoundIds: ResourcePacks.StandardGameSounds.concat(ResourcePacks.FullGameAdditionalSounds),

    menuImageFilenames: ResourcePacks.StandardMenuImageFilenames,

    loaderPageImages: ["loader-bg.jpg", "loader-logo.png"],

    gameImageIds: ResourcePacks.StandardGameImages.concat(
        ResourcePacks.FullGameAdditionalGameImages
    ),

    boxes: boxes,

    get levelBackgroundIds() {
        return (
            getNormalizedBoxMetadata()
                .map(({ levelBackgroundId }) => levelBackgroundId)
                // ensure we don't emit null entries for the "coming soon" card
                .filter((levelBackgroundId) => levelBackgroundId != null)
        );
    },

    get levelOverlayIds() {
        return getNormalizedBoxMetadata()
            .map(({ levelOverlayId }) => levelOverlayId)
            .filter((levelOverlayId) => levelOverlayId != null);
    },

    // hidden drawings are disabled
    drawingImageNames: [],
};

export default netEdition;
