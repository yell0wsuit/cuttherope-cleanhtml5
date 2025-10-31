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
 * @typedef {Object} BoxMetadata
 * @property {string} id - Unique identifier for the box
 * @property {BoxText} boxText - Localized text for the box
 * @property {string | null} boxImage - Background image filename for the box
 * @property {string | null} boxDoor - Door transition image filename
 * @property {"HOLIDAY" | "NORMAL" | "MORECOMING"} boxType - Type of box
 * @property {number | null} unlockStars - Number of stars required to unlock
 * @property {number | null} support - Index of the support quad for Om Nom
 * @property {boolean} showEarth - Whether to show the earth animation
 * @property {number | null} levelBackgroundId - Resource key or resolved ID
 * @property {number | null} levelOverlayId - Resource key or resolved ID
 */

class NetEdition {
    constructor() {
        /** @type {BoxMetadata[] | null} */
        this._cachedNormalizedMetadata = null;

        /** @type {string} */
        this.siteUrl = "http://www.cuttherope.net";

        /** @type {boolean} */
        this.disableHiddenDrawings = true;

        /** @type {number[]} */
        this.languages = [
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
        ];

        /** @type {string[]} */
        this.boxBorders = [];

        /** @type {number[]} */
        this.menuSoundIds = ResourcePacks.StandardMenuSounds;

        /** @type {number[]} */
        this.gameSoundIds = ResourcePacks.StandardGameSounds.concat(
            ResourcePacks.FullGameAdditionalSounds
        );

        /** @type {string[]} */
        this.menuImageFilenames = ResourcePacks.StandardMenuImageFilenames;

        /** @type {string[]} */
        this.loaderPageImages = ["loader-bg.jpg", "loader-logo.png"];

        /** @type {number[]} */
        this.gameImageIds = ResourcePacks.StandardGameImages.concat(
            ResourcePacks.FullGameAdditionalGameImages
        );

        /** @type {Object} */
        this.boxes = boxes;

        /** @type {string[]} */
        this.drawingImageNames = [];

        /** @type {string} */
        this.editionImages = "";

        /** @type {string} */
        this.editionImageDirectory = "";
    }

    /**
     * Gets normalized box metadata with lazy initialization and caching.
     * @returns {BoxMetadata[]} The normalized metadata array
     */
    getNormalizedBoxMetadata() {
        if (this._cachedNormalizedMetadata) {
            return this._cachedNormalizedMetadata;
        }

        /** @type {BoxMetadata[]} */
        const boxMetadata = JsonLoader.getBoxMetadata() || [];
        this._cachedNormalizedMetadata = boxMetadata.map((box) => {
            const isHolidayBox = box.id === HOLIDAY_GIFT_BOX_ID;
            /** @type {BoxMetadata} */
            let modifiedBox = {
                ...box,
                boxType: /** @type {BoxMetadata["boxType"]} */ (
                    BoxType[/** @type {keyof typeof BoxType} */ (box.boxType)] ?? box.boxType
                ),
                levelBackgroundId:
                    box.levelBackgroundId == null
                        ? null
                        : ResourceId[
                              /** @type {keyof typeof ResourceId} */ (
                                  /** @type {unknown} */ (box.levelBackgroundId)
                              )
                          ],
                levelOverlayId:
                    box.levelOverlayId == null
                        ? null
                        : ResourceId[
                              /** @type {keyof typeof ResourceId} */ (
                                  /** @type {unknown} */ (box.levelOverlayId)
                              )
                          ],
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

        return /** @type {BoxMetadata[]} */ (this._cachedNormalizedMetadata);
    }

    /**
     * Gets the localized text to display on each box.
     * @returns {BoxText[]} Array of localized text objects for each box
     */
    get boxText() {
        return this.getNormalizedBoxMetadata().map(({ boxText }) => boxText);
    }

    /**
     * Gets the background images to use for each box.
     * @returns {(string | null)[]} Array of image filenames or null
     */
    get boxImages() {
        return this.getNormalizedBoxMetadata().map(({ boxImage }) => boxImage);
    }

    /**
     * Gets images used for sliding door transitions.
     * @returns {string[]} Array of door image filenames
     */
    get boxDoors() {
        return this.getNormalizedBoxMetadata()
            .map(({ boxDoor }) => boxDoor)
            .filter((boxDoor) => boxDoor != null);
    }

    /**
     * Gets the type of each box.
     * @returns {BoxMetadata["boxType"][]} Array of box type strings
     */
    get boxTypes() {
        return this.getNormalizedBoxMetadata().map(({ boxType }) => boxType);
    }

    /**
     * Gets the number of stars required to unlock each box.
     * @returns {(number | null)[]} Array of unlock star requirements or null
     */
    get unlockStars() {
        return this.getNormalizedBoxMetadata().map(({ unlockStars }) => unlockStars);
    }

    /**
     * Gets the index of the quad support for each box.
     * @returns {(number | null)[]} Array of support indices or null
     */
    get supports() {
        return this.getNormalizedBoxMetadata().map(({ support }) => support);
    }

    /**
     * Gets flags determining whether earth animation is shown.
     * @returns {boolean[]} Array of showEarth flags
     */
    get showEarth() {
        return this.getNormalizedBoxMetadata().map(({ showEarth }) => showEarth);
    }

    /**
     * Gets resource IDs for level backgrounds.
     * @returns {number[]} Array of level background resource IDs
     */
    get levelBackgroundIds() {
        return this.getNormalizedBoxMetadata()
            .map(({ levelBackgroundId }) => levelBackgroundId)
            .filter((id) => id != null);
    }

    /**
     * Gets resource IDs for level overlays.
     * @returns {number[]} Array of level overlay resource IDs
     */
    get levelOverlayIds() {
        return this.getNormalizedBoxMetadata()
            .map(({ levelOverlayId }) => levelOverlayId)
            .filter((id) => id != null);
    }
}

export default new NetEdition();
