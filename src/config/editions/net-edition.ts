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

import type { RawBoxMetadataJson, BoxTextJson, LevelJson } from "@/types/json";

/** @constant {string} The ID for the holiday gift box */
const HOLIDAY_GIFT_BOX_ID = "holidaygiftbox";

interface BoxMetadata {
    id: string;
    boxText: BoxTextJson;
    boxImage: string | null;
    boxDoor: string | null;
    boxType: "HOLIDAY" | "NORMAL" | "MORECOMING";
    unlockStars: number | null;
    support: number | null;
    showEarth: boolean;
    levelBackgroundId: number | null;
    levelOverlayId: number | null;
}

class NetEdition {
    _cachedNormalizedMetadata: BoxMetadata[] | null;
    siteUrl: string;
    disableHiddenDrawings: boolean;
    languages: number[];
    boxBorders: string[];
    menuSoundIds: number[];
    gameSoundIds: number[];
    menuImageFilenames: string[];
    loaderPageImages: string[];
    gameImageIds: number[];
    boxes: Array<{ levels: LevelJson[] }>;
    drawingImageNames: string[];
    editionImages: string;
    editionImageDirectory: string;
    disableBoxMenu: boolean;
    enableBoxBackgroundEasterEgg: boolean;
    boxDirectory: string;
    settingPrefix: string;
    levelBackgroundId: string;

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

        /** @type {boolean} */
        this.disableBoxMenu = false;

        /** @type {boolean} */
        this.enableBoxBackgroundEasterEgg = false;

        /** @type {string} */
        this.boxDirectory = "ui/";

        /** @type {string} */
        this.settingPrefix = "";
    }

    /**
     * Gets normalized box metadata with lazy initialization and caching.
     * @returns {BoxMetadata[]} The normalized metadata array
     */
    getNormalizedBoxMetadata(): BoxMetadata[] {
        if (this._cachedNormalizedMetadata) {
            return this._cachedNormalizedMetadata;
        }

        /** @type {BoxMetadata[]} */
        /** @type {RawBoxMetadataJson[]} */
        const rawBoxMetadata: RawBoxMetadataJson[] = JsonLoader.getBoxMetadata() ?? [];
        this._cachedNormalizedMetadata = rawBoxMetadata.map((box) => {
            const isHolidayBox = box.id === HOLIDAY_GIFT_BOX_ID;
            /** @type {BoxMetadata} */
            let modifiedBox: BoxMetadata = {
                ...box,
                boxImage: box.boxImage ?? null,
                boxDoor: box.boxDoor ?? null,
                unlockStars: box.unlockStars ?? null,
                support: box.support ?? null,
                showEarth: box.showEarth ?? false,
                boxType: box.boxType,
                levelBackgroundId:
                    box.levelBackgroundId == null
                        ? null
                        : ((ResourceId as Record<string, number>)[box.levelBackgroundId] ?? null),
                levelOverlayId:
                    box.levelOverlayId == null
                        ? null
                        : ((ResourceId as Record<string, number>)[box.levelOverlayId] ?? null),
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

        return /** @type {BoxMetadata[]} */ this._cachedNormalizedMetadata;
    }

    /**
     * Gets the localized text to display on each box.
     * @returns {BoxTextJson[]} Array of localized text objects for each box
     */
    get boxText(): BoxTextJson[] {
        return this.getNormalizedBoxMetadata().map(({ boxText }) => boxText);
    }

    /**
     * Gets the background images to use for each box.
     * @returns {(string | null)[]} Array of image filenames or null
     */
    get boxImages(): (string | null)[] {
        return this.getNormalizedBoxMetadata().map(({ boxImage }) => boxImage);
    }

    /**
     * Gets images used for sliding door transitions.
     * @returns {string[]} Array of door image filenames
     */
    get boxDoors(): string[] {
        return this.getNormalizedBoxMetadata()
            .map(({ boxDoor }) => boxDoor)
            .filter((boxDoor) => boxDoor != null);
    }

    /**
     * Gets the type of each box.
     * @returns {BoxMetadata["boxType"][]} Array of box type strings
     */
    get boxTypes(): BoxMetadata["boxType"][] {
        return this.getNormalizedBoxMetadata().map(({ boxType }) => boxType);
    }

    /**
     * Gets the number of stars required to unlock each box.
     * @returns {(number | null)[]} Array of unlock star requirements or null
     */
    get unlockStars(): (number | null)[] {
        return this.getNormalizedBoxMetadata().map(({ unlockStars }) => unlockStars);
    }

    /**
     * Gets the index of the quad support for each box.
     * @returns {(number | null)[]} Array of support indices or null
     */
    get supports(): (number | null)[] {
        return this.getNormalizedBoxMetadata().map(({ support }) => support);
    }

    /**
     * Gets flags determining whether earth animation is shown.
     * @returns {boolean[]} Array of showEarth flags
     */
    get showEarth(): boolean[] {
        return this.getNormalizedBoxMetadata().map(({ showEarth }) => showEarth);
    }

    /**
     * Gets resource IDs for level backgrounds.
     * @returns {number[]} Array of level background resource IDs
     */
    get levelBackgroundIds(): number[] {
        return this.getNormalizedBoxMetadata()
            .map(({ levelBackgroundId }) => levelBackgroundId)
            .filter((id) => id != null);
    }

    /**
     * Gets resource IDs for level overlays.
     * @returns {number[]} Array of level overlay resource IDs
     */
    get levelOverlayIds(): number[] {
        return this.getNormalizedBoxMetadata()
            .map(({ levelOverlayId }) => levelOverlayId)
            .filter((id) => id != null);
    }
}

export default new NetEdition();
