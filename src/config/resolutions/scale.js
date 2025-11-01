import Rectangle from "@/core/Rectangle";
import res2560x1440 from "@/config/resolutions/2560x1440";

/**
 * @typedef {object} BaseProfile
 * @property {number} [CANVAS_WIDTH]
 * @property {number} [CANVAS_HEIGHT]
 * @property {number} [CANVAS_SCALE]
 * @property {number} [PM]
 * @property {number} [PMY]
 * @property {number} BUNGEE_REST_LEN
 * @property {number} [DEFAULT_BUNGEE_LINE_WIDTH]
 * @property {number} [DEFAULT_BUNGEE_WIDTH]
 * @property {number} CLICK_TO_CUT_SEARCH_RADIUS
 * @property {number} MOVER_SCALE
 * @property {number} STAR_RADIUS
 * @property {number} MOUTH_OPEN_RADIUS
 * @property {number} OUT_OF_SCREEN_ADJUSTMENT_BOTTOM
 * @property {number} OUT_OF_SCREEN_ADJUSTMENT_TOP
 * @property {Rectangle} STAR_DEFAULT_BB
 * @property {Rectangle} STAR_BB
 * @property {Rectangle} TARGET_BB
 * @property {Rectangle} TARGET2_BB
 * @property {number} TUTORIAL_HAND_TARGET_X_1
 * @property {number} TUTORIAL_HAND_TARGET_X_2
 * @property {number} BUBBLE_SIZE
 * @property {number} BUBBLE_RADIUS
 * @property {number} BUBBLE_TOUCH_OFFSET
 * @property {number} BUBBLE_TOUCH_SIZE
 * @property {Rectangle} BUBBLE_BB
 * @property {number} [BUBBLE_IMPULSE_Y]
 * @property {number} [BUBBLE_IMPULSE_RD]
 * @property {number} STAR_SPIKE_RADIUS
 * @property {number} BOUNCER_RADIUS
 * @property {number} PUMP_POWER_RADIUS
 * @property {Rectangle} PUMP_BB
 * @property {number} PUMP_DIRT_SPEED
 * @property {number} PUMP_DIRT_PARTICLE_SIZE
 * @property {number} PUMP_DIRT_OFFSET
 * @property {number} CANDY_BUBBLE_TUTORIAL_LIMIT_Y
 * @property {number} CANDY_BUBBLE_TUTORIAL_LIMIT_X
 * @property {Rectangle} CANDY_BB
 * @property {Rectangle} CANDY_LR_BB
 * @property {number} [GRAB_RADIUS_ALPHA]
 * @property {number} GRAB_WHEEL_RADIUS
 * @property {number} GRAB_WHEEL_MAX_ROTATION
 * @property {number} GRAB_WHEEL_SCALE_DIVISOR
 * @property {number} GRAB_ROPE_ROLL_MAX_LENGTH
 * @property {number} GRAB_MOVE_BG_WIDTH
 * @property {number} GRAB_MOVE_BG_X_OFFSET
 * @property {number} GRAB_MOVE_RADIUS
 * @property {number} SPIDER_SPEED
 * @property {number} SOCK_LIGHT_Y
 * @property {number} SOCK_WIDTH
 * @property {number} SOCK_ROTATION_Y_OFFSET
 * @property {number} STAR_SOCK_RADIUS
 * @property {number} SOCK_TELEPORT_Y
 * @property {number} POLLEN_MIN_DISTANCE
 * @property {number} POLLEN_MAX_OFFSET
 * @property {number} RC_CONTROLLER_RADIUS
 * @property {number} IGNORE_TOUCHES_DISTANCE
 * @property {number} PREVIEW_CAMERA_SPEED
 * @property {number} PREVIEW_CAMERA_SPEED2
 * @property {number} MAX_PREVIEW_CAMERA_SPEED
 * @property {number} MIN_PREVIEW_CAMERA_SPEED
 * @property {number} CAMERA_SPEED_THRESHOLD
 * @property {number} CAMERA_SPEED
 * @property {number} CUT_MAX_SIZE
 * @property {number} [PHYSICS_SPEED_MULTIPLIER]
 */

