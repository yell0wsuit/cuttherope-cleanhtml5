define("utils/PointerCapture", [], function () {
    let singleTouch = false;

    function PointerCapture(settings) {
        this.el = settings.element;
        this.getZoom = settings.getZoom;

        const self = this;

        // save references to the event handlers so they can be removed
        this.startHandler = function (event) {
            self.preventPanning(event);

            if (singleTouch === false) {
                singleTouch = event.changedTouches && event.changedTouches[0].identifier;
            } else {
                return false;
            }

            if (settings.onStart) return self.translatePosition(event, settings.onStart);
            else return false; // not handled
        };
        this.moveHandler = function (event) {
            self.preventPanning(event);

            if (event.changedTouches && event.changedTouches[0].identifier !== singleTouch) return false;

            if (settings.onMove) return self.translatePosition(event, settings.onMove);
            else return false; // not handled
        };
        this.endHandler = function (event) {
            self.preventPanning(event);
            singleTouch = false;

            if (settings.onEnd) return self.translatePosition(event, settings.onEnd);
            else return false; // not handled
        };
        this.outHandler = function (event) {
            if (settings.onOut) return self.translatePosition(event, settings.onOut);
            else return false; // not handled
        };
    }

    // translates from page relative to element relative position
    PointerCapture.prototype.translatePosition = function (event, callback) {
        // get the mouse coordinate relative to the page
        // http://www.quirksmode.org/js/events_properties.html
        let posx = 0,
            posy = 0;
        if (!event) {
            event = window.event;
        }

        if (event.changedTouches && event.changedTouches.length > 0) {
            // iOS removes touches from targetTouches on touchend so we use
            // changedTouches when it's available
            posx = event.changedTouches[0].pageX;
            posy = event.changedTouches[0].pageY;
        } else if (event.targetTouches && event.targetTouches.length > 0) {
            posx = event.targetTouches[0].pageX;
            posy = event.targetTouches[0].pageY;
        } else if (event.pageX || event.pageY) {
            posx = event.pageX;
            posy = event.pageY;
        } else if (event.clientX || event.clientY) {
            posx = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        const rect = this.el.getBoundingClientRect();
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const offsetLeft = rect.left + scrollLeft;
        const offsetTop = rect.top + scrollTop;

        const zoom = this.getZoom ? this.getZoom() : 1;
        const mouseX = Math.round((posx - offsetLeft) / zoom);
        const mouseY = Math.round((posy - offsetTop) / zoom);

        return callback(mouseX, mouseY);
    };

    // prevent touches from panning the page
    PointerCapture.prototype.preventPanning = function (event) {
        if (event["preventManipulation"]) {
            event["preventManipulation"]();
        } else {
            event.preventDefault();
        }
    };

    PointerCapture.prototype.activate = function () {
        this.el.addEventListener(PointerCapture.startEventName, this.startHandler, false);
        this.el.addEventListener(PointerCapture.moveEventName, this.moveHandler, false);
        this.el.addEventListener(PointerCapture.endEventName, this.endHandler, false);
        this.el.addEventListener(PointerCapture.outEventName, this.outHandler, false);
    };

    PointerCapture.prototype.deactivate = function () {
        this.el.removeEventListener(PointerCapture.startEventName, this.startHandler, false);
        this.el.removeEventListener(PointerCapture.moveEventName, this.moveHandler, false);
        this.el.removeEventListener(PointerCapture.endEventName, this.endHandler, false);
        this.el.removeEventListener(PointerCapture.outEventName, this.outHandler, false);
    };

    // IE10 has pointer events that capture mouse, pen, and touch
    PointerCapture.useMSPointerEvents = window.navigator["msPointerEnabled"];

    // We are not using Modernizr in win8, but sometimes we debug in other browsers
    PointerCapture.useTouchEvents = "ontouchstart" in window || navigator.maxTouchPoints > 0;

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
