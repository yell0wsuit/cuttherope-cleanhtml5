class ActionData {
    actionName: string;
    actionParam: number;
    actionSubParam: number;
    /**
     * @param {string} name
     * @param {number} param
     * @param {number} subParam
     */
    constructor(name: string, param: number, subParam: number) {
        this.actionName = name;
        this.actionParam = param;
        this.actionSubParam = subParam;
    }
}

class Action {
    actionTarget: object;
    data: ActionData;
    actionName: string;
    actionParam: number;
    actionSubParam: number;
    /**
     * @param {Object} target
     * @param {ActionData} data
     */
    constructor(target: object, data: ActionData) {
        this.actionTarget = target;
        this.data = data;

        /**
         * @type {string}
         */
        this.actionName = "";

        /**
         * @type {number}
         */
        this.actionParam = 0;

        /**
         * @type {number}
         */
        this.actionSubParam = 0;
    }
    /**
     * @param {Object} target
     * @param {string} actionName
     * @param {number} param
     * @param {number} subParam
     */
    static create(target: object, actionName: string, param: number, subParam: number) {
        const data = new ActionData(actionName, param, subParam);
        return new Action(target, data);
    }
}

export default Action;
