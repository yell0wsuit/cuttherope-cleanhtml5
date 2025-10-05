import platform from "@/platform";
import edition from "@/edition";
import editionUI from "@/editionUI";
import resolution from "@/resolution";
import resData from "@/resources/ResData";
import SoundLoader from "@/resources/SoundLoader";
import PxLoader from "@/PxLoader";
import PxLoaderImage from "@/PxLoaderImage";
import LoadAnimation from "@/LoadAnimation";
import ResourceMgr from "@/resources/ResourceMgr";
import ResourcePacks from "@/resources/ResourcePacks";
let menuImagesLoadComplete = false,
    menuSoundLoadComplete = false,
    completeCallback = null,
    checkMenuLoadComplete = function () {
        if (!menuImagesLoadComplete || !menuSoundLoadComplete) {
            return;
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

const loadImages = function () {
    let pxLoader = new PxLoader({ noProgressTimeout: 30 * 1000 }), // stop waiting after 30 secs
        gameBaseUrl = platform.imageBaseUrl + resolution.CANVAS_WIDTH + "/game/",
        MENU_TAG = "MENU",
        FONT_TAG = "FONT",
        GAME_TAG = "GAME",
        i,
        len,
        imageUrl;

    // first menu images
    const queueMenuImages = function (imageFilenames, menuBaseUrl) {
        if (!imageFilenames) {
            return;
        }

        menuBaseUrl = menuBaseUrl || platform.uiImageBaseUrl;
        for (i = 0, len = imageFilenames.length; i < len; i++) {
            if (!imageFilenames[i]) {
                continue;
            }
            imageUrl = menuBaseUrl + imageFilenames[i];
            pxLoader.addImage(imageUrl, MENU_TAG);
        }
    };

    // queue page images first, the game can wait (we have a load animation)
    const passwordPath = platform.imageBaseUrl + (editionUI.passwordDirectory || "");
    queueMenuImages(editionUI.passwordImageNames, passwordPath);

    const passwordResolutionPath = platform.resolutionBaseUrl + (editionUI.passwordResolutionDirectory || "");
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

    // only report progress on the menu images and fonts
    pxLoader.addProgressListener(
        function (e) {
            const p = 100 * (e.completedCount / e.totalCount);
            if (LoadAnimation) {
                LoadAnimation.notifyLoadProgress(p);
            }

            if (e.completedCount === e.totalCount) {
                menuImagesLoadComplete = true;
                checkMenuLoadComplete();
            }
        },
        [MENU_TAG, FONT_TAG]
    );

    // next fonts and game images
    const queueForResMgr = function (ids, tag) {
        let i, len, imageId;
        for (i = 0, len = ids.length; i < len; i++) {
            imageId = ids[i];
            const pxImage = new PxLoaderImage(gameBaseUrl + resData[imageId].path, tag);

            // add the resId so we can find it upon completion
            pxImage.resId = imageId;
            pxLoader.add(pxImage);
        }
    };
    queueForResMgr(ResourcePacks.StandardFonts, FONT_TAG);
    queueForResMgr(edition.gameImageIds, GAME_TAG);
    queueForResMgr(edition.levelBackgroundIds, GAME_TAG);
    queueForResMgr(edition.levelOverlayIds, GAME_TAG);

    // tell the resource manager about game images and fonts
    pxLoader.addProgressListener(
        function (e) {
            ResourceMgr.onResourceLoaded(e.resource.resId, e.resource.img);
        },
        [FONT_TAG, GAME_TAG]
    );

    pxLoader.start();
};

const PreLoader = {
    init: function () {
        ResourceMgr.init();

        // start the loading animation images first
        if (LoadAnimation) {
            LoadAnimation.init();
        }

        // next start the images
        loadImages();

        // now start the sounds
        SoundLoader.onMenuComplete(function () {
            menuSoundLoadComplete = true;
            checkMenuLoadComplete();
        });
        SoundLoader.start();
    },
    domReady: function () {
        if (LoadAnimation) {
            LoadAnimation.domReady();
            LoadAnimation.show();
        }
    },
    run: function (onComplete) {
        completeCallback = onComplete;
        checkMenuLoadComplete();
    },
};

export default PreLoader;
