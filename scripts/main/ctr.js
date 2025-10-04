// a fix for the rotation issue in v1.1

document.addEventListener(
    "blur",
    function () {
        document.body.style.transform = "rotate(90deg)";
        setTimeout(function () {
            document.body.style.transform = "rotate(0deg)";
        }, 1000);
    },
    false
);

document.addEventListener(
    "focus",
    function () {
        document.body.style.transform = "rotate(0deg)";
    },
    false
);

window.addEventListener(
    "contextmenu",
    function (e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    },
    true
);

const GLOBAL_ZOOM = matchMedia("(min-width: 960px)").matches ? 2 : 1;

(function () {
    requirejs.config({
        baseUrl: "scripts/main",
    });

    // manages sounds (SoundManager2 only for now, but eventually PhoneGap as well)
    document.addEventListener("mozvisibilitychange", function () {
        //console.log("VISIBILTY", document.mozHidden);
        if (document.mozHidden) {
            for (const key in window.sounds__) {
                window.sounds__[key]._wasPlaying = !window.sounds__[key].paused;
                window.sounds__[key].pause();
            }
        } else {
            for (const key in window.sounds__) {
                window.sounds__[key]._wasPlaying && window.sounds__[key].play();
            }
        }
    });

    require(["app", "platform", "ctrExports"], function (app, platform) {
        // verify that the client meets platform requirements
        if (!platform.meetsRequirements()) {
            return;
        }

        // initialize the application immediately
        app.init();

        // wait until the DOM is loaded before wiring up events
        $(document).ready(function () {
            app.domReady();

            // for now, we will immediately run the app
            app.run();
        });
    });

    define("main", function () {});
})();
