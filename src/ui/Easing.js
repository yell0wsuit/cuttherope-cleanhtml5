// penner easing (we use for canvas animations)

//@t is the current time (or position) of the tween. This can be seconds or frames, steps, seconds, ms, whatever - as long as the unit is the same as is used for the total time [3].
//@b is the beginning value of the property.
//@c is the change between the beginning and destination value of the property.
//@d is the total time of the tween.

const Easing = {
    noEase: (t, b, c, d) => {
        return (c * t) / d + b;
    },
    easeOutCirc: (t, b, c, d) => {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },
    easeInCirc: (t, b, c, d) => {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },
    easeInOutCirc: (t, b, c, d) => {
        if ((t /= d / 2) < 1) return (-c / 2) * (Math.sqrt(1 - t * t) - 1) + b;
        return (c / 2) * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    },
    easeInSine: (t, b, c, d) => {
        return -c * Math.cos((t / d) * (Math.PI / 2)) + c + b;
    },
    easeOutSine: (t, b, c, d) => {
        return c * Math.sin((t / d) * (Math.PI / 2)) + b;
    },
    easeInOutSine: (t, b, c, d) => {
        return (-c / 2) * (Math.cos((Math.PI * t) / d) - 1) + b;
    },
    easeInCubic: (t, b, c, d) => {
        return c * (t /= d) * t * t + b;
    },
    easeOutCubic: (t, b, c, d) => {
        return c * ((t = t / d - 1) * t * t + 1) + b;
    },
    easeInOutCubic: (t, b, c, d) => {
        if ((t /= d / 2) < 1) return (c / 2) * t * t * t + b;
        return (c / 2) * ((t -= 2) * t * t + 2) + b;
    },
    easeInExpo: (t, b, c, d) => {
        return t == 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    },
    easeOutExpo: (t, b, c, d) => {
        return t == d ? b + c : c * (-Math.pow(2, (-10 * t) / d) + 1) + b;
    },
    easeInOutExpo: (t, b, c, d) => {
        if (t == 0) return b;
        if (t == d) return b + c;
        if ((t /= d / 2) < 1) return (c / 2) * Math.pow(2, 10 * (t - 1)) + b;
        return (c / 2) * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeInBounce: (t, b, c, d, s) => {
        if (s == undefined) s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    easeOutBounce: (t, b, c, d, s) => {
        if (s == undefined) s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    easeInOutBounce: (t, b, c, d, s) => {
        if (s == undefined) s = 1.70158;
        if ((t /= d / 2) < 1) return (c / 2) * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
        return (c / 2) * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
    },
    easeInOutQuad: (t, b, c, d) => {
        if ((t /= d / 2) < 1) return (c / 2) * t * t + b;
        return (-c / 2) * (--t * (t - 2) - 1) + b;
    },
};

export default Easing;
