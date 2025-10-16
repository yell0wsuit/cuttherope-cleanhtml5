import platform from "@/platform";
import edition from "@/edition";
import editionUI from "@/editionUI";
import resolution from "@/resolution";
import resData from "@/resources/ResData";
import SoundLoader from "@/resources/SoundLoader";
import LoadAnimation from "@/LoadAnimation";
import ResourceMgr from "@/resources/ResourceMgr";
import ResourcePacks from "@/resources/ResourcePacks";
import PubSub from "@/utils/PubSub";

let menuImagesLoadComplete = false,
    menuSoundLoadComplete = false,
    completeCallback = null,
    totalResources = 0,
    loadedImages = 0,
    loadedSounds = 0,
    failedImages = 0,
    failedSounds = 0,
    checkMenuLoadComplete = function () {
        if (!menuImagesLoadComplete || !menuSoundLoadComplete) {
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
    },
    updateProgress = function () {
        if (totalResources === 0) return;
        const progress = ((loadedImages + loadedSounds) / totalResources) * 100;
        PubSub.publish(PubSub.ChannelId.PreloaderProgress, { progress: progress });

        if (LoadAnimation) {
            LoadAnimation.notifyLoadProgress(progress);
        }
    };

const MENU_TAG = "MENU";
const FONT_TAG = "FONT";
const GAME_TAG = "GAME";

const loadImageElement = (url) => {
    return new Promise((resolve) => {
        const img = new Image();

        const cleanup = () => {
            img.removeEventListener("load", onLoad);
            img.removeEventListener("error", onError);
        };

        const onLoad = () => {
            cleanup();
            resolve({ success: true, img });
        };

        const onError = () => {
            cleanup();
            resolve({ success: false, img: null });
        };

        img.addEventListener("load", onLoad);
        img.addEventListener("error", onError);
        img.src = url;
    });
};

const loadJson = (url) => {
    return fetch(url).then((response) => {
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        return response.json();
    });
};

const loadImages = function () {
    const gameBaseUrl = platform.imageBaseUrl + resolution.CANVAS_WIDTH + "/game/";

    let menuResourceCount = 0;
    let menuResourcesLoaded = 0;
    let menuResourcesFailed = 0;

    const queueResource = (url, tag, resId = null) => {
        if (!url) {
            return;
        }

        if (tag === MENU_TAG || tag === FONT_TAG) {
            menuResourceCount++;
        }

        loadImageElement(url).then((result) => {
            if (result.success) {
                if ((tag === FONT_TAG || tag === GAME_TAG) && resId !== null) {
                    ResourceMgr.onResourceLoaded(resId, result.img);
                }

                if (tag === MENU_TAG || tag === FONT_TAG) {
                    menuResourcesLoaded++;
                    loadedImages = menuResourcesLoaded;
                }
            } else {
                window.console?.error?.("Failed to load image:", url);

                if (tag === MENU_TAG || tag === FONT_TAG) {
                    menuResourcesFailed++;
                    failedImages = menuResourcesFailed;
                }
            }

            if (tag === MENU_TAG || tag === FONT_TAG) {
                updateProgress();

                if (menuResourcesLoaded + menuResourcesFailed === menuResourceCount) {
                    menuImagesLoadComplete = true;
                    checkMenuLoadComplete();
                }
            }
        });
    };

    const queueMenuImages = function (imageFilenames, menuBaseUrl) {
        if (!imageFilenames) {
            return;
        }

        menuBaseUrl = menuBaseUrl || platform.uiImageBaseUrl;
        for (let i = 0, len = imageFilenames.length; i < len; i++) {
            const filename = imageFilenames[i];
            if (!filename) {
                continue;
            }
            const imageUrl = menuBaseUrl + filename;
            queueResource(imageUrl, MENU_TAG);
        }
    };

    // queue page images first, the game can wait (we have a load animation)
    const passwordPath = platform.imageBaseUrl + (editionUI.passwordDirectory || "");
    queueMenuImages(editionUI.passwordImageNames, passwordPath);

    const passwordResolutionPath =
        platform.resolutionBaseUrl + (editionUI.passwordResolutionDirectory || "");
    queueMenuImages(editionUI.passwordResolutionImageNames, passwordResolutionPath);

    queueMenuImages(editionUI.pageImageNames, platform.imageBaseUrl + "page/");
    queueMenuImages(editionUI.pageResolutionImageNames, platform.resolutionBaseUrl + "page/");
    queueMenuImages(edition.menuImageFilenames);
    queueMenuImages(edition.boxImages, platform.boxImageBaseUrl);
    queueMenuImages(edition.boxBorders);
    queueMenuImages(edition.boxDoors);

    queueMenuImages(edition.drawingImageNames);

    const editionBaseUrl = platform.resolutionBaseUrl + (edition.editionImageDirectory || "");
    queueMenuImages(edition.editionImages, editionBaseUrl);

    const queueForResMgr = function (ids, tag) {
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
            queueResource(imageUrl, tag, imageId);

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

    if (menuResourceCount === 0) {
        menuImagesLoadComplete = true;
        checkMenuLoadComplete();
    }

    return {
        trackedResourceCount: menuResourceCount,
    };
};

const PreLoader = {
    init: function () {
        ResourceMgr.init();

        // start the loading animation images first
        if (LoadAnimation) {
            LoadAnimation.init();
        }
    },
    domReady: function () {
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
    run: function (onComplete) {
        completeCallback = onComplete;
        checkMenuLoadComplete();
    },
};

const startResourceLoading = function () {
    // Start loading images and get the count we track for progress
    const { trackedResourceCount } = loadImages();

    // Set total resources for progress calculation (menu images/fonts + sounds)
    totalResources = trackedResourceCount + SoundLoader.getSoundCount();

    // Track sound loading progress
    SoundLoader.onProgress(function (completed, total) {
        loadedSounds = completed;
        updateProgress();
    });

    SoundLoader.onMenuComplete(function () {
        menuSoundLoadComplete = true;
        checkMenuLoadComplete();
    });
    SoundLoader.start();
};

export default PreLoader;
