define("game/Star", [
    "game/CTRGameObject",
    "visual/Animation",
    "resources/ResourceId",
    "core/Alignment",
    "visual/Timeline",
    "visual/KeyFrame",
    "core/RGBAColor",
    "core/Rectangle",
    "utils/MathHelper",
    "utils/Mover",
    "resolution",
], function (
    CTRGameObject,
    Animation,
    ResourceId,
    Alignment,
    Timeline,
    KeyFrame,
    RGBAColor,
    Rectangle,
    MathHelper,
    Mover,
    resolution
) {
    const IMG_OBJ_STAR_IDLE_glow = 0;
    const IMG_OBJ_STAR_IDLE_idle_start = 1;
    const IMG_OBJ_STAR_IDLE_idle_end = 18;
    const IMG_OBJ_STAR_IDLE_timed_start = 19;
    const IMG_OBJ_STAR_IDLE_timed_end = 55;

    const Star = CTRGameObject.extend({
        init: function () {
            this._super();

            this.time = 0;
            this.timeout = 0;
            this.timedAnim = null;

            // typically we pixel align image coordinates, but the star animation
            // occurs along a small distance so we use a smaller increment so they
            // don't appear jerky. It's good to use a value that evenly divides 1
            // so that at least some of the positions are on pixel boundaries.
            this.drawPosIncrement = 0.0001;
        },
        createAnimations: function () {
            let t;
            if (this.timeout > 0) {
                // create animation
                this.timedAnim = new Animation();
                this.timedAnim.initTextureWithId(ResourceId.IMG_OBJ_STAR_IDLE);
                this.timedAnim.anchor = this.timedAnim.parentAnchor = Alignment.CENTER;
                const delay =
                    this.timeout /
                    (IMG_OBJ_STAR_IDLE_timed_end - IMG_OBJ_STAR_IDLE_timed_start + 1);
                this.timedAnim.addAnimationEndpoints(
                    0,
                    delay,
                    Timeline.LoopType.NO_LOOP,
                    IMG_OBJ_STAR_IDLE_timed_start,
                    IMG_OBJ_STAR_IDLE_timed_end
                );

                // play and add as child
                this.timedAnim.playTimeline(0);
                this.time = this.timeout;
                this.timedAnim.visible = false;
                this.addChild(this.timedAnim);

                // timeline for animation color fade
                const tt = new Timeline();
                tt.addKeyFrame(
                    KeyFrame.makeColor(
                        RGBAColor.solidOpaque.copy(),
                        KeyFrame.TransitionType.LINEAR,
                        0
                    )
                );
                tt.addKeyFrame(
                    KeyFrame.makeColor(
                        RGBAColor.transparent.copy(),
                        KeyFrame.TransitionType.LINEAR,
                        0.5
                    )
                );
                this.timedAnim.addTimelineWithID(tt, 1);

                // timeline for element scale and color fade
                t = new Timeline();
                t.addKeyFrame(KeyFrame.makeScale(1, 1, KeyFrame.TransitionType.LINEAR, 0));
                t.addKeyFrame(KeyFrame.makeScale(0, 0, KeyFrame.TransitionType.LINEAR, 0.25));
                t.addKeyFrame(
                    KeyFrame.makeColor(
                        RGBAColor.solidOpaque.copy(),
                        KeyFrame.TransitionType.LINEAR,
                        0
                    )
                );
                t.addKeyFrame(
                    KeyFrame.makeColor(
                        RGBAColor.transparent.copy(),
                        KeyFrame.TransitionType.LINEAR,
                        0.25
                    )
                );
                this.addTimelineWithID(t, 1);
            }

            this.bb = Rectangle.copy(resolution.STAR_DEFAULT_BB);

            // timeline to make the star move up and down slightly
            t = new Timeline();
            t.addKeyFrame(KeyFrame.makePos(this.x, this.y, KeyFrame.TransitionType.EASE_IN, 0));
            t.addKeyFrame(
                KeyFrame.makePos(this.x, this.y - 3, KeyFrame.TransitionType.EASE_OUT, 0.5)
            );
            t.addKeyFrame(KeyFrame.makePos(this.x, this.y, KeyFrame.TransitionType.EASE_IN, 0.5));
            t.addKeyFrame(
                KeyFrame.makePos(this.x, this.y + 3, KeyFrame.TransitionType.EASE_OUT, 0.5)
            );
            t.addKeyFrame(KeyFrame.makePos(this.x, this.y, KeyFrame.TransitionType.EASE_IN, 0.5));
            t.loopType = Timeline.LoopType.REPLAY;
            this.addTimelineWithID(t, 0);
            this.playTimeline(0);
            t.update(MathHelper.randomRange(0, 20) / 10);

            // idle star animation
            const sr = new Animation();
            sr.initTextureWithId(ResourceId.IMG_OBJ_STAR_IDLE);
            sr.doRestoreCutTransparency();
            sr.addAnimationDelay(
                0.05,
                Timeline.LoopType.REPLAY,
                IMG_OBJ_STAR_IDLE_idle_start,
                IMG_OBJ_STAR_IDLE_idle_end
            );
            sr.playTimeline(0);
            sr.getTimeline(0).update(MathHelper.randomRange(0, 20) / 10);
            sr.anchor = sr.parentAnchor = Alignment.CENTER;
            sr.drawPosIncrement = 0.0001;

            this.addChild(sr);
        },
        update: function (delta) {
            if (this.timeout > 0) {
                if (this.time > 0) {
                    this.time = Mover.moveToTarget(this.time, 0, 1, delta);
                }
            }
            this._super(delta);
        },
        draw: function () {
            if (this.timedAnim) {
                this.timedAnim.draw();
            }

            this._super();
        },
    });

    return Star;
});