/**
 * @typedef {object} TargetProfile
 * @property {number} CANVAS_SCALE
 * @property {number} UI_IMAGES_SCALE
 * @property {(n:number)=>number} uiScaledNumber
 * @property {number} BUNGEE_REST_LEN
 * @property {number} MOVER_SCALE
 * @property {number} STAR_RADIUS
 * @property {number} MOUTH_OPEN_RADIUS
 * @property {number} OUT_OF_SCREEN_ADJUSTMENT_TOP
 * @property {number} OUT_OF_SCREEN_ADJUSTMENT_BOTTOM
 * @property {number} CLICK_TO_CUT_SEARCH_RADIUS
 * @property {Rectangle} TARGET_BB
 * @property {Rectangle} TARGET2_BB
 * @property {number} TUTORIAL_HAND_TARGET_X_1
 * @property {number} TUTORIAL_HAND_TARGET_X_2
 * @property {number} BUBBLE_SIZE
 * @property {number} BUBBLE_TOUCH_OFFSET
 * @property {number} BUBBLE_TOUCH_SIZE
 * @property {Rectangle} BUBBLE_BB
 * @property {number} BUBBLE_RADIUS
 * @property {number} STAR_SPIKE_RADIUS
 * @property {Rectangle} STAR_BB
 * @property {Rectangle} STAR_DEFAULT_BB
 * @property {number} BOUNCER_RADIUS
 * @property {number} PUMP_POWER_RADIUS
 * @property {Rectangle} PUMP_BB
 * @property {number} PUMP_DIRT_SPEED
 * @property {number} PUMP_DIRT_PARTICLE_SIZE
 * @property {number} PUMP_DIRT_OFFSET
 * @property {Rectangle} CANDY_BB
 * @property {Rectangle} CANDY_LR_BB
 * @property {number} CANDY_BUBBLE_TUTORIAL_LIMIT_Y
 * @property {number} CANDY_BUBBLE_TUTORIAL_LIMIT_X
 * @property {number} IGNORE_TOUCHES_DISTANCE
 * @property {number} PREVIEW_CAMERA_SPEED
 * @property {number} PREVIEW_CAMERA_SPEED2
 * @property {number} MAX_PREVIEW_CAMERA_SPEED
 * @property {number} MIN_PREVIEW_CAMERA_SPEED
 * @property {number} CAMERA_SPEED_THRESHOLD
 * @property {number} CAMERA_SPEED
 * @property {number} GRAB_WHEEL_MAX_ROTATION
 * @property {number} GRAB_WHEEL_SCALE_DIVISOR
 * @property {number} GRAB_WHEEL_RADIUS
 * @property {number} GRAB_ROPE_ROLL_MAX_LENGTH
 * @property {number} GRAB_MOVE_BG_WIDTH
 * @property {number} GRAB_MOVE_BG_X_OFFSET
 * @property {number} GRAB_MOVE_RADIUS
 * @property {number} SPIDER_SPEED
 * @property {number} POLLEN_MIN_DISTANCE
 * @property {number} POLLEN_MAX_OFFSET
 * @property {number} RC_CONTROLLER_RADIUS
 * @property {number} SOCK_LIGHT_Y
 * @property {number} SOCK_WIDTH
 * @property {number} SOCK_ROTATION_Y_OFFSET
 * @property {number} STAR_SOCK_RADIUS
 * @property {number} SOCK_TELEPORT_Y
 * @property {number} CUT_MAX_SIZE
 */

/**
 * Initializes the target device profile using a base profile.
 * A set of properties will be scaled and added to the target.
 * @param {BaseProfile} base
 * @param {TargetProfile} target
 */
