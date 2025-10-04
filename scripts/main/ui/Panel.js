define("ui/Panel", [], function () {
    function Panel(id, paneldivid, bgdivid, showshadow) {
        this.id = id;
        this.panelDivId = paneldivid;
        this.bgDivId = bgdivid;
        this.showShadow = showshadow;
    }

    return Panel;
});
