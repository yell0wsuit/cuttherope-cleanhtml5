define("config/resolutions/ZoomManager", [], function () {
    function ZoomManager() {
        // cache the target element
        this.$el = null;

        // no zoom by default
        this.zoom = GLOBAL_ZOOM;

        this.transformOrigin = "top left";

        this.setElementId = function (elementId) {
            this.$el = $("#" + elementId);
        };

        this.setElement = function (element) {
            this.$el = $(element);
        };

        this.updateCss = function (css) {
            css = css || {};

            var cssScale = "scale(" + this.zoom + ")",
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
                key = "-" + prefixes[i] + "-transform";
                css[key] = cssScale;
                css[key + "-origin"] = transformOrigin;
            }

            this.$el.css(css);
        };

        this.getCanvasZoom = function () {
            return this.zoom || 1;
        };

        this.getUIZoom = function () {
            return this.zoom || 1;
        };

        // begin monitoring the window for dimension changes
        this.autoResize = function () {
            var self = this;
            $(window).resize(function () {
                self.resize();
            });
            this.resize();
        };

        this.nativeWidth = 0;
        this.nativeHeight = 0;

        var originalHeight = 270;

        this.resize = function (skipZoom) {
            // get the viewport and canvas dimensions
            var $w = $(window),
                vpWidth = $w.width(),
                vpHeight = $w.height(),
                canvasWidth = this.nativeWidth,
                canvasHeight = this.nativeHeight;

            // choose smallest zoom factor that will maximize one side
            if (!skipZoom) {
                this.zoom = Math.min(vpWidth / canvasWidth, vpHeight / canvasHeight);
            }

            this.bgZoom = vpHeight / (originalHeight * this.zoom);
            $(".coverBg").css({
                "-webkit-transform": "scale(" + this.bgZoom + ")",
                "-moz-transform": "scale(" + this.bgZoom + ")",
            });

            $(".scaleBg").css({
                "-webkit-transform": "scaleY(" + this.bgZoom + ")",
                "-moz-transform": "scaleY(" + this.bgZoom + ")",
            });

            // center the game by setting the margin (using auto in css doesn't
            // work because of zoom). Note: there are differences in how margin
            // is applied. IE doesn't consider margin as part of the zoomed element
            // while Chrome does. We can safely ignore this for now as full screen is
            // only necessary in win8 (IE10).
            var marginLeft = Math.round((vpWidth - canvasWidth * this.zoom) / 2),
                marginTop = Math.round((vpHeight - canvasHeight * this.zoom) / 2);

            this.updateCss({
                "margin-top": marginTop,
                "margin-left": marginLeft,
            });
        };
    }

    // we only need a singleton instance
    return new ZoomManager();
});
