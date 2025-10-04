define("config/resolutions/480x270", [], function () {
  var res480x270 = {
    /**
     * @const
     * @type {number}
     */
    VIDEO_WIDTH: 768,

    /**
     * @const
     * @type {number}
     */
    CANVAS_WIDTH: 480,
    /**
     * @const
     * @type {number}
     */
    CANVAS_HEIGHT: 320,
    /**
     * @const
     * @type {number}
     */
    CANVAS_SCALE: 0.1875,

    /**
     * @const
     * @type {number}
     */
    UI_IMAGES_SCALE: 0.46875,
    /**
     * @const
     * @type {number}
     */
    UI_TEXT_SCALE: 1,
    /**
     * @const
     * @type {number}
     */
    UI_WIDTH: 480,
    /**
     * @const
     * @type {number}
     */
    UI_HEIGHT: 320,

    /**
     * @const
     * @type {number}
     */
    BUNGEE_BEZIER_POINTS: 2,

    /**
     * @const
     * @type {number}
     */
    DEFAULT_BUNGEE_LINE_WIDTH: 2,

    /**
     * @const
     * @type {number}
     */
    DEFAULT_BUNGEE_WIDTH: 2,

    /**
     * Platform multiplier (maps the height of the level to the height of the canvas).
     * Map height is 480 and canvas height is 576.
     * @const
     * @type {number}
     */
    PM: 0.5625,

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
    BUBBLE_IMPULSE_Y: -9,
    /**
     * Controls descent speed of bubble
     * @const
     * @type {number}
     */
    BUBBLE_IMPULSE_RD: 22,

    /**
     * @const
     * @type {number}
     */
    BOUNCER_MAX_MOVEMENT: 158,

    /**
     * @const
     * @type {number}
     */
    PHYSICS_SPEED_MULTIPLIER: 0.65,
  };

  window.resolution = res480x270;

  return res480x270;
});
