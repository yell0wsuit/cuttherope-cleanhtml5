import settings from "@/game/CTRSettings";
import Sounds from "@/resources/Sounds";
import ResourceId from "@/resources/ResourceId";
import { IS_XMAS } from "@/resources/ResData";

class SoundManager {
    /**
     * @type {boolean}
     */
    audioPaused;

    /**
     * @type {boolean | null}
     */
    soundEnabled;

    /**
     * @type {boolean | null}
     */
    musicEnabled;

    /**
     * @type {number | null}
     */
    musicId;

    /**
     * @type {number}
     */
    musicResumeOffset;

    /**
     * @type {number[]}
     */
    gameMusicLibrary;

    /**
     * @type {number | null}
     */
    currentGameMusicId;

    /**
     * @type {Map<string, { active: boolean; soundId: number; timeoutId: ReturnType<typeof setTimeout> | null; loopFn: Function }>}
     */
    loopingSounds;

    constructor() {
        this.audioPaused = false;
        this.soundEnabled = settings.getSoundEnabled();
        this.musicEnabled = settings.getMusicEnabled();
        this.musicId = null;
        this.musicResumeOffset = 0;
        this.gameMusicLibrary = IS_XMAS
            ? [ResourceId.SND_GAME_MUSIC_XMAS]
            : [
                  ResourceId.SND_GAME_MUSIC,
                  ResourceId.SND_GAME_MUSIC2,
                  ResourceId.SND_GAME_MUSIC3,
                  ResourceId.SND_GAME_MUSIC4,
              ];

        this.currentGameMusicId = ResourceId.SND_GAME_MUSIC;
        this.loopingSounds = new Map(); // Track looping sound state by instance
    }

    _getActiveLoopSoundIds() {
        const soundIds = new Set();

        for (const entry of this.loopingSounds.values()) {
            if (entry?.active) {
                soundIds.add(entry.soundId);
            }
        }

        return soundIds;
    }

    /**
     * @param {string} instanceId
     * @param {{ active: boolean; soundId: number; timeoutId: ReturnType<typeof setTimeout> | null; loopFn: Function }} entry
     */
    _deactivateLoopEntry(instanceId, entry) {
        if (!entry) {
            return;
        }

        entry.active = false;

        if (entry.timeoutId) {
            clearTimeout(entry.timeoutId);
            entry.timeoutId = null;
        }

        this.loopingSounds.delete(instanceId);
    }

    /**
     * @param {number} soundId
     */
    playSound(soundId) {
        if (this.soundEnabled) {
            Sounds.play(soundId);
        }
    }

    /**
     * @param {number} soundId
     */
    pauseSound(soundId) {
        if (this.soundEnabled && Sounds.isPlaying(soundId)) {
            Sounds.pause(soundId);
        }
    }

    /**
     * @param {number} soundId
     */
    resumeSound(soundId) {
        if (this.soundEnabled && Sounds.isPaused(soundId)) {
            Sounds.play(soundId);
        }
    }

    /**
     * Play a sound that loops until explicitly stopped
     * Supports multiple concurrent instances
     *
     * @param {number} soundId - The sound resource ID
     * @param {string} instanceKey - Unique identifier for this loop instance (e.g., spark position or ID)
     * @param {number} delayMs - Optional delay before starting the loop (for staggered sounds)
     */
    playLoopedSound(soundId, instanceKey, delayMs = 0) {
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
            const entry = this.loopingSounds.get(instanceId);
            console.log(entry);
            if (!entry || !entry.active) {
                return;
            }

            if (!this.audioPaused && this.soundEnabled) {
                Sounds.play(soundId, loop, { instanceId });
            }
        };

        /** @type {{ active: boolean; soundId: number; timeoutId: ReturnType<typeof setTimeout> | null; loopFn: Function }} */
        const entry = { active: true, loopFn: loop, soundId, timeoutId: null };
        this.loopingSounds.set(instanceId, entry);

