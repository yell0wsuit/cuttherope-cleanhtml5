import Constants from "@/utils/Constants";
import PubSub from "@/utils/PubSub";

// COMMENTS from iOS sources:
// controller philosophy
// - there's a root controller which is notified about every controller state change
// - only one controller runs (invokes 'update') at a time
// - controller can control several views (or none)
// - controller can have childs, when controller's child is active, controller itself is paused
// - child controller notifies parent after deactivation

//noinspection JSUnusedLocalSymbols
/**
 * @constructor
 */
class ViewController {
    constructor(parent) {
        this.controllerState = ViewController.StateType.INACTIVE;
        this.views = [];
        this.children = [];
        this.activeViewID = Constants.UNDEFINED;
        this.activeChildID = Constants.UNDEFINED;
        this.pausedViewID = Constants.UNDEFINED;
        this.parent = parent;
        this.lastTime = Constants.UNDEFINED;
        this.delta = 0;
        this.frames = 0;
        this.accumDt = 0;
        this.frameRate = 0;

        // like a bank account for frame updates. we try to keep our
        // balance under 1 by doing extra frame updates when above 1
        this.frameBalance = 0;

        // initially assume we are getting 60 fps
        this.avgDelta = 1 / 60;

        // keep the last five deltas (init with target fps)
        this.pastDeltas = [
            this.avgDelta,
            this.avgDelta,
            this.avgDelta,
            this.avgDelta,
            this.avgDelta,
        ];
    }

    activate() {
        //Debug.log('View controller activated');
        this.controllerState = ViewController.StateType.ACTIVE;
        PubSub.publish(PubSub.ChannelId.ControllerActivated, this);
    }

    deactivate() {
        PubSub.publish(PubSub.ChannelId.ControllerDeactivateRequested, this);
    }

    deactivateImmediately() {
        this.controllerState = ViewController.StateType.INACTIVE;
        if (this.activeViewID !== Constants.UNDEFINED) {
            this.hideActiveView();
        }
        // notify root and parent controllers
        PubSub.publish(PubSub.ChannelId.ControllerDeactivate, this);
        this.parent.onChildDeactivated(this.parent.activeChildID);
    }

    pause() {
        this.controllerState = ViewController.StateType.PAUSED;
        PubSub.publish(PubSub.ChannelId.ControllerPaused, this);

        if (this.activeViewID != Constants.UNDEFINED) {
            this.pausedViewID = this.activeViewID;
            this.hideActiveView();
        }
    }

    unpause() {
        this.controllerState = ViewController.StateType.ACTIVE;
        if (this.activeChildID !== Constants.UNDEFINED) {
            this.activeChildID = Constants.UNDEFINED;
        }

        PubSub.publish(PubSub.ChannelId.ControllerUnpaused, this);

        if (this.pausedViewID !== Constants.UNDEFINED) {
            this.showView(this.pausedViewID);
        }
    }

    update() {
        if (this.activeViewID === Constants.UNDEFINED) {
            return;
        }

        const v = this.activeView();

        // the physics engine needs to be updated at 60fps. we
        // will do up to 3 updates for each frame that is
        // actually rendered. This means we could run as low as 20 fps
        const maxUpdates = Math.min(3, this.frameBalance | 0);
        for (let i = 0; i < maxUpdates; i++) {
            v.update(0.016);
            this.frameBalance -= 1;
        }
    }

    resetLastTime() {
        this.lastTime = Constants.UNDEFINED;
    }

    calculateTimeDelta(time) {
        this.delta = this.lastTime !== Constants.UNDEFINED ? (time - this.lastTime) / 1000 : 0;
        this.lastTime = time;

        // if the physics engine requires 60 fps, how many frames do
        // we need to update?
        this.frameBalance += this.clampDelta(this.delta) / 0.016;
    }

    /**
     * Make sure a delta doesn't exceed some reasonable bounds
     * Delta changes might be large if we are using requestAnimationFrame
     * and the user switches tabs (the browser will stop calling us to
     * preserve power).
     * @param delta {number}
     */
    clampDelta(delta) {
        if (delta < 0.016) {
            // sometimes we'll get a bunch of frames batched together
            // but we don't want to go below the 60 fps delta
            return 0.016;
        } else if (delta > 0.05) {
            // dont go below the delta for 20 fps
            return 0.05;
        }
        return delta;
    }

