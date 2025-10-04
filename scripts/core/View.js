define("core/View", ["visual/BaseElement", "resolution"], function (
  BaseElement,
  resolution,
) {
  var View = BaseElement.extend({
    init: function () {
      this._super();
      this.width = resolution.CANVAS_WIDTH;
      this.height = resolution.CANVAS_HEIGHT;
    },
  });

  return View;
});
