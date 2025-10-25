/**
 * @enum {string}
 */
const BoxType = {
    NORMAL: "NORMAL",
    IEPINNED: "IEPINNED",
    MORECOMING: "MORECOMING",
    PURCHASE: "PURCHASE",
    TIME: "TIME",
    HOLIDAY: "HOLIDAY",
} as const;

export function isValidBoxType(key: string): key is keyof typeof BoxType {
    return key in BoxType;
}

export default BoxType;