const initProfile = (base, target) => {
    const scale = target.CANVAS_SCALE;

    target.BUNGEE_REST_LEN = base.BUNGEE_REST_LEN * scale;
    target.MOVER_SCALE = base.MOVER_SCALE * scale;
    target.STAR_RADIUS = base.STAR_RADIUS * scale;
    target.MOUTH_OPEN_RADIUS = base.MOUTH_OPEN_RADIUS * scale;
    target.OUT_OF_SCREEN_ADJUSTMENT_TOP = base.OUT_OF_SCREEN_ADJUSTMENT_TOP * scale;
    target.OUT_OF_SCREEN_ADJUSTMENT_BOTTOM = base.OUT_OF_SCREEN_ADJUSTMENT_BOTTOM * scale;
    target.CLICK_TO_CUT_SEARCH_RADIUS = base.CLICK_TO_CUT_SEARCH_RADIUS * scale;

    target.TARGET_BB = Rectangle.scaleCopy(base.TARGET_BB, scale);
    target.TARGET2_BB = Rectangle.scaleCopy(base.TARGET2_BB, scale);

    target.TUTORIAL_HAND_TARGET_X_1 = base.TUTORIAL_HAND_TARGET_X_1 * scale;
    target.TUTORIAL_HAND_TARGET_X_2 = base.TUTORIAL_HAND_TARGET_X_2 * scale;

    target.BUBBLE_SIZE = base.BUBBLE_SIZE * scale;
    target.BUBBLE_TOUCH_OFFSET = base.BUBBLE_TOUCH_OFFSET * scale;
    target.BUBBLE_TOUCH_SIZE = base.BUBBLE_TOUCH_SIZE * scale;
    target.BUBBLE_BB = Rectangle.scaleCopy(base.BUBBLE_BB, scale);
    target.BUBBLE_RADIUS = base.BUBBLE_RADIUS * scale;

    target.STAR_SPIKE_RADIUS = base.STAR_SPIKE_RADIUS * scale;
    target.STAR_BB = Rectangle.scaleCopy(base.STAR_BB, scale);
    target.STAR_DEFAULT_BB = Rectangle.scaleCopy(base.STAR_DEFAULT_BB, scale);

    target.BOUNCER_RADIUS = base.BOUNCER_RADIUS * scale;

    target.PUMP_POWER_RADIUS = target.PUMP_POWER_RADIUS || base.PUMP_POWER_RADIUS * scale;
    target.PUMP_BB = Rectangle.scaleCopy(base.PUMP_BB, scale);
    target.PUMP_DIRT_SPEED = base.PUMP_DIRT_SPEED * scale;
    target.PUMP_DIRT_PARTICLE_SIZE = base.PUMP_DIRT_PARTICLE_SIZE * scale;
    target.PUMP_DIRT_OFFSET = base.PUMP_DIRT_OFFSET * scale;

    target.CANDY_BB = Rectangle.scaleCopy(base.CANDY_BB, scale);
    target.CANDY_LR_BB = Rectangle.scaleCopy(base.CANDY_LR_BB, scale);
    target.CANDY_BUBBLE_TUTORIAL_LIMIT_Y = base.CANDY_BUBBLE_TUTORIAL_LIMIT_Y * scale;
    target.CANDY_BUBBLE_TUTORIAL_LIMIT_X = base.CANDY_BUBBLE_TUTORIAL_LIMIT_X * scale;

    target.IGNORE_TOUCHES_DISTANCE = base.IGNORE_TOUCHES_DISTANCE * scale;
    target.PREVIEW_CAMERA_SPEED = base.PREVIEW_CAMERA_SPEED * scale;
    target.PREVIEW_CAMERA_SPEED2 = base.PREVIEW_CAMERA_SPEED2 * scale;
    target.MAX_PREVIEW_CAMERA_SPEED = base.MAX_PREVIEW_CAMERA_SPEED * scale;
    target.MIN_PREVIEW_CAMERA_SPEED = base.MIN_PREVIEW_CAMERA_SPEED * scale;
    target.CAMERA_SPEED_THRESHOLD = base.CAMERA_SPEED_THRESHOLD * scale;
    target.CAMERA_SPEED = base.CAMERA_SPEED * scale;

    target.GRAB_WHEEL_MAX_ROTATION = base.GRAB_WHEEL_MAX_ROTATION * scale;
    target.GRAB_WHEEL_SCALE_DIVISOR = base.GRAB_WHEEL_SCALE_DIVISOR * scale;
    target.GRAB_WHEEL_RADIUS = base.GRAB_WHEEL_RADIUS * scale;
    target.GRAB_ROPE_ROLL_MAX_LENGTH = base.GRAB_ROPE_ROLL_MAX_LENGTH * scale;
    target.GRAB_MOVE_BG_WIDTH = base.GRAB_MOVE_BG_WIDTH * scale;
    target.GRAB_MOVE_BG_X_OFFSET = base.GRAB_MOVE_BG_X_OFFSET * scale;
    target.GRAB_MOVE_RADIUS = base.GRAB_MOVE_RADIUS * scale;
    target.SPIDER_SPEED = base.SPIDER_SPEED * scale;

    target.POLLEN_MIN_DISTANCE = base.POLLEN_MIN_DISTANCE * scale;
    target.POLLEN_MAX_OFFSET = base.POLLEN_MAX_OFFSET * scale;

    target.RC_CONTROLLER_RADIUS = base.RC_CONTROLLER_RADIUS * scale;

    target.SOCK_LIGHT_Y = base.SOCK_LIGHT_Y * scale;
    target.SOCK_WIDTH = base.SOCK_WIDTH * scale;
    target.SOCK_ROTATION_Y_OFFSET = base.SOCK_ROTATION_Y_OFFSET * scale;
    target.STAR_SOCK_RADIUS = base.STAR_SOCK_RADIUS * scale;
    target.SOCK_TELEPORT_Y = base.SOCK_TELEPORT_Y * scale;

    target.CUT_MAX_SIZE = base.CUT_MAX_SIZE * scale;

    target.uiScaledNumber = function (n) {
        return Math.round(n * target.UI_IMAGES_SCALE);
    };
};

/**
 * Initializes a target profile scaled from the macOS version profile.
 *
 * @template {Record<string, unknown>} T
 * @param {T} target
 * @returns {T & typeof res2560x1440 & { uiScaledNumber(n: number): number }}
 */
const initProfileFromMac = (target) => {
    initProfile(res2560x1440, /** @type {TargetProfile} */ (target));
    return /** @type {T & typeof res2560x1440 & { uiScaledNumber(n: number): number }} */ (target);
};

export default initProfileFromMac;
