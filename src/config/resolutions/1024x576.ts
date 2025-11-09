import type { ResolutionProfile } from "@/types/resolution";

const res1024x576: Partial<ResolutionProfile> = {
    /**
     * @const
     * @type {number}
     */
    VIDEO_WIDTH: 1024,

    /**
     * @const
     * @type {number}
     */
    CANVAS_WIDTH: 1024,
    /**
     * @const
     * @type {number}
     */
    CANVAS_HEIGHT: 576,
    /**
     * @const
     * @type {number}
     */
    CANVAS_SCALE: 0.4,

    /**
     * @const
     * @type {number}
     */
    UI_IMAGES_SCALE: 1,
    /**
     * @const
     * @type {number}
     */
    UI_TEXT_SCALE: 1,
    /**
     * @const
     * @type {number}
     */
    UI_WIDTH: 1024,
    /**
     * @const
     * @type {number}
     */
    UI_HEIGHT: 576,

    /**
     * @const
     * @type {number}
     */
    BUNGEE_BEZIER_POINTS: 3,

    /**
     * @const
     * @type {number}
     */
    DEFAULT_BUNGEE_LINE_WIDTH: 3.5,

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
    PM: 1.2,

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
    BUBBLE_IMPULSE_Y: -17,
    /**
     * Controls descent speed of bubble
     * @const
     * @type {number}
     */
    BUBBLE_IMPULSE_RD: 20,

    /**
     * @const
     * @type {number}
     */
    BOUNCER_MAX_MOVEMENT: 336,

    /**
     * @const
     * @type {number}
     */
    PHYSICS_SPEED_MULTIPLIER: 0.925,
} as const;

window.resolution = res1024x576 as ResolutionProfile;

export default res1024x576;
