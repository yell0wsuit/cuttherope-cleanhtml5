const Log = {
    /**
     * @param {string} message
     */
    debug(message) {
        if (import.meta.env.DEV) {
            console.log(`CTR debug: ${message}`);
        }
    },
    /**
     * @param {string} message
     */
    alert(message) {
        if (import.meta.env.DEV) {
            console.error(`CTR encountered an error: ${message}`);
            Log.debug(message);
        }
    },
};

export default Log;
