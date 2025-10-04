define("Doors", [
  "resolution",
  "edition",
  "platform",
  "ui/BoxManager",
  "ui/Easing",
  "utils/PubSub",
  "utils/Canvas",
], function (
  resolution,
  edition,
  platform,
  BoxManager,
  Easing,
  PubSub,
  Canvas,
) {
  var doorImages = [],
    tapeImgL = new Image(),
    tapeImgR = new Image();

  var BoxDoors = {};

  $(function () {
    BoxDoors.canvasLeft = document.getElementById("levelCanvasLeft");
    BoxDoors.canvasRight = document.getElementById("levelCanvasRight");

    BoxDoors.canvasLeft.width = (resolution.uiScaledNumber(1024) / 2) | 0;
    BoxDoors.canvasRight.width = (resolution.uiScaledNumber(1024) / 2) | 0;

    BoxDoors.canvasLeft.height = 320;
    BoxDoors.canvasRight.height = 320;

    BoxDoors.currentIndex = BoxManager.currentBoxIndex;
    BoxDoors.showTape = true;
  });

  BoxDoors.appReady = function () {
    // cache the door and tape images (which have already been preloaded)
    for (var i = 0, len = edition.boxDoors.length; i < len; i++) {
      var doorImg = new Image();
      doorImg.src = platform.uiImageBaseUrl + edition.boxDoors[i];
      doorImages[i] = doorImg;
    }

    tapeImgL.src = platform.uiImageBaseUrl + "leveltape_left.png";
    tapeImgR.src = platform.uiImageBaseUrl + "leveltape_right.png";

    BoxDoors.preRenderDoors();
  };

  BoxDoors.preRenderDoors = function () {
    var doorImg = doorImages[BoxManager.currentBoxIndex];
    var leftCtx = BoxDoors.canvasLeft.getContext("2d");
    var rightCtx = BoxDoors.canvasRight.getContext("2d");

    leftCtx.drawImage(doorImg, 0, 0);

    rightCtx.save();
    rightCtx.translate(doorImg.width, doorImg.height);
    rightCtx.rotate(Math.PI);
    rightCtx.drawImage(doorImg, 0, 0);
    rightCtx.restore();

    if (BoxDoors.showTape) {
      //draw the left side tape
      leftCtx.drawImage(
        tapeImgL,
        BoxDoors.canvasLeft.width - resolution.uiScaledNumber(26),
        resolution.uiScaledNumber(10),
      );

      rightCtx.drawImage(tapeImgR, 0, resolution.uiScaledNumber(10));
    }
  };

  BoxDoors.renderDoors = function (showTape, percentOpen) {
    //do another prerender
    if (
      BoxDoors.currentIndex !== BoxManager.currentBoxIndex ||
      BoxDoors.showTape !== showTape
    ) {
      BoxDoors.currentIndex = BoxManager.currentBoxIndex;
      BoxDoors.showTape = showTape;
      BoxDoors.preRenderDoors(showTape);
    }

    //calculations
    var p = percentOpen || 0.0,
      dw = BoxDoors.canvasLeft.width, //door width
      offset = dw - dw * (1 - p); //512 - (512 * (1 - 0.1))

    //use css3 transformations
    $(BoxDoors.canvasLeft).css(
      "transform",
      "translateX(" + -1 * offset + "px)",
    );
    $(BoxDoors.canvasRight).css(
      "transform",
      "translateX(" + (dw + offset) + "px)",
    );
  };

  BoxDoors.openDoors = function (showTape, callback, runInReverse) {
    var r = runInReverse != null ? runInReverse : false;

    var begin = Date.now();
    var dur = 750;
    // Draw the door animation on the main game canvas
    var ctx = document.getElementById("c").getContext("2d");
    var easing = runInReverse ? Easing.easeOutCubic : Easing.easeInOutCubic;

    function openBoxDoors() {
      var now = Date.now(),
        p = now - begin,
        v = easing(p, 0, 1, dur);

      if (v < 1) {
        BoxDoors.renderDoors(showTape, r ? 1 - v : v, ctx);
        window.requestAnimationFrame(openBoxDoors);
      } else {
        BoxDoors.renderDoors(showTape, r ? 0 : 1, ctx);

        if (r) {
          $("#levelPanel").show();
        } else {
          $("#levelPanel").hide();
        }

        if (callback != null) callback();
      }
    }

    window.requestAnimationFrame(openBoxDoors);
  };

  BoxDoors.closeDoors = function (showTape, callback) {
    BoxDoors.openDoors(showTape, callback, true);
  };

  BoxDoors.closeBoxAnimation = function (callback) {
    // animating to level select
    // box already closed, just needs to be taped and then redirected
    var tapeRoll = $("#tapeRoll");
    var tapeSlice = $("#levelTape");

    $("#levelResults").fadeOut(400);
    tapeRoll.css("top", resolution.uiScaledNumber(0));
    tapeRoll.delay(400).fadeIn(200, function () {
      var offset = resolution.uiScaledNumber(650);
      var offsetH = resolution.uiScaledNumber(553);
      var b = Date.now();
      var from = parseInt(tapeRoll.css("top"), 10);
      var fromH = resolution.uiScaledNumber(63);
      var d = 1000;

      tapeSlice.css("height", fromH);
      tapeSlice.show();

      function rollTape() {
        var now = Date.now(),
          diff = now - b,
          v = Easing.easeInOutCubic(diff, from, offset - from, d),
          vH = Easing.easeInOutCubic(diff, fromH, offset - fromH, d);

        tapeRoll.css("top", v);
        tapeSlice.css("height", vH);

        if (diff < d) {
          window.requestAnimationFrame(rollTape);
        } else {
          // hide the tape slice and re-render the doors with tape
          tapeSlice.hide();
          BoxDoors.renderDoors(true);

          //fade out tape and switch panels
          tapeRoll.fadeOut(400, function () {
            setTimeout(callback, 200);
          }); //end fadeOut
        } // end if/else
      } // end rollTape

      window.requestAnimationFrame(rollTape);
    });
  };

  BoxDoors.openBoxAnimation = function (callback) {
    // make sure the doors are rendered closed initially
    BoxDoors.renderDoors(true, 0);

    // make sure the gradient (time edition) is removed
    BoxDoors.hideGradient();

    //cut box open with boxCutter
    var boxCutter = $("#boxCutter");
    boxCutter.css("top", resolution.uiScaledNumber(371));
    boxCutter.delay(200).fadeIn(200, function () {
      var offset = resolution.uiScaledNumber(-255);
      var b = Date.now();
      var from = parseInt(boxCutter.css("top"), 10);
      var d = 1000;

      function cutBox() {
        var now = Date.now(),
          diff = now - b,
          v = Easing.easeInOutCubic(diff, from, offset - from, d);

        boxCutter.css("top", v);

        if (diff < d) {
          window.requestAnimationFrame(cutBox);
        } else {
          //fade out cutter and open doors
          boxCutter.fadeOut(300, callback); //end fadeOut
        } // end if/else
      } // end cutBox

      window.requestAnimationFrame(cutBox);
    });
  };

  BoxDoors.showGradient = function () {};
  BoxDoors.hideGradient = function () {};

  return BoxDoors;
});
