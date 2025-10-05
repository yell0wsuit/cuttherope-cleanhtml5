import View from "core/View";
import resolution from "resolution";
import RGBAColor from "core/RGBAColor";
import Canvas from "utils/Canvas";
import Constants from "utils/Constants";
var GameView = View.extend({
    init: function () {
        this._super();
    },
    draw: function () {
        const children = this.children,
            childCount = children.length;
        for (let i = 0; i < childCount; i++) {
            const c = children[i];
            if (!c.visible) {
                continue;
            }

            c.draw();
        }

        const gs = this.getChild(GameView.ElementType.GAME_SCENE);
        if (gs.dimTime > 0) {
            let alpha = gs.dimTime / Constants.DIM_TIMEOUT;
            if (gs.isFadingIn()) {
                alpha = 1 - alpha;
            }

            const ctx = Canvas.context,
                color = new RGBAColor(1, 1, 1, alpha);
            ctx.fillStyle = color.rgbaStyle();
            ctx.fillRect(0, 0, resolution.CANVAS_WIDTH, resolution.CANVAS_HEIGHT);
        }
    },
    show: function () {
        this._super();

        const gs = this.getChild(GameView.ElementType.GAME_SCENE);
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

export default GameView;
