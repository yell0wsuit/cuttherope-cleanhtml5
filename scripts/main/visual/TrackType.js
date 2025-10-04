define("visual/TrackType", [], function () {
    /**
     * @enum {number}
     */
    var TrackType = {
        POSITION: 0,
        SCALE: 1,
        ROTATION: 2,
        COLOR: 3,
        ACTION: 4,
        COUNT: 5,
    };

    return TrackType;
});
