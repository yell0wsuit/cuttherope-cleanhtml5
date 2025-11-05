/**
 * @typedef {Object} PointerCaptureSettings
 * @property {HTMLElement} element - The DOM element to capture pointer events on
 * @property {() => number} [getZoom] - Optional function that returns the current zoom level
 * @property {(x: number, y: number, pointerId?: number) => void} [onStart] - Callback for pointer start events
 * @property {(x: number, y: number, pointerId?: number) => void} [onMove] - Callback for pointer move events
 * @property {(x: number, y: number, pointerId?: number) => void} [onEnd] - Callback for pointer end events
 * @property {(x: number, y: number, pointerId?: number) => void} [onOut] - Callback for pointer out events
 * @property {boolean} [multiTouch=false] - Enable multi-touch support
 * @property {number} [maxPointers=10] - Maximum number of simultaneous pointers to track
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
        /** @type {boolean} */
        this.multiTouch = settings.multiTouch || true;
        /** @type {number} */
        this.maxPointers = settings.maxPointers || 10;
        /** @type {Set<number>} */
        this.activePointerIds = new Set();

        // Legacy single-touch mode compatibility
        /** @type {number|null} */
        this.activePointerId = null;

        // Save references to the event handlers so they can be removed
        /** @type {(event: Event) => void} */
        this.startHandler = (event) => {
            const pointerEvent = /** @type {PointerEvent} */ (event);
            event.preventDefault();

            if (this.multiTouch) {
                // Multi-touch mode: track multiple pointers
                if (this.activePointerIds.size < this.maxPointers) {
                    this.activePointerIds.add(pointerEvent.pointerId);
                    this.el.setPointerCapture(pointerEvent.pointerId);

                    if (settings.onStart) {
                        this.translatePosition(pointerEvent, settings.onStart);
                    }
                }
            } else {
                // Single-touch mode: only handle the first pointer
                if (this.activePointerId === null) {
                    this.activePointerId = pointerEvent.pointerId;
                    this.el.setPointerCapture(pointerEvent.pointerId);

                    if (settings.onStart) {
                        this.translatePosition(pointerEvent, settings.onStart);
                    }
                }
            }
        };

        /** @type {(event: Event) => void} */
        this.moveHandler = (event) => {
            const pointerEvent = /** @type {PointerEvent} */ (event);

            if (this.multiTouch) {
                // Multi-touch mode: handle all active pointers
                if (this.activePointerIds.has(pointerEvent.pointerId)) {
                    event.preventDefault();

                    if (settings.onMove) {
                        this.translatePosition(pointerEvent, settings.onMove);
                    }
                } else {
                    // Allow hover events for non-active pointers
                    if (settings.onMove) {
                        this.translatePosition(pointerEvent, settings.onMove);
                    }
                }
            } else {
                // Single-touch mode: handle hover or active pointer
                if (
                    this.activePointerId !== null &&
                    pointerEvent.pointerId === this.activePointerId
                ) {
                    event.preventDefault();
                }

                if (settings.onMove) {
                    this.translatePosition(pointerEvent, settings.onMove);
                }
            }
        };

        /** @type {(event: Event) => void} */
        this.endHandler = (event) => {
            const pointerEvent = /** @type {PointerEvent} */ (event);
            event.preventDefault();

            if (this.multiTouch) {
                // Multi-touch mode: remove this pointer from active set
                if (this.activePointerIds.has(pointerEvent.pointerId)) {
                    this.activePointerIds.delete(pointerEvent.pointerId);

                    if (settings.onEnd) {
                        this.translatePosition(pointerEvent, settings.onEnd);
                    }
                }
            } else {
                // Single-touch mode
                if (pointerEvent.pointerId === this.activePointerId) {
                    this.activePointerId = null;

                    if (settings.onEnd) {
                        this.translatePosition(pointerEvent, settings.onEnd);
                    }
                }
            }
        };

        /** @type {(event: Event) => void} */
        this.cancelHandler = (event) => {
            const pointerEvent = /** @type {PointerEvent} */ (event);

            if (this.multiTouch) {
                // Multi-touch mode: remove this pointer from active set
                if (this.activePointerIds.has(pointerEvent.pointerId)) {
                    this.activePointerIds.delete(pointerEvent.pointerId);

                    if (settings.onOut) {
                        this.translatePosition(pointerEvent, settings.onOut);
                    }
                }
            } else {
                // Single-touch mode
                if (pointerEvent.pointerId === this.activePointerId) {
                    this.activePointerId = null;

                    if (settings.onOut) {
                        this.translatePosition(pointerEvent, settings.onOut);
                    }
                }
            }
        };
    }

    /**
     * Translates from page-relative to element-relative position
     * @param {PointerEvent} event - The pointer event
     * @param {(x: number, y: number, pointerId?: number) => void} callback - Callback function with translated coordinates
     */
    translatePosition(event, callback) {
        const rect = this.el.getBoundingClientRect();
        const zoom = this.getZoom ? this.getZoom() : 1;

        // Use clientX/Y which are relative to the viewport, then adjust for element position
        const mouseX = Math.round((event.clientX - rect.left) / zoom);
        const mouseY = Math.round((event.clientY - rect.top) / zoom);

        callback(mouseX, mouseY, event.pointerId);
    }

    /**
     * Gets all currently active pointer IDs
     * @returns {number[]} Array of active pointer IDs
     */
    getActivePointers() {
        if (this.multiTouch) {
            return Array.from(this.activePointerIds);
        }
        return this.activePointerId !== null ? [this.activePointerId] : [];
    }

    /**
     * Checks if a specific pointer is active
     * @param {number} pointerId - The pointer ID to check
     * @returns {boolean} True if the pointer is active
     */
    isPointerActive(pointerId) {
        if (this.multiTouch) {
            return this.activePointerIds.has(pointerId);
        }
        return this.activePointerId === pointerId;
    }

    /**
     * Gets the number of active pointers
     * @returns {number} Count of active pointers
     */
    getActivePointerCount() {
        if (this.multiTouch) {
            return this.activePointerIds.size;
        }
        return this.activePointerId !== null ? 1 : 0;
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
