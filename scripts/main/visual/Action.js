function ActionData(name, param, subParam) {
    this.actionName = name;
    this.actionParam = param;
    this.actionSubParam = subParam;
}

function Action(target, data) {
    this.actionTarget = target;
    this.data = data;
}

Action.create = function (target, actionName, param, subParam) {
    const data = new ActionData(actionName, param, subParam);
    return new Action(target, data);
};

export default Action;
