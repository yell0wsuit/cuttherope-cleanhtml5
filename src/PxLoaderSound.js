import PxLoader from "@/PxLoader";
import { getAudioContext } from "@/utils/audioContext";

window.sounds__ = {};

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

/**
 * PxLoader plugin to load sound using the Web Audio API
 */
class PxLoaderSound {
    constructor(id, url, tags, priority) {
        this.id = id;
        this.src = url;
        this.tags = tags;
        this.priority = priority;
        this.loader = null;
        this.isReady = false;
        this.hasError = false;
        this.isLoading = false;
    }

    async start(pxLoader) {
        this.loader = pxLoader;
        this.isLoading = true;

        const context = getAudioContext();

        if (!context) {
            this.hasError = true;
            this.isLoading = false;
            this.loader.onError(this);
            return;
        }

        try {
            const response = await fetch(this.src);

            if (!response.ok) {
                throw new Error(`Failed to load audio: ${response.status} ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await decodeAudioBuffer(context, arrayBuffer);

            const gainNode = context.createGain();
            gainNode.connect(context.destination);

            window.sounds__[this.id] = {
                buffer: audioBuffer,
                gainNode,
                playingSources: new Set(),
                isPaused: false,
                volume: 1,
            };

            this.isReady = true;
        } catch (error) {
            window.console?.error?.(error);
            this.hasError = true;
        } finally {
            this.isLoading = false;
        }
    }

    cleanup() {
        const soundData = window.sounds__[this.id];
        if (soundData) {
            // Stop all playing sources
            for (const source of soundData.playingSources) {
                try {
                    source.stop();
                    source.disconnect();
                } catch (e) {}
            }
            soundData.playingSources.clear();

            // Disconnect gain node
            try {
                soundData.gainNode.disconnect();
            } catch (e) {}

            delete window.sounds__[this.id];
        }
    }

    checkStatus() {
        if (this.isLoading) {
            return; // Still loading, don't report anything yet
        }

        if (this.hasError) {
            this.loader.onError(this);
            return;
        }

        if (this.isReady) {
            this.loader.onLoad(this);
        }
    }

    onTimeout() {
        this.loader.onTimeout(this);
    }

    getName() {
        return this.src;
    }
}

// add a convenience method to PxLoader for adding a sound
PxLoader.prototype.addSound = function (id, url, tags, priority) {
    const soundLoader = new PxLoaderSound(id, url, tags, priority);
    this.add(soundLoader);
    return soundLoader;
};

export default PxLoaderSound;
