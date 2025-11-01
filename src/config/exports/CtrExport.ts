// Extend the Window interface to include ZeptoLab
declare global {
    interface Window {
        ZeptoLab?: {
            ctr?: Record<string, boolean>;
        };
    }
}

const ctrExport = (key: string, value: boolean) => {
    // MUST use string literals for exported properties
    let zeptoLab = window.ZeptoLab;
    if (zeptoLab == null) {
        zeptoLab = window.ZeptoLab = {};
    }

    let ctr = zeptoLab.ctr;
    if (ctr == null) {
        ctr = zeptoLab.ctr = {};
    }
    ctr[key] = value;
};

export default ctrExport;
