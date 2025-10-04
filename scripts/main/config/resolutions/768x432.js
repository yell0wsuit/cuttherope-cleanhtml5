define("config/resolutions/768x432", [], function () {
    const res768x432 = {
        /**
         * @const
         * @type {number}
         */
        VIDEO_WIDTH: 768,

        /**
         * @const
         * @type {number}
         */
        CANVAS_WIDTH: 768,
        /**
         * @const
         * @type {number}
         */
        CANVAS_HEIGHT: 432,
        /**
         * @const
         * @type {number}
         */
        CANVAS_SCALE: 0.3,

        /**
         * @const
         * @type {number}
         */
        UI_IMAGES_SCALE: 0.75,
        /**
         * @const
         * @type {number}
         */
        UI_TEXT_SCALE: 1,
        /**
         * @const
         * @type {number}
         */
        UI_WIDTH: 768,
        /**
         * @const
         * @type {number}
         */
        UI_HEIGHT: 432,

        /**
         * @const
         * @type {number}
         */
        BUNGEE_BEZIER_POINTS: 2,

        /**
         * @const
         * @type {number}
         */
        DEFAULT_BUNGEE_LINE_WIDTH: 3,

        /**
         * @const
         * @type {number}
         */
        DEFAULT_BUNGEE_WIDTH: 2,

        /**
         * Platform multiplier (maps the height of the level to the height of the canvas).
         * Map height is 480 and canvas height is 432.
         * @const
         * @type {number}
         */
        PM: 0.9,

        /**
         * Adjusts the y offset for the level
         * @const
         * @type {number}
         */
        PMY: 0,

        /**
         * @const
         * @type {number}
         */
        GRAB_RADIUS_ALPHA: 0.8,

        /**
         * Controls ascent speed of bubble
         * @const
         * @type {number}
         */
        BUBBLE_IMPULSE_Y: -14,
        /**
         * Controls descent speed of bubble
         * @const
         * @type {number}
         */
        BUBBLE_IMPULSE_RD: 24,

        /**
         * @const
         * @type {number}
         */
        BOUNCER_MAX_MOVEMENT: 255,

        /**
         * @const
         * @type {number}
         */
        PHYSICS_SPEED_MULTIPLIER: 0.8,
    };

    return res768x432;
});
