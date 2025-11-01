/**
 * Tutorial elements can have a special id specified in the level xml
 * @const
 * @type {number}
 */
export const LEVEL1_ARROW_SPECIAL_ID: number = 2;

/**
 * @enum {number}
 */
export const RestartState = {
    FADE_IN: 0,
    FADE_OUT: 1,
};

/**
 * @enum {number}
 */
export const CameraMove = {
    TO_CANDY_PART: 0,
    TO_CANDY: 1,
};

/**
 * @enum {number}
 */
export const ButtonMode = {
    GRAVITY: 0,
    SPIKES: 1,
};

/**
 * @enum {number}
 */
export const PartsType = {
    SEPARATE: 0,
    DISTANCE: 1,
    NONE: 2,
};

/**
 * @const
 * @type {number}
 */
export const SCOMBO_TIMEOUT: number = 0.2;

/**
 * @const
 * @type {number}
 */
export const SCUT_SCORE: number = 10;

/**
 * @const
 * @type {number}
 */
export const MAX_LOST_CANDIES: number = 3;

/**
 * @const
 * @type {number}
 */
export const ROPE_CUT_AT_ONCE_TIMEOUT: number = 0.1;

// Candy Juggler: keep candy without ropes or bubbles for 30 secs
export const CANDY_JUGGLER_TIME = 30;

/**
 * @const
 * @type {number}
 */
export const BLINK_SKIP: number = 3;

/**
 * @const
 * @type {number}
 */
export const MOUTH_OPEN_TIME: number = 1;

/**
 * @const
 * @type {number}
 */
export const PUMP_TIMEOUT: number = 0.05;

/**
 * @const
 * @type {number}
 */
export const SOCK_SPEED_K: number = 0.9;

/**
 * @const
 * @type {number}
 */
export const SOCK_COLLISION_Y_OFFSET: number = 25;

/**
 * @enum {number}
 */
export const CandyBlink = {
    INITIAL: 0,
    STAR: 1,
};

/**
 * @enum {number}
 */
export const TutorialAnimation = {
    SHOW: 0,
    HIDE: 1,
};

/**
 * @enum {number}
 */
export const EarthAnimation = {
    NORMAL: 0,
    UPSIDE_DOWN: 1,
};

/**
 * Animations for Om-nom character
 * @enum {number}
 */
export const CharAnimation = {
    IDLE: 0,
    IDLE2: 1,
    IDLE3: 2,
    EXCITED: 3,
    PUZZLED: 4,
    FAIL: 5,
    WIN: 6,
    MOUTH_OPEN: 7,
    MOUTH_CLOSE: 8,
    CHEW: 9,
    GREETING: 10,
    GREETINGXMAS: 11,
    IDLEXMAS: 12,
    IDLE2XMAS: 13,
    IDLEPADDINGTON: 14,
};

/**
 * @const
 * @type {number}
 */
export const HUD_STARS_COUNT: number = 3;

/**
 * @const
 * @type {number}
 */
export const HUD_CANDIES_COUNT: number = 3;

/**
 * @const
 * @type {number}
 */
export const IMG_BGR_01_bgr: number = 0;
/**
 * @const
 * @type {number}
 */
export const IMG_BGR_01_P2_vert_transition: number = 0;
export const IMG_BGR_02_vert_transition = 1;

export const IMG_OBJ_CANDY_01_candy_bottom = 0;
export const IMG_OBJ_CANDY_01_candy_main = 1;
export const IMG_OBJ_CANDY_01_candy_top = 2;

export const IMG_OBJ_SPIDER_busted = 11;
export const IMG_OBJ_SPIDER_stealing = 12;

export const IMG_OBJ_CANDY_01_highlight_start = 8;
export const IMG_OBJ_CANDY_01_highlight_end = 17;
export const IMG_OBJ_CANDY_01_glow = 18;
export const IMG_OBJ_CANDY_01_part_1 = 19;
export const IMG_OBJ_CANDY_01_part_2 = 20;
export const IMG_OBJ_CANDY_01_part_fx_start = 21;
export const IMG_OBJ_CANDY_01_part_fx_end = 25;

export const IMG_OBJ_STAR_DISAPPEAR_Frame_1 = 0;
export const IMG_OBJ_STAR_DISAPPEAR_Frame_2 = 1;
export const IMG_OBJ_STAR_DISAPPEAR_Frame_3 = 2;
export const IMG_OBJ_STAR_DISAPPEAR_Frame_4 = 3;
export const IMG_OBJ_STAR_DISAPPEAR_Frame_5 = 4;
export const IMG_OBJ_STAR_DISAPPEAR_Frame_6 = 5;
export const IMG_OBJ_STAR_DISAPPEAR_Frame_7 = 6;
export const IMG_OBJ_STAR_DISAPPEAR_Frame_8 = 7;
export const IMG_OBJ_STAR_DISAPPEAR_Frame_9 = 8;
export const IMG_OBJ_STAR_DISAPPEAR_Frame_10 = 9;
export const IMG_OBJ_STAR_DISAPPEAR_Frame_11 = 10;
export const IMG_OBJ_STAR_DISAPPEAR_Frame_12 = 11;
export const IMG_OBJ_STAR_DISAPPEAR_Frame_13 = 12;

