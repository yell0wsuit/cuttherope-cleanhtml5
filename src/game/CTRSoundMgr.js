import settings from "@/game/CTRSettings";
import Log from "@/utils/Log";
import ResourceId from "@/resources/ResourceId";
import Sounds from "@/resources/Sounds";

const SoundMgr = {
    audioPaused: false,
    soundEnabled: settings.getSoundEnabled(),
    musicEnabled: settings.getMusicEnabled(),
    musicId: null,
    musicResumeOffset: 0,
    loopingSounds: new Map(), // Track looping sound state by instance

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
            // Check if this instance should still be looping
            const entry = self.loopingSounds.get(instanceId);
            if (!entry || !entry.active) return;

            if (!self.audioPaused && self.soundEnabled) {
                Sounds.play(soundId, loop);
            }
        };

        this.loopingSounds.set(instanceId, { active: true, loopFn: loop });

        // Start with optional delay
        if (delayMs > 0) {
            setTimeout(loop, delayMs);
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

        if (this.loopingSounds.has(instanceId)) {
            this.loopingSounds.delete(instanceId);
        }

        // Only stop the sound completely if no other instances are playing
        let hasOtherInstances = false;
        for (const [id] of this.loopingSounds) {
            if (id.startsWith(soundId + "_")) {
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
        // Stop all instances that match this soundId
        for (const [instanceId] of this.loopingSounds) {
            if (instanceId.startsWith(soundId + "_")) {
                this.loopingSounds.delete(instanceId);
            }
        }

        Sounds.stop(soundId);
    },

    stopSound: function (soundId) {
        Sounds.stop(soundId);
    },

    playMusic: function (soundId) {
        if (this.musicId && this.musicId !== soundId) {
            this.stopMusic();
        }

        const self = this;
        if (this.musicEnabled && !Sounds.isPlaying(soundId)) {
            this.musicId = soundId;
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

        // Pause the actual sound, but preserve loop state
        Sounds.pause(ResourceId.SND_ELECTRIC);
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

        // Restart each active electric loop instance exactly once
        if (this.soundEnabled) {
            for (const [instanceId, entry] of this.loopingSounds) {
                if (entry && entry.active && instanceId.startsWith(ResourceId.SND_ELECTRIC + "_")) {
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
            // Stop all looping sounds when disabled
            this.loopingSounds.clear();
            this.stopSound(ResourceId.SND_ELECTRIC);
        }
    },
};

export default SoundMgr;
