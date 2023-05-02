//@input string[] jointNames

var pos = new vec3(0,0,0);

function initialize() {
    script.createEvent("UpdateEvent").bind(onUpdate);
}
initialize();

function onUpdate() {
    if (!global.getActiveHandController()) {
        return;
    }

    pos = global.getJointsAveragePosition(script.jointNames);
}

script.api.getPosition = function() {
    return pos;
};