import platform from "@/platform";
import edition from "@/edition";
import resData from "@/resources/ResData";
import Sounds from "@/resources/Sounds";
import { getAudioContext } from "@/utils/audioContext";
import { soundRegistry } from "@/utils/soundRegistry";

const decodeAudioBuffer = (context, arrayBuffer) => {
    return new Promise((resolve, reject) => {
        let decodePromise;

        try {
            decodePromise = context.decodeAudioData(
                arrayBuffer,
                (buffer) => resolve(buffer),
                (error) => reject(error)
            );
        } catch (error) {
            reject(error);
            return;
        }

        if (decodePromise && typeof decodePromise.then === "function") {
            decodePromise.then(resolve).catch(reject);
        }
    });
};

const completeListeners = [],
    progressListeners = [];
let startRequested = false,
    soundManagerReady = false,
    hasStartedLoading = false,
    currentCompleted = 0,
    currentFailed = 0,
    currentTotal = 0;
const startIfReady = function () {
    // ensure start was requested, we are ready, and we haven't already started
    if (!startRequested || !soundManagerReady || hasStartedLoading) {
        return;
    }

    hasStartedLoading = true;

    const baseUrl = platform.audioBaseUrl;
    const extension = platform.getAudioExtension();
    const context = getAudioContext();

    const soundIds = [];

    for (let i = 0; i < edition.menuSoundIds.length; i++) {
        soundIds.push({ id: edition.menuSoundIds[i], tag: "MENU" });
    }

    for (let i = 0; i < edition.gameSoundIds.length; i++) {
        soundIds.push({ id: edition.gameSoundIds[i], tag: "GAME" });
    }

    currentTotal = soundIds.length;
    currentCompleted = 0;

    const notifyProgress = () => {
        for (let i = 0, len = progressListeners.length; i < len; i++) {
            try {
                progressListeners[i](currentCompleted, currentTotal);
            } catch (error) {
                window.console?.error?.("Sound progress listener failed", error);
            }
        }
    };

    const notifyComplete = () => {
        for (let i = 0, len = completeListeners.length; i < len; i++) {
            try {
                completeListeners[i]();
            } catch (error) {
                window.console?.error?.("Sound completion listener failed", error);
            }
        }
    };

    if (!context || currentTotal === 0) {
        currentCompleted = currentTotal;
        notifyProgress();
        notifyComplete();
        return;
    }

    const loadSound = async (soundDescriptor) => {
        const soundId = soundDescriptor.id;
        const resource = resData[soundId];
        if (!resource) {
            throw new Error(`Resource not found for sound ID: ${soundId}`);
        }

        const soundKey = `s${soundId}`;
        const soundUrl = baseUrl + resource.path + extension;

        const response = await fetch(soundUrl);

        if (!response.ok) {
            throw new Error(`Failed to load audio: ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await decodeAudioBuffer(context, arrayBuffer);

        const gainNode = context.createGain();
        gainNode.connect(context.destination);

        soundRegistry.set(soundKey, {
            buffer: audioBuffer,
            gainNode,
            playingSources: new Set(),
            isPaused: false,
            volume: 1,
        });
    };

    Promise.all(
        soundIds.map((descriptor) =>
            loadSound(descriptor)
                .then(() => {
                    currentCompleted++;
                    notifyProgress();
                })
                .catch((error) => {
                    currentFailed++;
                    window.console?.error?.("Failed to load audio", descriptor.id, error);
                    notifyProgress();
                })
        )
    ).finally(() => {
        if (currentFailed > 0) {
            window.console?.warn?.(
                `Sound loading completed with ${currentFailed} failure(s) out of ${currentTotal} total`
            );
        }
        notifyComplete();
    });
};

const SoundLoader = {
    start() {
        startRequested = true;
        startIfReady();
    },
    onMenuComplete(callback) {
        completeListeners.push(callback);
    },
    onProgress(callback) {
        progressListeners.push(callback);
        if (currentTotal > 0) {
            try {
                callback(currentCompleted, currentTotal);
            } catch (error) {
                window.console?.error?.("Sound progress listener failed", error);
            }
        }
    },
    getSoundCount() {
        return edition.menuSoundIds.length + edition.gameSoundIds.length;
    },
};

Sounds.onReady(function () {
    soundManagerReady = true;
    startIfReady();
});

export default SoundLoader;
