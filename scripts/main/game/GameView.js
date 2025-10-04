define("game/GameView", [
    "core/View",
    "resolution",
    "core/RGBAColor",
    "utils/Canvas",
    "utils/Constants",
], function (View, resolution, RGBAColor, Canvas, Constants) {
    var GameView = View.extend({
        init: function () {
            this._super();
        },
        draw: function () {
            var children = this.children,
                childCount = children.length;
            for (var i = 0; i < childCount; i++) {
                var c = children[i];
                if (!c.visible) {
                    continue;
                }

                c.draw();
            }

            var gs = this.getChild(GameView.ElementType.GAME_SCENE);
            if (gs.dimTime > 0) {
                var alpha = gs.dimTime / Constants.DIM_TIMEOUT;
                if (gs.isFadingIn()) {
                    alpha = 1 - alpha;
                }

                var ctx = Canvas.context,
                    color = new RGBAColor(1, 1, 1, alpha);
                ctx.fillStyle = color.rgbaStyle();
                ctx.fillRect(0, 0, resolution.CANVAS_WIDTH, resolution.CANVAS_HEIGHT);
            }
        },
        show: function () {
            this._super();

            var gs = this.getChild(GameView.ElementType.GAME_SCENE);
            if (gs.animateRestartDim) {
                gs.animateLevelRestart();
            }
        },
    });

    /**
     * @enum {number}
     */
    GameView.ElementType = {
        GAME_SCENE: 0,
        PAUSE_BUTTON: 1,
        RESTART_BUTTON: 2,
        NEXT_BUTTON: 3,
        PAUSE_MENU: 4,
        RESULTS: 5,
    };

    return GameView;
});
