define("core/RootControllerBase", [
    "core/ViewController",
    "utils/PointerCapture",
    "ZoomManager",
    "utils/Constants",
    "game/CTRSettings",
    "resolution",
    "utils/PubSub",
    "utils/Canvas",
    "core/RGBAColor",
], function (
    ViewController,
    PointerCapture,
    ZoomManager,
    Constants,
    settings,
    resolution,
    PubSub,
    Canvas,
    RGBAColor
) {
    /**
     * @const
     * @type {number}
     */
    var TRANSITION_DEFAULT_DELAY = 0.3;

    /**
     * @enum {number}
     */
    var ViewTransition = {
        SLIDE_HORIZONTAL_RIGHT: 0,
        SLIDE_HORIZONTAL_LEFT: 1,
        SLIDE_VERTICAL_UP: 2,
        SLIDE_VERTICAL_DOWN: 3,
        FADE_OUT_BLACK: 4,
        FADE_OUT_WHITE: 5,
        REVEAL: 6,
        COUNT: 7,
    };

    var RootController = ViewController.extend({
        init: function (parent) {
            this._super(parent);
            this.suspended = false;
            this.currentController = null;
            this.viewTransition = Constants.UNDEFINED;
            this.transitionTime = Constants.UNDEFINED;
            this.previousView = null;
            this.transitionDelay = TRANSITION_DEFAULT_DELAY;
            this.deactivateCurrentController = false;

            // when the user holds down the mouse button while moving the mouse
            this.dragMode = false;

            PubSub.subscribe(
                PubSub.ChannelId.ControllerActivated,
                $.proxy(this.onControllerActivated, this)
            );
            PubSub.subscribe(
                PubSub.ChannelId.ControllerDeactivateRequested,
                $.proxy(this.onControllerDeactivationRequest, this)
            );
            PubSub.subscribe(
                PubSub.ChannelId.ControllerDeactivated,
                $.proxy(this.onControllerDeactivated, this)
            );
            PubSub.subscribe(
                PubSub.ChannelId.ControllerPaused,
                $.proxy(this.onControllerPaused, this)
            );
            PubSub.subscribe(
                PubSub.ChannelId.ControllerUnpaused,
                $.proxy(this.onControllerUnpaused, this)
            );
            PubSub.subscribe(
                PubSub.ChannelId.ControllerViewHidden,
                $.proxy(this.onControllerViewHide, this)
            );
            PubSub.subscribe(
                PubSub.ChannelId.ControllerViewShow,
                $.proxy(this.onControllerViewShow, this)
            );
        },

        operateCurrentMVC: function (time) {
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
                var activeView = this.currentController.activeView();
                if (activeView) {
                    activeView.draw();
                }

                // always calc fps because we use the avg to adjust delta at runtime
                this.currentController.calculateFPS();

                // draw the fps meter
                if (settings.fpsEnabled) {
                    // make sure we have one cycle of measurements
                    var frameRate = this.currentController.frameRate.toFixed(0);
                    if (frameRate > 0) {
                        // draw the fps frame rate
                        var ctx = Canvas.context;
                        ctx.font = "20px Arial";
                        ctx.fillStyle = RGBAColor.styles.SOLID_OPAQUE;
                        ctx.fillText(frameRate + " fps", 10, resolution.CANVAS_HEIGHT - 10);
                    }
                }
            }
        },
        activateMouseEvents: function () {
            // ensure the pointer capture helper has been created
            if (!this.pointerCapture) {
                this.pointerCapture = new PointerCapture({
                    element: Canvas.element,
                    onStart: $.proxy(this.mouseDown, this),
                    onMove: $.proxy(this.mouseMove, this),
                    onEnd: $.proxy(this.mouseUp, this),
                    onOut: $.proxy(this.mouseOut, this),
                    getZoom: function () {
                        return ZoomManager.getCanvasZoom();
                    },
                });
            }

            this.pointerCapture.activate();
        },
        deactivateMouseEvents: function () {
            if (this.pointerCapture) {
                this.pointerCapture.deactivate();
            }
        },
        activate: function () {
            this._super();
            this.activateMouseEvents();

            // called to render a frame
            var self = this,
                requestAnimationFrame = window["requestAnimationFrame"],
                animationLoop = function () {
                    var now = Date.now();
                    self.operateCurrentMVC(now);
                    if (!self.stopAnimation) {
                        requestAnimationFrame(animationLoop);
                    }
                };

            // start the animation loop
            this.stopAnimation = false;
            animationLoop();
        },
        deactivate: function () {
            this._super();

            // set flag to stop animation
            this.stopAnimation = true;

            // remove mouse events
            this.deactivateMouseEvents();
        },

        setCurrentController: function (controller) {
            this.currentController = controller;
            this.currentController.idealDelta = 1 / 60;
        },
        getCurrentController: function () {
            return this.currentController;
        },
        onControllerActivated: function (controller) {
            this.setCurrentController(controller);
        },
        onControllerDeactivated: function (controller) {
            this.currentController = null;
        },
        onControllerPaused: function (controller) {
            this.currentController = null;
        },
        onControllerUnpaused: function (controller) {
            this.setCurrentController(controller);
        },
        onControllerDeactivationRequest: function (controller) {
            this.deactivateCurrentController = true;
        },
        onControllerViewShow: function (view) {
            if (this.viewTransition !== Constants.UNDEFINED && this.previousView != null) {
                this.currentController.calculateTimeDelta();
                this.transitionTime = this.currentController.lastTime + this.transitionDelay;
                var activeView = this.currentController.activeView();
                if (activeView) {
                    activeView.draw();
                }
            }
        },
        onControllerViewHide: function (view) {
            this.previousView = view;
            if (this.viewTransition !== Constants.UNDEFINED && this.previousView != null) {
                this.previousView.draw();
            }
        },
        isSuspended: function () {
            return this.suspended;
        },
        suspend: function () {
            this.suspended = true;
        },
        resume: function () {
            if (this.currentController) {
                this.currentController.resetLastTime();
            }
            this.suspended = false;
        },
        mouseDown: function (x, y) {
            if (this.currentController && this.currentController != this) {
                //Log.debug('mouse down at:' + x + ',' + y + ' drag mode was:' + this.dragMode);
                this.dragMode = true;
                return this.currentController.mouseDown(x, y);
            }
            return false;
        },
        mouseMove: function (x, y) {
            if (this.currentController && this.currentController != this) {
                if (this.dragMode) {
                    this.currentController.mouseDragged(x, y);
                }

                // fire moved event even if drag event was also fired
                return this.currentController.mouseMoved(x, y);
            }
            return false;
        },
        mouseUp: function (x, y) {
            if (this.currentController && this.currentController != this) {
                //Log.debug('mouse up at:' + x + ',' + y + ' drag mode was:' + this.dragMode);
                var handled = this.currentController.mouseUp(x, y);
                this.dragMode = false;
                return handled;
            }
            return false;
        },
        mouseOut: function (x, y) {
            if (this.currentController && this.currentController != this) {
                // if the mouse leaves the canvas while down, trigger the mouseup
                // event because we won't get it if the user lets go outside
                if (this.dragMode) {
                    //Log.debug('mouse out at:' + x + ',' + y);
                    var handled = this.currentController.mouseUp(x, y);
                    this.dragMode = false;
                    return handled;
                }
            }
            return false;
        },
        doubleClick: function (x, y) {
            if (this.currentController && this.currentController != this) {
                //Log.debug('double click at:' + x + ',' + y + ' drag mode was:' + this.dragMode);
                this.currentController.mouseUp(x, y);
                this.dragMode = false;
                return this.currentController.doubleClick(x, y);
            }
            return false;
        },
    });

    return RootController;
});
