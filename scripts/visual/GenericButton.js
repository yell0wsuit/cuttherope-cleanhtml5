define("visual/GenericButton", [
  "visual/BaseElement",
  "visual/ImageElement",
  "core/Rectangle",
  "utils/Constants",
  "core/Alignment",
], function (BaseElement, ImageElement, Rectangle, Constants, Alignment) {
  var TOUCH_MOVE_AND_UP_ZONE_INCREASE = 15;

  var GenericButton = BaseElement.extend({
    init: function (id) {
      this._super();

      this.buttonId = id;
      this.state = GenericButton.StateType.UP;

      this.touchLeftInc = 0.0;
      this.touchRightInc = 0.0;
      this.touchTopInc = 0.0;
      this.touchBottomInc = 0.0;

      this.onButtonPressed = null;

      this.forcedTouchZone = new Rectangle(
        Constants.UNDEFINED,
        Constants.UNDEFINED,
        Constants.UNDEFINED,
        Constants.UNDEFINED,
      );
    },
    initWithElements: function (up, down) {
      up.parentAnchor = down.parentAnchor = Alignment.TOP | Alignment.LEFT;
      this.addChildWithID(up, GenericButton.StateType.UP);
      this.addChildWithID(down, GenericButton.StateType.DOWN);
      this.setState(GenericButton.StateType.UP);
    },
    initWithTextures: function (upTexture, downTexture) {
      var up = new ImageElement();
      up.initTexture(upTexture);

      var down = new ImageElement();
      down.initTexture(downTexture);

      this.initWithElements(up, down);
    },
    forceTouchRect: function (rect) {
      this.forcedTouchZone = rect;
    },
    setTouchIncrease: function (left, right, top, bottom) {
      this.touchLeftInc = left;
      this.touchRightInc = right;
      this.touchTopInc = top;
      this.touchBottomInc = bottom;
    },
    setState: function (s) {
      this.state = s;
      var up = this.getChild(GenericButton.StateType.UP),
        down = this.getChild(GenericButton.StateType.DOWN);

      up.setEnabled(s === GenericButton.StateType.UP);
      down.setEnabled(s === GenericButton.StateType.DOWN);
    },
    isInTouchZone: function (tx, ty, td) {
      var tzIncrease = td ? 0 : TOUCH_MOVE_AND_UP_ZONE_INCREASE;

      if (this.forcedTouchZone.w !== Constants.UNDEFINED) {
        return Rectangle.pointInRect(
          tx,
          ty,
          this.drawX + this.forcedTouchZone.x - tzIncrease,
          this.drawY + this.forcedTouchZone.y - tzIncrease,
          this.forcedTouchZone.w + tzIncrease * 2,
          this.forcedTouchZone.h + tzIncrease * 2,
        );
      } else {
        return Rectangle.pointInRect(
          tx,
          ty,
          this.drawX - this.touchLeftInc - tzIncrease,
          this.drawY - this.touchTopInc - tzIncrease,
          this.width +
            (this.touchLeftInc + this.touchRightInc) +
            tzIncrease * 2,
          this.height +
            (this.touchTopInc + this.touchBottomInc) +
            tzIncrease * 2,
        );
      }
    },
    onTouchDown: function (tx, ty) {
      this._super(tx, ty);

      if (this.state === GenericButton.StateType.UP) {
        if (this.isInTouchZone(tx, ty, true)) {
          this.setState(GenericButton.StateType.DOWN);
          return true;
        }
      }

      return false;
    },
    onTouchUp: function (tx, ty) {
      this._super(tx, ty);

      if (this.state === GenericButton.StateType.DOWN) {
        this.setState(GenericButton.StateType.UP);
        if (this.isInTouchZone(tx, ty, false)) {
          if (this.onButtonPressed) {
            this.onButtonPressed(this.buttonId);
          }
          return true;
        }
      }

      return false;
    },
    onTouchMove: function (tx, ty) {
      this._super(tx, ty);

      if (this.state === GenericButton.StateType.DOWN) {
        if (!this.isInTouchZone(tx, ty, false)) {
          this.setState(GenericButton.StateType.UP);
        } else {
          return true;
        }
      }

      return false;
    },
    addChildWithID: function (child, id) {
      this._super(child, id);

      child.parentAnchor = Alignment.TOP | Alignment.LEFT;

      if (id === GenericButton.StateType.DOWN) {
        this.width = child.width;
        this.height = child.height;
        this.setState(GenericButton.StateType.UP);
      }
    },
  });

  GenericButton.StateType = {
    UP: 0,
    DOWN: 1,
  };

  return GenericButton;
});
