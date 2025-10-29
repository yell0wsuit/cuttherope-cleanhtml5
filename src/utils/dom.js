/**
 * @fileoverview DOM manipulation utilities providing a lightweight jQuery-like API.
 * Includes element selection, class manipulation, style management, event handling,
 * and animation utilities.
 */

/**
 * WeakMap to track animation timers for DOM elements.
 * @type {WeakMap<Element, Set<number>>}
 */
const animationTimers = new WeakMap();

/**
 * Gets a single DOM element from various input types.
 * @param {string|Element|Window|Document|null|undefined} target - Selector string, DOM element, window, or document
 * @param {Element|Document} [context] - Optional context element to search within
 * @returns {Element|Window|Document|null} The resolved element or null if not found
 */
const getElement = (target, context) => {
    if (!target) {
        return null;
    }
    if (typeof target === "string") {
        if (target[0] === "#" && target.indexOf(" ") === -1 && !context) {
            return document.getElementById(target.slice(1));
        }
        return (context || document).querySelector(target);
    }
    if (target instanceof Element || target === window || target === document) {
        return target;
    }
    return null;
};

/**
 * Gets multiple DOM elements from various input types.
 * @param {string|Element|Window|Document|Array|NodeList|null|undefined} target - Selector string, element(s), or array-like collection
 * @param {Element|Document} [context] - Optional context element to search within
 * @returns {Element[]} Array of resolved elements
 */
const getElements = (target, context) => {
    if (!target) {
        return [];
    }
    if (typeof target === "string") {
        return Array.from((context || document).querySelectorAll(target));
    }
    if (target instanceof Element || target === window || target === document) {
        return [target];
    }
    if (Array.isArray(target) || (target.length != null && typeof target !== "string")) {
        return Array.from(target);
    }
    return [];
};

/**
 * Adds one or more CSS classes to an element.
 * @param {string|Element} target - Selector string or DOM element
 * @param {string} className - Space-separated class names to add
 * @returns {void}
 */
const addClass = (target, className) => {
    const element = getElement(target);
    if (!element || !className) {
        return;
    }
    className
        .split(/\s+/)
        .filter(Boolean)
        .forEach((name) => element.classList.add(name));
};

/**
 * Removes one or more CSS classes from an element.
 * @param {string|Element} target - Selector string or DOM element
 * @param {string} classNames - Space-separated class names to remove
 * @returns {void}
 */
const removeClass = (target, classNames) => {
    const element = getElement(target);
    if (!element || !classNames) {
        return;
    }
    classNames
        .split(/\s+/)
        .filter(Boolean)
        .forEach((name) => element.classList.remove(name));
};

/**
 * Toggles a CSS class on an element.
 * @param {string|Element} target - Selector string or DOM element
 * @param {string} className - Class name to toggle
 * @param {boolean} [force] - Optional force parameter: true to add, false to remove
 * @returns {void}
 */
const toggleClass = (target, className, force) => {
    const element = getElement(target);
    if (!element || !className) {
        return;
    }
    if (force === undefined) {
        element.classList.toggle(className);
    } else {
        element.classList.toggle(className, !!force);
    }
};

/**
 * Sets a CSS style property on an element.
 * @param {string|Element} target - Selector string or DOM element
 * @param {string} property - CSS property name (camelCase)
 * @param {string} value - CSS property value
 * @returns {void}
 */
const setStyle = (target, property, value) => {
    const element = getElement(target);
    if (!element) {
        return;
    }
    element.style[property] = value;
};

/**
 * Cache for storing default display values of HTML elements.
 * @type {Map<string, string>}
 */
const defaultDisplayCache = new Map();

/**
 * Gets the default display value for an HTML element type.
 * @param {string} nodeName - The node name (tag name) of the element
 * @returns {string} The default display value (e.g., "block", "inline")
 */
