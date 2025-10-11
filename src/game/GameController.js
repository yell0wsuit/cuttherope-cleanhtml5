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

const GameController = ViewController.extend({
    init: function (parent) {
        this._super(parent);
        this.animateRestart = false;
    },
    activate: function () {
        this._super();
        SoundMgr.playGameMusic();
        this.createGameView();
        this.initGameView();
        this.showView(0);
    },
    createGameView: function () {
        const view = new GameView();
        const sc = new GameScene();
        sc.gameController = this;
        sc.animateRestartDim = this.animateRestart;
        this.animateRestart = false;
        view.addChildWithID(sc, GameView.ElementType.GAME_SCENE);

        this.addView(view, 0);
    },

    initGameView: function () {
        this.setPaused(false);
        this.levelFirstStart();
    },
    levelFirstStart: function () {
        this.isGamePaused = false;
    },
    levelStart: function () {
        this.isGamePaused = false;
    },
    onLevelWon: function () {
        SoundMgr.playSound(ResourceId.SND_WIN);
        this.deactivate();
    },
    onLevelLost: function () {
        this.restartLevel();
    },
    setPaused: function (paused) {
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
    },
    pauseLevel: function () {
        const view = this.getView(0);
        if (view) {
            const gs = view.getChild(GameView.ElementType.GAME_SCENE);
            if (gs) {
                gs.dimTime = 0.0;
                this.setPaused(true);
            }
        }
    },
    resumeLevel: function () {
        this.setPaused(false);
    },
    restartLevel: function () {
        this.deleteView(0);
        this.animateRestart = true;
        this.activate();
    },

    /**
     * @param x {number}
     * @param y {number}
     * @return {boolean} true if event was handled
     */
    mouseDown: function (x, y) {
        // see if the event was handled by the base class
        const res = this._super(x, y);
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
    },
    /**
     * @param x {number}
     * @param y {number}
     * @return {boolean} true if event was handled
     */
    mouseDragged: function (x, y) {
        // see if the event was handled by the base class
        const res = this._super(x, y);
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
    },
    /**
     * @param x {number}
     * @param y {number}
     * @return {boolean} true if event was handled
     */
    mouseMoved: function (x, y) {
        // see if the event was handled by the base class
        const res = this._super(x, y);
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
    },
    /**
     * @param x {number}
     * @param y {number}
     * @return {boolean} true if event was handled
     */
    mouseUp: function (x, y) {
        // see if the event was handled by the base class
        const res = this._super(x, y);
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
    },
    /**
     * @param x {number}
     * @param y {number}
     * @return {boolean} true if event was handled
     */
    doubleClick: function (x, y) {
        // see if the event was handled by the base class
        const res = this._super(x, y);
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
    },
});

export default GameController;
