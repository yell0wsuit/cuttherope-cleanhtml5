define("game/TutorialText", ["visual/TextImage"], function (TextImage) {
  var TutorialText = TextImage.extend({
    init: function () {
      this._super();
      this.special = 0;
    },
  });

  return TutorialText;
});
