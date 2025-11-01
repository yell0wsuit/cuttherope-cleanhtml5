class Panel {
    init: (interfaceManager: any) => void;
    onShow: () => void;
    id: number;
    panelDivId: string | null;
    bgDivId: string | null;
    showShadow: boolean;
    /**
     * @param {number} id
     * @param {string | null} paneldivid
     * @param {string | null} bgdivid
     * @param {boolean} showshadow
     */
    constructor(
        id: number,
        paneldivid: string | null,
        bgdivid: string | null,
        showshadow: boolean
    ) {
        this.id = id;
        this.panelDivId = paneldivid;
        this.bgDivId = bgdivid;
        this.showShadow = showshadow;
    }
}

export default Panel;
