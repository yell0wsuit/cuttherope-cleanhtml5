import { getAudioContext, resumeAudioContext } from "@/utils/audioContext";
import { soundRegistry } from "@/utils/soundRegistry";

/**
 * @typedef {object} SoundSource
 * @property {AudioBufferSourceNode} [node]
 * @property {boolean} [__skipOnEnd]
 * @property {(() => void) | null} [__onComplete]
 * @property {number} [__startedAt]
 * @property {number} [__startOffset]
 * @property {string | null} [__instanceId]
 */

/**
 * @typedef {object} SoundData
 * @property {AudioBuffer} buffer
 * @property {GainNode} gainNode
 * @property {Set<AudioBufferSourceNode & SoundSource>} playingSources
 * @property {boolean} [isPaused]
 * @property {number} [volume]
 * @property {number} [resumeOffset]
 */

/**
 * @typedef {object} PlayOptions
 * @property {number} [offset] - Playback start offset (seconds)
 * @property {string} [instanceId] - Optional unique instance identifier
 */

/**
 * SoundManager — manages playback of pre-decoded Web Audio buffers.
 * Wraps soundRegistry entries with unified lifecycle control (play, pause, stop, etc.)
 */
class SoundManager {
    constructor() {}

    /**
     * Retrieve the sound data by sound ID.
     * @param {number | string} soundId
     * @returns {SoundData | null}
     */
    getSoundData(soundId) {
        const id = `s${soundId}`;
        const soundData = soundRegistry.get(id);
        if (!soundData || !soundData.buffer) {
            console.error("Sound not loaded", soundId);
            return null;
        }
        return soundData;
    }

    /**
     * Stops currently playing sources for a given sound.
     * @param {SoundData} soundData
     * @param {boolean} [shouldInvokeCallback=false]
     * @param {(source: AudioBufferSourceNode & SoundSource) => boolean} [predicate]
     * @returns {number} number of stopped sources
     */
    stopSources(soundData, shouldInvokeCallback = false, predicate) {
        if (!soundData) return 0;
        const sources = Array.from(soundData.playingSources);
        let stoppedCount = 0;

        if (!predicate) soundData.playingSources.clear();

        for (const source of sources) {
            if (predicate && !predicate(source)) continue;
            stoppedCount++;
            if (predicate) soundData.playingSources.delete(source);

            const callback = shouldInvokeCallback ? source.__onComplete : null;
            source.__skipOnEnd = true;
            source.__onComplete = null;
            source.onended = null;

            try {
                source.stop();
            } catch (error) {
                console.warn("Failed to stop audio source", error);
            }
            try {
                source.disconnect();
            } catch (error) {
                console.warn("Failed to disconnect audio source", error);
            }

            if (typeof callback === "function") {
                try {
                    callback();
                } catch (error) {
                    console.error("Sound completion callback failed", error);
                }
            }
        }

        return stoppedCount;
    }

    /**
     * Calculates playback resume offset.
     * @param {SoundData} soundData
     * @returns {number}
     */
    calculateResumeOffset(soundData) {
        if (!soundData || soundData.playingSources.size === 0) return soundData?.resumeOffset ?? 0;

        const context = getAudioContext();
        if (!context) return soundData.resumeOffset ?? 0;

        const source = soundData.playingSources.values().next().value;
        if (!source || typeof source.__startedAt !== "number") return soundData.resumeOffset ?? 0;

        const elapsed = Math.max(0, context.currentTime - source.__startedAt);
        const baseOffset = source.__startOffset || 0;
        const duration = soundData.buffer?.duration || 0;
        const totalOffset = baseOffset + elapsed;

        return duration > 0 ? totalOffset % duration : totalOffset;
    }

    /**
     * Runs a callback when the sound system is ready.
     * @param {() => void} callback
     */
    onReady(callback) {
        if (typeof callback === "function") callback();
    }

