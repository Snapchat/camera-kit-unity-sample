//@input Component.Image backpackImage
//@input Component.Image coinImage
//@input Component.Camera sceneCamera
//@input Component.Camera uiCamera
//@input float hitCheckDistance
// @input Asset.RemoteServiceModule remoteServiceModule

// Import module
const Module = require("./Camera Kit Unity Bridge API Module");
const UnityApi = new Module.ApiModule(script.remoteServiceModule);

// -----JS CODE-----
var dragging = false
var overlapping = false

function sendEventToUnity(eventName, eventValue) {
    var dataToSend = {
        "eventName" : eventName,
        "eventValue" : eventValue
    };
    UnityApi.unity_send_data(JSON.stringify(dataToSend), function(err, r){
        print("Data sent to Unity");
        print("Error? " + err);
        print("Result? " + r);
    })
}

function handDetected(handName) {
    //print("Hand detected: "+ handName);
    sendEventToUnity("handDetected", handName);
}

function handLost(handName) {
    //print("Hand lost: "+ handName);
    sendEventToUnity("handLost", handName);
}

script.createEvent("UpdateEvent").bind(function() {
    if (dragging) {
        var targetScreenPos = script.uiCamera.worldSpaceToScreenSpace(script.backpackImage.getTransform().getWorldPosition());
        var objScreenPos = script.sceneCamera.worldSpaceToScreenSpace(script.coinImage.getTransform().getWorldPosition());
        var distance = targetScreenPos.distance(objScreenPos);
        if (distance < script.hitCheckDistance) {
            script.backpackImage.getTransform().setLocalScale(new vec3(1.2, 1.2, 1.2));
            overlapping = true
        } else {
            script.backpackImage.getTransform().setLocalScale(new vec3(1, 1, 1));
            overlapping = false
        } 
    }
});

global.behaviorSystem.addCustomTriggerResponse("Grab_Detected", function(event){
    print("Grab Detected");
    dragging = true;
    sendEventToUnity("grabDetected");
    
})

global.behaviorSystem.addCustomTriggerResponse("Grab_Lost", function(event){
    print("Grab Lost")
    dragging = false;
    script.backpackImage.getTransform().setLocalScale(new vec3(1, 1, 1));
    if (overlapping) {
        print("coin deposited")
        overlapping = false
        script.coinImage.mainPass.colorMask = new vec4b(false,false,false,false);
        var restoreCoinVisibility = script.createEvent("DelayedCallbackEvent");
        restoreCoinVisibility.bind(function(){
            script.coinImage.mainPass.colorMask = new vec4b(true,true,true,true);            
        });
        restoreCoinVisibility.reset(2);
        
        sendEventToUnity("coinDeposited");
       
    }
})

global.behaviorSystem.addCustomTriggerResponse("RightHandTracking_DETECTED", function(event) {
    handDetected("right");
});

global.behaviorSystem.addCustomTriggerResponse("LeftHandTracking_DETECTED", function(event) {
    handDetected("left");
});

global.behaviorSystem.addCustomTriggerResponse("RightHandTracking_LOST", function(event) {
    handLost("right");
});

global.behaviorSystem.addCustomTriggerResponse("LeftHandTracking_LOST", function(event) {
    handLost("left");
});