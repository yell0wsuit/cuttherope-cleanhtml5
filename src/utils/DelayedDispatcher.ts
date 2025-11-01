/**
 * Represents a single delayed dispatch operation.
 */
class Dispatch {
    /**
     * @param {object} object - The context in which the callback is executed.
     * @param {() => void} callback - The function to call after the delay.
     * @param {any[] | null} param - The arguments to pass to the callback.
     * @param {number} delay - The delay time (in milliseconds or time units) before dispatching.
     */
    constructor(object, callback, param, delay) {
        /** @type {object} */
        this.object = object;
        /** @type {() => void} */
        this.callback = callback;
        /** @type {any[] | null} */
        this.param = param;
        /** @type {number} */
        this.delay = delay;
    }

    /**
     * Executes the stored callback with its parameters and context.
     */
    dispatch() {
        this.callback.apply(this.object, this.param);
    }
}

/**
 * Manages delayed function calls with a per-update countdown system.
 * Use `update(delta)` each frame/tick to process active dispatches.
 */
class DelayedDispatcher {
    constructor() {
        /** @type {Dispatch[]} */
        this.dispatchers = [];
    }

    /**
     * Schedules a new delayed callback.
     * @param {object} object - The `this` context for the callback.
     * @param {() => void} callback - The function to call.
     * @param {any[] | null} param - The arguments to pass to the callback.
     * @param {number} delay - The delay time before execution.
     */
    callObject(object, callback, param, delay) {
        const dp = new Dispatch(object, callback, param, delay);
        this.dispatchers.push(dp);
    }

    /**
     * Cancels all scheduled dispatches.
     */
    cancelAllDispatches() {
        this.dispatchers.length = 0;
    }

    /**
     * Cancels a specific scheduled dispatch based on its parameters.
     * @param {object} object - The same context used when calling `callObject`.
     * @param {() => void} callback - The callback to cancel.
     * @param {any[] | null} param - The parameter used during registration.
     */
    cancelDispatch(object, callback, param) {
        for (let i = 0; i < this.dispatchers.length; i++) {
            const dp = this.dispatchers[i];
            if (dp.object === object && dp.callback === callback && dp.param === param) {
                this.dispatchers.splice(i, 1);
                return;
            }
        }
    }

    /**
     * Updates all active dispatches by subtracting delta time.
     * Executes and removes any whose delay reaches zero or below.
     * @param {number} delta - The time increment (usually per frame).
     */
    update(delta) {
        // Make a shallow copy since dispatchers may be modified during iteration
        const currentDps = this.dispatchers.slice();

        for (let i = 0; i < currentDps.length; i++) {
            const dp = currentDps[i];
            const dpIndex = this.dispatchers.indexOf(dp);

            // Skip if already removed
            if (dpIndex < 0) continue;

            dp.delay -= delta;
            if (dp.delay <= 0) {
                // Remove from main list before executing
                this.dispatchers.splice(dpIndex, 1);
                dp.dispatch();
            }
        }
    }
}

export default new DelayedDispatcher();
