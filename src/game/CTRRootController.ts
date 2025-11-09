import ViewController from "@/core/ViewController";
import RootControllerBase from "@/core/RootControllerBase";
import GameController from "@/game/GameController";
import "@/config/editions/net-edition";
import LevelState from "@/game/LevelState";

const ChildController = {
    START: 0,
    MENU: 1,
    LOADING: 2,
    GAME: 3,
} as const;

type ChildControllerValue = (typeof ChildController)[keyof typeof ChildController];

class CTRRootController extends RootControllerBase {
    static readonly ChildController = ChildController;

    startLevel(pack: number, level: number): void {
        LevelState.loadLevel(pack, level);

        if (this.controllerState === ViewController.StateType.INACTIVE) {
            this.activate();
        }

        let gameController = this.getChild(ChildController.GAME) as
            | GameController
            | null
            | undefined;
        if (gameController) {
            gameController.deactivateImmediately();
        }

        gameController = new GameController(this);
        this.addChildWithID(gameController, ChildController.GAME);
        this.activateChild(ChildController.GAME);
    }

    pauseLevel(): void {
        const gameController = this.getChild(ChildController.GAME) as
            | GameController
            | null
            | undefined;
        gameController?.pauseLevel();
    }

    resumeLevel(): void {
        const gameController = this.getChild(ChildController.GAME) as
            | GameController
            | null
            | undefined;
        gameController?.resumeLevel();
    }

    restartLevel(): void {
        const gameController = this.getChild(ChildController.GAME) as
            | GameController
            | null
            | undefined;
        gameController?.restartLevel();
    }

    stopLevel(): void {
        this.deactivateActiveChild();
    }

    isLevelActive(): boolean {
        if (this.controllerState === ViewController.StateType.INACTIVE) {
            return false;
        }

        const gameController = this.getChild(ChildController.GAME) as
            | GameController
            | null
            | undefined;
        if (!gameController) {
            return false;
        }

        if (gameController.controllerState === ViewController.StateType.INACTIVE) {
            return false;
        }

        if (gameController.isGamePaused) {
            return false;
        }

        return true;
    }

    override onChildDeactivated(childType: ChildControllerValue): void {
        super.onChildDeactivated(childType);

        if (childType === ChildController.GAME) {
            this.deleteChild(ChildController.GAME);
        }
    }
}

const ctrRootController = new CTRRootController();

export { CTRRootController };
export type { ChildControllerValue };
export default ctrRootController;
