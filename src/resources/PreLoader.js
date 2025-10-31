import platform from "@/platform";
import edition from "@/edition";
import resolution from "@/resolution";
import resData from "@/resources/ResData";
import SoundLoader from "@/resources/SoundLoader";
import JsonLoader from "@/resources/JsonLoader";
import ResourceMgr, { initializeResources } from "@/resources/ResourceMgr";
import ResourcePacks from "@/resources/ResourcePacks";
import PubSub from "@/utils/PubSub";

class PreLoader {
    constructor() {
        // State tracking
        this.menuImagesLoadComplete = false;
        this.menuSoundLoadComplete = false;
        this.menuJsonLoadComplete = false;

        /**
         * @type {(() => void) | null}
         */
        this.completeCallback = null;

        this.totalResources = 0;
        this.loadedImages = 0;
        this.loadedSounds = 0;
        this.loadedJsonFiles = 0;
        this.failedImages = 0;
        this.failedSounds = 0;

        this.MENU_TAG = "MENU";
        this.FONT_TAG = "FONT";
        this.GAME_TAG = "GAME";
        this.supportsImageBitmap = typeof createImageBitmap === "function";
    }

    // === Utility helpers ===
    getUrlFacade() {
        if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function") return URL;
        if (typeof window !== "undefined") {
            const legacy = window.URL || window.webkitURL;
            if (legacy && typeof legacy.createObjectURL === "function") return legacy;
        }
        return null;
    }

