import boxes from "@/boxes";
import boxMetadata from "./net-box-text.json";
import ResourcePacks from "@/resources/ResourcePacks";
import ResourceId from "@/resources/ResourceId";
import BoxType from "@/ui/BoxType";
import LangId from "@/resources/LangId";

const normalizedBoxMetadata = boxMetadata.map((box) => ({
    ...box,
    boxType: BoxType[box.boxType] ?? box.boxType,
    levelBackgroundId:
        box.levelBackgroundId == null ? null : ResourceId[box.levelBackgroundId],
}));

const netEdition = {
    siteUrl: "http://www.cuttherope.net",

    // no hidden drawings yet
    disableHiddenDrawings: true,

    // the text to display on the box in the box selector
    boxText: normalizedBoxMetadata.map(({ boxText }) => boxText),

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
    boxImages: normalizedBoxMetadata.map(({ boxImage }) => boxImage),

    // no box borders in Chrome theme
    boxBorders: [],

    // images used for the sliding door transitions
    boxDoors: normalizedBoxMetadata
        .map(({ boxDoor }) => boxDoor)
        // omit placeholders so resource preloaders only receive valid assets
        .filter((boxDoor) => boxDoor != null),

    // the type of box to create
    boxTypes: normalizedBoxMetadata.map(({ boxType }) => boxType),

    // how many stars are required to unlock each box
    unlockStars: normalizedBoxMetadata.map(({ unlockStars }) => unlockStars),

    // the index of the quad for the support OmNom sits on
    supports: normalizedBoxMetadata.map(({ support }) => support),

    // determines whether the earth animation is shown
    showEarth: normalizedBoxMetadata.map(({ showEarth }) => showEarth),

    menuSoundIds: ResourcePacks.StandardMenuSounds,

    gameSoundIds: ResourcePacks.StandardGameSounds.concat(ResourcePacks.ChromeLiteAdditionalGameSounds),

    menuImageFilenames: ResourcePacks.StandardMenuImageFilenames,

    loaderPageImages: ["loader-bg.jpg", "loader-logo.png"],

    gameImageIds: ResourcePacks.StandardGameImages.concat(ResourcePacks.ChromeLiteAdditionalGameImages),

    boxes: boxes,

    levelBackgroundIds: normalizedBoxMetadata
        .map(({ levelBackgroundId }) => levelBackgroundId)
        // ensure we don't emit null entries for the "coming soon" card
        .filter((levelBackgroundId) => levelBackgroundId != null),

    // none of the chrome lite levels scroll
    levelOverlayIds: [],

    // hidden drawings are disabled
    drawingImageNames: [],
};

export default netEdition;
