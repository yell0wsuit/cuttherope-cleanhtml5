define("PxLoader", [], function () {
    /**
     * PixelLab Resource Loader
     * Loads resources while providing progress updates.
     */
    class PxLoader {
        /**
         * The status of a resource
         * @enum {number}
         */
        static ResourceState = {
            QUEUED: 0,
            WAITING: 1,
            LOADED: 2,
            ERROR: 3,
            TIMEOUT: 4,
        };

        constructor(settings = {}) {
            // merge settings with defaults
            this.settings = {
                statusInterval: settings.statusInterval ?? 5000, // every 5 seconds by default
                loggingDelay: settings.loggingDelay ?? 20000, // log stragglers after 20 secs
                noProgressTimeout: settings.noProgressTimeout ?? Infinity, // do not stop waiting by default
            };

            this.entries = []; // holds resources to be loaded with their status
            this.progressListeners = [];
            this.timeStarted = null;
            this.progressChanged = Date.now();
        }

        add(resource) {
            // ensure tags are in an array
            resource.tags = this.#ensureArray(resource.tags);

            // ensure priority is set
            resource.priority = resource.priority ?? Infinity;

            this.entries.push({
                resource: resource,
                status: PxLoader.ResourceState.QUEUED,
            });
        }

        addProgressListener(callback, tags) {
            this.progressListeners.push({
                callback: callback,
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

            // first order the resources
            const compareResources = this.#getResourceSort(orderedTags);
            this.entries.sort(compareResources);

            // trigger requests for each resource
            for (const entry of this.entries) {
                entry.status = PxLoader.ResourceState.WAITING;
                entry.resource.start(this);
            }

            // do an initial status check soon since items may be loaded from the cache
            setTimeout(() => this.#statusCheck(), 100);
        }

        isBusy() {
            return this.entries.some(
                (entry) =>
                    entry.status === PxLoader.ResourceState.QUEUED || entry.status === PxLoader.ResourceState.WAITING
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
            if (!window.console) {
                return;
            }

            const elapsedSeconds = Math.round((Date.now() - this.timeStarted) / 1000);
            window.console.log(`PxLoader elapsed: ${elapsedSeconds} sec`);

            this.entries.forEach((entry, i) => {
                if (!showAll && entry.status !== PxLoader.ResourceState.WAITING) {
                    return;
                }

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

        // places non-array values into an array.
        #ensureArray(val) {
            if (val == null) {
                return [];
            }

            if (Array.isArray(val)) {
                return val;
            }

            return [val];
        }

        // creates a comparison function for resources
        #getResourceSort(orderedTags) {
            orderedTags = this.#ensureArray(orderedTags);

            // helper to get the top tag's order for a resource
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
                // check tag order first
                const aOrder = getTagOrder(a);
                const bOrder = getTagOrder(b);
                if (aOrder < bOrder) return -1;
                if (aOrder > bOrder) return 1;

                // now check priority
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
                if (entry.status !== PxLoader.ResourceState.WAITING) {
                    continue;
                }

                // see if the resource has loaded
                entry.resource.checkStatus();

                // if still waiting, mark as timed out or make sure we check again
                if (entry.status === PxLoader.ResourceState.WAITING) {
                    if (timedOut) {
                        entry.resource.onTimeout();
                    } else {
                        checkAgain = true;
                    }
                }
            }

            // log any resources that are still pending
            if (shouldLog && checkAgain) {
                this.log();
            }

            if (checkAgain) {
                setTimeout(() => this.#statusCheck(), this.settings.statusInterval);
            }
        }

        // helper which returns true if two arrays share at least one item
        #arraysIntersect(a, b) {
            return a.some((item) => b.includes(item));
        }

        #onProgress(resource, statusType) {
            // find the entry for the resource
            const entry = this.entries.find((e) => e.resource === resource);

            // we have already updated the status of the resource
            if (!entry || entry.status !== PxLoader.ResourceState.WAITING) {
                return;
            }

            entry.status = statusType;
            this.progressChanged = Date.now();

            // fire callbacks for interested listeners
            for (const listener of this.progressListeners) {
                const shouldCall = listener.tags.length === 0 || this.#arraysIntersect(resource.tags, listener.tags);

                if (shouldCall) {
                    this.#sendProgress(entry, listener);
                }
            }
        }

        // sends a progress report to a listener
        #sendProgress(updatedEntry, listener) {
            // find stats for all the resources the caller is interested in
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
                // info about the resource that changed
                resource: updatedEntry.resource,

                // should we expose StatusType instead?
                loaded: updatedEntry.status === PxLoader.ResourceState.LOADED,
                error: updatedEntry.status === PxLoader.ResourceState.ERROR,
                timeout: updatedEntry.status === PxLoader.ResourceState.TIMEOUT,

                // updated stats for all resources
                completedCount: completed,
                totalCount: total,
            });
        }
    }

    return PxLoader;
});
