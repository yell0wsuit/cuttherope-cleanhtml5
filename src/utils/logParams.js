const logParams = (context, params) => {
    if (typeof window === "undefined") {
        return;
    }

    const consoleObj = window.console;
    if (!consoleObj || typeof consoleObj.log !== "function") {
        return;
    }

    const getTypeInfo = (val) => {
        if (val === null) return "null";
        if (val === undefined) return "undefined";
        if (Array.isArray(val)) {
            const types = [...new Set(val.map(getTypeInfo))];
            return `Array<${types.join(" | ") || "unknown"}>`;
        }
        if (typeof val === "object") {
            return val.constructor?.name || "Object";
        }
        return typeof val;
    };

    const entries = Array.isArray(params) ? params : [params];
    const typeInfo = entries.map(getTypeInfo).join(", ");

    try {
        consoleObj.log(
            `[%cparams%c] ${context} %c(${typeInfo})`,
            "color:#888",
            "",
            "color:#0a0",
            ...entries
        );
    } catch (error) {
        consoleObj.log(`[%cparams%c] ${context}`, "color:#888", "", params);
        consoleObj.warn(
            `Failed to expand parameter entries for ${context}. Falling back to raw object.`,
            error
        );
    }
};

export default logParams;
