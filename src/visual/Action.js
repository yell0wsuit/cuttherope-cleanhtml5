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
     * @param {GameObject | Animation} target
     * @param {ActionData} data
     */
    constructor(target, data) {
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
     * @param {GameObject | Animation} target
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
