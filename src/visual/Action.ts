class ActionData {
    constructor(name, param, subParam) {
        this.actionName = name;
        this.actionParam = param;
        this.actionSubParam = subParam;
    }
}

class Action {
    constructor(target, data) {
        this.actionTarget = target;
        this.data = data;
    }
    static create(target, actionName, param, subParam) {
        const data = new ActionData(actionName, param, subParam);
        return new Action(target, data);
    }
}

export default Action;