const getDefaultDisplay = (nodeName) => {
    const tagName = nodeName.toLowerCase();
    if (defaultDisplayCache.has(tagName)) {
        return defaultDisplayCache.get(tagName);
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
 * Shows a hidden element by setting its display property.
 * @param {string|Element} target - Selector string or DOM element
 * @param {string} [displayValue] - Optional display value to use (e.g., "block", "flex")
 * @returns {void}
 */
const show = (target, displayValue) => {
    const element = getElement(target);
    if (!element) {
        return;
    }
    element.style.removeProperty("display");
    const computedDisplay = window.getComputedStyle(element).display;
    if (computedDisplay === "none") {
        element.style.display = displayValue || getDefaultDisplay(element.nodeName);
    }
};

/**
 * Hides an element by setting its display to "none".
 * @param {string|Element} target - Selector string or DOM element
 * @returns {void}
 */
const hide = (target) => {
    const element = getElement(target);
    if (!element) {
        return;
    }
    element.style.display = "none";
};

/**
 * Removes all child nodes from an element.
 * @param {string|Element} target - Selector string or DOM element
 * @returns {void}
 */
const empty = (target) => {
    const element = getElement(target);
    if (!element) {
        return;
    }
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
};

/**
 * Appends a child element or HTML string to a target element.
 * @param {string|Element} target - Selector string or DOM element
 * @param {string|Element} child - HTML string or DOM element to append
 * @returns {Element|null} The appended element or null if operation failed
 */
const append = (target, child) => {
    const element = getElement(target);
    if (!element || child == null) {
        return null;
    }
    if (typeof child === "string") {
        element.insertAdjacentHTML("beforeend", child);
        return element.lastElementChild;
    }
    const childElement = getElement(child);
    if (childElement) {
        element.appendChild(childElement);
        return childElement;
    }
    return null;
};

/**
 * Gets or sets the text content of an element.
 * @param {string|Element} target - Selector string or DOM element
 * @param {string} [value] - Optional text value to set. If omitted, returns current text content.
 * @returns {string|undefined} Current text content if getting, or the set value if setting
 */
const text = (target, value) => {
    const element = getElement(target);
    if (!element) {
        return undefined;
    }
    if (value === undefined) {
        return element.textContent;
    }
    element.textContent = value;
    return value;
};

/**
 * Finds a descendant element matching a CSS selector.
 * @param {string|Element} target - Selector string or DOM element to search within
 * @param {string} selector - CSS selector to match
 * @returns {Element|null} The first matching element or null if not found
 */
const find = (target, selector) => {
    const element = getElement(target);
    if (!element) {
        return null;
    }
    return element.querySelector(selector);
};

/**
 * Adds an event listener to an element and returns a cleanup function.
 * @param {string|Element|Window|Document} target - Selector string or event target
 * @param {string} event - Event type (e.g., "click", "mouseover")
 * @param {Function} handler - Event handler function
 * @param {Object|boolean} [options] - Optional event listener options
 * @returns {Function} Cleanup function to remove the event listener
 */
const on = (target, event, handler, options) => {
    const element = getElement(target);
    if (!element) {
        return function () {};
    }
    element.addEventListener(event, handler, options);
    return function () {
        element.removeEventListener(event, handler, options);
    };
};

/**
 * Attaches mouseenter and mouseleave event handlers to an element.
 * @param {string|Element} target - Selector string or DOM element
 * @param {Function} [enter] - Handler for mouseenter event
 * @param {Function} [leave] - Handler for mouseleave event
 * @returns {Function} Cleanup function to remove both event listeners
 */
const hover = (target, enter, leave) => {
    const element = getElement(target);
    if (!element) {
        return function () {};
    }
    const enterHandler = typeof enter === "function" ? enter : function () {};
    const leaveHandler = typeof leave === "function" ? leave : function () {};
    element.addEventListener("mouseenter", enterHandler);
    element.addEventListener("mouseleave", leaveHandler);
    return function () {
        element.removeEventListener("mouseenter", enterHandler);
        element.removeEventListener("mouseleave", leaveHandler);
    };
};

/**
 * Tracks a timer ID for an element to enable cleanup of animations.
 * @param {Element} element - DOM element to track timer for
 * @param {number} timer - Timer ID from setTimeout
 * @returns {void}
 */
const trackTimer = (element, timer) => {
    if (!animationTimers.has(element)) {
        animationTimers.set(element, new Set());
    }
    animationTimers.get(element).add(timer);
};

/**
 * Removes a tracked timer for an element.
 * @param {Element} element - DOM element to clear timer for
 * @param {number} timer - Timer ID to remove
 * @returns {void}
 */
const clearTrackedTimer = (element, timer) => {
    const timers = animationTimers.get(element);
    if (!timers) {
        return;
    }
    timers.delete(timer);
    if (timers.size === 0) {
        animationTimers.delete(element);
    }
};

/**
 * Stops all running animations on an element by clearing tracked timers.
 * @param {string|Element} target - Selector string or DOM element
 * @returns {void}
 */
const stopAnimations = (target) => {
    const element = getElement(target);
    if (!element) {
        return;
    }
    const timers = animationTimers.get(element);
    if (timers) {
        timers.forEach((timer) => clearTimeout(timer));
        timers.clear();
        animationTimers.delete(element);
    }
    const computedOpacity = window.getComputedStyle(element).opacity;
    element.style.transition = "";
    element.style.opacity = computedOpacity;
};

/**
 * Animates the opacity of an element using CSS transitions.
 * @param {Element} element - DOM element to animate
 * @param {number} to - Target opacity value (0-1)
 * @param {number} duration - Animation duration in milliseconds
 * @param {string} [displayValue] - Optional display value when showing element
 * @returns {Promise<void>} Promise that resolves when animation completes
 */
const animateOpacity = (element, to, duration, displayValue) => {
    if (!element) {
        return Promise.resolve();
    }
    stopAnimations(element);
    if (to === 1) {
        show(element, displayValue);
    }
    const startOpacity = parseFloat(window.getComputedStyle(element).opacity);
    const initialOpacity = isNaN(startOpacity) ? (to === 1 ? 0 : 1) : startOpacity;
    element.style.opacity = initialOpacity;
    element.style.transition = `opacity ${duration}ms ease`;
    element.getBoundingClientRect();
    element.style.opacity = String(to);
    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            clearTrackedTimer(element, timer);
            element.style.transition = "";
            if (to === 0) {
                element.style.display = "none";
            }
            resolve();
        }, duration);
        trackTimer(element, timer);
    });
};

