define("utils/PubSub", [], function () {
    const PubSub = {},
        subscriptions = [];

    PubSub.subscribe = function (name, callback) {
        subscriptions.push({ name: name, callback: callback });
        return [name, callback];
    };
    PubSub.unsubscribe = function (name, callback) {
        let i, sub;
        for (i = subscriptions.length; i >= 0; i--) {
            sub = subscriptions[i];
            if (sub.name === name && sub.callback === callback) {
                subscriptions.splice(i, 1);
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
    };

    return PubSub;
});
