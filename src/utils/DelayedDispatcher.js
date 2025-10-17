class Dispatch {
    constructor(object, callback, param, delay) {
        this.object = object;
        this.callback = callback;
        this.param = param;
        this.delay = delay;
    }
    dispatch() {
        this.callback.apply(
            this.object, // use the object as the context (this) for the callback
            this.param
        );
    }
}

const DelayedDispatcher = {
    dispatchers: [],
    callObject: function (object, callback, param, delay) {
        const dp = new Dispatch(object, callback, param, delay);
        this.dispatchers.push(dp);
    },
    cancelAllDispatches: function () {
        this.dispatchers.length = 0;
    },
    cancelDispatch: function (object, callback, param) {
        for (let i = 0, count = this.dispatchers.length; i < count; i++) {
            const dp = this.dispatchers[i];
            if (dp.object === object && dp.callback === callback && dp.param === param) {
                this.dispatchers.splice(i, 1);
                return;
            }
        }
    },
    update: function (delta) {
        // take a snapshot of the current dispatchers since
        // the queue may be modified during our update
        const currentDps = this.dispatchers.slice(0);

        // update each of the dispatchers
        for (let i = 0, len = currentDps.length; i < len; i++) {
            const dp = currentDps[i];

            // a previous dispatch may have cleared the queue,
            // so make sure it still exists
            const dpIndex = this.dispatchers.indexOf(dp);
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

export default DelayedDispatcher;
