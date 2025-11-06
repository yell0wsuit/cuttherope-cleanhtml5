interface PointerCaptureSettings {
    element: HTMLElement;
    getZoom?: () => number;
    onStart?: (x: number, y: number) => void;
    onMove?: (x: number, y: number) => void;
    onEnd?: (x: number, y: number) => void;
    onOut?: (x: number, y: number) => void;
}

/**
 * Captures and normalizes pointer events using the modern Pointer Events API
 */
class PointerCapture {
    el: HTMLElement;
    getZoom: (() => number) | undefined;
    activePointerId: number | null;
    startHandler: (event: PointerEvent) => void;
    moveHandler: (event: PointerEvent) => void;
    endHandler: (event: PointerEvent) => void;
    cancelHandler: (event: PointerEvent) => void;

    constructor(settings: PointerCaptureSettings) {
        this.el = settings.element;
        this.getZoom = settings.getZoom;
        this.activePointerId = null;

        // Save references to the event handlers so they can be removed
        this.startHandler = (event: PointerEvent): void => {
            event.preventDefault();

            // Only handle the first pointer
            if (this.activePointerId === null) {
                this.activePointerId = event.pointerId;
                this.el.setPointerCapture(event.pointerId);

                if (settings.onStart) {
                    this.translatePosition(event, settings.onStart);
                }
            }
        };

        this.moveHandler = (event: PointerEvent): void => {
            // Always allow move events (for hover effects), but only prevent default
            // when actively dragging to allow normal scrolling when not interacting
            if (this.activePointerId !== null && event.pointerId === this.activePointerId) {
                event.preventDefault();
            }

            // Fire onMove for any pointer movement (hover or drag)
            if (settings.onMove) {
                this.translatePosition(event, settings.onMove);
            }
        };

        this.endHandler = (event: PointerEvent): void => {
            event.preventDefault();

            if (event.pointerId === this.activePointerId) {
                this.activePointerId = null;

                if (settings.onEnd) {
                    this.translatePosition(event, settings.onEnd);
                }
            }
        };

        this.cancelHandler = (event: PointerEvent): void => {
            if (event.pointerId === this.activePointerId) {
                this.activePointerId = null;

                if (settings.onOut) {
                    this.translatePosition(event, settings.onOut);
                }
            }
        };
    }

    /**
     * Translates from page-relative to element-relative position
     */
    translatePosition(event: PointerEvent, callback: (x: number, y: number) => void) {
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
