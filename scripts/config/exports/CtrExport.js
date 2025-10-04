define("config/exports/CtrExport", [], function () {
  function ctrExport(key, value) {
    // MUST use string literals for exported properties
    var zeptoLab = window["ZeptoLab"];
    if (zeptoLab == null) {
      zeptoLab = window["ZeptoLab"] = {};
    }

    var ctr = zeptoLab["ctr"];
    if (ctr == null) {
      ctr = zeptoLab["ctr"] = {};
    }
    ctr[key] = value;
  }

  return ctrExport;
});
