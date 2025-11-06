/**
 * Shared UI type definitions to break circular dependencies
 */

/** Interface for components that can be redrawn */
export interface Redrawable {
  redraw(): void;
}

/** Interface for dialog-like components */
export interface DialogController {
  showPopup(contentId: string): Promise<void>;
  closePopup(): Promise<void>;
}

/**
 * Static registry for accessing UI singletons without direct imports.
 * This breaks circular dependencies between BoxManager, BoxPanel, and Dialogs.
 */
export class UIRegistry {
  private static _boxPanel: Redrawable | null = null;
  private static _dialogs: DialogController | null = null;

  static registerBoxPanel(panel: Redrawable): void {
    UIRegistry._boxPanel = panel;
  }

  static getBoxPanel(): Redrawable | null {
    return UIRegistry._boxPanel;
  }

  static registerDialogs(dialogs: DialogController): void {
    UIRegistry._dialogs = dialogs;
  }

  static getDialogs(): DialogController | null {
    return UIRegistry._dialogs;
  }
}