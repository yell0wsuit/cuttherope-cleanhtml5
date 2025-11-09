import type { CTRRootController } from "@/game/CTRRootController";
import ViewController from "@/core/ViewController";
import GameScene from "@/GameScene";
import GameView from "@/game/GameView";
import SoundMgr from "@/game/CTRSoundMgr";
import ResourceId from "@/resources/ResourceId";

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
} as const;

const ExitCodeFrom = {
    PAUSE_MENU: 0,
    PAUSE_MENU_LEVEL_SELECT: 1,
    PAUSE_MENU_LEVEL_SELECT_NEXT_PACK: 2,
} as const;

class GameController extends ViewController {
    static readonly GameButton = GameButton;
    static readonly ExitCodeFrom = ExitCodeFrom;

    private animateRestart: boolean;
    isGamePaused: boolean;

    constructor(parent: CTRRootController) {
        super(parent);
        this.animateRestart = false;
        this.isGamePaused = false;
    }

    override activate(): void {
        super.activate();
        SoundMgr.playGameMusic();
        this.createGameView();
        this.initGameView();
        this.showView(0);
    }

    private createGameView(): void {
        const view = new GameView();
        const scene = new GameScene();
        scene.gameController = this;
        scene.animateRestartDim = this.animateRestart;
        this.animateRestart = false;
        view.addChildWithID(scene, GameView.ElementType.GAME_SCENE);

        this.addView(view, 0);
    }

    private initGameView(): void {
        this.setPaused(false);
        this.levelFirstStart();
    }

    private levelFirstStart(): void {
        this.isGamePaused = false;
    }

    levelStart(): void {
        this.isGamePaused = false;
    }

    onLevelWon(): void {
        SoundMgr.playSound(ResourceId.SND_WIN);
        this.deactivate();
    }

    onLevelLost(): void {
        this.restartLevel();
    }

    setPaused(paused: boolean): void {
        this.isGamePaused = paused;

        const view = this.getView(0);
        if (!view) {
            return;
        }

        const scene = view.getChild(GameView.ElementType.GAME_SCENE) as GameScene | undefined;
        if (!scene) {
            return;
        }

        scene.touchable = !paused;
        scene.updateable = !paused;

        if (paused) {
            SoundMgr.pauseAudio();
        } else {
            SoundMgr.resumeAudio();
        }
    }

    pauseLevel(): void {
        const view = this.getView(0);
        if (!view) {
            return;
        }

        const scene = view.getChild(GameView.ElementType.GAME_SCENE) as GameScene | undefined;
        if (!scene) {
            return;
        }

        scene.dimTime = 0;
        this.setPaused(true);
    }

    resumeLevel(): void {
        this.setPaused(false);
    }

    restartLevel(): void {
        this.deleteView(0);
        this.animateRestart = true;
        this.activate();
    }

    override mouseDown(x: number, y: number): boolean {
        const handledByBase = super.mouseDown(x, y);
        if (handledByBase) {
            return true;
        }

        const view = this.getView(0);
        if (!view) {
            return false;
        }

        const scene = view.getChild(GameView.ElementType.GAME_SCENE) as GameScene | undefined;
        if (scene?.touchable) {
            scene.touchDown(x, y, 0);
            return true;
        }

        return false;
    }

    override mouseDragged(x: number, y: number): boolean {
        const handledByBase = super.mouseDragged(x, y);
        if (handledByBase) {
            return true;
        }

        const view = this.getView(0);
        if (!view) {
            return false;
        }

        const scene = view.getChild(GameView.ElementType.GAME_SCENE) as GameScene | undefined;
        if (scene?.touchable) {
            scene.touchDragged(x, y, 0);
            return true;
        }

        return false;
    }

    override mouseMoved(x: number, y: number): boolean {
        const handledByBase = super.mouseMoved(x, y);
        if (handledByBase) {
            return true;
        }

        const view = this.getView(0);
        if (!view) {
            return false;
        }

        const scene = view.getChild(GameView.ElementType.GAME_SCENE) as GameScene | undefined;
        if (scene?.touchable) {
            scene.touchMove(x, y, 0);
            return true;
        }

        return false;
    }

    override mouseUp(x: number, y: number): boolean {
        const handledByBase = super.mouseUp(x, y);
        if (handledByBase) {
            return true;
        }

        const view = this.getView(0);
        if (!view) {
            return false;
        }

        const scene = view.getChild(GameView.ElementType.GAME_SCENE) as GameScene | undefined;
        if (scene?.touchable) {
            scene.touchUp(x, y, 0);
            return true;
        }

        return false;
    }

    override doubleClick(x: number, y: number): boolean {
        const handledByBase = super.doubleClick(x, y);
        if (handledByBase) {
            return true;
        }

        const view = this.getView(0);
        if (!view) {
            return false;
        }

        const scene = view.getChild(GameView.ElementType.GAME_SCENE) as GameScene | undefined;
        if (scene?.touchable) {
            scene.doubleClick(x, y, 0);
            return true;
        }

        return false;
    }
}

export default GameController;
