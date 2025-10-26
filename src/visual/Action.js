class ActionData {
    /**
     * @param {string} name
     * @param {number} param
     * @param {number} subParam
     */
    constructor(name, param, subParam) {
        this.actionName = name;
        this.actionParam = param;
        this.actionSubParam = subParam;
    }
}

class Action {
    /**
     * @param {import('@/visual/GameObject').default | import('@/visual/Animation').default} target
     * @param {ActionData} data
     */
    constructor(target, data) {
        this.actionTarget = target;
        this.data = data;
    }
    /**
     * @param {import("@/visual/GameObject").default | import("@/visual/Animation").default} target
     * @param {string} actionName
     * @param {number} param
     * @param {number} subParam
     */
    static create(target, actionName, param, subParam) {
        const data = new ActionData(actionName, param, subParam);
        return new Action(target, data);
    }
}

export default Action;