        if (delayMs > 0) {
            entry.timeoutId = setTimeout(loop, delayMs);
        } else {
            loop();
        }
    }

    /**
     * Stop a specific looping instance
     *
     * @param {number} soundId - The sound resource ID
     * @param {string} instanceKey - The unique identifier for this instance
     */
    stopLoopedSoundInstance(soundId, instanceKey) {
        const instanceId = `${soundId}_${instanceKey}`;
        const entry = this.loopingSounds.get(instanceId);

        if (entry) {
            this._deactivateLoopEntry(instanceId, entry);
        }

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
    }

    /**
     * Stop all looping instances of a sound
     * @param {number} soundId
     */
    stopLoopedSound(soundId) {
        const matchingInstanceIds = [];

        for (const [instanceId, entry] of this.loopingSounds) {
            if (entry.soundId === soundId) {
                matchingInstanceIds.push(instanceId);
            }
        }

        for (const id of matchingInstanceIds) {
            const entry = this.loopingSounds.get(id);
            if (entry) {
                this._deactivateLoopEntry(id, entry);
            }
        }

        Sounds.stop(soundId);
    }

    /**
     * @param {number} soundId
     */
    stopSound(soundId) {
        this.stopLoopedSound(soundId);
    }

    _getAvailableGameMusic() {
        if (!this.gameMusicLibrary || this.gameMusicLibrary.length === 0) {
            return [];
        }

        return this.gameMusicLibrary;
    }

    selectRandomGameMusic() {
        const availableTracks = this._getAvailableGameMusic();
        if (availableTracks.length === 0) {
            this.currentGameMusicId = null;
            return null;
        }

        let pool = availableTracks;
        if (pool.length > 1 && this.currentGameMusicId != null) {
            pool = pool.filter((soundId) => soundId !== this.currentGameMusicId);
            if (pool.length === 0) {
                pool = availableTracks;
            }
        }

        const nextId = pool[Math.floor(Math.random() * pool.length)];
        this.currentGameMusicId = nextId;
        return nextId;
    }

    playGameMusic() {
        const availableTracks = this._getAvailableGameMusic();
        if (availableTracks.length === 0) {
            return;
        }

        const trackId =
            this.currentGameMusicId != null && availableTracks.includes(this.currentGameMusicId)
                ? this.currentGameMusicId
                : availableTracks[0];

        this.currentGameMusicId = trackId;
        this.playMusic(trackId);
    }

    /**
     * @param {number} soundId
     */
    playMusic(soundId) {
        const previousMusicId = this.musicId;

        if (previousMusicId && previousMusicId !== soundId) {
            this.stopMusic();
        }

        this.musicId = soundId;

        if (this.musicEnabled && !Sounds.isPlaying(soundId)) {
            const offset = this.musicResumeOffset || 0;
            this.musicResumeOffset = 0;
            Sounds.setVolume(soundId, 70);
            Sounds.play(
                soundId,
                () => {
                    if (!this.audioPaused && this.musicEnabled) {
                        this.musicResumeOffset = 0;
                        this.playMusic(soundId);
                    }
                },
                { offset }
            );
        }
    }

    pauseAudio() {
        if (this.audioPaused) return; // Don't pause if already paused

        this.audioPaused = true;
        this.pauseMusic();

        for (const soundId of this._getActiveLoopSoundIds()) {
            Sounds.pause(soundId);
        }
    }

    pauseMusic() {
        if (this.musicId && Sounds.isPlaying(this.musicId)) {
            Sounds.pause(this.musicId);
            this.musicResumeOffset = Sounds.getResumeOffset(this.musicId);
        }
    }

    resumeAudio() {
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
    }

    resumeMusic() {
        if (this.musicId && !Sounds.isPlaying(this.musicId)) {
            this.playMusic(this.musicId);
        }
    }

    stopMusic() {
        if (this.musicId) {
            Sounds.stop(this.musicId);
            this.musicResumeOffset = 0;
        }
    }

    /**
     * @param {boolean} musicEnabled
     */
    setMusicEnabled(musicEnabled) {
        this.musicEnabled = musicEnabled;
        settings.setMusicEnabled(musicEnabled);
        if (this.musicEnabled) {
            this.resumeMusic();
        } else {
            this.pauseMusic();
        }
    }

    /**
     * @param {boolean} soundEnabled
     */
    setSoundEnabled(soundEnabled) {
        this.soundEnabled = soundEnabled;
        settings.setSoundEnabled(soundEnabled);

        if (!soundEnabled) {
            const soundIds = Array.from(this._getActiveLoopSoundIds());

            for (const soundId of soundIds) {
                this.stopLoopedSound(soundId);
            }
        }
    }
}

// Export a singleton instance to maintain the same usage pattern
const SoundMgr = new SoundManager();

export default SoundMgr;
