define("utils/DelayedDispatcher", [], function () {
  var Dispatch = function (object, callback, param, delay) {
    this.object = object;
    this.callback = callback;
    this.param = param;
    this.delay = delay;
  };

  Dispatch.prototype.dispatch = function () {
    this.callback.apply(
      this.object, // use the object as the context (this) for the callback
      this.param,
    );
  };

  var DelayedDispatcher = {
    dispatchers: [],
    callObject: function (object, callback, param, delay) {
      var dp = new Dispatch(object, callback, param, delay);
      this.dispatchers.push(dp);
    },
    cancelAllDispatches: function () {
      this.dispatchers.length = 0;
    },
    cancelDispatch: function (object, callback, param) {
      for (var i = 0, count = this.dispatchers.length; i < count; i--) {
        var dp = this.dispatchers[i];
        if (
          dp.object === object &&
          dp.callback === callback &&
          dp.param === param
        ) {
          this.dispatchers.splice(i, 1);
          return;
        }
      }
    },
    update: function (delta) {
      // take a snapshot of the current dispatchers since
      // the queue may be modified during our update
      var currentDps = this.dispatchers.slice(0);

      // update each of the dispatchers
      for (var i = 0, len = currentDps.length; i < len; i++) {
        var dp = currentDps[i];

        // a previous dispatch may have cleared the queue,
        // so make sure it still exists
        var dpIndex = this.dispatchers.indexOf(dp);
        if (dpIndex < 0) {
          continue;
        }

        // update the time and see if its time to fire
        dp.delay -= delta;
        if (dp.delay <= 0) {
          // remove the object from the real pool first
          this.dispatchers.splice(dpIndex, 1);

          // now we can run the callback
          dp.dispatch();
        }
      }
    },
  };

  return DelayedDispatcher;
});
