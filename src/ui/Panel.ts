class Panel {
    id: number;
    panelDivId: string | null;
    bgDivId: string | null;
    showShadow: boolean;

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
