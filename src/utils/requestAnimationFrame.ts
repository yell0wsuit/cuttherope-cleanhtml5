// see if the browser natively supports requestAnimationFrame
const vendors = ["ms", "moz", "webkit", "o"];
for (let i = 0; i < vendors.length && !window["requestAnimationFrame"]; i++) {
    window["requestAnimationFrame"] = window[`${vendors[i]}RequestAnimationFrame`];
}

// fallback to using setTimeout if requestAnimationFrame isn't available
if (!window["requestAnimationFrame"]) {
    const renderInterval = 1000 / 60;
    let lastTime = 0;
    window["requestAnimationFrame"] = function (callback, element) {
        const currTime = Date.now();
        const timeToCall = Math.max(0, renderInterval - (currTime - lastTime));
        window.setTimeout(function () {
            callback(Date.now());
        }, timeToCall);
        lastTime = currTime + timeToCall;
    };
}

export default window["requestAnimationFrame"];
