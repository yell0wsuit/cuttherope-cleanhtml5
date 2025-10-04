define("resources/Sounds", ["platform", "utils/Log"], function (platform, Log) {
    // export a singleton which manages audio using SoundManager2
    const Sounds = {
        onReady: function (callback) {
            callback();
        },
        play: function (soundId, onComplete) {
            let sound = window.sounds__["s" + soundId];
            const id = "s" + soundId;

            // choose and create a backup sound
            if (!sound.paused) {
                // lazy clone it
                if (!window.backupSounds__[id]) {
                    window.backupSounds__[id] = window.sounds__[id].cloneNode();
                    window.backupSounds__[id].mozAudioChannelType = "content";
                }

                sound = window.backupSounds__[id];
            }

            sound["addEventListener"](
                "ended",
                function onendcb() {
                    sound["removeEventListener"]("ended", onendcb);
                    if (onComplete) {
                        onComplete();
                    }
                },
                false
            );
            sound["play"]();
        },
        isPlaying: function (soundId) {
            const sound = window.sounds__["s" + soundId];
            return !sound["paused"];
        },
        isPaused: function (soundId) {
            const sound = window.sounds__["s" + soundId];
            return sound["paused"];
        },
        pause: function (soundId) {
            const sound = window.sounds__["s" + soundId];
            sound["pause"]();
        },
        stop: function (soundId) {
            const sound = window.sounds__["s" + soundId];
            sound["pause"]();
            try {
                sound["currentTime"] = sound["initialTime"];
            } catch (e) {}
        },
        setVolume: function (soundId, percent) {
            const sound = window.sounds__["s" + soundId];
            sound["volume"] = percent / 100;
        },
    };

    return Sounds;
});
