const ctrExport = (key: string, value: any): void => {
    // MUST use string literals for exported properties
    let zeptoLab = (window as any)["ZeptoLab"];
    if (zeptoLab == null) {
        zeptoLab = (window as any)["ZeptoLab"] = {};
    }

    let ctr = zeptoLab["ctr"];
    if (ctr == null) {
        ctr = zeptoLab["ctr"] = {};
    }
    ctr[key] = value;
};

export default ctrExport;
