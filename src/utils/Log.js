const Log = {
    /**
     * @param {string} message
     */
    debug(message) {
        if (import.meta.env.DEV) {
            console.log(message);
        }
    },
    /**
     * @param {string} message
     */
    alert(message) {
        if (import.meta.env.DEV) {
            alert(message);
            Log.debug(message);
        }
    },
};

export default Log;