/**
 * Fades in an element by animating opacity from 0 to 1.
 * @param {string|Element} target - Selector string or DOM element
 * @param {number} [duration=400] - Animation duration in milliseconds
 * @param {string} [displayValue] - Optional display value to use when showing
 * @returns {Promise<void>} Promise that resolves when animation completes
 */
const fadeIn = (target, duration, displayValue) => {
    const element = getElement(target);
    return animateOpacity(element, 1, duration || 400, displayValue);
};

/**
 * Fades out an element by animating opacity from 1 to 0.
 * @param {string|Element} target - Selector string or DOM element
 * @param {number} [duration=400] - Animation duration in milliseconds
 * @returns {Promise<void>} Promise that resolves when animation completes
 */
const fadeOut = (target, duration) => {
    const element = getElement(target);
    return animateOpacity(element, 0, duration || 400);
};

/**
 * Creates a delay associated with an element that can be tracked and cancelled.
 * @param {string|Element} target - Selector string or DOM element
 * @param {number} duration - Delay duration in milliseconds
 * @returns {Promise<void>} Promise that resolves after the delay
 */
const delay = (target, duration) => {
    const element = getElement(target);
    if (!element) {
        return Promise.resolve();
    }
    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            clearTrackedTimer(element, timer);
            resolve();
        }, duration);
        trackTimer(element, timer);
    });
};

/**
 * Gets the width of an element or window.
 * @param {string|Element|Window} target - Selector string, DOM element, or window
 * @returns {number} Width in pixels
 */
const width = (target) => {
    const element = getElement(target);
    if (!element) {
        return 0;
    }
    if (element === window) {
        return window.innerWidth;
    }
    return element.getBoundingClientRect().width;
};

export default {
    addClass,
    append,
    delay,
    empty,
    fadeIn,
    fadeOut,
    find,
    getElement,
    getElements,
    hide,
    hover,
    on,
    removeClass,
    setStyle,
    show,
    stopAnimations,
    text,
    toggleClass,
    width,
};
