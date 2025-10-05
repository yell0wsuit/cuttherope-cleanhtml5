import platform from "@/platform";
import edition from "@/edition";
import resData from "@/resources/ResData";
import Sounds from "@/resources/Sounds";
import PxLoader from "@/PxLoader";
import PxLoaderSound from "@/PxLoaderSound";
let completeListeners = [],
    startRequested = false,
    soundManagerReady = false,
    startIfReady = function () {
        // ensure start was requested and we are ready
        if (!startRequested || !soundManagerReady) {
            return;
        }

        let pxLoader = new PxLoader({ noProgressTimeout: 30 * 1000 }), // stop waiting after 30 secs
            baseUrl = platform.audioBaseUrl,
            extension = platform.getAudioExtension(),
            MENU_TAG = "MENU",
            i,
            len,
            soundId,
            soundUrl;

        // menu sounds first
        for (i = 0, len = edition.menuSoundIds.length; i < len; i++) {
            soundId = edition.menuSoundIds[i];
            soundUrl = baseUrl + resData[soundId].path + extension;

            // SoundManager2 wants a sound id which a char prefix
            pxLoader.addSound("s" + soundId, soundUrl, MENU_TAG);
        }

        // now game sounds
        for (i = 0, len = edition.gameSoundIds.length; i < len; i++) {
            soundId = edition.gameSoundIds[i];
            soundUrl = baseUrl + resData[soundId].path + extension;

            // SoundManager2 wants a sound id which a char prefix
            pxLoader.addSound("s" + soundId, soundUrl);
        }

        // wait for all sounds before showing main menu
        pxLoader.addCompletionListener(function () {
            for (let i = 0, len = completeListeners.length; i < len; i++) {
                completeListeners[i]();
            }
        });

        pxLoader.start();
    };

const SoundLoader = {
    start: function () {
        startRequested = true;
        startIfReady();
    },
    onMenuComplete: function (callback) {
        completeListeners.push(callback);
    },
};

Sounds.onReady(function () {
    soundManagerReady = true;
    startIfReady();
});

export default SoundLoader;
