import ViewController from "@/core/ViewController";
import PointerCapture from "@/utils/PointerCapture";
import ZoomManager from "@/ZoomManager";
import Constants from "@/utils/Constants";
import settings from "@/game/CTRSettings";
import resolution from "@/resolution";
import PubSub from "@/utils/PubSub";
import Canvas from "@/utils/Canvas";
import RGBAColor from "@/core/RGBAColor";
/**
 * @const
 * @type {number}
 */
const TRANSITION_DEFAULT_DELAY = 0.3;

/**
 * @enum {number}
 */
const ViewTransition = {
    SLIDE_HORIZONTAL_RIGHT: 0,
    SLIDE_HORIZONTAL_LEFT: 1,
    SLIDE_VERTICAL_UP: 2,
    SLIDE_VERTICAL_DOWN: 3,
    FADE_OUT_BLACK: 4,
    FADE_OUT_WHITE: 5,
    REVEAL: 6,
    COUNT: 7,
};

class RootController extends ViewController {
    constructor(parent) {
        super(parent);
        this.suspended = false;
        this.currentController = null;
        this.viewTransition = Constants.UNDEFINED;
        this.transitionTime = Constants.UNDEFINED;
        this.previousView = null;
        this.transitionDelay = TRANSITION_DEFAULT_DELAY;
        this.deactivateCurrentController = false;
        this.dragMode = false;
        this.controllerSubscriptions = [];

        this.subscribeToControllerEvents();
    }

    subscribeToControllerEvents() {
        if (!this.controllerSubscriptions) {
            this.controllerSubscriptions = [];
        }

        if (this.controllerSubscriptions.length > 0) {
            return;
        }

        this.controllerSubscriptions.push(
            PubSub.subscribe(
                PubSub.ChannelId.ControllerActivated,
                this.onControllerActivated.bind(this)
            ),
            PubSub.subscribe(
                PubSub.ChannelId.ControllerDeactivateRequested,
                this.onControllerDeactivationRequest.bind(this)
            ),
            PubSub.subscribe(
                PubSub.ChannelId.ControllerDeactivated,
                this.onControllerDeactivated.bind(this)
            ),
            PubSub.subscribe(PubSub.ChannelId.ControllerPaused, this.onControllerPaused.bind(this)),
            PubSub.subscribe(
                PubSub.ChannelId.ControllerUnpaused,
                this.onControllerUnpaused.bind(this)
            ),
            PubSub.subscribe(
                PubSub.ChannelId.ControllerViewHidden,
                this.onControllerViewHide.bind(this)
            ),
            PubSub.subscribe(
                PubSub.ChannelId.ControllerViewShow,
                this.onControllerViewShow.bind(this)
            )
        );
    }

    unsubscribeFromControllerEvents() {
        if (!this.controllerSubscriptions) {
            return;
        }

        while (this.controllerSubscriptions.length) {
            PubSub.unsubscribe(this.controllerSubscriptions.pop());
        }
    }

    operateCurrentMVC(time) {
        if (this.suspended || this.currentController === null) {
            return;
        }

        // pass control to the active controller
        this.currentController.calculateTimeDelta(time);
        if (this.transitionTime === Constants.UNDEFINED) {
            this.currentController.update();
        }

        if (this.deactivateCurrentController) {
            this.deactivateCurrentController = false;
            this.currentController.deactivateImmediately();
        }

        // draw the active view
        if (this.currentController.activeViewID !== Constants.UNDEFINED) {
            const activeView = this.currentController.activeView();
            if (activeView) {
                activeView.draw();
            }

            // always calc fps because we use the avg to adjust delta at runtime
            this.currentController.calculateFPS();

            // draw the fps meter
            if (settings.fpsEnabled) {
                // make sure we have one cycle of measurements
                const frameRate = this.currentController.frameRate.toFixed(0);
                if (frameRate > 0) {
                    // draw the fps frame rate
                    const ctx = Canvas.context;
                    ctx.font = "20px Arial";
                    ctx.fillStyle = RGBAColor.styles.SOLID_OPAQUE;
                    ctx.fillText(frameRate + " fps", 10, resolution.CANVAS_HEIGHT - 10);
                }
            }
        }
    }

