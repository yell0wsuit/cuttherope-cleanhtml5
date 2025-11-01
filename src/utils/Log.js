class Log {
    /**
     * Logs a debug message when running in development mode.
     * @param {string} message
     */
    static debug(message) {
        if (import.meta.env.DEV) {
            console.log(`CTR debug: ${message}`);
        }
    }

    /**
     * Logs an error message when running in development mode.
     * @param {string} message
     */
    static alert(message) {
        if (import.meta.env.DEV) {
            console.error(`CTR encountered an error: ${message}`);
            Log.debug(message);
        }
    }
}

export default Log;
