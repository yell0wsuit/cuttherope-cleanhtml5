class Panel {
    /**
     * @param {number} id
     * @param {string | null} paneldivid
     * @param {string | null} bgdivid
     * @param {boolean} showshadow
     */
    constructor(id, paneldivid, bgdivid, showshadow) {
        this.id = id;
        this.panelDivId = paneldivid;
        this.bgDivId = bgdivid;
        this.showShadow = showshadow;
    }
}

export default Panel;
