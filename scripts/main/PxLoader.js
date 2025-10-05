export default class PxLoader {
    /**
     * PixelLab Resource Loader
     * Loads resources while providing progress updates.
     */
    static ResourceState = {
        QUEUED: 0,
        WAITING: 1,
        LOADED: 2,
        ERROR: 3,
        TIMEOUT: 4,
    };

    constructor(settings = {}) {
        this.settings = {
            statusInterval: settings.statusInterval ?? 5000,
            loggingDelay: settings.loggingDelay ?? 20000,
            noProgressTimeout: settings.noProgressTimeout ?? Infinity,
        };

        this.entries = [];
        this.progressListeners = [];
        this.timeStarted = null;
        this.progressChanged = Date.now();
    }

    add(resource) {
        resource.tags = this.#ensureArray(resource.tags);
        resource.priority = resource.priority ?? Infinity;

        this.entries.push({
            resource,
            status: PxLoader.ResourceState.QUEUED,
        });
    }

    addProgressListener(callback, tags) {
        this.progressListeners.push({
            callback,
            tags: this.#ensureArray(tags),
        });
    }

    addCompletionListener(callback, tags) {
        this.progressListeners.push({
            tags: this.#ensureArray(tags),
            callback: (e) => {
                if (e.completedCount === e.totalCount) {
                    callback();
                }
            },
        });
    }

    start(orderedTags) {
        this.timeStarted = Date.now();

        const compareResources = this.#getResourceSort(orderedTags);
        this.entries.sort(compareResources);

        for (const entry of this.entries) {
            entry.status = PxLoader.ResourceState.WAITING;
            entry.resource.start(this);
        }

        setTimeout(() => this.#statusCheck(), 100);
    }

    isBusy() {
        return this.entries.some(
            (entry) => entry.status === PxLoader.ResourceState.QUEUED || entry.status === PxLoader.ResourceState.WAITING
        );
    }

    onLoad(resource) {
        this.#onProgress(resource, PxLoader.ResourceState.LOADED);
    }

    onError(resource) {
        this.#onProgress(resource, PxLoader.ResourceState.ERROR);
    }

    onTimeout(resource) {
        this.#onProgress(resource, PxLoader.ResourceState.TIMEOUT);
    }

    log(showAll) {
        if (!window.console) return;

        const elapsedSeconds = Math.round((Date.now() - this.timeStarted) / 1000);
        window.console.log(`PxLoader elapsed: ${elapsedSeconds} sec`);

        this.entries.forEach((entry, i) => {
            if (!showAll && entry.status !== PxLoader.ResourceState.WAITING) return;

            let message = `PxLoader: #${i} ${entry.resource.getName()}`;
            switch (entry.status) {
                case PxLoader.ResourceState.QUEUED:
                    message += " (Not Started)";
                    break;
                case PxLoader.ResourceState.WAITING:
                    message += " (Waiting)";
                    break;
                case PxLoader.ResourceState.LOADED:
                    message += " (Loaded)";
                    break;
                case PxLoader.ResourceState.ERROR:
                    message += " (Error)";
                    break;
                case PxLoader.ResourceState.TIMEOUT:
                    message += " (Timeout)";
                    break;
            }

            if (entry.resource.tags.length > 0) {
                message += ` Tags: [${entry.resource.tags.join(",")}]`;
            }

            window.console.log(message);
        });
    }

    #ensureArray(val) {
        if (val == null) return [];
        if (Array.isArray(val)) return val;
        return [val];
    }

    #getResourceSort(orderedTags) {
        orderedTags = this.#ensureArray(orderedTags);

        const getTagOrder = (entry) => {
            const resource = entry.resource;
            let bestIndex = Infinity;
            for (const tag of resource.tags) {
                const index = orderedTags.indexOf(tag);
                if (index >= 0 && index < bestIndex) {
                    bestIndex = index;
                }
            }
            return bestIndex;
        };

        return (a, b) => {
            const aOrder = getTagOrder(a);
            const bOrder = getTagOrder(b);
            if (aOrder < bOrder) return -1;
            if (aOrder > bOrder) return 1;

            if (a.priority < b.priority) return -1;
            if (a.priority > b.priority) return 1;
            return 0;
        };
    }

    #statusCheck() {
        let checkAgain = false;
        const noProgressTime = Date.now() - this.progressChanged;
        const timedOut = noProgressTime >= this.settings.noProgressTimeout;
        const shouldLog = noProgressTime >= this.settings.loggingDelay;

        for (const entry of this.entries) {
            if (entry.status !== PxLoader.ResourceState.WAITING) continue;

            entry.resource.checkStatus();

            if (entry.status === PxLoader.ResourceState.WAITING) {
                if (timedOut) {
                    entry.resource.onTimeout();
                } else {
                    checkAgain = true;
                }
            }
        }

        if (shouldLog && checkAgain) {
            this.log();
        }

        if (checkAgain) {
            setTimeout(() => this.#statusCheck(), this.settings.statusInterval);
        }
    }

    #arraysIntersect(a, b) {
        return a.some((item) => b.includes(item));
    }

    #onProgress(resource, statusType) {
        const entry = this.entries.find((e) => e.resource === resource);

        if (!entry || entry.status !== PxLoader.ResourceState.WAITING) return;

        entry.status = statusType;
        this.progressChanged = Date.now();

        for (const listener of this.progressListeners) {
            const shouldCall = listener.tags.length === 0 || this.#arraysIntersect(resource.tags, listener.tags);

            if (shouldCall) {
                this.#sendProgress(entry, listener);
            }
        }
    }

    #sendProgress(updatedEntry, listener) {
        let completed = 0;
        let total = 0;

        for (const entry of this.entries) {
            const includeResource =
                listener.tags.length === 0 || this.#arraysIntersect(entry.resource.tags, listener.tags);

            if (includeResource) {
                total++;
                if (
                    entry.status === PxLoader.ResourceState.LOADED ||
                    entry.status === PxLoader.ResourceState.ERROR ||
                    entry.status === PxLoader.ResourceState.TIMEOUT
                ) {
                    completed++;
                }
            }
        }

        listener.callback({
            resource: updatedEntry.resource,
            loaded: updatedEntry.status === PxLoader.ResourceState.LOADED,
            error: updatedEntry.status === PxLoader.ResourceState.ERROR,
            timeout: updatedEntry.status === PxLoader.ResourceState.TIMEOUT,
            completedCount: completed,
            totalCount: total,
        });
    }
}
