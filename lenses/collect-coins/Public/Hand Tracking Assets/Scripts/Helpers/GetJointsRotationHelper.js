//@input string[] jointNames

var localRot = 0;
var worldRot = 0;

function initialize() {
    if (!global.rightHand || global.leftHand) {
        print("Warning! Make sure scene has Tracking Manager (HandTrackingController and GlobalTrackingHelper) enabled!");
        return;
    }
    script.createEvent("UpdateEvent").bind(onUpdate);
}
initialize();

function onUpdate() {
    if (!global.getActiveHandController()) {
        return;
    }

    worldRot = global.getJointsAverageWorldRotation(script.jointNames).getAngle();
    localRot = global.getJointsAverageLocalRotation(script.jointNames);
}

script.api.getWorldRotation = function() {
    return worldRot;
};

script.api.getLocalRotation = function() {
    return localRot;
};