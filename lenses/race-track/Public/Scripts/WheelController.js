// WheelController.js
// Version: 0.1.0
// Event: Initialized
// Description: Apply torque to the wheels when touching the screen
// without dragging any objects

//@input Physics.BodyComponent[] wheelBodys
//@input float force
//@input  Component.ScriptComponent draggable

var isTouch = false;
// Prints the touch position when a screen touch has started
var touchStartEvent = script.createEvent("TouchStartEvent");
touchStartEvent.bind(function(eventData) {
    isTouch = true;
});

// Prints "touch ended" when the touch input ends
var touchEndEvent = script.createEvent("TouchEndEvent");
touchEndEvent.bind(function(eventData) {
    isTouch = false;
});

// Handle Unity updates
global.behaviorSystem.addCustomTriggerResponse("Unity_ButtonDown", function() {
    print("Handling unity event: Button down")
    isTouch = true;
});

global.behaviorSystem.addCustomTriggerResponse("Unity_ButtonUp", function() {
    print("Handling unity event: Button up")
    isTouch = false;
});


var event = script.createEvent("UpdateEvent");
event.bind(function(eventData) {
    if (!isTouch) {
        return;
    }
 
    if (script.draggable.api.isDragging && script.draggable.api.isDragging()) {      
        return;
    }
    AddTorque();
});

function AddTorque() {   
    for (var i = 0; i<script.wheelBodys.length; i++) {
        script.wheelBodys[i].addRelativeTorque(new vec3(0.0, 0.0, script.force), Physics.ForceMode.Acceleration);
    }
}