    /**
     * @param {string} url
     */
    async loadImageElement(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.decoding = "async";

            const cleanup = () => {
                img.removeEventListener("load", onLoad);
                img.removeEventListener("error", onError);
            };

            const onLoad = () => {
                cleanup();
                resolve(img);
            };

            const onError = () => {
                cleanup();
                reject(new Error(`Failed to load image: ${url}`));
            };

            img.addEventListener("load", onLoad);
            img.addEventListener("error", onError);
            img.src = url;
        });
    }

    /**
     * @param {ImageBitmap} drawable
     * @param {string} sourceUrl
     */
    createImageAsset(drawable, sourceUrl) {
        const naturalWidth = drawable.naturalWidth ?? drawable.videoWidth ?? drawable.width ?? 0;
        const naturalHeight =
            drawable.naturalHeight ?? drawable.videoHeight ?? drawable.height ?? 0;

        return { drawable, width: naturalWidth, height: naturalHeight, sourceUrl };
    }

    /**
     * @param {string | URL | Request} url
     */
    async fetchImageBlob(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
        return await response.blob();
    }

    /**
     * @param {Blob} blob
     * @param {string} fallbackUrl
     */
    async loadImageFromBlob(blob, fallbackUrl) {
        const urlFacade = this.getUrlFacade();
        if (!urlFacade) {
            if (fallbackUrl) return await this.loadImageElement(fallbackUrl);
            throw new Error("Object URL API not available");
        }
        const objectUrl = urlFacade.createObjectURL(blob);
        try {
            return await this.loadImageElement(objectUrl);
        } finally {
            urlFacade.revokeObjectURL(objectUrl);
        }
    }

    /**
     * @param {string} url
     */
    async loadImageAsset(url) {
        if (!url) throw new Error("Image URL must be provided");

        if (!this.supportsImageBitmap && !this.getUrlFacade()) {
            const img = await this.loadImageElement(url);
            return this.createImageAsset(img, url);
        }

        const blob = await this.fetchImageBlob(url);

        if (this.supportsImageBitmap) {
            try {
                const bitmap = await createImageBitmap(blob);
                return this.createImageAsset(bitmap, url);
            } catch (err) {
                console.warn("Falling back to HTMLImageElement for", url, err);
            }
        }

        const img = await this.loadImageFromBlob(blob, url);
        return this.createImageAsset(img, url);
    }

    /**
     * @param {string | URL | Request} url
     */
    async loadJson(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const text = await res.text();
        return JSON.parse(text);
    }

    // === Progress handling ===
    updateProgress() {
        if (this.totalResources === 0) return;
        const progress =
            ((this.loadedImages + this.loadedSounds + this.loadedJsonFiles) / this.totalResources) *
            100;
        PubSub.publish(PubSub.ChannelId.PreloaderProgress, { progress });
        /*LoadAnimation?.notifyLoadProgress?.(progress);*/
    }

    checkMenuLoadComplete() {
        if (
            !this.menuImagesLoadComplete ||
            !this.menuSoundLoadComplete ||
            !this.menuJsonLoadComplete
        )
            return;

        if (this.failedImages > 0 || this.failedSounds > 0) {
            console.warn(
                `Loading completed with failures - Images: ${this.failedImages}, Sounds: ${this.failedSounds}`
            );
        }

        /*LoadAnimation?.notifyLoaded?.();
        LoadAnimation?.hide?.();*/

        if (this.completeCallback) setTimeout(this.completeCallback, 0);

        // lock once
        this.checkMenuLoadComplete = () => {};
    }

    // === Resource collection ===
    /**
     * @param {string} gameBaseUrl
     */
    collectImageResources(gameBaseUrl) {
        const resources = [];
        let menuResourceCount = 0;
        const add = (url, tag, resId = null) => {
            if (!url) return;
            resources.push({ url, tag, resId });
            if (tag === this.MENU_TAG || tag === this.FONT_TAG) menuResourceCount++;
        };

        const queueMenu = (arr, base = platform.uiImageBaseUrl) => {
            if (!arr) return;
            for (const name of arr) name && add(base + name, this.MENU_TAG);
        };

        // Menu UI images
        //const pwdPath = platform.imageBaseUrl + (editionUI.passwordDirectory || "");
        //queueMenu(editionUI.passwordImageNames, pwdPath);

        /*const pwdResPath =
            platform.resolutionBaseUrl + (editionUI.passwordResolutionDirectory || "");*/
        //queueMenu(editionUI.passwordResolutionImageNames, pwdResPath);

        //queueMenu(editionUI.pageImageNames, `${platform.imageBaseUrl}page/`);
        //queueMenu(editionUI.pageResolutionImageNames, `${platform.resolutionBaseUrl}page/`);
        queueMenu(edition.menuImageFilenames);
        queueMenu(edition.boxImages, platform.boxImageBaseUrl);
        queueMenu(edition.boxBorders);
        queueMenu(edition.boxDoors);
        queueMenu(edition.drawingImageNames);
        queueMenu(
            edition.editionImages,
            platform.resolutionBaseUrl + (edition.editionImageDirectory || "")
        );

        const queueForResMgr = (ids, tag) => {
            if (!ids) return;
            for (const id of ids) {
                const res = resData[id];
                if (!res) continue;
                add(gameBaseUrl + res.path, tag, id);
                if (res.atlasPath) {
                    this.loadJson(gameBaseUrl + res.atlasPath)
                        .then((atlas) => ResourceMgr.onAtlasLoaded(id, atlas))
                        .catch((err) => ResourceMgr.onAtlasError(id, err));
                }
            }
        };

        queueForResMgr(ResourcePacks.StandardFonts, this.FONT_TAG);
        queueForResMgr(edition.gameImageIds, this.GAME_TAG);
        queueForResMgr(edition.levelBackgroundIds, this.GAME_TAG);
        queueForResMgr(edition.levelOverlayIds, this.GAME_TAG);

        return { resources, menuResourceCount };
    }

    // === Image loading ===
    loadImages() {
        const gameBaseUrl = `${platform.imageBaseUrl}${resolution.CANVAS_WIDTH}/game/`;
        const { resources, menuResourceCount } = this.collectImageResources(gameBaseUrl);

        let menuLoaded = 0;
        let menuFailed = 0;

        const tracked = (tag) => tag === this.MENU_TAG || tag === this.FONT_TAG;
        const finalize = () => {
            this.loadedImages = menuLoaded + menuFailed;
            this.failedImages = menuFailed;
            this.updateProgress();

            if (menuLoaded + menuFailed === menuResourceCount) {
                this.menuImagesLoadComplete = true;
                this.checkMenuLoadComplete();
            }
        };

        if (menuResourceCount === 0) {
            this.menuImagesLoadComplete = true;
            this.checkMenuLoadComplete();
        }

        for (const { url, tag, resId } of resources) {
            this.loadImageAsset(url)
                .then((asset) => {
                    if ((tag === this.FONT_TAG || tag === this.GAME_TAG) && resId !== null)
                        ResourceMgr.onResourceLoaded(resId, asset);
                    if (tracked(tag)) menuLoaded++;
                })
                .catch((err) => {
                    console.error("Failed to load image:", url, err);
                    if (tracked(tag)) menuFailed++;
                })
                .finally(() => {
                    if (tracked(tag)) finalize();
                });
        }

        return { trackedResourceCount: menuResourceCount };
    }

    // === Lifecycle ===
    start() {
        initializeResources();
        // LoadAnimation?.init?.();
    }

    domReady() {
        const betterLoader = document.getElementById("betterLoader");
        const start = () => this.startResourceLoading();

        if (!betterLoader) return start();

        const bg = window.getComputedStyle(betterLoader).backgroundImage;
        const match = bg.match(/url\(["']?([^"']*)["']?\)/);
        if (match && match[1]) {
            const img = new Image();
            img.onload = start;
            img.onerror = start;
            img.src = match[1];
        } else {
            start();
        }
    }

    /**
     * @param {(() => void) | null} onComplete
     */
    run(onComplete) {
        this.completeCallback = onComplete;
        this.checkMenuLoadComplete();
    }

    startResourceLoading() {
        this.totalResources = JsonLoader.getJsonFileCount();

        JsonLoader.onProgress((completed) => {
            this.loadedJsonFiles = completed;
            this.updateProgress();
        });

        JsonLoader.onMenuComplete(() => {
            this.menuJsonLoadComplete = true;
            const { trackedResourceCount } = this.loadImages();

            this.totalResources =
                trackedResourceCount + SoundLoader.getSoundCount() + JsonLoader.getJsonFileCount();

            SoundLoader.onProgress((/** @type {number} */ completed) => {
                this.loadedSounds = completed;
                this.updateProgress();
            });

            SoundLoader.onMenuComplete(() => {
                this.menuSoundLoadComplete = true;
                this.checkMenuLoadComplete();
            });

            SoundLoader.start();
        });

        JsonLoader.start();
    }
}

export default new PreLoader();
