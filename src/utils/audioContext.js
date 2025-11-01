let cachedAudioContext = null;

export function getAudioContext() {
    if (cachedAudioContext) {
        return cachedAudioContext;
    }

    if (typeof window === "undefined") {
        return null;
    }

    if (window.audioContext__) {
        cachedAudioContext = window.audioContext__;
        return cachedAudioContext;
    }

    const AudioContextClass = window.AudioContext;

    if (!AudioContextClass) {
        return null;
    }

    cachedAudioContext = new AudioContextClass();
    window.audioContext__ = cachedAudioContext;

    return cachedAudioContext;
}

export function resumeAudioContext() {
    const context = getAudioContext();

    if (context && context.state === "suspended" && typeof context.resume === "function") {
        context.resume().catch(() => {});
    }

    return context;
}
