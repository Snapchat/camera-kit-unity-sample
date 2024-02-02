// WorldObjectController.js
// Version: 0.1.0
// Event: Lens Initialized
// Description: Controls the touch, hiding, and showing functionality of the movable character

//@input Asset.Material touchCollisionMaterial
//@input Component.RenderMeshVisual groundGrid
//@input Component.WorldTracking worldTrackingComponent {"label":"Device Tracking"}

// Set up the color we want for the ground grid
var onSelectingColor = new vec3(1, 1, 1);
var onFocusingColor = new vec3(0.35, 0.35, 0.35);
var onNotInteractingColor = new vec3(0, 0, 0);
var groundGridFadeSpeed = .2;

var interactionComponent;
var originalPosition;

function initialize() {
    // Getting the original position of the object so when tracking get reset it goes back to the original position
    originalPosition = script.getSceneObject().getTransform().getLocalPosition();

    // If an object with a touch component is defined then this will allow the user to double tap through them to 
    // perform a camera swap from back to front cam
    if (script.getSceneObject().getComponentCount("Component.InteractionComponent") > 0) {
        interactionComponent = script.getSceneObject().getComponent("Component.InteractionComponent");
        interactionComponent.addTouchBlockingException("TouchTypeDoubleTap");
    }
    
    // Hides the touchCollision object when lens is running by setting the alpha on its material to 0
    if (script.touchCollisionMaterial) {
        script.touchCollisionMaterial.mainPass.baseColor = new vec4(1,1,1,0);
    }
    
    if (script.groundGrid) {
        var clonedMaterial = script.groundGrid.mainMaterial.clone();
        script.groundGrid.clearMaterials();
        script.groundGrid.addMaterial(clonedMaterial);
    }
    
    // bind events
    script.createEvent("WorldTrackingResetEvent").bind(onSurfaceReset);
    script.createEvent("CameraFrontEvent").bind(onFrontCamEvent);
    script.createEvent("CameraBackEvent").bind(onBackCamEvent);
    script.createEvent("UpdateEvent").bind(onUpdateEvent);

    setTrackingTarget();
}

// Events
function onSurfaceReset(eventData) {
    script.getSceneObject().getTransform().setLocalPosition(originalPosition);
    setTrackingTarget();
}

function onFrontCamEvent(eventData) {
    setEnabledAllChildren(false);    
}

function onBackCamEvent(eventData) {
    setEnabledAllChildren(true);
}

function onUpdateEvent(eventData) {
    manageGroundGrid();
}

// Helpers
function setEnabledAllChildren(enabledStatus) {
    for (var i = 0; i < script.getSceneObject().getChildrenCount(); i++) {
        var childObject = script.getSceneObject().getChild(i);
        if (childObject) {
            childObject.enabled = enabledStatus;                   
        }
    }
}

function setTrackingTarget() {
    if (script.worldTrackingComponent) {
        script.worldTrackingComponent.surfaceTrackingTarget = script.getSceneObject();
    } else {
        print("WorldObjectController: This helper makes its children visible only on rear camera and provides UI for a movable surface object. Make sure to have a Device Tracking component on your Camera object to enable surface tracking, and assign it to the \"Device Tracking\" property field in this object.");
    }
}

function manageGroundGrid() {
    if (!script.groundGrid || !interactionComponent) {
        return;
    }
   
    // Update Alpha for the ground grid material
    var curColor = script.groundGrid.mainPass.baseColor;

    // Set color grid depending on state of interaction
    var isSelected = interactionComponent.isSelected;
    var isFocused = interactionComponent.isFocused;   
    var targetColor = isSelected ? onSelectingColor : isFocused ? onFocusingColor : onNotInteractingColor;
    var lerpedColor = vec3.lerp(curColor, targetColor, groundGridFadeSpeed);
    
    // Set the color based on current interaction state
    script.groundGrid.mainPass.baseColor = lerpedColor;

    // This controls hiding the grid if the user is recording on their device within Snapchat
    script.groundGrid.enabled = !global.scene.isRecording();
}


initialize();