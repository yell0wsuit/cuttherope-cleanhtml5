import ViewController from "@/core/ViewController";
import GameScene from "@/GameScene";
import GameView from "@/game/GameView";
import SoundMgr from "@/game/CTRSoundMgr";
import ResourceId from "@/resources/ResourceId";
import Constants from "@/utils/Constants";

/**
 * @enum {number}
 */
const GameButton = {
    PAUSE_RESUME: 0,
    PAUSE_RESTART: 1,
    PAUSE_SKIP: 2,
    PAUSE_LEVEL_SELECT: 3,
    PAUSE_EXIT: 4,
    WIN_EXIT: 5,
    PAUSE: 6,
    NEXT_LEVEL: 7,
    WIN_RESTART: 8,
    WIN_NEXT_LEVEL: 9,
};

/**
 * @enum {number}
 */
const ExitCodeFrom = {
    PAUSE_MENU: 0,
    PAUSE_MENU_LEVEL_SELECT: 1,
    PAUSE_MENU_LEVEL_SELECT_NEXT_PACK: 2,
};

class GameController extends ViewController {
    /**
     * @param {CTRRootController} parent
     */
    constructor(parent) {
        super(parent);
        this.animateRestart = false;
    }

    activate() {
        super.activate();
        SoundMgr.playGameMusic();
        this.createGameView();
        this.initGameView();
        this.showView(0);
    }

    createGameView() {
        const view = new GameView();
        const sc = new GameScene();
        sc.gameController = this;
        sc.animateRestartDim = this.animateRestart;
        this.animateRestart = false;
        view.addChildWithID(sc, GameView.ElementType.GAME_SCENE);

        this.addView(view, 0);
    }

    initGameView() {
        this.setPaused(false);
        this.levelFirstStart();
    }

    levelFirstStart() {
        this.isGamePaused = false;
    }

    levelStart() {
        this.isGamePaused = false;
    }

    onLevelWon() {
        SoundMgr.playSound(ResourceId.SND_WIN);
        this.deactivate();
    }

    onLevelLost() {
        this.restartLevel();
    }

    /**
     * @param {boolean} paused
     */
    setPaused(paused) {
        this.isGamePaused = paused;

        const view = this.getView(0);
        if (view) {
            const gs = view.getChild(GameView.ElementType.GAME_SCENE);
            if (gs) {
                gs.touchable = !paused;
                gs.updateable = !paused;

                if (paused) {
                    SoundMgr.pauseAudio();
                } else {
                    SoundMgr.resumeAudio();
                }
            }
        }
    }

    pauseLevel() {
        const view = this.getView(0);
        if (view) {
            const gs = view.getChild(GameView.ElementType.GAME_SCENE);
            if (gs) {
                gs.dimTime = 0.0;
                this.setPaused(true);
            }
        }
    }

    resumeLevel() {
        this.setPaused(false);
    }

    restartLevel() {
        this.deleteView(0);
        this.animateRestart = true;
        this.activate();
    }

    /**
     * @param {number} x
     * @param {number} y
     * @return {boolean} true if event was handled
     */
    mouseDown(x, y) {
        // see if the event was handled by the base class
        const res = super.mouseDown(x, y);
        if (res) {
            return true;
        }

        // see if the game scene is touchable
        const view = this.getView(0);
        if (view) {
            const gs = view.getChild(GameView.ElementType.GAME_SCENE);
            if (gs && gs.touchable) {
                gs.touchDown(x, y, 0);
                return true;
            }
        }

        return false;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @return {boolean} true if event was handled
     */
    mouseDragged(x, y) {
        // see if the event was handled by the base class
        const res = super.mouseDragged(x, y);
        if (res) {
            return true;
        }

        // see if the game scene is touchable
        const view = this.getView(0);
        if (view) {
            const gs = view.getChild(GameView.ElementType.GAME_SCENE);
            if (gs && gs.touchable) {
                gs.touchDragged(x, y, 0);
                return true;
            }
        }

        return false;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @return {boolean} true if event was handled
     */
    mouseMoved(x, y) {
        // see if the event was handled by the base class
        const res = super.mouseMoved(x, y);
        if (res) {
            return true;
        }

        // see if the game scene is touchable
        const view = this.getView(0);
        if (view) {
            const gs = view.getChild(GameView.ElementType.GAME_SCENE);
            if (gs && gs.touchable) {
                gs.touchMove(x, y, 0);
                return true;
            }
        }

        return false;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @return {boolean} true if event was handled
     */
    mouseUp(x, y) {
        // see if the event was handled by the base class
        const res = super.mouseUp(x, y);
        if (res) {
            return true;
        }

        // see if the game scene is touchable
        const view = this.getView(0);
        if (view) {
            const gs = view.getChild(GameView.ElementType.GAME_SCENE);
            if (gs && gs.touchable) {
                gs.touchUp(x, y, 0);
                return true;
            }
        }

        return false;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @return {boolean} true if event was handled
     */
    doubleClick(x, y) {
        // see if the event was handled by the base class
        const res = super.doubleClick(x, y);
        if (res) {
            return true;
        }

        const view = this.getView(0);
        if (view) {
            const gs = view.getChild(GameView.ElementType.GAME_SCENE);
            if (gs && gs.touchable) {
                gs.doubleClick(x, y, 0);
                return true;
            }
        }

        return false;
    }
}

export default GameController;
