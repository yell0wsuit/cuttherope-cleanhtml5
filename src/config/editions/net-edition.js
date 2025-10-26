// @ts-check

/**
 * @fileoverview Configuration for the web edition of Cut the Rope.
 * Defines game resources, box metadata, and web-specific settings.
 */

import boxes from "@/boxes";
import JsonLoader from "@/resources/JsonLoader";
import ResourcePacks from "@/resources/ResourcePacks";
import ResourceId from "@/resources/ResourceId";
import BoxType from "@/ui/BoxType";
import LangId from "@/resources/LangId";
import { IS_JANUARY } from "@/resources/ResData";

/** @constant {string} The ID for the holiday gift box */
const HOLIDAY_GIFT_BOX_ID = "holidaygiftbox";

/**
 * Localized text for a box, supporting multiple languages.
 * @typedef {Object} BoxText
 * @property {string} en - English text
 * @property {string} ko - Korean text
 * @property {string} zh - Chinese (Simplified) text
 * @property {string} ja - Japanese text
 * @property {string} nl - Dutch text
 * @property {string} it - Italian text
 * @property {string} ca - Catalan text
 * @property {string} br - Brazilian Portuguese text
 * @property {string} es - Spanish text
 * @property {string} fr - French text
 * @property {string} de - German text
 * @property {string} ru - Russian text
 */

/**
 * Type of box display mode.
 * @typedef {"HOLIDAY" | "NORMAL" | "MORECOMING"} BoxTypeString
 */

/**
 * Raw box metadata from JSON before normalization.
 * @typedef {Object} RawBoxMetadata
 * @property {string} id - Unique identifier for the box
 * @property {BoxText} boxText - Localized text for the box
 * @property {string | null} boxImage - Background image filename for the box
 * @property {string | null} boxDoor - Door transition image filename
 * @property {string} boxType - Type of box as string key (e.g., "NORMAL", "HOLIDAY")
 * @property {number | null} unlockStars - Number of stars required to unlock
 * @property {number | null} support - Index of the support quad for Om Nom
 * @property {boolean} showEarth - Whether to show the earth animation
 * @property {string | null} levelBackgroundId - Resource ID key for level background
 * @property {string | null} levelOverlayId - Resource ID key for level overlay
 */

/**
 * Metadata for a game box configuration (after normalization).
 * @typedef {Object} BoxMetadata
 * @property {string} id - Unique identifier for the box
 * @property {BoxText} boxText - Localized text for the box
 * @property {string | null} boxImage - Background image filename for the box
 * @property {string | null} boxDoor - Door transition image filename
 * @property {BoxTypeString} boxType - Type of box (NORMAL, HOLIDAY, MORECOMING)
 * @property {number | null} unlockStars - Number of stars required to unlock
 * @property {number | null} support - Index of the support quad for Om Nom
 * @property {boolean} showEarth - Whether to show the earth animation
 * @property {number | null} levelBackgroundId - Resource ID for level background
 * @property {number | null} levelOverlayId - Resource ID for level overlay
 */

/**
 * Cached normalized box metadata to avoid redundant processing.
 * @type {BoxMetadata[] | null}
 */
let cachedNormalizedMetadata = null;

/**
 * Gets normalized box metadata with lazy initialization and caching.
 * Transforms raw box metadata from JSON, resolving resource IDs and applying
 * seasonal modifications (e.g., Paddington theme in January for holiday box).
 * @returns {BoxMetadata[]} The normalized metadata array
 */
