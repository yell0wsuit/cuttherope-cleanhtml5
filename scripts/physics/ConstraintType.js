define("physics/ConstraintType", [], function () {
    /** @enum {number} */
    var ConstraintType = {
        DISTANCE: 0,
        NOT_MORE_THAN: 1,
        NOT_LESS_THAN: 2,
    };

    return ConstraintType;
});