    /**
     * Plays a sound buffer.
     * @param {number | string} soundId
     * @param {(() => void)=} onComplete
     * @param {PlayOptions=} options
     */
    play(soundId, onComplete, options = {}) {
        const soundData = this.getSoundData(soundId);
        if (!soundData) return;

        const context = resumeAudioContext();
        if (!context) {
            console.warn("AudioContext not available for sound", soundId);
            return;
        }

        /** @type {AudioBufferSourceNode & SoundSource} */
        const source = context.createBufferSource();
        source.buffer = soundData.buffer;
        source.__skipOnEnd = false;
        source.__onComplete = onComplete || null;

        const duration = soundData.buffer?.duration || 0;
        const rawOffset = Math.max(0, options.offset || 0);
        const instanceId = options.instanceId || null;
        const offset =
            duration > 0
                ? Math.min(rawOffset % duration, Math.max(0, duration - 0.0001))
                : rawOffset;

        source.__startOffset = offset;
        source.__startedAt = context.currentTime;
        source.__instanceId = instanceId;

        try {
            source.connect(soundData.gainNode);
        } catch (error) {
            console.warn("Failed to connect audio source", error);
            this.#safeInvokeCallback(source);
            return;
        }

        source.onended = () => {
            try {
                source.disconnect();
            } catch (e) {
                console.warn("source.onended error:", e);
            }

            soundData.playingSources.delete(source);
            if (!source.__skipOnEnd) {
                soundData.resumeOffset = 0;
                soundData.isPaused = false;
            }

            if (!source.__skipOnEnd && typeof source.__onComplete === "function") {
                try {
                    source.__onComplete();
                } catch (error) {
                    console.error("Sound completion callback failed", error);
                }
            }
        };

        soundData.playingSources.add(source);
        soundData.isPaused = false;
        soundData.resumeOffset = offset;

        try {
            source.start(0, offset);
        } catch (error) {
            console.error("Failed to start audio source", error);
            soundData.playingSources.delete(source);
            soundData.resumeOffset = 0;
            this.#safeInvokeCallback(source, /** @type {Error} */ (error));
        }
    }

    /**
     * Safely invokes completion callback for a source.
     * @param {AudioBufferSourceNode & SoundSource} source
     * @param {Error | null} [error]
     */
    #safeInvokeCallback(source, error = null) {
        const callback = source.__onComplete;
        source.__onComplete = null;
        source.onended = null;

        try {
            source.disconnect();
        } catch (disconnectError) {
            console.warn("Failed to disconnect audio source", disconnectError);
        }

        if (typeof callback === "function") {
            try {
                callback();
            } catch (callbackError) {
                console.error("Sound completion callback failed", callbackError);
            }
        }
    }

    /**
     * @param {number | string} soundId
     * @returns {boolean}
     */
    isPlaying(soundId) {
        const soundData = this.getSoundData(soundId);
        return !!(soundData && soundData.playingSources.size > 0);
    }

    /**
     * @param {number | string} soundId
     * @returns {boolean}
     */
    isPaused(soundId) {
        const soundData = this.getSoundData(soundId);
        return !!(soundData && soundData.isPaused && soundData.playingSources.size === 0);
    }

    /**
     * Pauses playback and stores current offset.
     * @param {number | string} soundId
     */
    pause(soundId) {
        const soundData = this.getSoundData(soundId);
        if (!soundData) return;

        soundData.resumeOffset = this.calculateResumeOffset(soundData);
        this.stopSources(soundData, false);
        soundData.isPaused = true;
    }

    /**
     * Stops all active instances of a sound.
     * @param {number | string} soundId
     */
    stop(soundId) {
        const soundData = this.getSoundData(soundId);
        if (!soundData) return;

        this.stopSources(soundData, false);
        soundData.isPaused = false;
        soundData.resumeOffset = 0;
    }

    /**
     * Stops only a specific sound instance by its ID.
     * @param {number | string} soundId
     * @param {string} instanceId
     */
    stopInstance(soundId, instanceId) {
        if (!instanceId) return;
        const soundData = this.getSoundData(soundId);
        if (!soundData) return;

        const stoppedCount = this.stopSources(
            soundData,
            false,
            (source) => source.__instanceId === instanceId
        );

        if (stoppedCount > 0 && soundData.playingSources.size === 0) {
            soundData.isPaused = false;
            soundData.resumeOffset = 0;
        }
    }

    /**
     * Gets the last resume offset for a sound.
     * @param {number | string} soundId
     * @returns {number}
     */
    getResumeOffset(soundId) {
        const soundData = this.getSoundData(soundId);
        return soundData?.resumeOffset || 0;
    }

    /**
     * Sets volume for a given sound.
     * @param {number | string} soundId
     * @param {number} percent - Volume in range [0–100]
     */
    setVolume(soundId, percent) {
        const soundData = this.getSoundData(soundId);
        if (!soundData) return;

        const clampedPercent = Math.max(0, Math.min(100, percent));
        const volume = clampedPercent / 100;
        soundData.volume = volume;
        soundData.gainNode.gain.value = volume;
    }
}

// Export singleton instance
const Sounds = new SoundManager();
export default Sounds;
