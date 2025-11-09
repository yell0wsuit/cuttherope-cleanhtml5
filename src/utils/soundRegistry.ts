/**
 * Central registry for managing loaded sound buffers
 * Replaces the global window.sounds__ pattern
 */

interface SoundData {
    buffer: AudioBuffer;
    gainNode: GainNode;
    playingSources: Set<AudioBufferSourceNode>;
    isPaused: boolean;
    volume: number;
}

class SoundRegistry {
    sounds: Map<string, SoundData>;

    constructor() {
        this.sounds = new Map();
    }

    set(id: string, soundData: SoundData) {
        this.sounds.set(id, soundData);
    }

    get(id: string): SoundData | undefined {
        return this.sounds.get(id);
    }

    has(id: string): boolean {
        return this.sounds.has(id);
    }

    delete(id: string): boolean {
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

    getAll(): string[] {
        return Array.from(this.sounds.keys());
    }
}

// Export singleton instance
export const soundRegistry = new SoundRegistry();
