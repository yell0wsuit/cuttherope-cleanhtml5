define("core/Alignment", [], function () {
    var Alignment = {
        /** @const
         *  @type {number}
         */
        UNDEFINED: 0,
        /** @const
         *  @type {number}
         */
        LEFT: 1,
        /** @const
         *  @type {number}
         */
        HCENTER: 2,
        /** @const
         *  @type {number}
         */
        RIGHT: 4,
        /** @const
         *  @type {number}
         */
        TOP: 8,
        /** @const
         *  @type {number}
         */
        VCENTER: 16,
        /** @const
         *  @type {number}
         */
        BOTTOM: 32,
        /** @const
         *  @type {number}
         */
        CENTER: 2 | 16,
        /**
         * @param s {string} input string
         * @return {number}
         */
        parse: function (s) {
            var a = this.UNDEFINED;
            if (s.indexOf("LEFT") > 0) a = this.LEFT;
            else if (s.indexOf("HCENTER") > 0 || s === "CENTER") a = this.HCENTER;
            else if (s.indexOf("RIGHT") > 0) a = this.RIGHT;

            if (s.indexOf("TOP") > 0) a |= this.TOP;
            else if (s.indexOf("VCENTER") > 0 || s === "CENTER") a |= this.VCENTER;
            else if (s.indexOf("BOTTOM") > 0) a |= this.BOTTOM;

            return a;
        },
    };

    return Alignment;
});