const getNormalizedBoxMetadata = () => {
    if (cachedNormalizedMetadata) {
        return cachedNormalizedMetadata;
    }

    /** @type {RawBoxMetadata[]} */
    const boxMetadata = JsonLoader.getBoxMetadata() || [];
    cachedNormalizedMetadata = boxMetadata.map((box) => {
        const isHolidayBox = box.id === HOLIDAY_GIFT_BOX_ID;
        /** @type {BoxMetadata} */
        let modifiedBox = {
            ...box,
            boxType: /** @type {BoxTypeString} */ (
                BoxType[/** @type {keyof typeof BoxType} */ (box.boxType)] ?? box.boxType
            ),
            levelBackgroundId:
                box.levelBackgroundId == null
                    ? null
                    : ResourceId[/** @type {keyof typeof ResourceId} */ (box.levelBackgroundId)],
            levelOverlayId:
                box.levelOverlayId == null
                    ? null
                    : ResourceId[/** @type {keyof typeof ResourceId} */ (box.levelOverlayId)],
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

    return /** @type {BoxMetadata[]} */ (cachedNormalizedMetadata);
};

/**
 * Configuration object for the Cut the Rope web edition.
 * Contains all game resources, box configurations, and edition-specific settings.
 * @type {Object}
 */
const netEdition = {
    /**
     * Official website URL for Cut the Rope.
     * @type {string}
     */
    siteUrl: "http://www.cuttherope.net",

    /**
     * Flag to disable hidden drawings feature.
     * @type {boolean}
     */
    disableHiddenDrawings: true,

    /**
     * Gets the localized text to display on each box in the box selector.
     * @returns {BoxText[]} Array of localized text objects for each box
     */
    get boxText() {
        return getNormalizedBoxMetadata().map(({ boxText }) => boxText);
    },

    /**
     * Supported languages for the game.
     * @type {number[]}
     */
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

    /**
     * Gets the background images to use for each box in the box selector.
     * @returns {(string | null)[]} Array of image filenames or null for each box
     */
    get boxImages() {
        return getNormalizedBoxMetadata().map(({ boxImage }) => boxImage);
    },

    /**
     * Box border images (empty for web edition).
     * @type {string[]}
     */
    boxBorders: [],

    /**
     * Gets images used for the sliding door transitions.
     * Filters out null placeholders to ensure only valid assets are preloaded.
     * @returns {string[]} Array of door image filenames
     */
    get boxDoors() {
        return (
            getNormalizedBoxMetadata()
                .map(({ boxDoor }) => boxDoor)
                // omit placeholders so resource preloaders only receive valid assets
                .filter((boxDoor) => boxDoor != null)
        );
    },

    /**
     * Gets the type of each box (NORMAL, HOLIDAY, MORECOMING).
     * @returns {BoxTypeString[]} Array of box type strings
     */
    get boxTypes() {
        return getNormalizedBoxMetadata().map(({ boxType }) => boxType);
    },

    /**
     * Gets the number of stars required to unlock each box.
     * @returns {(number | null)[]} Array of unlock star requirements or null
     */
    get unlockStars() {
        return getNormalizedBoxMetadata().map(({ unlockStars }) => unlockStars);
    },

    /**
     * Gets the index of the quad for the support Om Nom sits on for each box.
     * @returns {(number | null)[]} Array of support quad indices or null
     */
    get supports() {
        return getNormalizedBoxMetadata().map(({ support }) => support);
    },

    /**
     * Gets flags determining whether the earth animation is shown for each box.
     * @returns {boolean[]} Array of showEarth flags
     */
    get showEarth() {
        return getNormalizedBoxMetadata().map(({ showEarth }) => showEarth);
    },

    /**
     * Sound IDs for menu sounds.
     * @type {number[]}
     */
    menuSoundIds: ResourcePacks.StandardMenuSounds,

    /**
     * Sound IDs for game sounds (standard + additional).
     * @type {number[]}
     */
    gameSoundIds: ResourcePacks.StandardGameSounds.concat(ResourcePacks.FullGameAdditionalSounds),

    /**
     * Filenames for menu images.
     * @type {string[]}
     */
    menuImageFilenames: ResourcePacks.StandardMenuImageFilenames,

    /**
     * Images to display on the loader page.
     * @type {string[]}
     */
    loaderPageImages: ["loader-bg.jpg", "loader-logo.png"],

    /**
     * Image resource IDs for game images (standard + additional).
     * @type {number[]}
     */
    gameImageIds: ResourcePacks.StandardGameImages.concat(
        ResourcePacks.FullGameAdditionalGameImages
    ),

    /**
     * Box and level configuration data.
     * @type {Object}
     */
    boxes: boxes,

    /**
     * Gets resource IDs for level background images.
     * Filters out null entries for "coming soon" cards.
     * @returns {number[]} Array of level background resource IDs
     */
    get levelBackgroundIds() {
        return (
            getNormalizedBoxMetadata()
                .map(({ levelBackgroundId }) => levelBackgroundId)
                // ensure we don't emit null entries for the "coming soon" card
                .filter((levelBackgroundId) => levelBackgroundId != null)
        );
    },

    /**
     * Gets resource IDs for level overlay images.
     * Filters out null entries for boxes without overlays.
     * @returns {number[]} Array of level overlay resource IDs
     */
    get levelOverlayIds() {
        return getNormalizedBoxMetadata()
            .map(({ levelOverlayId }) => levelOverlayId)
            .filter((levelOverlayId) => levelOverlayId != null);
    },

    /**
     * Hidden drawing image names (temporarily disabled for web edition).
     * @type {string[]}
     */
    drawingImageNames: [],
};

export default netEdition;
