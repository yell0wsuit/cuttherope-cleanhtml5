define("PxLoaderSound", ["PxLoader"], function (PxLoader) {
    window.sounds__ = {};
    window.backupSounds__ = {};

    /**
     * PxLoader plugin to load sound using Audio elements
     */
    class PxLoaderSound {
        constructor(id, url, tags, priority) {
            this.tags = tags;
            this.priority = priority;
            this.sound = new Audio();
            this.sound.mozAudioChannelType = "content";
            this.src = url;
            this.loader = null;

            window.sounds__[id] = this.sound;
        }

        start(pxLoader) {
            this.loader = pxLoader;

            this.sound.src = this.src;
            this.sound.mozAudioChannelType = "content";
            this.loader.onLoad(this);
        }

        checkStatus() {
            switch (this.sound.readyState) {
                case 0: // uninitialised
                case 1: // loading
                    break;
                case 2: // failed/error
                    this.loader.onError(this);
                    break;
                case 3: // loaded/success
                    this.loader.onLoad(this);
                    break;
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
        return soundLoader.sound;
    };

    return PxLoaderSound;
});
