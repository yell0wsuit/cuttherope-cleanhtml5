class ZoomManager {
    $el: HTMLElement | null;
    zoom: number;
    transformOrigin: string;
    nativeWidth: number;
    nativeHeight: number;
    originalHeight: number;
    bgZoom: number;

    constructor() {
        this.$el = null;
        this.zoom = 1;
        this.transformOrigin = "top left";
        this.nativeWidth = 0;
        this.nativeHeight = 0;
        this.originalHeight = 270;
        this.bgZoom = 1;
    }

    /** Assign element by ID */
    setElementId(elementId: string) {
        this.$el = document.getElementById(elementId);
    }

    /** Assign element directly */
    setElement(element: HTMLElement | null) {
        this.$el = element;
    }

    /** Apply CSS transform + optional custom properties */
    updateCss(css = {}) {
        if (!this.$el) return;

        // const prefixes = ["ms", "o", "webkit", "moz"];
        const scaleValue = this.zoom === 1 ? "" : `scale(${this.zoom})`;
        const originValue = this.zoom === 1 ? "" : this.transformOrigin;

        // apply standard transform
        this.$el.style.transform = scaleValue;
        this.$el.style.transformOrigin = originValue;

        // merge in additional CSS
        Object.assign(this.$el.style, css);
    }

    /** Return zoom factor for canvas/UI */
    getCanvasZoom() {
        return this.zoom || 1;
    }
    getUIZoom() {
        return this.zoom || 1;
    }

    /** Automatically re-scale when window resizes */
    autoResize() {
        window.addEventListener("resize", () => this.resize());
        this.resize();
    }

    /** Perform scaling logic */
    resize(skipZoom = false) {
        if (!this.$el) return;

        const vpWidth = window.innerWidth;
        const vpHeight = window.innerHeight;

        const { nativeWidth, nativeHeight, originalHeight } = this;

        if (!skipZoom) {
            this.zoom = Math.min(vpWidth / nativeWidth, vpHeight / nativeHeight);
        }

        // Calculate background zoom ratio
        this.bgZoom = vpHeight / (originalHeight * this.zoom);

        // Apply transforms to cover/scale backgrounds
        this.#applyBackgroundScale(".coverBg", `scale(${this.bgZoom})`);
        this.#applyBackgroundScale(".scaleBg", `scaleY(${this.bgZoom})`);

        // Determine scaled size and center position
        const scaledWidth = nativeWidth * this.zoom;
        const scaledHeight = nativeHeight * this.zoom;
        const left = Math.round((vpWidth - scaledWidth) / 2);
        const top = Math.round((vpHeight - scaledHeight) / 2);

        this.updateCss({
            position: "absolute",
            left: `${left}px`,
            top: `${top}px`,
            width: `${nativeWidth}px`,
            height: `${nativeHeight}px`,
        });
    }

    /** Private helper: apply transform to background elements */
    #applyBackgroundScale(selector: string, transformValue: string) {
        document.querySelectorAll(selector).forEach((el) => {
            if (el instanceof HTMLElement) {
                el.style.transform = transformValue;
            }
        });
    }
}

export default new ZoomManager();
