/**
 * @fileoverview Native DOM manipulation utilities.
 * Provides lightweight helper functions using native browser APIs.
 */

/**
 * Gets a single DOM element from a selector or element.
 * @param {string|Element|Window|Document|null|undefined} selector - Selector string or DOM element
 * @returns {Element|Window|Document|null} The resolved element or null if not found
 */
export const getElement = (selector) => {
    if (!selector) return null;
    if (typeof selector === "string") {
        return selector[0] === "#" && selector.indexOf(" ") === -1
            ? document.getElementById(selector.slice(1))
            : document.querySelector(selector);
    }
    if (selector instanceof Element || selector === window || selector === document) {
        return selector;
    }
    return null;
};

/**
 * Adds one or more CSS classes to an element.
 * @param {string|Element|null|undefined} selector - Selector string or DOM element
 * @param {string} className - Space-separated class names to add
 */
export const addClass = (selector, className) => {
    const el = getElement(selector);
    if (!el || !(el instanceof Element)) return;
    className
        .split(/\s+/)
        .filter(Boolean)
        .forEach((name) => el.classList.add(name));
};

/**
 * Removes one or more CSS classes from an element.
 * @param {string|Element|null|undefined} selector - Selector string or DOM element
 * @param {string} className - Space-separated class names to remove
 */
export const removeClass = (selector, className) => {
    const el = getElement(selector);
    if (!el || !className || !(el instanceof Element)) return;
    className
        .split(/\s+/)
        .filter(Boolean)
        .forEach((name) => el.classList.remove(name));
};

/**
 * Toggles a CSS class on an element.
 * @param {string|Element|null|undefined} selector - Selector string or DOM element
 * @param {string} className - Class name to toggle
 * @param {boolean} [force] - Optional force parameter: true to add, false to remove
 */
export const toggleClass = (selector, className, force) => {
    const el = getElement(selector);
    if (!el || !(el instanceof Element)) return;
    if (force === undefined) {
        el.classList.toggle(className);
    } else {
        el.classList.toggle(className, !!force);
    }
};

/**
 * Sets a CSS style property on an element.
 * @param {string|Element|null|undefined} selector - Selector string or DOM element
 * @param {string} property - CSS property name (camelCase or kebab-case)
 * @param {string} value - CSS property value
 */
export const setStyle = (selector, property, value) => {
    const el = getElement(selector);
    if (!el || !(el instanceof HTMLElement)) return;
    el.style.setProperty(property, value);
};

/**
 * Track active timers per element so we can cancel animations when needed.
 * @type {WeakMap<HTMLElement, Set<number>>}
 */
const elementTimers = new WeakMap();

/**
 * Registers a timeout/interval id with an element for later cleanup.
 * @param {HTMLElement} element
 * @param {number} timerId
 */
const trackTimer = (element, timerId) => {
    if (!elementTimers.has(element)) {
        elementTimers.set(element, new Set());
    }
    /** @type {Set<number>} */ (elementTimers.get(element)).add(timerId);
};

/**
 * Clears a tracked timer and removes it from the element registry.
 * @param {HTMLElement} element
 * @param {number} timerId
 */
const clearTrackedTimer = (element, timerId) => {
    const timers = elementTimers.get(element);
    if (!timers) return;
    if (timers.has(timerId)) {
        timers.delete(timerId);
        clearTimeout(timerId);
    }
    if (timers.size === 0) {
        elementTimers.delete(element);
    }
};

/**
 * Clears all timers registered for an element.
 * @param {HTMLElement} element
 */
const clearAllTimers = (element) => {
    const timers = elementTimers.get(element);
    if (!timers) return;
    timers.forEach((timerId) => clearTimeout(timerId));
    timers.clear();
    elementTimers.delete(element);
};

/**
 * Cache for default display values by tag name.
 * @type {Map<string, string>}
 */
const defaultDisplayCache = new Map();

/**
 * Computes the default display value for a given element tag.
 * @param {string} nodeName
 * @returns {string}
 */
