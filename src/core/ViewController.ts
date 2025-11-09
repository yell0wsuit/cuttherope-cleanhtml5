import Constants from "@/utils/Constants";
import PubSub from "@/utils/PubSub";
import type { CTRRootController } from "@/game/CTRRootController";
import type GameView from "@/game/GameView";

// COMMENTS from iOS sources:
// controller philosophy
// - there's a root controller which is notified about every controller state change
// - only one controller runs (invokes 'update') at a time
// - controller can control several views (or none)
// - controller can have childs, when controller's child is active, controller itself is paused
// - child controller notifies parent after deactivation

const StateType = {
    INACTIVE: 0,
    ACTIVE: 1,
    PAUSED: 2,
} as const;

type StateNumType = (typeof StateType)[keyof typeof StateType];

class ViewController {
    static StateType = StateType;
    static StateNumType = StateType;

    controllerState: StateNumType;
    views: (GameView | null)[];
    children: (ViewController | null)[];
    activeViewID: number;
    activeChildID: number;
    pausedViewID: number;
    parent: ViewController;
    lastTime: number;
    delta: number;
    frames: number;
    accumDt: number;
    frameRate: number;
    avgDelta: number;
    pastDeltas: number[];

    constructor(parent: ViewController) {
        this.controllerState = StateType.INACTIVE;
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

    activate(): void {
        //Debug.log('View controller activated');
        this.controllerState = ViewController.StateType.ACTIVE;
        PubSub.publish(PubSub.ChannelId.ControllerActivated, this);
    }

    deactivate(): void {
        PubSub.publish(PubSub.ChannelId.ControllerDeactivateRequested, this);
    }

    deactivateImmediately(): void {
        this.controllerState = ViewController.StateType.INACTIVE;
        if (this.activeViewID !== Constants.UNDEFINED) {
            this.hideActiveView();
        }
        // notify root and parent controllers
        PubSub.publish(PubSub.ChannelId.ControllerDeactivated, this);
        this.parent.onChildDeactivated(this.parent.activeChildID);
    }

    pause(): void {
        this.controllerState = ViewController.StateType.PAUSED;
        PubSub.publish(PubSub.ChannelId.ControllerPaused, this);

        if (this.activeViewID != Constants.UNDEFINED) {
            this.pausedViewID = this.activeViewID;
            this.hideActiveView();
        }
    }

    unpause(): void {
        this.controllerState = ViewController.StateType.ACTIVE;
        if (this.activeChildID !== Constants.UNDEFINED) {
            this.activeChildID = Constants.UNDEFINED;
        }

        PubSub.publish(PubSub.ChannelId.ControllerUnpaused, this);

        if (this.pausedViewID !== Constants.UNDEFINED) {
            this.showView(this.pausedViewID);
        }
    }

    update(): void {
        if (this.activeViewID === Constants.UNDEFINED) {
            return;
        }

        const v = this.activeView();
        if (!v) {
            return;
        }

        // Physics is frame-rate independent - just pass the actual delta time.
        // Clamp to reasonable bounds to handle tab switches and extreme cases.
        const clampedDelta = this.clampDelta(this.delta);
        if (clampedDelta > 0) {
            v.update(clampedDelta);
        }
    }

    resetLastTime(): void {
        this.lastTime = Constants.UNDEFINED;
    }

    calculateTimeDelta(time: number | undefined): void {
        if (time) {
            this.delta = this.lastTime !== Constants.UNDEFINED ? (time - this.lastTime) / 1000 : 0;
            this.lastTime = time;
        }
    }

    // Make sure a delta doesn't exceed some reasonable bounds
    // Delta changes might be large if we are using requestAnimationFrame
    // and the user switches tabs (the browser will stop calling us to
    // preserve power).
    clampDelta(delta: number): number {
        if (delta <= 0) {
            return 0;
        }

        if (delta > 0.05) {
            // dont go below the delta for 20 fps
            return 0.05;
        }
        return delta;
    }

    calculateFPS(): void {
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
                this.avgDelta += this.pastDeltas[i] ?? 0;
            }
            this.avgDelta /= len;
        }
    }

    addView(v: GameView, index: number): void {
        this.views[index] = v;
    }

    deleteView(viewIndex: number): void {
        this.views[viewIndex] = null;
    }

    hideActiveView(): void {
        const previousView = this.views[this.activeViewID];
        if (previousView) {
            PubSub.publish(PubSub.ChannelId.ControllerViewHidden, previousView);
            previousView.hide();
            this.activeViewID = Constants.UNDEFINED;
        }
    }

    showView(index: number): void {
        if (this.activeViewID != Constants.UNDEFINED) {
            this.hideActiveView();
        }
        this.activeViewID = index;
        const v = this.views[index];
        if (v) {
            PubSub.publish(PubSub.ChannelId.ControllerViewShow, v);
            v.show();
        }
    }

    activeView(): GameView | null | undefined {
        return this.views[this.activeViewID];
    }

    getView(index: number): GameView | null | undefined {
        return this.views[index];
    }

    addChildWithID(controller: ViewController, index: number): void {
        this.children[index] = controller;
    }

    deleteChild(index: number): void {
        this.children[index] = null;
        if (this.activeChildID === index) {
            this.activeChildID = Constants.UNDEFINED;
        }
    }

    deactivateActiveChild(): void {
        if (this.activeChildID !== Constants.UNDEFINED) {
            const prevController = this.children[this.activeChildID];
            if (prevController) {
                prevController.deactivate();
            }
            this.activeChildID = Constants.UNDEFINED;
        }
    }

    activateChild(index: number): void {
        if (this.activeChildID !== Constants.UNDEFINED) {
            this.deactivateActiveChild();
        }

        this.pause();
        this.activeChildID = index;
        const child = this.children[index];
        if (child) {
            child.activate();
        }
    }

    onChildDeactivated(childType: number): void {
        this.unpause();
    }

    activeChild(): ViewController | null | undefined {
        return this.children[this.activeChildID];
    }

    getChild(index: number): ViewController | null | undefined {
        return this.children[index];
    }

    mouseDown(x: number, y: number): boolean {
        if (this.activeViewID === Constants.UNDEFINED) {
            return false;
        }
        const view = this.views[this.activeViewID];
        if (!view) {
            return false;
        }
        return view.onTouchDown(x, y);
    }

    mouseUp(x: number, y: number): boolean {
        if (this.activeViewID === Constants.UNDEFINED) {
            return false;
        }
        const view = this.views[this.activeViewID];
        if (!view) {
            return false;
        }
        return view.onTouchUp(x, y);
    }

    mouseDragged(x: number, y: number): boolean {
        if (this.activeViewID === Constants.UNDEFINED) {
            return false;
        }
        const view = this.views[this.activeViewID];
        if (!view) {
            return false;
        }
        return view.onTouchMove(x, y);
    }

    mouseMoved(x: number, y: number): boolean {
        // only drag events are used
        return false;
    }

    doubleClick(x: number, y: number): boolean {
        if (this.activeViewID === Constants.UNDEFINED) {
            return false;
        }
        const view = this.views[this.activeViewID];
        if (!view) {
            return false;
        }
        return view.onDoubleClick(x, y);
    }
}

export default ViewController;
