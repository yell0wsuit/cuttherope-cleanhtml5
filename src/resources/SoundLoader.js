import platform from "@/config/platforms/platform-web";
import edition from "@/config/editions/net-edition";
import resData from "@/resources/ResData";
import Sounds from "@/resources/Sounds";
import { getAudioContext } from "@/utils/audioContext";
import { soundRegistry } from "@/utils/soundRegistry";

/**
 * @param {BaseAudioContext} context
 * @param {ArrayBuffer} arrayBuffer
 * @returns {Promise<AudioBuffer>}
 */
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

class SoundLoader {
    constructor() {
        /** @type {(() => void)[]} */
        this.completeListeners = [];
        /** @type {((completed: number, total: number) => void)[]} */
        this.progressListeners = [];

        this.startRequested = false;
        this.soundManagerReady = false;
        this.hasStartedLoading = false;
        this.currentCompleted = 0;
        this.currentFailed = 0;
        this.currentTotal = 0;

        // Bind `startIfReady` so it keeps correct `this`
        this.startIfReady = this.startIfReady.bind(this);

        // Hook into Sounds readiness
        Sounds.onReady(() => {
            this.soundManagerReady = true;
            this.startIfReady();
        });
    }

    start() {
        this.startRequested = true;
        this.startIfReady();
    }

    /**
     * @param {{ (): void; (): void; }} callback
     */
    onMenuComplete(callback) {
        this.completeListeners.push(callback);
    }

    /**
     * @param {{ (completed: number): void; (completed: number, total: number): void; }} callback
     */
    onProgress(callback) {
        this.progressListeners.push(callback);
        if (this.currentTotal > 0) {
            try {
                callback(this.currentCompleted, this.currentTotal);
            } catch (error) {
                window.console?.error?.("Sound progress listener failed", error);
            }
        }
    }

    getSoundCount() {
        return edition.menuSoundIds.length + edition.gameSoundIds.length;
    }

    async startIfReady() {
        if (!this.startRequested || !this.soundManagerReady || this.hasStartedLoading) {
            return;
        }

        this.hasStartedLoading = true;

        const baseUrl = platform.audioBaseUrl;
        const extension = platform.getAudioExtension();
        const context = getAudioContext();

        const soundIds = [
            ...edition.menuSoundIds.map((id) => ({ id, tag: "MENU" })),
            ...edition.gameSoundIds.map((id) => ({ id, tag: "GAME" })),
        ];

        this.currentTotal = soundIds.length;
        this.currentCompleted = 0;

        const notifyProgress = () => {
            for (const listener of this.progressListeners) {
                try {
                    listener(this.currentCompleted, this.currentTotal);
                } catch (error) {
                    window.console?.error?.("Sound progress listener failed", error);
                }
            }
        };

        const notifyComplete = () => {
            for (const listener of this.completeListeners) {
                try {
                    listener();
                } catch (error) {
                    window.console?.error?.("Sound completion listener failed", error);
                }
            }
        };

        if (!context || this.currentTotal === 0) {
            this.currentCompleted = this.currentTotal;
            notifyProgress();
            notifyComplete();
            return;
        }

        /**
         * @param {{ id: number }} param0
         */
        const loadSound = async ({ id }) => {
            const resource = resData[id];
            if (!resource) throw new Error(`Resource not found for sound ID: ${id}`);

            const soundKey = `s${id}`;
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

        await Promise.all(
            soundIds.map((desc) =>
                loadSound(desc)
                    .then(() => {
                        this.currentCompleted++;
                        notifyProgress();
                    })
                    .catch((error) => {
                        this.currentFailed++;
                        window.console?.error?.("Failed to load audio", desc.id, error);
                        notifyProgress();
                    })
            )
        );

        if (this.currentFailed > 0) {
            window.console?.warn?.(
                `Sound loading completed with ${this.currentFailed} failure(s) out of ${this.currentTotal} total`
            );
        }

        notifyComplete();
    }
}

// Export a singleton instance
export default new SoundLoader();
