import RGBAColor from "@/core/RGBAColor";

/**
 * Canvas wrapper class for 2D rendering operations
 */
class Canvas {
    /**
     * @type {HTMLCanvasElement | null}
     */
    element = null;

    /**
     * @type {CanvasRenderingContext2D | null}
     */
    context = null;

    /**
     * @type {HTMLElement | null}
     * @deprecated Use element instead
     */
    id = null;

    /**
     * Initialize canvas from element ID
     * @param {string} elementId - The DOM element ID
     */
    domReady(elementId) {
        const element = document.getElementById(elementId);
        if (element instanceof HTMLCanvasElement) {
            this.setTarget(element);
        }
    }

    /**
     * Set the target canvas element
     * @param {HTMLCanvasElement} element - The canvas element
     */
    setTarget(element) {
        this.id = element;
        this.element = element;
        const context = this.element.getContext("2d");
        if (!context) {
            throw new Error("Failed to get 2D context from canvas element");
        }
        this.context = context;
        this.setStyleColor(RGBAColor.white);
    }

    /**
     * Sets the fill and stroke styles using an RGBAColor
     * @param {RGBAColor} color - The color to set
     */
    setStyleColor(color) {
        const rgba = color.rgbaStyle();

        if (!this.context) {
            return;
        }

        this.context.fillStyle = rgba;
        this.context.strokeStyle = rgba;
        //console.log('Color changed to: ' + rgba);
    }

    /**
     * Sets the fill and stroke styles using a raw style string
     * @param {string} style - The style string (e.g., 'rgba(255, 0, 0, 1)')
     */
    setStyles(style) {
        if (!this.context) {
            return;
        }

        this.context.fillStyle = style;
        this.context.strokeStyle = style;
    }

    /**
     * Fills a shape specified using a triangle strip array, ex:
     *   0 -- 2 -- 4 -- 6
     *   |    |    |    |
     *   1 -- 3 -- 5 -- 7
     * @param {Array<{x: number, y: number}>} points - Array of points
     * @param {string} style - Fill style
     */
    fillTriangleStrip(points, style) {
        const ctx = this.context;
        let point = points[0];
        if (ctx) {
            ctx.fillStyle = style;
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
        }

        // draw the bottom portion of the shape
        for (let i = 1, len = points.length; i < len; i += 2) {
            point = points[i];
            ctx && ctx.lineTo(point.x, point.y);
        }

        // draw the top portion
        for (let i = points.length - 2; i >= 0; i -= 2) {
            point = points[i];
            ctx && ctx.lineTo(point.x, point.y);
        }

        ctx && ctx.fill(); // auto-closes path
    }
}

export const CanvasClass = Canvas;

export default new Canvas();
