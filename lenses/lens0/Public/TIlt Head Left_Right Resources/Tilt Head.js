//@input Component.Head head 
//@input float angle {"widget" : "slider", "min" : 0, "max" : 90, "step" : 0.1}

//@ui {"widget": "separator"}
//@input bool useBehavior
//@input string onLeftTrigger = "ON_LEFT" {"showIf" : "useBehavior"}
//@input string onRightTrigger = "ON_RIGHT"  {"showIf" : "useBehavior"}
//@input string onResetTrigger = "ON_RESET"  {"showIf" : "useBehavior"}
//@ui {"widget":"separator"}
//@input bool callApiFunc
//@input Component.ScriptComponent scriptWithApi  {"showIf" : "callApiFunc"}
//@input string onLeftFunction = "onLeft" {"showIf" : "callApiFunc"}
//@input string onRightFunction = "onRight"  {"showIf" : "callApiFunc"}
//@input string onResetFunction = "onReset"  {"showIf" : "callApiFunc"}

if (!script.head) {
    print("Warning, please set head input. You can add Head Binding to teh scene by clicking on the + Button in the Objects panel");
}
script.threshold = Math.abs(Math.sin(script.angle / 180 * Math.PI))

var headTransform = script.head.getSceneObject().getTransform();
const eps = 0.1;
var State = { "NONE": 0, "LEFT": 1, "RIGHT": 2 };
var currentState = State.None;
var x;

script.createEvent("UpdateEvent").bind(onUpdate);

function onUpdate() {
    if (script.head.getFacesCount() > 0) {
        x = headTransform.up.x;
        if (Math.abs(x) < eps) {
            if (currentState != State.NONE) {
                currentState = State.NONE;
                onReset();
            }
        } else if (x < -script.threshold) {
            if (currentState != State.LEFT) {
                currentState = State.LEFT;
                onLeft();
            }
        } else if (x > script.threshold) {
            if (currentState != State.RIGHT) {
                currentState = State.RIGHT;
                onRight();
            }
        }
    } else {
        if (currentState != State.NONE) {
            currentState = State.NONE;
            onReset();
        }
    }
}

function onLeft() {
    if (script.callApiFunc && script.scriptWithApi && script.onLeftFunction && script.scriptWithApi.api[script.onLeftFunction]) {
        script.scriptWithApi.api[script.onLeftFunction]();
    }
    if (script.useBehavior && global.behaviorSystem && script.onLeftTrigger) {
        global.behaviorSystem.sendCustomTrigger(script.onLeftTrigger);
    }
}

function onRight() {
    if (script.callApiFunc && script.scriptWithApi && script.onRightFunction && script.scriptWithApi.api[script.onRightFunction]) {
        script.scriptWithApi.api[script.onRightFunction]();
    }
    if (script.useBehavior &&global.behaviorSystem && script.onRightTrigger) {
        global.behaviorSystem.sendCustomTrigger(script.onRightTrigger);
    }
}

function onReset() {
    if (script.callApiFunc && script.scriptWithApi && script.onResetFunction && script.scriptWithApi.api[script.onResetFunction]) {
        script.scriptWithApi.api[script.onResetFunction]();
    }
    if (script.useBehavior &&global.behaviorSystem && script.onResetTrigger) {
        global.behaviorSystem.sendCustomTrigger(script.onResetTrigger);
    }
}