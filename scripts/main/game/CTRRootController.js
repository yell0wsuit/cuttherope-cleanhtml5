import ViewController from "core/ViewController";
import RootControllerBase from "core/RootControllerBase";
import GameController from "game/GameController";
import edition from "edition";
import LevelState from "game/LevelState";
/**
 * @enum {number}
 */
const ChildController = {
    START: 0,
    MENU: 1,
    LOADING: 2,
    GAME: 3,
};

const CTRRootController = RootControllerBase.extend({
    init: function (parent) {
        this._super(parent);
    },
    startLevel: function (pack, level) {
        LevelState.loadLevel(pack, level);

        // activate the root controller if necessary
        if (this.controllerState === ViewController.StateType.INACTIVE) {
            this.activate();
        }

        // deactivate any existing game that is running
        let gameController = this.getChild(ChildController.GAME);
        if (gameController) {
            gameController.deactivateImmediately();
        }

        // create and add the new game controller
        gameController = new GameController(this);
        this.addChildWithID(gameController, ChildController.GAME);
        this.activateChild(ChildController.GAME);
    },
    pauseLevel: function () {
        const gameController = this.getChild(ChildController.GAME);
        if (gameController) {
            gameController.pauseLevel();
        }
    },
    resumeLevel: function () {
        const gameController = this.getChild(ChildController.GAME);
        if (gameController) {
            gameController.resumeLevel();
        }
    },
    restartLevel: function () {
        const gameController = this.getChild(ChildController.GAME);
        if (gameController) {
            gameController.restartLevel();
        }
    },
    stopLevel: function () {
        this.deactivateActiveChild();
    },
    isLevelActive: function () {
        // is the root controller active?
        if (this.controllerState === ViewController.StateType.INACTIVE) return false;

        // see if the game controller exists
        const gameController = this.getChild(ChildController.GAME);
        if (!gameController) return false;

        // is the game controller active?
        if (gameController.controllerState === ViewController.StateType.INACTIVE) return false;

        // see if the game is paused
        if (gameController.isGamePaused) return false;

        return true;
    },
    onChildDeactivated: function (childType) {
        this._super(childType);

        if (childType == ChildController.GAME) {
            this.deleteChild(ChildController.GAME);
        }
    },
});

export default new CTRRootController();
