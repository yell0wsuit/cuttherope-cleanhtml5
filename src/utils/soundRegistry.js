/**
 * Central registry for managing loaded sound buffers
 * Replaces the global window.sounds__ pattern
 */

/**
 * @typedef {Object} SoundData
 * @property {AudioBuffer} buffer - The audio buffer
 * @property {GainNode} gainNode - The gain node for volume control
 * @property {Set<AudioBufferSourceNode>} playingSources - Set of currently playing source nodes
 * @property {boolean} isPaused - Whether the sound is paused
 * @property {number} volume - Volume level (0-1)
 */

class SoundRegistry {
    constructor() {
        this.sounds = new Map();
    }

    /**
     * @param {string} id
     * @param {SoundData} soundData - Sound data object containing buffer, gainNode, and playingSources
     */
    set(id, soundData) {
        this.sounds.set(id, soundData);
    }

    /**
     * @param {string} id
     * @returns {SoundData|undefined} Sound data object or undefined if not found
     */
    get(id) {
        return this.sounds.get(id);
    }

    /**
     * @param {string} id
     * @returns {boolean} True if the sound exists in the registry
     */
    has(id) {
        return this.sounds.has(id);
    }

    /**
     * @param {string} id
     * @returns {boolean} True if the sound was deleted, false if it didn't exist
     */
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

    /**
     * Clears all sounds from the registry and cleans up resources
     */
    clear() {
        // Clean up all sounds
        for (const [id] of this.sounds) {
            this.delete(id);
        }
        this.sounds.clear();
    }

    /**
     * @returns {string[]} Array of all sound IDs in the registry
     */
    getAll() {
        return Array.from(this.sounds.keys());
    }
}

// Export singleton instance
export const soundRegistry = new SoundRegistry();
