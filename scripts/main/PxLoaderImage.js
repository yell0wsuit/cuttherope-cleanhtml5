import PxLoader from "./PxLoader.js";

export default class PxLoaderImage {
    constructor(url, tags, priority) {
        this.img = new Image();
        this.tags = tags;
        this.priority = priority;
        this.url = url;
        this.loader = null;
    }

    start(pxLoader) {
        this.loader = pxLoader;

        // NOTE: Must add event listeners before the src is set.
        this.img.addEventListener("load", this.#onLoad);
        this.img.addEventListener("error", this.#onError);

        this.img.src = this.url;
    }

    checkStatus() {
        if (this.img.complete) {
            this.#removeEventHandlers();
            this.loader.onLoad(this);
        }
    }

    onTimeout() {
        this.#removeEventHandlers();
        if (this.img.complete) {
            this.loader.onLoad(this);
        } else {
            this.loader.onTimeout(this);
        }
    }

    getName() {
        return this.url;
    }

    #onLoad = () => {
        this.#removeEventHandlers();
        this.loader.onLoad(this);
    };

    #onError = () => {
        this.#removeEventHandlers();
        this.loader.onError(this);
    };

    #removeEventHandlers() {
        this.img.removeEventListener("load", this.#onLoad);
        this.img.removeEventListener("error", this.#onError);
    }
}

// add a convenience method to PxLoader for adding an image
PxLoader.prototype.addImage = function (url, tags, priority) {
    const imageLoader = new PxLoaderImage(url, tags, priority);
    this.add(imageLoader);

    // return the img element to the caller
    return imageLoader.img;
};
