import type { CTRRootController } from "@/game/CTRRootController";
import type GameView from "@/game/GameView";
import ViewController from "@/core/ViewController";
import PointerCapture from "@/utils/PointerCapture";
import ZoomManager from "@/ZoomManager";
import Constants from "@/utils/Constants";
import settings from "@/game/CTRSettings";
import resolution from "@/resolution";
import PubSub, { type SubscriptionHandle } from "@/utils/PubSub";
import Canvas from "@/utils/Canvas";
import RGBAColor from "@/core/RGBAColor";

const TRANSITION_DEFAULT_DELAY = 0.3;

const ViewTransition = {
    SLIDE_HORIZONTAL_RIGHT: 0,
    SLIDE_HORIZONTAL_LEFT: 1,
    SLIDE_VERTICAL_UP: 2,
    SLIDE_VERTICAL_DOWN: 3,
    FADE_OUT_BLACK: 4,
    FADE_OUT_WHITE: 5,
    REVEAL: 6,
    COUNT: 7,
} as const;

type ViewTransitionValue = (typeof ViewTransition)[keyof typeof ViewTransition];

class RootControllerBase extends ViewController {
    static readonly ViewTransition = ViewTransition;

    protected suspended: boolean;
    protected currentController: ViewController | null;
    protected viewTransition: ViewTransitionValue | number;
    protected transitionTime: number;
    protected previousView: GameView | null;
    protected transitionDelay: number;
    protected deactivateCurrentController: boolean;
    protected dragMode: boolean;
    protected controllerSubscriptions: SubscriptionHandle[];
    protected pointerCapture: PointerCapture | null;
    protected stopAnimation: boolean;
    idealDelta: number | undefined;

    constructor(parent?: CTRRootController) {
        super(parent as CTRRootController);
        this.suspended = false;
        this.currentController = null;
        this.viewTransition = Constants.UNDEFINED;
        this.transitionTime = Constants.UNDEFINED;
        this.previousView = null;
        this.transitionDelay = TRANSITION_DEFAULT_DELAY;
        this.deactivateCurrentController = false;
        this.dragMode = false;
        this.controllerSubscriptions = [];
        this.pointerCapture = null;
        this.stopAnimation = false;
        this.idealDelta = undefined;

        this.subscribeToControllerEvents();
    }

    subscribeToControllerEvents(): void {
        if (this.controllerSubscriptions.length > 0) {
            return;
        }

        this.controllerSubscriptions.push(
            PubSub.subscribe(PubSub.ChannelId.ControllerActivated, (controller) =>
                this.onControllerActivated(controller as ViewController)
            ),
            PubSub.subscribe(PubSub.ChannelId.ControllerDeactivateRequested, (controller) =>
                this.onControllerDeactivationRequest(controller as ViewController)
            ),
            PubSub.subscribe(PubSub.ChannelId.ControllerDeactivated, (controller) =>
                this.onControllerDeactivated(controller as ViewController)
            ),
            PubSub.subscribe(PubSub.ChannelId.ControllerPaused, (controller) =>
                this.onControllerPaused(controller as ViewController)
            ),
            PubSub.subscribe(PubSub.ChannelId.ControllerUnpaused, (controller) =>
                this.onControllerUnpaused(controller as ViewController)
            ),
            PubSub.subscribe(PubSub.ChannelId.ControllerViewHidden, (view) =>
                this.onControllerViewHide(view as GameView)
            ),
            PubSub.subscribe(PubSub.ChannelId.ControllerViewShow, (view) =>
                this.onControllerViewShow(view as GameView)
            )
        );
    }

    unsubscribeFromControllerEvents(): void {
        while (this.controllerSubscriptions.length) {
            const subscription = this.controllerSubscriptions.pop();
            if (subscription) {
                PubSub.unsubscribe(subscription);
            }
        }
    }

    operateCurrentMVC(time?: number): void {
        if (this.suspended || this.currentController === null) {
            return;
        }

        this.currentController.calculateTimeDelta(time);
        if (this.transitionTime === Constants.UNDEFINED) {
            this.currentController.update();
        }

        if (this.deactivateCurrentController) {
            this.deactivateCurrentController = false;
            this.currentController.deactivateImmediately();
        }

        if (this.currentController.activeViewID !== Constants.UNDEFINED) {
            const activeView = this.currentController.activeView();
            activeView?.draw();

            this.currentController.calculateFPS();

            if (settings.fpsEnabled) {
                const frameRate = this.currentController.frameRate.toFixed(0);
                if (Number(frameRate) > 0) {
                    const ctx = Canvas.context;
                    if (ctx) {
                        ctx.font = "30px system-ui, sans-serif";
                        ctx.fillStyle = RGBAColor.styles.SOLID_OPAQUE;
                        ctx.fillText(`${frameRate} fps`, 10, resolution.CANVAS_HEIGHT - 10);
                    }
                }
            }
        }
    }

