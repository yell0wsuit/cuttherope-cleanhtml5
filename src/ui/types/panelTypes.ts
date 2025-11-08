import type PanelId from "@/ui/PanelId";
import type Panel from "@/ui/Panel";

/**
 * Type representing any valid panel ID from the PanelId enum
 */
export type PanelIdType = (typeof PanelId)[keyof typeof PanelId];

/**
 * Panel with lifecycle hooks for initialization and visibility changes
 */
export interface PanelWithLifecycle extends Panel {
    /** Called once during panel initialization */
    init?: (manager: unknown) => void;
    /** Called when panel becomes visible */
    onShow?: () => void;
    /** Called when panel is hidden */
    onHide?: () => void;
    /** Called to slide to the next box (box panel specific) */
    slideToNextBox?: () => void;
    /** Called to animate the current box (box panel specific) */
    bounceCurrentBox?: () => void;
}
