import platform from "@/platform";
import edition from "@/edition";
import editionUI from "@/editionUI";
import resolution from "@/resolution";
import resData from "@/resources/ResData";
import SoundLoader from "@/resources/SoundLoader";
import JsonLoader from "@/resources/JsonLoader";
import LoadAnimation from "@/LoadAnimation";
import ResourceMgr, { initializeResources } from "@/resources/ResourceMgr";
import ResourcePacks from "@/resources/ResourcePacks";
import PubSub from "@/utils/PubSub";

let menuImagesLoadComplete = false,
    menuSoundLoadComplete = false,
    menuJsonLoadComplete = false,
    completeCallback = null,
    totalResources = 0,
    loadedImages = 0,
    loadedSounds = 0,
    loadedJsonFiles = 0,
    failedImages = 0,
    failedSounds,
    checkMenuLoadComplete = function () {
        if (!menuImagesLoadComplete || !menuSoundLoadComplete || !menuJsonLoadComplete) {
            return;
        }

        // Log any failures
        if (failedImages > 0 || failedSounds > 0) {
            window.console?.warn?.(
                `Loading completed with failures - Images: ${failedImages}, Sounds: ${failedSounds}`
            );
        }

        if (LoadAnimation) {
            LoadAnimation.notifyLoaded();
            LoadAnimation.hide();
        }

        if (completeCallback) {
            // queue the execution of the callback so the loader can
            // finish notifying listeners first
            setTimeout(completeCallback, 0);
        }

        // ensure the completion is only run once
        checkMenuLoadComplete = function () {};
    };

const updateProgress = function () {
    if (totalResources === 0) return;
    const progress = ((loadedImages + loadedSounds + loadedJsonFiles) / totalResources) * 100;
    PubSub.publish(PubSub.ChannelId.PreloaderProgress, { progress: progress });

    if (LoadAnimation) {
        LoadAnimation.notifyLoadProgress(progress);
    }
};

const MENU_TAG = "MENU";
const FONT_TAG = "FONT";
const GAME_TAG = "GAME";

const supportsImageBitmap = typeof createImageBitmap === "function";

const loadImageElement = (url) =>
    new Promise((resolve, reject) => {
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

const createImageAsset = (drawable, sourceUrl) => {
    if (!drawable) {
        throw new Error("Drawable image asset is required");
    }

    const naturalWidth = drawable.naturalWidth ?? drawable.videoWidth ?? drawable.width ?? 0;
    const naturalHeight = drawable.naturalHeight ?? drawable.videoHeight ?? drawable.height ?? 0;

    return {
        drawable,
        width: naturalWidth,
        height: naturalHeight,
        sourceUrl,
    };
};

const getUrlFacade = () => {
    if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
        return URL;
    }

    if (typeof window !== "undefined") {
        const legacyUrl = window.URL || window.webkitURL;
        if (legacyUrl && typeof legacyUrl.createObjectURL === "function") {
            return legacyUrl;
        }
    }

    return null;
};

const loadImageFromBlob = async (blob, fallbackUrl) => {
    if (!blob) {
        throw new Error("Image blob must be provided");
    }

    const urlFacade = getUrlFacade();
    if (!urlFacade) {
        if (fallbackUrl) {
            return await loadImageElement(fallbackUrl);
        }
        throw new Error("Object URL API is not available");
    }

    const objectUrl = urlFacade.createObjectURL(blob);
    try {
        return await loadImageElement(objectUrl);
    } finally {
        urlFacade.revokeObjectURL(objectUrl);
    }
};

const fetchImageBlob = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }
    return await response.blob();
};

const loadImageAsset = async (url) => {
    if (!url) {
        throw new Error("Image URL must be provided");
    }

    if (!supportsImageBitmap && !getUrlFacade()) {
        const img = await loadImageElement(url);
        return createImageAsset(img, url);
    }

    const blob = await fetchImageBlob(url);

    if (supportsImageBitmap) {
        try {
            const bitmap = await createImageBitmap(blob);
            return createImageAsset(bitmap, url);
        } catch (error) {
            window.console?.warn?.("Falling back to HTMLImageElement for", url, "due to", error);
        }
    }

    const img = await loadImageFromBlob(blob, url);
    return createImageAsset(img, url);
};

const loadJson = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    const jsonText = await response.text();

    try {
        return JSON.parse(jsonText);
    } catch (error) {
        window.console?.error?.("Failed to parse JSON asset", url, error);
        throw error;
    }
};

