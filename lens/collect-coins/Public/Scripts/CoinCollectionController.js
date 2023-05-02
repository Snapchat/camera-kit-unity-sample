//@input Component.Image backpackImage
//@input Component.Image coinImage
//@input Component.Camera sceneCamera
//@input Component.Camera uiCamera
//@input float hitCheckDistance

// -----JS CODE-----
var dragging = false
var overlapping = false
script.createEvent("UpdateEvent").bind(function() {
    if (dragging) {
        var targetScreenPos = script.uiCamera.worldSpaceToScreenSpace(script.backpackImage.getTransform().getWorldPosition());
        var objScreenPos = script.sceneCamera.worldSpaceToScreenSpace(script.coinImage.getTransform().getWorldPosition());
//        print("targetPos --> " + "x:" + targetScreenPos.x + ";y:" + targetScreenPos.y);
//        print("objScreenPos --> " + "x:" + objScreenPos.x + ";y:" + objScreenPos.y)
        var distance = targetScreenPos.distance(objScreenPos);
//        print("distance --> " + distance);   
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
//    script.dragHereText.enabled = true;
    dragging = true;
    
})

global.behaviorSystem.addCustomTriggerResponse("Grab_Lost", function(event){
    print("Grab Lost")
//    script.dragHereText.enabled = false;   
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
    }
})