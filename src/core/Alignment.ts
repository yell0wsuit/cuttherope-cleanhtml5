enum Alignment {
    UNDEFINED = 0,
    LEFT = 1,
    HCENTER = 2,
    RIGHT = 4,
    TOP = 8,
    VCENTER = 16,
    BOTTOM = 32,
    CENTER = 18, // 2 | 16
}

namespace Alignment {
    export function parse(s: string): Alignment {
        let a = Alignment.UNDEFINED;

        if (s.includes("LEFT")) a = Alignment.LEFT;
        else if (s.includes("HCENTER") || s === "CENTER") a = Alignment.HCENTER;
        else if (s.includes("RIGHT")) a = Alignment.RIGHT;

        if (s.includes("TOP")) a |= Alignment.TOP;
        else if (s.includes("VCENTER") || s === "CENTER") a |= Alignment.VCENTER;
        else if (s.includes("BOTTOM")) a |= Alignment.BOTTOM;

        return a;
    }
}

export default Alignment;
