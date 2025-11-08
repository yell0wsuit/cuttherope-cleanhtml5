import type { ResolutionProfile } from "@/types/resolution";

const res1920x1080: Partial<ResolutionProfile> = {
    /**
     * @const
     * @type {number}
     */
    VIDEO_WIDTH: 1280,

    /**
     * @const
     * @type {number}
     */
    CANVAS_WIDTH: 1920,
    /**
     * @const
     * @type {number}
     */
    CANVAS_HEIGHT: 1080,
    /**
     * @const
     * @type {number}
     */
    CANVAS_SCALE: 0.75,

    /**
     * @const
     * @type {number}
     */
    UI_IMAGES_SCALE: 1.875,
    /**
     * @const
     * @type {number}
     */
    UI_TEXT_SCALE: 1,
    /**
     * @const
     * @type {number}
     */
    UI_WIDTH: 1920,
    /**
     * @const
     * @type {number}
     */
    UI_HEIGHT: 1080,

    /**
     * @const
     * @type {number}
     */
    BUNGEE_BEZIER_POINTS: 3,

    /**
     * @const
     * @type {number}
     */
    DEFAULT_BUNGEE_LINE_WIDTH: 6,

    /**
     * @const
     * @type {number}
     */
    DEFAULT_BUNGEE_WIDTH: 5,

    /**
     * Platform multiplier (maps the height of the level to the height of the canvas).
     * Map height is 480 and canvas height is 576.
     * @const
     * @type {number}
     */
    PM: 2.25,

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
    BUBBLE_IMPULSE_Y: -23,
    /**
     * Controls descent speed of bubble
     * @const
     * @type {number}
     */
    BUBBLE_IMPULSE_RD: 23,

    /**
     * @const
     * @type {number}
     */
    BOUNCER_MAX_MOVEMENT: 510,

    /**
     * @const
     * @type {number}
     */
    PUMP_POWER_RADIUS: 475,

    /**
     * @const
     * @type {number}
     */
    PHYSICS_SPEED_MULTIPLIER: 1.05,
} as const;

window.resolution = res1920x1080 as ResolutionProfile;

export default res1920x1080;