const getDefaultDisplay = (nodeName) => {
    const tagName = nodeName.toLowerCase();
    if (defaultDisplayCache.has(tagName)) {
        return /** @type {string} */ (defaultDisplayCache.get(tagName));
    }
    if (!document.body) {
        return "block";
    }
    const temp = document.createElement(tagName);
    document.body.appendChild(temp);
    let display = window.getComputedStyle(temp).display;
    document.body.removeChild(temp);
    if (!display || display === "none") {
        display = "block";
    }
    defaultDisplayCache.set(tagName, display);
    return display;
};

/**
 * Shows an element by setting its display property.
 * @param {string|Element|null|undefined} selector - Selector string or DOM element
 * @param {string} [displayValue] - Display value to use (e.g., "block", "flex"); defaults to the element's natural display.
 */
export const show = (selector, displayValue) => {
    const el = getElement(selector);
    if (!el || !(el instanceof HTMLElement)) return;
    el.style.removeProperty("display");
    const computedDisplay = window.getComputedStyle(el).display;
    if (computedDisplay === "none") {
        el.style.display = displayValue || getDefaultDisplay(el.nodeName);
    }
};

/**
 * Hides an element by setting its display to "none".
 * @param {string|Element|null|undefined} selector - Selector string or DOM element
 */
export const hide = (selector) => {
    const el = getElement(selector);
    if (!el || !(el instanceof HTMLElement)) return;
    el.style.display = "none";
};

/**
 * Removes all child nodes from an element.
 * @param {string|Element|null|undefined} selector - Selector string or DOM element
 */
export const empty = (selector) => {
    const el = getElement(selector);
    if (!el || !(el instanceof Element)) return;
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
};

/**
 * Appends a child element or HTML string to a target element.
 * @param {string|Element|null|undefined} selector - Selector string or DOM element
 * @param {string|Element} child - HTML string or DOM element to append
 * @returns {Element|null} The appended element or null if operation failed
 */
export const append = (selector, child) => {
    const el = getElement(selector);
    if (!el || child == null || !(el instanceof Element)) return null;
    if (typeof child === "string") {
        el.insertAdjacentHTML("beforeend", child);
        return el.lastElementChild;
    }
    const childElement = child instanceof Element ? child : null;
    if (childElement) {
        el.appendChild(childElement);
        return childElement;
    }
    return null;
};

/**
 * Stops all running animations on an element by clearing transitions.
 * @param {string|Element|null|undefined} selector - Selector string or DOM element
 */
export const stopAnimations = (selector) => {
    const el = getElement(selector);
    if (!el || !(el instanceof HTMLElement)) return;
    clearAllTimers(el);
    const computedOpacity = window.getComputedStyle(el).opacity;
    el.style.transition = "";
    el.style.opacity = computedOpacity;
};

/**
 * Fades in an element by animating opacity from 0 to 1.
 * @param {string|Element|null|undefined} selector - Selector string or DOM element
 * @param {number} [duration] - Animation duration in milliseconds
 * @param {string} [displayValue] - Optional display value to use when showing
 * @returns {Promise<void>} Promise that resolves when animation completes
 */
export const fadeIn = (selector, duration, displayValue) => {
    const el = getElement(selector);
    if (!el || !(el instanceof HTMLElement)) return Promise.resolve();

    const ms = typeof duration === "number" ? duration : 400;

    stopAnimations(el);

    // Show the element first
    if (displayValue) {
        show(el, displayValue);
    } else {
        show(el);
    }

    el.style.transition = `opacity ${ms}ms ease`;
    el.style.opacity = "0";
    el.getBoundingClientRect(); // force reflow
    el.style.opacity = "1";

    return new Promise((resolve) => {
        const timer = window.setTimeout(() => {
            clearTrackedTimer(el, timer);
            el.style.transition = "";
            resolve();
        }, ms);
        trackTimer(el, timer);
    });
};

/**
 * Fades out an element by animating opacity from 1 to 0.
 * @param {string|Element|null|undefined} selector - Selector string or DOM element
 * @param {number} [duration] - Animation duration in milliseconds
 * @returns {Promise<void>} Promise that resolves when animation completes
 */
