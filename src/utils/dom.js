const animationTimers = new WeakMap();

function getElement(target, context) {
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
}

function getElements(target, context) {
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
}

function addClass(target, className) {
    const element = getElement(target);
    if (!element || !className) {
        return;
    }
    className
        .split(/\s+/)
        .filter(Boolean)
        .forEach((name) => element.classList.add(name));
}

function removeClass(target, classNames) {
    const element = getElement(target);
    if (!element || !classNames) {
        return;
    }
    classNames
        .split(/\s+/)
        .filter(Boolean)
        .forEach((name) => element.classList.remove(name));
}

function toggleClass(target, className, force) {
    const element = getElement(target);
    if (!element || !className) {
        return;
    }
    if (force === undefined) {
        element.classList.toggle(className);
    } else {
        element.classList.toggle(className, !!force);
    }
}

function setStyle(target, property, value) {
    const element = getElement(target);
    if (!element) {
        return;
    }
    element.style[property] = value;
}

const defaultDisplayCache = new Map();

function getDefaultDisplay(nodeName) {
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
}

function show(target, displayValue) {
    const element = getElement(target);
    if (!element) {
        return;
    }
    element.style.removeProperty("display");
    const computedDisplay = window.getComputedStyle(element).display;
    if (computedDisplay === "none") {
        element.style.display = displayValue || getDefaultDisplay(element.nodeName);
    }
}

function hide(target) {
    const element = getElement(target);
    if (!element) {
        return;
    }
    element.style.display = "none";
}

function empty(target) {
    const element = getElement(target);
    if (!element) {
        return;
    }
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function append(target, child) {
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
}

function text(target, value) {
    const element = getElement(target);
    if (!element) {
        return undefined;
    }
    if (value === undefined) {
        return element.textContent;
    }
    element.textContent = value;
    return value;
}

function find(target, selector) {
    const element = getElement(target);
    if (!element) {
        return null;
    }
    return element.querySelector(selector);
}

function on(target, event, handler, options) {
    const element = getElement(target);
    if (!element) {
        return function () {};
    }
    element.addEventListener(event, handler, options);
    return function () {
        element.removeEventListener(event, handler, options);
    };
}

function hover(target, enter, leave) {
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
}

function trackTimer(element, timer) {
    if (!animationTimers.has(element)) {
        animationTimers.set(element, new Set());
    }
    animationTimers.get(element).add(timer);
}

function clearTrackedTimer(element, timer) {
    const timers = animationTimers.get(element);
    if (!timers) {
        return;
    }
    timers.delete(timer);
    if (timers.size === 0) {
        animationTimers.delete(element);
    }
}

function stopAnimations(target) {
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
}

function animateOpacity(element, to, duration, displayValue) {
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
}

function fadeIn(target, duration, displayValue) {
    const element = getElement(target);
    return animateOpacity(element, 1, duration || 400, displayValue);
}

function fadeOut(target, duration) {
    const element = getElement(target);
    return animateOpacity(element, 0, duration || 400);
}

function delay(target, duration) {
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
}

function width(target) {
    const element = getElement(target);
    if (!element) {
        return 0;
    }
    if (element === window) {
        return window.innerWidth;
    }
    return element.getBoundingClientRect().width;
}

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
