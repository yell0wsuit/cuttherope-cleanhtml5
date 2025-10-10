import { resumeAudioContext } from "@/utils/audioContext";

const getSoundData = (soundId) => {
    const id = "s" + soundId;
    const soundData = window.sounds__[id];

    if (!soundData || !soundData.buffer) {
        window.console?.error?.("Sound not loaded", soundId);
        return null;
    }

    return soundData;
};

const stopAllSources = (soundData, shouldInvokeCallback = false) => {
    if (!soundData) return;

    const sources = Array.from(soundData.playingSources);
    soundData.playingSources.clear();

    for (const source of sources) {
        const callback = shouldInvokeCallback ? source.__onComplete : null;

        source.__skipOnEnd = true;
        source.__onComplete = null;

        const disconnectSource = () => {
            try {
                source.disconnect();
            } catch (error) {
                window.console?.warn?.("Failed to disconnect audio source", error);
            }
        };

        source.onended = null;

        try {
            source.stop();
        } catch (error) {
            window.console?.warn?.("Failed to stop audio source", error);
        } finally {
            disconnectSource();
        }

        if (typeof callback === "function") {
            try {
                callback();
            } catch (error) {
                window.console?.error?.("Sound completion callback failed", error);
            }
        }
    }
};

// export a singleton which manages audio using the Web Audio API
const Sounds = {
    onReady: function (callback) {
        callback();
    },
    play: function (soundId, onComplete) {
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
            source.disconnect();
            soundData.playingSources.delete(source);

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

        try {
            source.start(0);
        } catch (error) {
            window.console?.error?.("Failed to start audio source", error);
            soundData.playingSources.delete(source);

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
    isPlaying: function (soundId) {
        const soundData = getSoundData(soundId);
        if (!soundData) return false;

        return soundData.playingSources.size > 0;
    },
    isPaused: function (soundId) {
        const soundData = getSoundData(soundId);
        if (!soundData) return false;

        return soundData.isPaused && soundData.playingSources.size === 0;
    },
    pause: function (soundId) {
        const soundData = getSoundData(soundId);
        if (!soundData) return;

        stopAllSources(soundData, false);
        soundData.isPaused = true;
    },
    stop: function (soundId) {
        const soundData = getSoundData(soundId);
        if (!soundData) return;

        stopAllSources(soundData, false);
        soundData.isPaused = false;
    },
    setVolume: function (soundId, percent) {
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
