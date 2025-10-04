define("PxLoaderSound", ["PxLoader"], function (PxLoader) {
    window.sounds__ = {};
    window.backupSounds__ = {};

    /**
     * PxLoader plugin to load sound using SoundManager2
     */
    class PxLoaderSound {
        constructor(id, url, tags, priority) {
            var self = this,
                loader = null;

            this.tags = tags;
            this.priority = priority;
            this.sound = new Audio();
            this.sound.mozAudioChannelType = "content";

            window.sounds__[id] = this.sound;
            this.src = url;

            this.start = function (pxLoader) {
                // we need the loader ref so we can notify upon completion
                loader = pxLoader;

                self.sound["src"] = self.src;
                self.sound.mozAudioChannelType = "content";
                loader.onLoad(self);
            };

            this.checkStatus = function () {
                switch (self.sound["readyState"]) {
                    case 0: // uninitialised
                    case 1: // loading
                        break;
                    case 2: // failed/error
                        loader.onError(self);
                        break;
                    case 3: // loaded/success
                        loader.onLoad(self);
                        break;
                }
            };

            this.onTimeout = function () {
                loader.onTimeout(self);
            };

            this.getName = function () {
                return url;
            };
        }
    }

    // add a convenience method to PxLoader for adding a sound
    PxLoader.prototype.addSound = function (id, url, tags, priority) {
        var soundLoader = new PxLoaderSound(id, url, tags, priority);
        this.add(soundLoader);
        return soundLoader.sound;
    };

    return PxLoaderSound;
});
