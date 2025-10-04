define("game/CTRRootController", [
  "core/ViewController",
  "core/RootControllerBase",
  "game/GameController",
  "edition",
  "game/LevelState",
], function (
  ViewController,
  RootControllerBase,
  GameController,
  edition,
  LevelState,
) {
  /**
   * @enum {number}
   */
  var ChildController = {
    START: 0,
    MENU: 1,
    LOADING: 2,
    GAME: 3,
  };

  var CTRRootController = RootControllerBase.extend({
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
      var gameController = this.getChild(ChildController.GAME);
      if (gameController) {
        gameController.deactivateImmediately();
      }

      // create and add the new game controller
      gameController = new GameController(this);
      this.addChildWithID(gameController, ChildController.GAME);
      this.activateChild(ChildController.GAME);
    },
    pauseLevel: function () {
      var gameController = this.getChild(ChildController.GAME);
      if (gameController) {
        gameController.pauseLevel();
      }
    },
    resumeLevel: function () {
      var gameController = this.getChild(ChildController.GAME);
      if (gameController) {
        gameController.resumeLevel();
      }
    },
    restartLevel: function () {
      var gameController = this.getChild(ChildController.GAME);
      if (gameController) {
        gameController.restartLevel();
      }
    },
    stopLevel: function () {
      this.deactivateActiveChild();
    },
    isLevelActive: function () {
      // is the root controller active?
      if (this.controllerState === ViewController.StateType.INACTIVE)
        return false;

      // see if the game controller exists
      var gameController = this.getChild(ChildController.GAME);
      if (!gameController) return false;

      // is the game controller active?
      if (gameController.controllerState === ViewController.StateType.INACTIVE)
        return false;

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

  // we only need a singleton instance
  return new CTRRootController();
});
