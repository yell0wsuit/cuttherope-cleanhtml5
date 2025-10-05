define("utils/Canvas", ["core/RGBAColor"], function (RGBAColor) {
    const Canvas = {
        domReady: function (elementId) {
            this.setTarget(document.getElementById(elementId));
        },
        setTarget: function (element) {
            this.id = element;
            this.element = element;
            this.context = this.element.getContext("2d");
            this.setStyleColor(RGBAColor.white);
        },
        /**
         * Sets the fill and stroke styles
         * @param color {RGBAColor}
         */
        setStyleColor: function (color) {
            const rgba = color.rgbaStyle();
            this.context.fillStyle = rgba;
            this.context.strokeStyle = rgba;
            //console.log('Color changed to: ' + rgba);
        },
        setStyles: function (style) {
            this.context.fillStyle = style;
            this.context.strokeStyle = style;
        },
        /**
         * Fills a shape specified using a triangle strip array, ex:
         *   0 -- 2 -- 4 -- 6
         *   |    |    |    |
         *   1 -- 3 -- 5 -- 7
         * @param points
         * @param style
         */
        fillTriangleStrip: function (points, style) {
            let ctx = this.context,
                point = points[0];
            ctx.fillStyle = style;
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);

            // draw the bottom portion of the shape
            for (var i = 1, len = points.length; i < len; i += 2) {
                point = points[i];
                ctx.lineTo(point.x, point.y);
            }

            // draw the top portion
            for (i = points.length - 2; i >= 0; i -= 2) {
                point = points[i];
                ctx.lineTo(point.x, point.y);
            }

            ctx.fill(); // auto-closes path
        },
    };

    return Canvas;
});
