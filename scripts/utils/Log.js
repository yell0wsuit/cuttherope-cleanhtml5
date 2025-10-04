define("utils/Log", [], function () {
    var Log = {
        debug: function (message) {
            if (false && window.console) {
                console.log(message);
            }
        },
        alert: function (message) {
            if (false) {
                alert(message);
                Log.debug(message);
            }
        },
    };

    return Log;
});
