import type {
    JsonCacheEntry,
    LevelJson,
    LoadedLevelEntry,
    MenuStringEntry,
    RawBoxMetadataJson,
} from "@/types/json";

const loadJson = async <T>(url: RequestInfo | URL): Promise<T> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    const text = await response.text();

    try {
        return JSON.parse(text) as T;
    } catch (error) {
        window.console?.error?.("Failed to parse JSON:", url, error);
        throw error;
    }
};

type ProgressCallback = (loaded: number, total: number) => void;

class JsonLoader {
    private menuJsonLoadComplete = false;

    private loadedJsonFiles = 0;

    private failedJsonFiles = 0;

    private totalJsonFiles = 0;

    private checkCompleteCallback: (() => void) | null = null;

    private progressCallback: ProgressCallback | null = null;

    private readonly jsonCache: Map<string, JsonCacheEntry | MenuStringEntry[]> = new Map();

    getJsonFileCount(): number {
        return this.totalJsonFiles;
    }

    onProgress(callback: ProgressCallback): void {
        this.progressCallback = callback;
    }

    onMenuComplete(callback: () => void): void {
        this.checkCompleteCallback = callback;
    }

    async start(): Promise<void> {
        // Use the configured base from vite config
        const baseUrl = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

        try {
            // First, load the box metadata and menu strings
            const boxMetadataUrl = `${baseUrl}/data/config/editions/net-box-text.json`;
            const menuStringsUrl = `${baseUrl}/data/resources/menu-strings.json`;

            const [boxMetadata, menuStrings] = await Promise.all([
                loadJson<RawBoxMetadataJson[]>(boxMetadataUrl),
                loadJson<MenuStringEntry[]>(menuStringsUrl),
            ]);

            this.jsonCache.set("boxMetadata", boxMetadata);
            this.jsonCache.set("menuStrings", menuStrings);

            const levelFiles: Array<{ url: string; key: string }> = [];

            // Queue level files based on levelCount from metadata
            boxMetadata.forEach((box, index) => {
                if (box.levelCount && typeof box.levelCount === "number") {
                    const boxStr = String(index).padStart(2, "0");
                    for (let level = 1; level <= box.levelCount; level++) {
                        const levelStr = String(level).padStart(2, "0");
                        levelFiles.push({
                            url: `${baseUrl}/data/boxes/levels/${boxStr}-${levelStr}.json`,
                            key: `level-${boxStr}-${levelStr}`,
                        });
                    }
                }
            });

            // Set total to metadata (1) + menu strings (1) + level files
            this.totalJsonFiles = 2 + levelFiles.length;
            this.loadedJsonFiles = 2; // Box metadata and menu strings already loaded

            this.progressCallback?.(this.loadedJsonFiles, this.totalJsonFiles);

            // Load all level JSON files
            const promises = levelFiles.map(async ({ url, key }) => {
                try {
                    const data = await loadJson<LevelJson>(url);
                    this.jsonCache.set(key, data);
                    this.loadedJsonFiles++;
                    this.progressCallback?.(this.loadedJsonFiles, this.totalJsonFiles);
                    return { success: true as const, key };
                } catch (error) {
                    // Silent fail for level files that might not exist
                    this.loadedJsonFiles++;
                    this.progressCallback?.(this.loadedJsonFiles, this.totalJsonFiles);
                    return { success: false as const, key, silent: true };
                }
            });

            await Promise.all(promises);
            this.menuJsonLoadComplete = true;
            this.checkCompleteCallback?.();
        } catch (error) {
            this.failedJsonFiles++;
            window.console?.error?.("Failed to load box metadata", error);
            this.menuJsonLoadComplete = true;
            this.checkCompleteCallback?.();
        }
    }

    getJson(key: string): JsonCacheEntry | MenuStringEntry[] | undefined {
        return this.jsonCache.get(key);
    }

    getAllLevels(): Map<string, LoadedLevelEntry[]> {
        const levels = new Map<string, LoadedLevelEntry[]>();
        for (const [key, value] of this.jsonCache.entries()) {
            if (key.startsWith("level-")) {
                const match = key.match(/level-(\d{2})-(\d{2})/);
                if (match) {
                    const boxNumber = match[1];
                    const levelNumber = match[2];
                    if (!boxNumber || !levelNumber) {
                        continue;
                    }
                    if (!levels.has(boxNumber)) {
                        levels.set(boxNumber, []);
                    }
                    const levelEntries = levels.get(boxNumber);
                    if (levelEntries) {
                        levelEntries.push({
                            levelNumber,
                            level: value as LevelJson,
                        });
                    }
                }
            }
        }
        return levels;
    }

    getBoxMetadata(): RawBoxMetadataJson[] | undefined {
        const metadata = this.jsonCache.get("boxMetadata");
        if (Array.isArray(metadata)) {
            return metadata as RawBoxMetadataJson[];
        }
        return undefined;
    }

    getMenuStrings(): MenuStringEntry[] | undefined {
        const menuStrings = this.jsonCache.get("menuStrings");
        if (Array.isArray(menuStrings)) {
            return menuStrings as MenuStringEntry[];
        }
        return undefined;
    }
}

// Export a singleton instance
export default new JsonLoader();
