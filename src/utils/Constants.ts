const Constants = {
    MAX_TOUCHES: 2,
    DIM_TIMEOUT: 0.15,
    UNDEFINED: -1,
    FLOAT_PRECISION: 0.000001,
    TIME_SCALE: 1,
    PIXEL_TO_SI_METERS_K: 80,
    AIR_RESISTANCE: 0.15,
    MAX_FORCES: 10,
    CANDY2_FLAG: -2,
    INT_MAX: 0x7fffffff,
} as const;

export type ConstantKey = keyof typeof Constants;
export type ConstantValue = (typeof Constants)[ConstantKey];

export default Constants;
