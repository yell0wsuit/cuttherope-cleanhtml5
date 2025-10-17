/**
 * Central registry for managing loaded sound buffers
 * Replaces the global window.sounds__ pattern
 */
class SoundRegistry {
    constructor() {
        this.sounds = new Map();
    }

    set(id, soundData) {
        this.sounds.set(id, soundData);
    }

    get(id) {
        return this.sounds.get(id);
    }

    has(id) {
        return this.sounds.has(id);
    }

    delete(id) {
        const soundData = this.sounds.get(id);
        if (soundData) {
            // Stop all playing sources
            for (const source of soundData.playingSources || []) {
                try {
                    source.stop();
                    source.disconnect();
                } catch (e) {
                    console.log(`soundData.gainNode error: ${e}`);
                }
            }

            if (soundData.playingSources) {
                soundData.playingSources.clear();
            }

            // Disconnect gain node
            if (soundData.gainNode) {
                try {
                    soundData.gainNode.disconnect();
                } catch (e) {
                    console.log(`soundData.gainNode error: ${e}`);
                }
            }
        }

        return this.sounds.delete(id);
    }

    clear() {
        // Clean up all sounds
        for (const [id] of this.sounds) {
            this.delete(id);
        }
        this.sounds.clear();
    }

    getAll() {
        return Array.from(this.sounds.keys());
    }
}

// Export singleton instance
export const soundRegistry = new SoundRegistry();
