// SlowMotionSetting.js
// Version: 0.1.0
// Event: Initialized
// Description: Enable/Disable root slow motion setting.
//@input Physics.WorldComponent worldComponent
//@input float slowStep {"widget":"slider", "min":0, "max":10, "step":0.1}
//@input float slowTime {"widget":"slider", "min":0, "max":10, "step":0.11}
var disableSlowMotionStep = 1.0;
var disableSlowMotionTime = 1.0;
var worldSettings = script.worldComponent.worldSettings;
script.api.enableSlowMotion = enableSlowMotion;
script.api.disableSlowMotion = disableSlowMotion;

function enableSlowMotion() {
    worldSettings.slowDownStep = script.slowStep;
    worldSettings.slowDownTime = script.slowTime; 
}

function disableSlowMotion() {
    worldSettings.slowDownStep = disableSlowMotionStep;
    worldSettings.slowDownTime = disableSlowMotionTime; 
}
