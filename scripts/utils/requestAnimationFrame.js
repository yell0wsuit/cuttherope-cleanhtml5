define("utils/requestAnimationFrame", [], function () {
  // see if the browser natively supports requestAnimationFrame
  var vendors = ["ms", "moz", "webkit", "o"];
  for (var i = 0; i < vendors.length && !window["requestAnimationFrame"]; i++) {
    window["requestAnimationFrame"] =
      window[vendors[i] + "RequestAnimationFrame"];
  }

  // fallback to using setTimeout if requestAnimationFrame isn't available
  if (!window["requestAnimationFrame"]) {
    var renderInterval = 1000 / 60,
      lastTime = 0;
    window["requestAnimationFrame"] = function (callback, element) {
      var currTime = Date.now();
      var timeToCall = Math.max(0, renderInterval - (currTime - lastTime));
      window.setTimeout(function () {
        callback(Date.now());
      }, timeToCall);
      lastTime = currTime + timeToCall;
    };
  }

  return window["requestAnimationFrame"];
});
