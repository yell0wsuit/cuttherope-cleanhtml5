import settings from "@/game/CTRSettings";
import Sounds from "@/resources/Sounds";

const SoundMgr = {
    audioPaused: false,
    soundEnabled: settings.getSoundEnabled(),
    musicEnabled: settings.getMusicEnabled(),
    musicId: null,
    musicResumeOffset: 0,
    loopingSounds: new Map(), // Track looping sound state by instance
    _getActiveLoopSoundIds: function () {
        const soundIds = new Set();

        for (const entry of this.loopingSounds.values()) {
            if (entry?.active) {
                soundIds.add(entry.soundId);
            }
        }

        return soundIds;
    },
    _deactivateLoopEntry: function (instanceId, entry) {
        if (!entry) {
            return;
        }

        entry.active = false;

        if (entry.timeoutId) {
            clearTimeout(entry.timeoutId);
            entry.timeoutId = null;
        }

        this.loopingSounds.delete(instanceId);
    },

    playSound: function (soundId) {
        if (this.soundEnabled) {
            Sounds.play(soundId);
        }
    },

    pauseSound: function (soundId) {
        if (this.soundEnabled && Sounds.isPlaying(soundId)) {
            Sounds.pause(soundId);
        }
    },

    resumeSound: function (soundId) {
        if (this.soundEnabled && Sounds.isPaused(soundId)) {
            Sounds.play(soundId);
        }
    },

    /**
     * Play a sound that loops until explicitly stopped
     * Supports multiple concurrent instances
     *
     * @param {string} soundId - The sound resource ID
     * @param {string} instanceKey - Unique identifier for this loop instance (e.g., spark position or ID)
     * @param {number} delayMs - Optional delay before starting the loop (for staggered sounds)
     */
    playLoopedSound: function (soundId, instanceKey, delayMs = 0) {
        const self = this;

        if (!this.soundEnabled || this.audioPaused) {
            return;
        }

        // Use instanceKey if provided, otherwise generate unique ID
        const instanceId = instanceKey
            ? `${soundId}_${instanceKey}`
            : `${soundId}_${Date.now()}_${Math.random()}`;

        // Don't start if already playing
        if (this.loopingSounds.has(instanceId)) {
            return;
        }

        const loop = () => {
            const entry = self.loopingSounds.get(instanceId);
            if (!entry || !entry.active) {
                return;
            }

            if (!self.audioPaused && self.soundEnabled) {
                Sounds.play(soundId, loop, { instanceId });
            }
        };

        const entry = { active: true, loopFn: loop, soundId, timeoutId: null };
        this.loopingSounds.set(instanceId, entry);

        if (delayMs > 0) {
            entry.timeoutId = setTimeout(loop, delayMs);
        } else {
            loop();
        }
    },

    /**
     * Stop a specific looping instance
     *
     * @param {string} soundId - The sound resource ID
     * @param {string} instanceKey - The unique identifier for this instance
     */
    stopLoopedSoundInstance: function (soundId, instanceKey) {
        const instanceId = `${soundId}_${instanceKey}`;
        const entry = this.loopingSounds.get(instanceId);

        this._deactivateLoopEntry(instanceId, entry);

        Sounds.stopInstance(soundId, instanceId);

        // Only stop the sound completely if no other instances are playing
        let hasOtherInstances = false;
        for (const loopEntry of this.loopingSounds.values()) {
            if (loopEntry.soundId === soundId && loopEntry.active) {
                hasOtherInstances = true;
                break;
            }
        }

        if (!hasOtherInstances) {
            Sounds.stop(soundId);
        }
    },

    /**
     * Stop all looping instances of a sound
     */
    stopLoopedSound: function (soundId) {
        const matchingInstanceIds = [];

        for (const [instanceId, entry] of this.loopingSounds) {
            if (entry.soundId === soundId) {
                matchingInstanceIds.push(instanceId);
            }
        }

        for (const id of matchingInstanceIds) {
            const entry = this.loopingSounds.get(id);
            this._deactivateLoopEntry(id, entry);
        }

        Sounds.stop(soundId);
    },

    stopSound: function (soundId) {
        this.stopLoopedSound(soundId);
    },

    playMusic: function (soundId) {
        const previousMusicId = this.musicId;

        if (previousMusicId && previousMusicId !== soundId) {
            this.stopMusic();
        }

        this.musicId = soundId;

        const self = this;
        if (this.musicEnabled && !Sounds.isPlaying(soundId)) {
            const offset = this.musicResumeOffset || 0;
            this.musicResumeOffset = 0;
            Sounds.setVolume(soundId, 70);
            Sounds.play(
                soundId,
                function () {
                    if (!self.audioPaused && self.musicEnabled) {
                        self.musicResumeOffset = 0;
                        self.playMusic(soundId);
                    }
                },
                { offset }
            );
        }
    },

    pauseAudio: function () {
        if (this.audioPaused) return; // Don't pause if already paused

        this.audioPaused = true;
        this.pauseMusic();

        for (const soundId of this._getActiveLoopSoundIds()) {
            Sounds.pause(soundId);
        }
    },

    pauseMusic: function () {
        if (this.musicId && Sounds.isPlaying(this.musicId)) {
            Sounds.pause(this.musicId);
            this.musicResumeOffset = Sounds.getResumeOffset(this.musicId);
        }
    },

    resumeAudio: function () {
        if (!this.audioPaused) return;

        this.audioPaused = false;
        this.resumeMusic();

        // Restart each active loop instance exactly once
        if (this.soundEnabled) {
            for (const entry of this.loopingSounds.values()) {
                if (entry && entry.active) {
                    entry.loopFn();
                }
            }
        }
    },

    resumeMusic: function () {
        if (this.musicId && !Sounds.isPlaying(this.musicId)) {
            this.playMusic(this.musicId);
        }
    },

    stopMusic: function () {
        if (this.musicId) {
            Sounds.stop(this.musicId);
            this.musicResumeOffset = 0;
        }
    },

    setMusicEnabled: function (musicEnabled) {
        this.musicEnabled = musicEnabled;
        settings.setMusicEnabled(musicEnabled);
        if (this.musicEnabled) {
            this.resumeMusic();
        } else {
            this.pauseMusic();
        }
    },

    setSoundEnabled: function (soundEnabled) {
        this.soundEnabled = soundEnabled;
        settings.setSoundEnabled(soundEnabled);

        if (!soundEnabled) {
            const soundIds = Array.from(this._getActiveLoopSoundIds());

            for (const soundId of soundIds) {
                this.stopLoopedSound(soundId);
            }
        }
    },
};

export default SoundMgr;
