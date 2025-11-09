import View from "@/core/View";
import resolution from "@/resolution";
import RGBAColor from "@/core/RGBAColor";
import Canvas from "@/utils/Canvas";
import Constants from "@/utils/Constants";
import type GameScene from "@/GameScene";

const ElementType = {
    GAME_SCENE: 0,
    PAUSE_BUTTON: 1,
    RESTART_BUTTON: 2,
    NEXT_BUTTON: 3,
    PAUSE_MENU: 4,
    RESULTS: 5,
} as const;

type ElementTypeValue = (typeof ElementType)[keyof typeof ElementType];

class GameView extends View {
    static readonly ElementType = ElementType;

    override draw(): void {
        const children = this.children;
        const childCount = children.length;
        for (let i = 0; i < childCount; i++) {
            const child = children[i];
            if (!child || !child.visible) {
                continue;
            }

            child.draw();
        }

        const gs = this.getChild(GameView.ElementType.GAME_SCENE) as GameScene | undefined;
        if (!gs || gs.dimTime <= 0) {
            return;
        }

        let alpha = gs.dimTime / Constants.DIM_TIMEOUT;
        if (typeof gs.isFadingIn === "function" && gs.isFadingIn()) {
            alpha = 1 - alpha;
        }

        const ctx = Canvas.context;
        if (!ctx) {
            return;
        }

        const color = new RGBAColor(1, 1, 1, alpha);
        ctx.fillStyle = color.rgbaStyle();
        ctx.fillRect(0, 0, resolution.CANVAS_WIDTH, resolution.CANVAS_HEIGHT);
    }

    override show(): void {
        super.show();

        const gs = this.getChild(GameView.ElementType.GAME_SCENE) as GameScene | undefined;
        if (gs?.animateRestartDim) {
            gs.animateLevelRestart?.();
        }
    }
}

export type GameViewElementType = ElementTypeValue;
export default GameView;
