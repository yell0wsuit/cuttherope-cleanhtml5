define("utils/PointerCapture", [], function () {
    let singleTouch = false;

    class PointerCapture {
        constructor(settings) {
            this.el = settings.element;
            this.getZoom = settings.getZoom;

            // save references to the event handlers so they can be removed
            this.startHandler = (event) => {
                this.preventPanning(event);

                if (singleTouch === false) {
                    singleTouch = event.changedTouches?.[0]?.identifier ?? null;
                } else {
                    return false;
                }

                if (settings.onStart) {
                    return this.translatePosition(event, settings.onStart);
                }
                return false; // not handled
            };

            this.moveHandler = (event) => {
                this.preventPanning(event);

                if (event.changedTouches?.[0]?.identifier !== singleTouch) {
                    return false;
                }

                if (settings.onMove) {
                    return this.translatePosition(event, settings.onMove);
                }
                return false; // not handled
            };

            this.endHandler = (event) => {
                this.preventPanning(event);
                singleTouch = false;

                if (settings.onEnd) {
                    return this.translatePosition(event, settings.onEnd);
                }
                return false; // not handled
            };

            this.outHandler = (event) => {
                if (settings.onOut) {
                    return this.translatePosition(event, settings.onOut);
                }
                return false; // not handled
            };
        }

        // translates from page relative to element relative position
        translatePosition(event, callback) {
            let posx = 0;
            let posy = 0;

            if (event.changedTouches?.length > 0) {
                // iOS removes touches from targetTouches on touchend so we use
                // changedTouches when it's available
                posx = event.changedTouches[0].pageX;
                posy = event.changedTouches[0].pageY;
            } else if (event.targetTouches?.length > 0) {
                posx = event.targetTouches[0].pageX;
                posy = event.targetTouches[0].pageY;
            } else if (event.pageX || event.pageY) {
                posx = event.pageX;
                posy = event.pageY;
            } else if (event.clientX || event.clientY) {
                posx = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                posy = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }

            // get element offset without jQuery
            const rect = this.el.getBoundingClientRect();
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const offset = {
                left: rect.left + scrollLeft,
                top: rect.top + scrollTop,
            };

            // adjust coordinates if the game is zoomed
            const zoom = this.getZoom ? this.getZoom() : 1;
            const mouseX = Math.round((posx - offset.left) / zoom);
            const mouseY = Math.round((posy - offset.top) / zoom);

            return callback(mouseX, mouseY);
        }

        // prevent touches from panning the page
        preventPanning(event) {
            if (event.preventManipulation) {
                event.preventManipulation();
            } else {
                event.preventDefault();
            }
        }

        activate() {
            this.el.addEventListener(PointerCapture.startEventName, this.startHandler, false);
            this.el.addEventListener(PointerCapture.moveEventName, this.moveHandler, false);
            this.el.addEventListener(PointerCapture.endEventName, this.endHandler, false);
            this.el.addEventListener(PointerCapture.outEventName, this.outHandler, false);
        }

        deactivate() {
            this.el.removeEventListener(PointerCapture.startEventName, this.startHandler, false);
            this.el.removeEventListener(PointerCapture.moveEventName, this.moveHandler, false);
            this.el.removeEventListener(PointerCapture.endEventName, this.endHandler, false);
            this.el.removeEventListener(PointerCapture.outEventName, this.outHandler, false);
        }
    }

    // IE10 has pointer events that capture mouse, pen, and touch
    PointerCapture.useMSPointerEvents = "msPointerEnabled" in window.navigator;

    // Check for touch support
    PointerCapture.useTouchEvents = "ontouchstart" in window;

    // cache the correct event names to use
    PointerCapture.startEventName = PointerCapture.useMSPointerEvents
        ? "MSPointerDown"
        : PointerCapture.useTouchEvents
        ? "touchstart"
        : "mousedown";
    PointerCapture.moveEventName = PointerCapture.useMSPointerEvents
        ? "MSPointerMove"
        : PointerCapture.useTouchEvents
        ? "touchmove"
        : "mousemove";
    PointerCapture.endEventName = PointerCapture.useMSPointerEvents
        ? "MSPointerUp"
        : PointerCapture.useTouchEvents
        ? "touchend"
        : "mouseup";

    // Unfortunately there is no touchleave event
    PointerCapture.outEventName = PointerCapture.useMSPointerEvents ? "MSPointerOut" : "mouseout";

    return PointerCapture;
});
