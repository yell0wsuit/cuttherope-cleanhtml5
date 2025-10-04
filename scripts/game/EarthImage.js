define("game/EarthImage", [
    "visual/ImageElement",
    "visual/Timeline",
    "visual/KeyFrame",
    "core/Alignment",
    "resources/ResourceId",
], function (ImageElement, Timeline, KeyFrame, Alignment, ResourceId) {
    var IMG_BGR_08_P1__position_window = 1;
    var IMG_OBJ_STAR_IDLE_window = 58;

    var EarthImage = ImageElement.extend({
        init: function (offsetX, offsetY) {
            this._super();
            this.initTextureWithId(ResourceId.IMG_OBJ_STAR_IDLE);
            this.setTextureQuad(IMG_OBJ_STAR_IDLE_window);
            this.anchor = Alignment.CENTER;

            var t = new Timeline();
            t.addKeyFrame(KeyFrame.makeRotation(0, KeyFrame.TransitionType.LINEAR, 0));
            t.addKeyFrame(KeyFrame.makeRotation(180, KeyFrame.TransitionType.EASE_OUT, 0.3));
            this.addTimelineWithID(t, EarthImage.TimelineId.UPSIDE_DOWN);

            var t2 = new Timeline();
            t2.addKeyFrame(KeyFrame.makeRotation(180, KeyFrame.TransitionType.LINEAR, 0));
            t2.addKeyFrame(KeyFrame.makeRotation(0, KeyFrame.TransitionType.EASE_OUT, 0.3));
            this.addTimelineWithID(t2, EarthImage.TimelineId.NORMAL);

            this.setElementPositionWithOffset(
                ResourceId.IMG_BGR_08_P1,
                IMG_BGR_08_P1__position_window
            );
            this.x += offsetX;
            this.y += offsetY;
        },
    });

    /**
     * @enum {number}
     */
    EarthImage.TimelineId = {
        NORMAL: 0,
        UPSIDE_DOWN: 1,
    };

    return EarthImage;
});