    activateMouseEvents(): void {
        if (!this.pointerCapture) {
            const element = Canvas.element;
            if (!element) {
                return;
            }

            this.pointerCapture = new PointerCapture({
                element,
                onStart: this.mouseDown.bind(this),
                onMove: this.mouseMove.bind(this),
                onEnd: this.mouseUp.bind(this),
                onOut: this.mouseOut.bind(this),
                getZoom() {
                    return ZoomManager.getCanvasZoom();
                },
            });
        }

        this.pointerCapture?.activate();
    }

    deactivateMouseEvents(): void {
        this.pointerCapture?.deactivate();
    }

    override activate(): void {
        super.activate();
        this.subscribeToControllerEvents();
        this.activateMouseEvents();

        const requestAnimationFrame = window.requestAnimationFrame.bind(window);
        const animationLoop = (): void => {
            const now = Date.now();
            this.operateCurrentMVC(now);
            if (!this.stopAnimation) {
                requestAnimationFrame(animationLoop);
            }
        };

        this.stopAnimation = false;
        animationLoop();
    }

    override deactivate(): void {
        super.deactivate();

        // set flag to stop animation
        this.stopAnimation = true;

        // remove mouse events
        this.deactivateMouseEvents();
        this.unsubscribeFromControllerEvents();
    }

    setCurrentController(controller: ViewController | null): void {
        this.currentController = controller;
        if (!controller) {
            return;
        }

        const controllerWithIdealDelta = controller as ViewController & { idealDelta?: number };
        controllerWithIdealDelta.idealDelta = 1 / 60;
    }

    getCurrentController(): ViewController | null {
        return this.currentController;
    }

    onControllerActivated(controller: ViewController): void {
        this.setCurrentController(controller);
    }

    onControllerDeactivated(_: ViewController): void {
        this.currentController = null;
    }

    onControllerPaused(_: ViewController): void {
        this.currentController = null;
    }

    onControllerUnpaused(controller: ViewController): void {
        this.setCurrentController(controller);
    }

    onControllerDeactivationRequest(_: ViewController): void {
        this.deactivateCurrentController = true;
    }

    onControllerViewShow(view: GameView): void {
        if (this.viewTransition !== Constants.UNDEFINED && this.previousView != null) {
            const currentControllerConst = this.currentController;
            if (currentControllerConst) {
                currentControllerConst.calculateTimeDelta(undefined);
                this.transitionTime = currentControllerConst.lastTime + this.transitionDelay;
                currentControllerConst.activeView()?.draw();
            }
        }
    }

    onControllerViewHide(view: GameView): void {
        this.previousView = view;
        if (this.viewTransition !== Constants.UNDEFINED && this.previousView != null) {
            this.previousView.draw();
        }
    }

    isSuspended(): boolean {
        return this.suspended;
    }

    suspend(): void {
        this.suspended = true;
    }

    resume(): void {
        if (this.currentController) {
            this.currentController.resetLastTime();
        }
        this.suspended = false;
    }

    override mouseDown(x: number, y: number): boolean {
        if (this.currentController && this.currentController !== this) {
            this.dragMode = true;
            return this.currentController.mouseDown(x, y);
        }
        return false;
    }

    mouseMove(x: number, y: number): boolean {
        if (this.currentController && this.currentController !== this) {
            if (this.dragMode) {
                this.currentController.mouseDragged(x, y);
            }

            return this.currentController.mouseMoved(x, y);
        }
        return false;
    }

    override mouseUp(x: number, y: number): boolean {
        if (this.currentController && this.currentController !== this) {
            const handled = this.currentController.mouseUp(x, y);
            this.dragMode = false;
            return handled;
        }
        return false;
    }

    mouseOut(x: number, y: number): boolean {
        if (this.currentController && this.currentController !== this) {
            if (this.dragMode) {
                const handled = this.currentController.mouseUp(x, y);
                this.dragMode = false;
                return handled;
            }
        }
        return false;
    }

    override doubleClick(x: number, y: number): boolean {
        if (this.currentController && this.currentController !== this) {
            this.currentController.mouseUp(x, y);
            this.dragMode = false;
            return this.currentController.doubleClick(x, y);
        }
        return false;
    }
}

export default RootControllerBase;
