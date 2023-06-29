// GetJointDistanceHelperManager.js
// Version: 0.0.1
// Event: Lens Initialized
// Description: To be used with HandTrackingController.js and GetJointDistanceHelper.js
// This script gets distance between joints or joints and objects and sends out triggers if it is within a certain range

//@input bool useContainer
//@input SceneObject scriptContainer {"showIf":"useContainer","showIfValue":"true"}
//@input Component.ScriptComponent[] jointDistanceScripts {"showIf":"useContainer","showIfValue":"false"}
//@ui {"widget":"separator"}
//@input bool overwriteVisual
//@input bool showVisualizer {"showIf":"overwriteVisual"}
//@ui {"widget":"separator"}
//@input bool setTextColor 
//@input vec4 defaultColor {"widget":"color","showIf":"setTextColor"}
//@input vec4 passColor {"widget":"color","showIf":"setTextColor"}
//@ui {"widget":"separator"}
//@input bool sendTriggers
//@input string gestureDetectedTrigger{"showIf":"sendTriggers","label":"Gesture Detected"}
//@input string gestureLostTrigger {"showIf":"sendTriggers","label":"Gesture Lost"}
//@ui {"widget":"separator"}
//@input bool logMessage


var distanceScripts = [];
var gestureMade = false;

var detectedTimer = 0;
var detectedGestureTriggered = false;

var lostTimer = 0;
var lostGestureTriggered = false;

var triggerTimerMax = 0.2;

var scriptsApiCalled = false;

function initialize() {
    
    if (script.useContainer) {
        for (var i=0; i<script.scriptContainer.getChildrenCount(); i++) {
            if (script.scriptContainer.getChild(i).getComponent("Component.ScriptComponent")) {
                distanceScripts.push(script.scriptContainer.getChild(i).getComponent("Component.ScriptComponent"));
            }
        }
    } else {
        distanceScripts = script.jointDistanceScripts;
    }

    script.createEvent("UpdateEvent").bind(onUpdate);
}
initialize();

function onUpdate() {
    
    if (!scriptsApiCalled) {
        for (var i=0; i<distanceScripts.length; i ++) {
            if (distanceScripts[i].api) {
                if (script.overwriteVisual) {
                    distanceScripts[i].api.overwriteVisualizer(script.showVisualizer, script.defaultColor);
                }

                if (script.setTextColor) {
                    distanceScripts[i].api.setTextColor(script.passColor, script.defaultColor);
                }
                
                scriptsApiCalled = true;
            }
            
        }
    }
    
    
    gestureMade = checkIfAllWithinRange();    
    
    if (gestureMade) {
        lostTimer = 0;
        
        if (!detectedGestureTriggered) {
            if (detectedTimer < triggerTimerMax) {
                detectedTimer += getDeltaTime();
            } else {
                triggerGesture(true);
                detectedTimer = 0;
                detectedGestureTriggered = true;
                lostGestureTriggered = false;
            }
        }
        
    } else {
        detectedTimer = 0;
        if (!lostGestureTriggered && detectedGestureTriggered) {
            if (lostTimer < triggerTimerMax) {
                lostTimer += getDeltaTime();
            } else {
                triggerGesture(false);
                lostTimer = 0;
                lostGestureTriggered = true;
                detectedGestureTriggered = false;
            }
        }
    }

}

function triggerGesture(isStarting) {
    var triggerName = isStarting ? script.gestureDetectedTrigger : script.gestureLostTrigger;
    global.behaviorSystem.sendCustomTrigger(triggerName);
    if (script.logMessage) {
        print(" Triggering Gesture " + script.getSceneObject() + " : " + triggerName);
    }
}

function checkIfAllWithinRange() {
    var isInRange = true;    
    for (var i=0; i<distanceScripts.length; i ++) {
        if (!distanceScripts[i].api.isWithinRange()) {
            isInRange = false;
            break;
        }
    }
    
    return isInRange;
}