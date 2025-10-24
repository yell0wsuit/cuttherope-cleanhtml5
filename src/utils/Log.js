const Log = {
    debug(message) {
        if (false && window.console) {
            console.log(message);
        }
    },
    alert(message) {
        if (false) {
            alert(message);
            Log.debug(message);
        }
    },
};

export default Log;