    calculateFPS() {
        this.frames++;
        this.accumDt += this.delta;

        // update the frame rate every second
        if (this.accumDt > 1) {
            this.frameRate = this.frames / this.accumDt;
            this.frames = 0;
            this.accumDt = 0;

            // advance the queue of past deltas
            this.pastDeltas.shift();
            this.pastDeltas.push(this.clampDelta(1 / this.frameRate));

            // we use a running average to prevent drastic changes
            this.avgDelta = 0;
            const len = this.pastDeltas.length;
            for (let i = 0; i < len; i++) {
                this.avgDelta += this.pastDeltas[i];
            }
            this.avgDelta /= len;
        }
    }

    addView(v, index) {
        this.views[index] = v;
    }

    deleteView(viewIndex) {
        this.views[viewIndex] = null;
    }

    hideActiveView() {
        const previousView = this.views[this.activeViewID];
        if (previousView) {
            PubSub.publish(PubSub.ChannelId.ControllerViewHidden, previousView);
            previousView.hide();
            this.activeViewID = Constants.UNDEFINED;
        }
    }

    showView(index) {
        if (this.activeViewID != Constants.UNDEFINED) {
            this.hideActiveView();
        }
        this.activeViewID = index;
        const v = this.views[index];
        PubSub.publish(PubSub.ChannelId.ControllerViewShow, v);
        v.show();
    }

    activeView() {
        return this.views[this.activeViewID];
    }

    getView(index) {
        return this.views[index];
    }

    addChildWithID(controller, index) {
        this.children[index] = controller;
    }

    deleteChild(index) {
        this.children[index] = null;
        if (this.activeChildID === index) {
            this.activeChildID = Constants.UNDEFINED;
        }
    }

    deactivateActiveChild() {
        if (this.activeChildID !== Constants.UNDEFINED) {
            const prevController = this.children[this.activeChildID];
            if (prevController) {
                prevController.deactivate();
            }
            this.activeChildID = Constants.UNDEFINED;
        }
    }

    activateChild(index) {
        if (this.activeChildID !== Constants.UNDEFINED) {
            this.deactivateActiveChild();
        }

        this.pause();
        this.activeChildID = index;
        this.children[index].activate();
    }

    onChildDeactivated(childType) {
        this.unpause();
    }

    activeChild() {
        return this.children[this.activeChildID];
    }

    getChild(index) {
        return this.children[index];
    }

    /**
     * @param x {number}
     * @param y {number}
     * @return {boolean} true if event was handled
     */
    mouseDown(x, y) {
        if (this.activeViewID === Constants.UNDEFINED) {
            return false;
        }
        return this.views[this.activeViewID].onTouchDown(x, y);
    }

    /**
     * @param x {number}
     * @param y {number}
     * @return {boolean} true if event was handled
     */
    mouseUp(x, y) {
        if (this.activeViewID === Constants.UNDEFINED) {
            return false;
        }
        return this.views[this.activeViewID].onTouchUp(x, y);
    }

    /**
     * @param x {number}
     * @param y {number}
     * @return {boolean} true if event was handled
     */
    mouseDragged(x, y) {
        if (this.activeViewID === Constants.UNDEFINED) {
            return false;
        }
        return this.views[this.activeViewID].onTouchMove(x, y);
    }

    /**
     * @param x {number}
     * @param y {number}
     * @return {boolean} true if event was handled
     */
    mouseMoved(x, y) {
        // only drag events are used
        return false;
    }

    /**
     * @param x {number}
     * @param y {number}
     * @return {boolean} true if event was handled
     */
    doubleClick(x, y) {
        if (this.activeViewID === Constants.UNDEFINED) {
            return false;
        }
        return this.views[this.activeViewID].onDoubleClick(x, y);
    }
}

/**
 * @enum {number}
 */
ViewController.StateType = {
    INACTIVE: 0,
    ACTIVE: 1,
    PAUSED: 2,
};

export default ViewController;