export const IMG_OBJ_BUBBLE_FLIGHT_Frame_1 = 0;
export const IMG_OBJ_BUBBLE_FLIGHT_Frame_2 = 1;
export const IMG_OBJ_BUBBLE_FLIGHT_Frame_3 = 2;
export const IMG_OBJ_BUBBLE_FLIGHT_Frame_4 = 3;
export const IMG_OBJ_BUBBLE_FLIGHT_Frame_5 = 4;
export const IMG_OBJ_BUBBLE_FLIGHT_Frame_6 = 5;
export const IMG_OBJ_BUBBLE_FLIGHT_Frame_7 = 6;
export const IMG_OBJ_BUBBLE_FLIGHT_Frame_8 = 7;
export const IMG_OBJ_BUBBLE_FLIGHT_Frame_9 = 8;
export const IMG_OBJ_BUBBLE_FLIGHT_Frame_10 = 9;
export const IMG_OBJ_BUBBLE_FLIGHT_Frame_11 = 10;
export const IMG_OBJ_BUBBLE_FLIGHT_Frame_12 = 11;
export const IMG_OBJ_BUBBLE_FLIGHT_Frame_13 = 12;
export const IMG_OBJ_BUBBLE_FLIGHT_Frame_14 = 13;

export const IMG_OBJ_BUBBLE_POP_Frame_1 = 0;
export const IMG_OBJ_BUBBLE_POP_Frame_2 = 1;
export const IMG_OBJ_BUBBLE_POP_Frame_3 = 2;
export const IMG_OBJ_BUBBLE_POP_Frame_4 = 3;
export const IMG_OBJ_BUBBLE_POP_Frame_5 = 4;
export const IMG_OBJ_BUBBLE_POP_Frame_6 = 5;
export const IMG_OBJ_BUBBLE_POP_Frame_7 = 6;
export const IMG_OBJ_BUBBLE_POP_Frame_8 = 7;
export const IMG_OBJ_BUBBLE_POP_Frame_9 = 8;
export const IMG_OBJ_BUBBLE_POP_Frame_10 = 9;
export const IMG_OBJ_BUBBLE_POP_Frame_11 = 10;
export const IMG_OBJ_BUBBLE_POP_Frame_12 = 11;

export const IMG_OBJ_BUBBLE_ATTACHED_bubble = 0;
export const IMG_OBJ_BUBBLE_ATTACHED_stain_01 = 1;
export const IMG_OBJ_BUBBLE_ATTACHED_stain_02 = 2;
export const IMG_OBJ_BUBBLE_ATTACHED_stain_03 = 3;

export const IMG_HUD_STAR_Frame_1 = 0;
export const IMG_HUD_STAR_Frame_2 = 1;
export const IMG_HUD_STAR_Frame_3 = 2;
export const IMG_HUD_STAR_Frame_4 = 3;
export const IMG_HUD_STAR_Frame_5 = 4;
export const IMG_HUD_STAR_Frame_6 = 5;
export const IMG_HUD_STAR_Frame_7 = 6;
export const IMG_HUD_STAR_Frame_8 = 7;
export const IMG_HUD_STAR_Frame_9 = 8;
export const IMG_HUD_STAR_Frame_10 = 9;
export const IMG_HUD_STAR_Frame_11 = 10;

export const IMG_CHAR_ANIMATIONS_idle_start = 0;
export const IMG_CHAR_ANIMATIONS_idle_end = 18;
export const IMG_CHAR_ANIMATIONS_mouth_open_start = 19;
export const IMG_CHAR_ANIMATIONS_mouth_open_end = 27;
export const IMG_CHAR_ANIMATIONS_mouth_close_start = 28;
export const IMG_CHAR_ANIMATIONS_mouth_close_end = 31;
export const IMG_CHAR_ANIMATIONS_chew_start = 32;
export const IMG_CHAR_ANIMATIONS_chew_end = 40;
export const IMG_CHAR_ANIMATIONS_blink_start = 41;
export const IMG_CHAR_ANIMATIONS_blink_end = 42;
export const IMG_CHAR_ANIMATIONS_idle2_start = 43;
export const IMG_CHAR_ANIMATIONS_idle2_end = 67;
export const IMG_CHAR_ANIMATIONS_idle3_start = 68;
export const IMG_CHAR_ANIMATIONS_idle3_end = 83;

export const IMG_CHAR_ANIMATIONS2_excited_start = 0;
export const IMG_CHAR_ANIMATIONS2_excited_end = 19;
export const IMG_CHAR_ANIMATIONS2_puzzled_start = 20;
export const IMG_CHAR_ANIMATIONS2_puzzled_end = 46;
export const IMG_CHAR_ANIMATIONS2_greeting_start = 47;
export const IMG_CHAR_ANIMATIONS2_greeting_end = 76;

export const IMG_CHAR_ANIMATIONS3_fail_start = 0;
export const IMG_CHAR_ANIMATIONS3_fail_end = 12;

export const IMG_CHAR_GREETINGS_XMAS_start = 0;
export const IMG_CHAR_GREETINGS_XMAS_end = 33;
export const IMG_CHAR_IDLE_XMAS_idle_start = 0;
export const IMG_CHAR_IDLE_XMAS_idle_end = 30;
export const IMG_CHAR_IDLE_XMAS_idle2_start = 31;
export const IMG_CHAR_IDLE_XMAS_idle2_end = 61;
export const IMG_CHAR_ANIMATION_PADDINGTON_start = 0;
export const IMG_CHAR_ANIMATION_PADDINGTON_end = 38;
export const IMG_CHAR_ANIMATION_PADDINGTON_hat = 39;
