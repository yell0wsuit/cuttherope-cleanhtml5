class ZoomManager {
    constructor() {
        // cache the target element
        this.$el = null;

        // no zoom by default
        this.zoom = 1;

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
                transformOrigin = this.transformOrigin,
                i,
                len,
                key;
            const prefixes = ["ms", "o", "webkit", "moz"];

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
                el.style.transform = "scale(" + this.bgZoom + ")";
            });

            const scaleBgs = document.querySelectorAll(".scaleBg");
            scaleBgs.forEach((el) => {
                el.style.webkitTransform = "scaleY(" + this.bgZoom + ")";
                el.style.mozTransform = "scaleY(" + this.bgZoom + ")";
                el.style.transform = "scaleY(" + this.bgZoom + ")";
            });

            // Calculate the actual scaled dimensions
            const scaledWidth = canvasWidth * this.zoom;
            const scaledHeight = canvasHeight * this.zoom;

            // Center the game using absolute positioning
            const left = Math.round((vpWidth - scaledWidth) / 2);
            const top = Math.round((vpHeight - scaledHeight) / 2);

            this.updateCss({
                position: "absolute",
                left: left + "px",
                top: top + "px",
                width: canvasWidth + "px",
                height: canvasHeight + "px",
            });
        };
    }
}

export default new ZoomManager();
