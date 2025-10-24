import { getAudioContext, resumeAudioContext } from "@/utils/audioContext";
import { soundRegistry } from "@/utils/soundRegistry";

const getSoundData = (soundId) => {
    const id = `s${soundId}`;
    const soundData = soundRegistry.get(id);

    if (!soundData || !soundData.buffer) {
        window.console?.error?.("Sound not loaded", soundId);
        return null;
    }

    return soundData;
};

const stopSources = (soundData, shouldInvokeCallback = false, predicate = null) => {
    if (!soundData) return 0;

    const sources = Array.from(soundData.playingSources);
    let stoppedCount = 0;

    if (!predicate) {
        soundData.playingSources.clear();
    }

    for (const source of sources) {
        if (predicate && !predicate(source)) {
            continue;
        }

        stoppedCount += 1;

        if (predicate) {
            soundData.playingSources.delete(source);
        }

        const callback = shouldInvokeCallback ? source.__onComplete : null;

        source.__skipOnEnd = true;
        source.__onComplete = null;
        source.onended = null;

        try {
            source.stop();
        } catch (error) {
            window.console?.warn?.("Failed to stop audio source", error);
        }

        try {
            source.disconnect();
        } catch (error) {
            window.console?.warn?.("Failed to disconnect audio source", error);
        }

        if (typeof callback === "function") {
            try {
                callback();
            } catch (error) {
                window.console?.error?.("Sound completion callback failed", error);
            }
        }
    }

    return stoppedCount;
};

const calculateResumeOffset = (soundData) => {
    if (!soundData || soundData.playingSources.size === 0) {
        return soundData?.resumeOffset ?? 0;
    }

    const context = getAudioContext();
    if (!context) {
        return soundData.resumeOffset ?? 0;
    }

    const source = soundData.playingSources.values().next().value;

    if (!source || typeof source.__startedAt !== "number") {
        return soundData.resumeOffset ?? 0;
    }

    const elapsed = Math.max(0, context.currentTime - source.__startedAt);
    const baseOffset = source.__startOffset || 0;
    const duration = soundData.buffer?.duration || 0;
    const totalOffset = baseOffset + elapsed;

    if (duration > 0) {
        return totalOffset % duration;
    }

    return totalOffset;
};

// export a singleton which manages audio using the Web Audio API
const Sounds = {
    onReady(callback) {
        callback();
    },
    play(soundId, onComplete, options = {}) {
        const soundData = getSoundData(soundId);
        if (!soundData) return;

        const context = resumeAudioContext();
        if (!context) {
            window.console?.warn?.("AudioContext not available for sound", soundId);
            return;
        }

        const source = context.createBufferSource();
        source.buffer = soundData.buffer;
        source.__skipOnEnd = false;
        source.__onComplete = onComplete;

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
            window.console?.warn?.("Failed to connect audio source", error);

            if (typeof source.__onComplete === "function") {
                try {
                    source.__onComplete();
                } catch (callbackError) {
                    window.console?.error?.("Sound completion callback failed", callbackError);
                }
            }

            source.__onComplete = null;
            return;
        }

        source.onended = () => {
            try {
                source.disconnect();
            } catch (e) {
                console.log(`source.onended error: ${e}`);
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
                    window.console?.error?.("Sound completion callback failed", error);
                }
            }
        };

        soundData.playingSources.add(source);
        soundData.isPaused = false;
        soundData.resumeOffset = offset;

        try {
            source.start(0, offset);
        } catch (error) {
            window.console?.error?.("Failed to start audio source", error);
            soundData.playingSources.delete(source);
            soundData.resumeOffset = 0;

            const callback = source.__onComplete;
            source.__onComplete = null;
            source.onended = null;

            try {
                source.disconnect();
            } catch (disconnectError) {
                window.console?.warn?.("Failed to disconnect audio source", disconnectError);
            }

            // Invoke callback to prevent caller from waiting indefinitely
            if (typeof callback === "function") {
                try {
                    callback();
                } catch (callbackError) {
                    window.console?.error?.("Sound completion callback failed", callbackError);
                }
            }
        }
    },
    isPlaying(soundId) {
        const soundData = getSoundData(soundId);
        if (!soundData) return false;

        return soundData.playingSources.size > 0;
    },
    isPaused(soundId) {
        const soundData = getSoundData(soundId);
        if (!soundData) return false;

        return soundData.isPaused && soundData.playingSources.size === 0;
    },
    pause(soundId) {
        const soundData = getSoundData(soundId);
        if (!soundData) return;

        soundData.resumeOffset = calculateResumeOffset(soundData);
        stopSources(soundData, false);
        soundData.isPaused = true;
    },
    stop(soundId) {
        const soundData = getSoundData(soundId);
        if (!soundData) return;

        stopSources(soundData, false);
        soundData.isPaused = false;
        soundData.resumeOffset = 0;
    },
    stopInstance(soundId, instanceId) {
        if (!instanceId) return;

        const soundData = getSoundData(soundId);
        if (!soundData) return;

        const stoppedCount = stopSources(
            soundData,
            false,
            (source) => source.__instanceId === instanceId
        );

        if (stoppedCount > 0 && soundData.playingSources.size === 0) {
            soundData.isPaused = false;
            soundData.resumeOffset = 0;
        }
    },
    getResumeOffset(soundId) {
        const soundData = getSoundData(soundId);
        if (!soundData) return 0;

        return soundData.resumeOffset || 0;
    },
    setVolume(soundId, percent) {
        const soundData = getSoundData(soundId);
        if (!soundData) return;

        // volume validation
        const clampedPercent = Math.max(0, Math.min(100, percent));
        const volume = clampedPercent / 100;

        soundData.volume = volume;
        soundData.gainNode.gain.value = volume;
    },
};

export default Sounds;