export const fadeOut = (selector, duration) => {
    const el = getElement(selector);
    if (!el || !(el instanceof HTMLElement)) return Promise.resolve();

    const ms = typeof duration === "number" ? duration : 400;

    stopAnimations(el);

    el.style.transition = `opacity ${ms}ms ease`;
    el.style.opacity = "1";
    el.getBoundingClientRect(); // force reflow
    el.style.opacity = "0";

    return new Promise((resolve) => {
        const timer = window.setTimeout(() => {
            clearTrackedTimer(el, timer);
            el.style.transition = "";
            el.style.display = "none";
            resolve();
        }, ms);
        trackTimer(el, timer);
    });
};

/**
 * Creates a delay associated with an element.
 * @param {string|Element} selector - Selector string or DOM element (not used but kept for API compatibility)
 * @param {number} duration - Delay duration in milliseconds
 * @returns {Promise<void>} Promise that resolves after the delay
 */
export const delay = (selector, duration) => {
    const el = getElement(selector);
    if (!el || !(el instanceof HTMLElement)) {
        return new Promise((resolve) => {
            window.setTimeout(resolve, duration);
        });
    }
    stopAnimations(el);
    return new Promise((resolve) => {
        const timer = window.setTimeout(() => {
            clearTrackedTimer(el, timer);
            resolve();
        }, duration);
        trackTimer(el, timer);
    });
};

/**
 * Adds an event listener to an element and returns a cleanup function.
 * @param {string|Element|Window|Document} selector - Selector string or event target
 * @param {string} event - Event type (e.g., "click", "mouseover")
 * @param {EventListener} handler - Event handler function
 * @param {AddEventListenerOptions|boolean} [options] - Optional event listener options
 * @returns {Function} Cleanup function to remove the event listener
 */
export const on = (selector, event, handler, options) => {
    const el = getElement(selector);
    if (!el) return () => {};
    el.addEventListener(event, handler, options);
    return () => {
        el.removeEventListener(event, handler, options);
    };
};

/**
 * Attaches mouseenter and mouseleave event handlers to an element.
 * @param {string|Element} selector - Selector string or DOM element
 * @param {EventListener} [enter] - Handler for mouseenter event
 * @param {EventListener} [leave] - Handler for mouseleave event
 * @returns {Function} Cleanup function to remove both event listeners
 */
export const hover = (selector, enter, leave) => {
    const el = getElement(selector);
    if (!el) return () => {};
    const enterHandler = typeof enter === "function" ? enter : () => {};
    const leaveHandler = typeof leave === "function" ? leave : () => {};
    el.addEventListener("mouseenter", enterHandler);
    el.addEventListener("mouseleave", leaveHandler);
    return () => {
        el.removeEventListener("mouseenter", enterHandler);
        el.removeEventListener("mouseleave", leaveHandler);
    };
};

/**
 * Gets or sets the text content of an element.
 * @param {string|Element|null|undefined} selector - Selector string or DOM element
 * @param {string} [value] - Optional text value to set. If omitted, returns current text content.
 * @returns {string|null|undefined} Current text content if getting, or the set value if setting
 */
export const text = (selector, value) => {
    const el = getElement(selector);
    if (!el || !(el instanceof Element)) return undefined;
    if (value === undefined) {
        return el.textContent;
    }
    el.textContent = value;
    return value;
};

/**
 * Gets the width of an element or window.
 * @param {string|Element|Window} selector - Selector string, DOM element, or window
 * @returns {number} Width in pixels
 */
export const width = (selector) => {
    const el = getElement(selector);
    if (!el) return 0;
    if (el === window) return window.innerWidth;
    if (el instanceof Element) return el.getBoundingClientRect().width;
    return 0;
};

export default {
    getElement,
    addClass,
    removeClass,
    toggleClass,
    setStyle,
    show,
    hide,
    empty,
    append,
    stopAnimations,
    fadeIn,
    fadeOut,
    delay,
    on,
    hover,
    text,
    width,
};
