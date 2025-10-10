const PubSub = {},
    subscriptions = [];

/**
 * Subscribe to a channel and receive a handle that should be passed to
 * {@link PubSub.unsubscribe} when the listener is no longer needed.
 *
 * @param {number} name Channel identifier.
 * @param {Function} callback Listener that will receive all published values.
 * @returns {{name: number, callback: Function}} Subscription handle.
 */
PubSub.subscribe = function (name, callback) {
    if (typeof callback !== "function") {
        throw new TypeError("PubSub.subscribe requires a callback function");
    }

    const handle = Object.freeze({ name: name, callback: callback });
    subscriptions.push(handle);
    return handle;
};

/**
 * Remove a previously registered subscription. Both the handle returned from
 * {@link PubSub.subscribe} and the legacy tuple form `[name, callback]` are
 * supported to avoid breaking existing callers.
 *
 * @param {{name: number, callback: Function}|[number, Function]} subscription
 */
PubSub.unsubscribe = function (subscription) {
    if (!subscription) {
        return;
    }

    const name = subscription.name ?? (Array.isArray(subscription) ? subscription[0] : undefined);
    const callback = subscription.callback ?? (Array.isArray(subscription) ? subscription[1] : undefined);

    if (typeof name !== "number" || typeof callback !== "function") {
        return;
    }

    for (let i = subscriptions.length - 1; i >= 0; i--) {
        const sub = subscriptions[i];
        if (sub.name === name && sub.callback === callback) {
            subscriptions.splice(i, 1);
            break;
        }
    }
};

PubSub.publish = function (name) {
    let callbacks = [],
        args = Array.prototype.slice.call(arguments, 1),
        i,
        len;
    if (subscriptions.length > 0) {
        for (i = 0, len = subscriptions.length; i < len; i++) {
            if (subscriptions[i].name === name) {
                callbacks.push(subscriptions[i].callback);
            }
        }
        for (i = 0, len = callbacks.length; i < len; i++) {
            callbacks[i].apply(this, args);
        }
    }
};

/**
 * set of well known channels
 * @enum {number}
 */
PubSub.ChannelId = {
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

export default PubSub;
