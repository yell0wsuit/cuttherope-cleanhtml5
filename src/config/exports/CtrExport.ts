interface ZeptoLabWindow extends Window {
    ZeptoLab?: {
        ctr?: Record<string, unknown>;
    };
}

declare const window: ZeptoLabWindow;

const ctrExport = (key: string, value: unknown): void => {
    // MUST use string literals for exported properties
    if (!window.ZeptoLab) {
        window.ZeptoLab = {};
    }

    if (!window.ZeptoLab.ctr) {
        window.ZeptoLab.ctr = {};
    }

    window.ZeptoLab.ctr[key] = value;
};

export default ctrExport;
