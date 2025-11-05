/**
 * @typedef {Object} PointerCaptureSettings
 * @property {HTMLElement} element - The DOM element to capture pointer events on
 * @property {() => number} [getZoom] - Optional function that returns the current zoom level
 * @property {(x: number, y: number) => void} [onStart] - Callback for pointer start events
 * @property {(x: number, y: number) => void} [onMove] - Callback for pointer move events
 * @property {(x: number, y: number) => void} [onEnd] - Callback for pointer end events
 * @property {(x: number, y: number) => void} [onOut] - Callback for pointer out events
 */

/**
 * Captures and normalizes pointer events using the modern Pointer Events API
 */
class PointerCapture {
    /**
     * @param {PointerCaptureSettings} settings - Configuration object for pointer capture
     */
    constructor(settings) {
        /** @type {HTMLElement} */
        this.el = settings.element;
        /** @type {(() => number)|undefined} */
        this.getZoom = settings.getZoom;
        /** @type {number|null} */
        this.activePointerId = null;

        // Save references to the event handlers so they can be removed
        /** @type {(event: Event) => void} */
        this.startHandler = (event) => {
            const pointerEvent = /** @type {PointerEvent} */ (event);
            event.preventDefault();

            // Only handle the first pointer
            if (this.activePointerId === null) {
                this.activePointerId = pointerEvent.pointerId;
                this.el.setPointerCapture(pointerEvent.pointerId);

                if (settings.onStart) {
                    this.translatePosition(pointerEvent, settings.onStart);
                }
            }
        };

        /** @type {(event: Event) => void} */
        this.moveHandler = (event) => {
            const pointerEvent = /** @type {PointerEvent} */ (event);

            // Always allow move events (for hover effects), but only prevent default
            // when actively dragging to allow normal scrolling when not interacting
            if (this.activePointerId !== null && pointerEvent.pointerId === this.activePointerId) {
                event.preventDefault();
            }

            // Fire onMove for any pointer movement (hover or drag)
            if (settings.onMove) {
                this.translatePosition(pointerEvent, settings.onMove);
            }
        };

        /** @type {(event: Event) => void} */
        this.endHandler = (event) => {
            const pointerEvent = /** @type {PointerEvent} */ (event);
            event.preventDefault();

            if (pointerEvent.pointerId === this.activePointerId) {
                this.activePointerId = null;

                if (settings.onEnd) {
                    this.translatePosition(pointerEvent, settings.onEnd);
                }
            }
        };

        /** @type {(event: Event) => void} */
        this.cancelHandler = (event) => {
            const pointerEvent = /** @type {PointerEvent} */ (event);

            if (pointerEvent.pointerId === this.activePointerId) {
                this.activePointerId = null;

                if (settings.onOut) {
                    this.translatePosition(pointerEvent, settings.onOut);
                }
            }
        };
    }

    /**
     * Translates from page-relative to element-relative position
     * @param {PointerEvent} event - The pointer event
     * @param {(x: number, y: number) => void} callback - Callback function with translated coordinates
     */
    translatePosition(event, callback) {
        const rect = this.el.getBoundingClientRect();
        const zoom = this.getZoom ? this.getZoom() : 1;

        // Use clientX/Y which are relative to the viewport, then adjust for element position
        const mouseX = Math.round((event.clientX - rect.left) / zoom);
        const mouseY = Math.round((event.clientY - rect.top) / zoom);

        callback(mouseX, mouseY);
    }

    /**
     * Activates pointer capture by attaching event listeners
     */
    activate() {
        this.el.addEventListener("pointerdown", this.startHandler);
        this.el.addEventListener("pointermove", this.moveHandler);
        this.el.addEventListener("pointerup", this.endHandler);
        this.el.addEventListener("pointercancel", this.cancelHandler);

        // Prevent touch actions to avoid browser handling
        this.el.style.touchAction = "none";
    }

    /**
     * Deactivates pointer capture by removing event listeners
     */
    deactivate() {
        this.el.removeEventListener("pointerdown", this.startHandler);
        this.el.removeEventListener("pointermove", this.moveHandler);
        this.el.removeEventListener("pointerup", this.endHandler);
        this.el.removeEventListener("pointercancel", this.cancelHandler);

        // Reset touch action
        this.el.style.touchAction = "";
    }
}

export default PointerCapture;
