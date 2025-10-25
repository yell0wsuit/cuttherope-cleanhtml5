import boxes from "@/boxes";
import JsonLoader from "@/resources/JsonLoader";
import ResourcePacks from "@/resources/ResourcePacks";
import ResourceId, { isValidResourceId } from "@/resources/ResourceId";
import BoxType, { isValidBoxType } from "@/ui/BoxType";
import LangId from "@/resources/LangId";
import { IS_JANUARY } from "@/resources/ResData";

const HOLIDAY_GIFT_BOX_ID = "holidaygiftbox";

// For localization entries
interface LocalizationEntry {
    en: string;
    fr?: string;
    de?: string;
    ru?: string;
    es?: string;
    br?: string;
    ca?: string;
    it?: string;
    nl?: string;
    ko?: string;
    zh?: string;
    ja?: string;
}

interface NormalizedBoxMetadata {
    id: string;
    boxText?: LocalizationEntry;
    boxImage?: string;
    boxDoor?: string | null;
    boxType: string;
    unlockStars?: number | null;
    support?: number | null;
    showEarth?: boolean;
    levelBackgroundId?: string | null;
    levelOverlayId?: string | null;
}

// Lazy getter for normalized box metadata
let cachedNormalizedMetadata: NormalizedBoxMetadata[] | null = null;
const getNormalizedBoxMetadata = () => {
    if (cachedNormalizedMetadata) {
        return cachedNormalizedMetadata;
    }

    const boxMetadata = JsonLoader.getBoxMetadata() || [];
    cachedNormalizedMetadata = boxMetadata.map((box: NormalizedBoxMetadata) => {
        const isHolidayBox = box.id === HOLIDAY_GIFT_BOX_ID;
        let modifiedBox = {
            ...box,
            boxType: isValidBoxType(box.boxType) ? BoxType[box.boxType] : box.boxType,
            levelBackgroundId:
                box.levelBackgroundId == null || !isValidResourceId(box.levelBackgroundId)
                    ? null
                    : ResourceId[box.levelBackgroundId],
            levelOverlayId:
                box.levelOverlayId == null || !isValidResourceId(box.levelOverlayId)
                    ? null
                    : ResourceId[box.levelOverlayId],
        };

        if (IS_JANUARY && isHolidayBox) {
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

    boxDirectory: "",

    // no hidden drawings yet
    disableHiddenDrawings: true,

    // the text to display on the box in the box selector
    get boxText() {
        return getNormalizedBoxMetadata()?.map(({ boxText }) => boxText);
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
        return getNormalizedBoxMetadata()?.map(({ boxImage }) => boxImage);
    },

    // no box borders in Chrome theme
    boxBorders: [],

    // images used for the sliding door transitions
    get boxDoors() {
        return (
            getNormalizedBoxMetadata()
                ?.map(({ boxDoor }) => boxDoor)
                // omit placeholders so resource preloaders only receive valid assets
                .filter((boxDoor) => boxDoor != null)
        );
    },

    // the type of box to create
    get boxTypes() {
        return getNormalizedBoxMetadata()?.map(({ boxType }) => boxType);
    },

    // how many stars are required to unlock each box
    get unlockStars() {
        return getNormalizedBoxMetadata()?.map(({ unlockStars }) => unlockStars);
    },

    // the index of the quad for the support OmNom sits on
    get supports() {
        return getNormalizedBoxMetadata()?.map(({ support }) => support);
    },

    // determines whether the earth animation is shown
    get showEarth() {
        return getNormalizedBoxMetadata()?.map(({ showEarth }) => showEarth);
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
                ?.map(({ levelBackgroundId }) => levelBackgroundId)
                // ensure we don't emit null entries for the "coming soon" card
                .filter((levelBackgroundId) => levelBackgroundId != null)
        );
    },

    get levelOverlayIds() {
        return getNormalizedBoxMetadata()
            ?.map(({ levelOverlayId }) => levelOverlayId)
            .filter((levelOverlayId) => levelOverlayId != null);
    },

    // hidden drawings are disabled
    drawingImageNames: [],
};

export default netEdition;
