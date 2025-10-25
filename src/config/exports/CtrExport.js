const ctrExport = (key, value) => {
    // MUST use string literals for exported properties
    let zeptoLab = window["ZeptoLab"];
    if (zeptoLab == null) {
        zeptoLab = window["ZeptoLab"] = {};
    }

    let ctr = zeptoLab["ctr"];
    if (ctr == null) {
        ctr = zeptoLab["ctr"] = {};
    }
    ctr[key] = value;
};

export default ctrExport;
