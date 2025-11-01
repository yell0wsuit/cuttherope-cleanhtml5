class Alignment {
    static UNDEFINED = 0;
    static LEFT = 1;
    static HCENTER = 2;
    static RIGHT = 4;
    static TOP = 8;
    static VCENTER = 16;
    static BOTTOM = 32;
    static CENTER = 18; // 2 | 16

    /**
     * Parse alignment string (e.g. "LEFT|TOP" → bitmask)
     * @param {string} s
     * @returns {number}
     */
    static parse(s) {
        let a = Alignment.UNDEFINED;

        if (s.includes("LEFT")) a = Alignment.LEFT;
        else if (s.includes("HCENTER") || s === "CENTER") a = Alignment.HCENTER;
        else if (s.includes("RIGHT")) a = Alignment.RIGHT;

        if (s.includes("TOP")) a |= Alignment.TOP;
        else if (s.includes("VCENTER") || s === "CENTER") a |= Alignment.VCENTER;
        else if (s.includes("BOTTOM")) a |= Alignment.BOTTOM;

        return a;
    }
}

export default Alignment;
