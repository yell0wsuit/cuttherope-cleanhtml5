class ActionData {
    actionName: string;
    actionParam: number;
    actionSubParam: number;

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

    constructor(target: object, data: ActionData) {
        this.actionTarget = target;
        this.data = data;
        this.actionName = "";
        this.actionParam = 0;
        this.actionSubParam = 0;
    }

    static create(target: object, actionName: string, param: number, subParam: number) {
        const data = new ActionData(actionName, param, subParam);
        return new Action(target, data);
    }
}

export default Action;
