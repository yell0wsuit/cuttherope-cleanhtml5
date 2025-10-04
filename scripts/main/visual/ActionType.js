define("visual/ActionType", [], function () {
    /**
     * @enum {string}
     */
    var ActionType = {
        SET_VISIBLE: "ACTION_SET_VISIBLE",
        SET_TOUCHABLE: "ACTION_SET_TOUCHABLE",
        SET_UPDATEABLE: "ACTION_SET_UPDATEABLE",
        SET_DRAWQUAD: "ACTION_SET_DRAWQUAD",

        PLAY_TIMELINE: "ACTION_PLAY_TIMELINE",
        PAUSE_TIMELINE: "ACTION_PAUSE_TIMELINE",
        STOP_TIMELINE: "ACTION_STOP_TIMELINE",
        JUMP_TO_TIMELINE_FRAME: "ACTION_JUMP_TO_TIMELINE_FRAME",
    };

    return ActionType;
});
