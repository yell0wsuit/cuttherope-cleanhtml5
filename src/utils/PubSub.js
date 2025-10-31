/**
 * PubSub system for managing event-based communication between modules.
 * Provides subscribe, unsubscribe, and publish methods.
 */
class PubSub {
    constructor() {
        /**
         * Store subscriptions grouped by channel so we do not need to iterate the
         * entire subscription list for every publish or unsubscribe call.
         * The value is an array rather than a Set to preserve call ordering for
         * listeners that were registered multiple times.
         * @type {Map<number, Function[]>}
         */
        this.subscriptions = new Map();

        /**
         * Enumeration of well-known channel identifiers.
         * @enum {number}
         */
        this.ChannelId = {
            LevelWon: 0,
            LevelLost: 1,
            OmNomClicked: 2,
            DrawingClicked: 3,
            StarCountChanged: 4,
            ControllerActivated: 5,
            ControllerDeactivateRequested: 6,
            ControllerDeactivated: 7,
            ControllerPaused: 8,
            ControllerUnpaused: 9,
            ControllerViewHidden: 10,
            ControllerViewShow: 11,
            LanguageChanged: 12,
            ShowOptionsPage: 13,
            LoadIntroVideo: 14,
            Share: 15,
            ShowOptions: 16,
            EnableGame: 17,
            DisableGame: 18,
            SetPaidBoxes: 19,
            AppInit: 20,
            AppDomReady: 21,
            AppRun: 22,
            PurchaseBoxesPrompt: 23,
            PauseGame: 24,
            AchievementManager: 25,
            UpdateBoxScore: 26,
            SignIn: 27,
            SignOut: 28,
            UpdateCandyScroller: 29,
            UpdateVisibleBoxes: 30,
            SelectedBoxChanged: 31,
            UserIdChanged: 32,
            RoamingSettingProvider: 33,
            RoamingDataChanged: 34,
            BoxesUnlocked: 35,
            PreloaderProgress: 36,
        };
    }

    /**
     * Subscribe to a channel and receive a handle that should be passed to
     * {@link PubSub#unsubscribe} when the listener is no longer needed.
     *
     * @param {number} name Channel identifier.
     * @param {Function} callback Listener that will receive all published values.
     * @returns {{name: number, callback: Function}} Subscription handle.
     */
    subscribe(name, callback) {
        if (typeof callback !== "function") {
            throw new TypeError("PubSub.subscribe requires a callback function");
        }

        const handle = Object.freeze({ name, callback });
        const callbacks = this.subscriptions.get(name);
        if (callbacks) {
            callbacks.push(callback);
        } else {
            this.subscriptions.set(name, [callback]);
        }
        return handle;
    }

    /**
     * Remove a previously registered subscription.
     * Both the handle returned from {@link PubSub#subscribe} and the legacy tuple
     * form `[name, callback]` are supported.
     *
     * @param {{name: number, callback: Function}|[number, Function]} subscription
     */
    unsubscribe(subscription) {
        if (!subscription) return;

        const name =
            subscription.name ?? (Array.isArray(subscription) ? subscription[0] : undefined);
        const callback =
            subscription.callback ?? (Array.isArray(subscription) ? subscription[1] : undefined);

        if (typeof name !== "number" || typeof callback !== "function") {
            return;
        }

        const callbacks = this.subscriptions.get(name);
        if (!callbacks) return;

        for (let i = callbacks.length - 1; i >= 0; i--) {
            if (callbacks[i] === callback) {
                callbacks.splice(i, 1);
                if (callbacks.length === 0) {
                    this.subscriptions.delete(name);
                }
                break;
            }
        }
    }

    /**
     * Publish an event to a channel with any number of arguments.
     *
     * @param {number} name Channel identifier.
     * @param {...any} args Arguments to pass to listeners.
     */
    publish(name, ...args) {
        const callbacks = this.subscriptions.get(name);
        if (!callbacks || callbacks.length === 0) return;

        // Create a shallow copy so callbacks can safely modify subscriptions.
        const listeners = callbacks.slice();
        for (let i = 0, len = listeners.length; i < len; i++) {
            listeners[i].apply(this, args);
        }
    }

    /**
     * Clear all subscriptions for all channels.
     */
    clearAll() {
        this.subscriptions.clear();
    }

    /**
     * Retrieve all current subscriptions (for debugging/testing).
     * @returns {Map<number, Function[]>}
     */
    getAll() {
        return this.subscriptions;
    }
}

// Create a singleton instance
export default new PubSub();