const collectImageResources = (gameBaseUrl) => {
    const resources = [];
    let menuResourceCount = 0;

    const addResource = (url, tag, resId = null) => {
        if (!url) {
            return;
        }

        resources.push({ url, tag, resId });

        if (tag === MENU_TAG || tag === FONT_TAG) {
            menuResourceCount++;
        }
    };

    const queueMenuImages = (imageFilenames, menuBaseUrl) => {
        if (!imageFilenames) {
            return;
        }

        const baseUrl = menuBaseUrl || platform.uiImageBaseUrl;
        for (let i = 0, len = imageFilenames.length; i < len; i++) {
            const filename = imageFilenames[i];
            if (!filename) {
                continue;
            }
            addResource(baseUrl + filename, MENU_TAG);
        }
    };

    // queue page images first, the game can wait (we have a load animation)
    const passwordPath = platform.imageBaseUrl + (editionUI.passwordDirectory || "");
    queueMenuImages(editionUI.passwordImageNames, passwordPath);

    const passwordResolutionPath =
        platform.resolutionBaseUrl + (editionUI.passwordResolutionDirectory || "");
    queueMenuImages(editionUI.passwordResolutionImageNames, passwordResolutionPath);

    queueMenuImages(editionUI.pageImageNames, `${platform.imageBaseUrl}page/`);
    queueMenuImages(editionUI.pageResolutionImageNames, `${platform.resolutionBaseUrl}page/`);
    queueMenuImages(edition.menuImageFilenames);
    queueMenuImages(edition.boxImages, platform.boxImageBaseUrl);
    queueMenuImages(edition.boxBorders);
    queueMenuImages(edition.boxDoors);
    queueMenuImages(edition.drawingImageNames);

    const editionBaseUrl = platform.resolutionBaseUrl + (edition.editionImageDirectory || "");
    queueMenuImages(edition.editionImages, editionBaseUrl);

    const queueForResMgr = (ids, tag) => {
        if (!ids) {
            return;
        }

        for (let i = 0, len = ids.length; i < len; i++) {
            const imageId = ids[i];
            const resource = resData[imageId];
            if (!resource) {
                continue;
            }

            const imageUrl = gameBaseUrl + resource.path;
            addResource(imageUrl, tag, imageId);

            if (resource.atlasPath) {
                const atlasUrl = gameBaseUrl + resource.atlasPath;
                loadJson(atlasUrl)
                    .then((atlasData) => {
                        ResourceMgr.onAtlasLoaded(imageId, atlasData);
                    })
                    .catch((error) => {
                        ResourceMgr.onAtlasError(imageId, error);
                    });
            }
        }
    };

    queueForResMgr(ResourcePacks.StandardFonts, FONT_TAG);
    queueForResMgr(edition.gameImageIds, GAME_TAG);
    queueForResMgr(edition.levelBackgroundIds, GAME_TAG);
    queueForResMgr(edition.levelOverlayIds, GAME_TAG);

    return { resources, menuResourceCount };
};

const loadImages = function () {
    const gameBaseUrl = `${platform.imageBaseUrl}${resolution.CANVAS_WIDTH}/game/`;

    const { resources, menuResourceCount } = collectImageResources(gameBaseUrl);
    let menuResourcesLoaded = 0;
    let menuResourcesFailed = 0;

    const finalizeMenuResource = () => {
        loadedImages = menuResourcesLoaded + menuResourcesFailed;
        failedImages = menuResourcesFailed;
        updateProgress();

        if (menuResourcesLoaded + menuResourcesFailed === menuResourceCount) {
            menuImagesLoadComplete = true;
            checkMenuLoadComplete();
        }
    };

    const trackedTag = (tag) => tag === MENU_TAG || tag === FONT_TAG;

    for (let i = 0, len = resources.length; i < len; i++) {
        const { url, tag, resId } = resources[i];
        loadImageAsset(url)
            .then((asset) => {
                if ((tag === FONT_TAG || tag === GAME_TAG) && resId !== null) {
                    ResourceMgr.onResourceLoaded(resId, asset);
                }

                if (trackedTag(tag)) {
                    menuResourcesLoaded++;
                }
            })
            .catch((error) => {
                window.console?.error?.("Failed to load image:", url, error);

                if (trackedTag(tag)) {
                    menuResourcesFailed++;
                }
            })
            .finally(() => {
                if (trackedTag(tag)) {
                    finalizeMenuResource();
                }
            });
    }

    if (menuResourceCount === 0) {
        menuImagesLoadComplete = true;
        checkMenuLoadComplete();
    }

    return {
        trackedResourceCount: menuResourceCount,
    };
};

const PreLoader = {
    init() {
        initializeResources();

        // start the loading animation images first
        if (LoadAnimation) {
            LoadAnimation.init();
        }
    },
    domReady() {
        if (LoadAnimation) {
            LoadAnimation.domReady();
            LoadAnimation.show();
        }

        // Wait for the loader background image to load before starting resource loading
        const betterLoader = document.getElementById("betterLoader");
        if (betterLoader) {
            const loaderStyle = window.getComputedStyle(betterLoader);
            const backgroundImage = loaderStyle.backgroundImage;

            // Extract URL from background-image CSS property
            const match = backgroundImage.match(/url\(["']?([^"']*)["']?\)/);
            if (match && match[1]) {
                const img = new Image();
                img.onload = function () {
                    // Start loading resources after loader image is ready
                    startResourceLoading();
                };
                img.onerror = function () {
                    // Start anyway if image fails to load
                    startResourceLoading();
                };
                img.src = match[1];
            } else {
                // No background image found, start immediately
                startResourceLoading();
            }
        } else {
            // No loader element, start immediately
            startResourceLoading();
        }
    },
    run(onComplete) {
        completeCallback = onComplete;
        checkMenuLoadComplete();
    },
};

const startResourceLoading = function () {
    // Set initial total resources for JSON loading only
    totalResources = JsonLoader.getJsonFileCount();

    // Track JSON loading progress
    JsonLoader.onProgress(function (completed) {
        loadedJsonFiles = completed;
        updateProgress();
    });

    // Load JSON first, then start loading images and sounds
    JsonLoader.onMenuComplete(function () {
        menuJsonLoadComplete = true;

        // Now that JSON is loaded, start loading images and sounds
        const { trackedResourceCount } = loadImages();

        // Update total resources to include images and sounds
        totalResources =
            trackedResourceCount + SoundLoader.getSoundCount() + JsonLoader.getJsonFileCount();

        // Track sound loading progress
        SoundLoader.onProgress(function (completed) {
            loadedSounds = completed;
            updateProgress();
        });

        SoundLoader.onMenuComplete(function () {
            menuSoundLoadComplete = true;
            checkMenuLoadComplete();
        });

        SoundLoader.start();
    });

    // Start JSON loading first
    JsonLoader.start();
};

export default PreLoader;
