export class ActionData {
    readonly actionName: string;
    readonly actionParam: number;
    readonly actionSubParam: number;

    constructor(name: string, param: number, subParam: number) {
        this.actionName = name;
        this.actionParam = param;
        this.actionSubParam = subParam;
    }
}

class Action<TTarget extends object = object> {
    readonly actionTarget: TTarget;
    readonly data: ActionData;
    actionName: string;
    actionParam: number;
    actionSubParam: number;

    constructor(target: TTarget, data: ActionData) {
        this.actionTarget = target;
        this.data = data;
        this.actionName = "";
        this.actionParam = 0;
        this.actionSubParam = 0;
    }

    static create<TTarget extends object>(
        target: TTarget,
        actionName: string,
        param: number,
        subParam: number
    ): Action<TTarget> {
        const data = new ActionData(actionName, param, subParam);
        return new Action(target, data);
    }
}

export default Action;
