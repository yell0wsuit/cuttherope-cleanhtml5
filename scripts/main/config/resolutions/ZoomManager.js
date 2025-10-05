class ZoomManager {
    constructor() {
        // cache the target element
        this.$el = null;

        // no zoom by default
        this.zoom = GLOBAL_ZOOM;

        this.transformOrigin = "top left";

        this.setElementId = function (elementId) {
            this.$el = document.getElementById(elementId);
        };

        this.setElement = function (element) {
            this.$el = element;
        };

        this.updateCss = function (css) {
            css = css || {};

            let cssScale = "scale(" + this.zoom + ")",
                prefixes = ["ms", "o", "webkit", "moz"],
                transformOrigin = this.transformOrigin,
                i,
                len,
                key;

            // clear values if no zoom is required
            if (this.zoom === 1) {
                cssScale = transformOrigin = "";
            }

            // set the transform scale and origin for each browser prefix
            for (i = 0, len = prefixes.length; i < len; i++) {
                key = prefixes[i] + "Transform";
                this.$el.style[key] = cssScale;
                this.$el.style[prefixes[i] + "TransformOrigin"] = transformOrigin;
            }

            // Apply additional CSS properties
            for (const prop in css) {
                this.$el.style[prop] = css[prop];
            }
        };

        this.getCanvasZoom = function () {
            return this.zoom || 1;
        };

        this.getUIZoom = function () {
            return this.zoom || 1;
        };

        // begin monitoring the window for dimension changes
        this.autoResize = function () {
            const self = this;
            window.addEventListener("resize", function () {
                self.resize();
            });
            this.resize();
        };

        this.nativeWidth = 0;
        this.nativeHeight = 0;

        const originalHeight = 270;

        this.resize = function (skipZoom) {
            // get the viewport and canvas dimensions
            const vpWidth = window.innerWidth,
                vpHeight = window.innerHeight,
                canvasWidth = this.nativeWidth,
                canvasHeight = this.nativeHeight;

            // choose smallest zoom factor that will maximize one side
            if (!skipZoom) {
                this.zoom = Math.min(vpWidth / canvasWidth, vpHeight / canvasHeight);
            }

            this.bgZoom = vpHeight / (originalHeight * this.zoom);

            const coverBgs = document.querySelectorAll(".coverBg");
            coverBgs.forEach((el) => {
                el.style.webkitTransform = "scale(" + this.bgZoom + ")";
                el.style.mozTransform = "scale(" + this.bgZoom + ")";
            });

            const scaleBgs = document.querySelectorAll(".scaleBg");
            scaleBgs.forEach((el) => {
                el.style.webkitTransform = "scaleY(" + this.bgZoom + ")";
                el.style.mozTransform = "scaleY(" + this.bgZoom + ")";
            });

            // center the game by setting the margin (using auto in css doesn't
            // work because of zoom). Note: there are differences in how margin
            // is applied. IE doesn't consider margin as part of the zoomed element
            // while Chrome does. We can safely ignore this for now as full screen is
            // only necessary in win8 (IE10).
            const marginLeft = Math.round((vpWidth - canvasWidth * this.zoom) / 2),
                marginTop = Math.round((vpHeight - canvasHeight * this.zoom) / 2);

            this.updateCss({
                marginTop: marginTop + "px",
                marginLeft: marginLeft + "px",
            });
        };
    }
}

export default new ZoomManager();
