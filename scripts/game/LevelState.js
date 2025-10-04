define("game/LevelState", ["edition"], function (edition) {
  // manages state of the current level
  var LevelState = {
    loadedMap: null,
    pack: 0,
    level: 0,
    survival: false,

    loadLevel: function (pack, level) {
      this.pack = pack - 1;
      this.level = level - 1;

      var box = edition.boxes[this.pack];
      this.loadedMap = box.levels[this.level];
    },
  };

  return LevelState;
});