    activateMouseEvents() {
        // ensure the pointer capture helper has been created
        if (!this.pointerCapture) {
            this.pointerCapture = new PointerCapture({
                element: Canvas.element,
                onStart: this.mouseDown.bind(this),
                onMove: this.mouseMove.bind(this),
                onEnd: this.mouseUp.bind(this),
                onOut: this.mouseOut.bind(this),
                getZoom() {
                    return ZoomManager.getCanvasZoom();
                },
            });
        }

        this.pointerCapture.activate();
    }

    deactivateMouseEvents() {
        if (this.pointerCapture) {
            this.pointerCapture.deactivate();
        }
    }

    activate() {
        super.activate();
        this.subscribeToControllerEvents();
        this.activateMouseEvents();

        // called to render a frame
        const requestAnimationFrame = window["requestAnimationFrame"],
            animationLoop = () => {
                const now = Date.now();
                this.operateCurrentMVC(now);
                if (!this.stopAnimation) {
                    requestAnimationFrame(animationLoop);
                }
            };

        // start the animation loop
        this.stopAnimation = false;
        animationLoop();
    }

    deactivate() {
        super.deactivate();

        // set flag to stop animation
        this.stopAnimation = true;

        // remove mouse events
        this.deactivateMouseEvents();
        this.unsubscribeFromControllerEvents();
    }

    setCurrentController(controller) {
        this.currentController = controller;
        this.currentController.idealDelta = 1 / 60;
    }

    getCurrentController() {
        return this.currentController;
    }

    onControllerActivated(controller) {
        this.setCurrentController(controller);
    }

    onControllerDeactivated(controller) {
        this.currentController = null;
    }

    onControllerPaused(controller) {
        this.currentController = null;
    }

    onControllerUnpaused(controller) {
        this.setCurrentController(controller);
    }

    onControllerDeactivationRequest(controller) {
        this.deactivateCurrentController = true;
    }

    onControllerViewShow(view) {
        if (this.viewTransition !== Constants.UNDEFINED && this.previousView != null) {
            this.currentController.calculateTimeDelta();
            this.transitionTime = this.currentController.lastTime + this.transitionDelay;
            const activeView = this.currentController.activeView();
            if (activeView) {
                activeView.draw();
            }
        }
    }

    onControllerViewHide(view) {
        this.previousView = view;
        if (this.viewTransition !== Constants.UNDEFINED && this.previousView != null) {
            this.previousView.draw();
        }
    }

    isSuspended() {
        return this.suspended;
    }

    suspend() {
        this.suspended = true;
    }

    resume() {
        if (this.currentController) {
            this.currentController.resetLastTime();
        }
        this.suspended = false;
    }

    mouseDown(x, y) {
        if (this.currentController && this.currentController != this) {
            //Log.debug('mouse down at:' + x + ',' + y + ' drag mode was:' + this.dragMode);
            this.dragMode = true;
            return this.currentController.mouseDown(x, y);
        }
        return false;
    }

    mouseMove(x, y) {
        if (this.currentController && this.currentController != this) {
            if (this.dragMode) {
                this.currentController.mouseDragged(x, y);
            }

            // fire moved event even if drag event was also fired
            return this.currentController.mouseMoved(x, y);
        }
        return false;
    }

    mouseUp(x, y) {
        if (this.currentController && this.currentController != this) {
            //Log.debug('mouse up at:' + x + ',' + y + ' drag mode was:' + this.dragMode);
            const handled = this.currentController.mouseUp(x, y);
            this.dragMode = false;
            return handled;
        }
        return false;
    }

    mouseOut(x, y) {
        if (this.currentController && this.currentController != this) {
            // if the mouse leaves the canvas while down, trigger the mouseup
            // event because we won't get it if the user lets go outside
            if (this.dragMode) {
                //Log.debug('mouse out at:' + x + ',' + y);
                const handled = this.currentController.mouseUp(x, y);
                this.dragMode = false;
                return handled;
            }
        }
        return false;
    }

    doubleClick(x, y) {
        if (this.currentController && this.currentController != this) {
            //Log.debug('double click at:' + x + ',' + y + ' drag mode was:' + this.dragMode);
            this.currentController.mouseUp(x, y);
            this.dragMode = false;
            return this.currentController.doubleClick(x, y);
        }
        return false;
    }
}

export default RootController;
