// Draggable.js
// Version: 0.2.0
// Event: Initialized
// Description: This script demonstrates how to implement a draggable body interface. It does so by
// performing a raycast on-touch to locate a body from screen position, then attaching
// a point constraint with kinematic target collider to move the body around.

// @input Component.Camera camera

//@input string physicsProbe = "Global" {"widget":"combobox", "values":[{"label":"Global", "value":"Global"}, {"label":"Root", "value":"Root"}, {"label":"World Component", "value":"World Component"}]}
//@input Physics.WorldComponent worldComponent {"showIf":"physicsProbe", "showIfValue":"World Component"}
//@input string rayCastType = "rayCast" { "values": [{"label": "rayCast", "value": "rayCast"}, {"label": "rayCastAll", "value": "rayCastAll"}], "widget": "combobox", "label": "RayCast Type"}

//@ui {"widget":"separator"}
//@input bool debugDrawEnabled = false

//@ui {"widget":"group_start","label":"Custom options"}
//@input string physicsFilterObjectsBy = "None" { "values": [{"label": "None (allow all)", "value": "None"}, {"label": "This object", "value": "This object"}, {"label": "Other object", "value": "Other object"}, {"label": "Other name", "value": "Other name"}], "widget": "combobox", "label": "Filter Objects By..."}

//@input Physics.ColliderComponent[] physicsAllowedObjects {"showIf": "physicsFilterObjectsBy", "showIfValue": "Other object", "label": "Allowed Objects"}
//@input string physicsNameMatchType = "Equals" {"showIf": "physicsFilterObjectsBy", "showIfValue": "Other name", "values": [{"value": "Equals", "label": "Equals"}, {"value": "Starts With", "label": "Starts With"}, {"value": "Regex", "label": "Regex"}], "widget": "combobox", "label": "Name Match Type"}
//@input string[] physicsAllowedNames {"showIf": "physicsFilterObjectsBy", "showIfValue": "Other name", "label": "Allowed Names"}

//@input bool includeStatic = false
//@input bool includeDynamic = true
//@input bool includeIntangible = false


//@ui {"widget":"group_end"}

var RayCastType = {
    rayCast:"rayCast",
    rayCastAll:"rayCastAll",
};

var PhysicsProbe = {
    Global:"Global",
    Root:"Root",
    World_Component:"World Component",
};
// Override the Snapchat app's default touch events
global.touchSystem.touchBlocking = true;

// Check required inputs
if (!script.camera) {
    print("Camera must be set!");
    return;
}

// Camera transform
var cameraTr = script.camera.getTransform();

// This SceneObject
var localSceneObject = script.getSceneObject();

// Physic Probe
var probe = setupProbe();

// Draggable constraint
var targetObj = setupDraggableConstraint();
// Draggable Collider Component
var targetColliderComponent = targetObj.createComponent("Physics.ColliderComponent");
// Mark the collider as intangible so it doesn't collide with the dragged body.
targetColliderComponent.intangible = true;

// Current drag state. These are used while a touch drag is active.
var dragBodyComponent = null;
var sourceConstraintComponent = null;
var dragDepth = 0.0;
var dragTouchId = -1;
var currentTouchPos = null;
var dragStatic = false;


// Provide function to get Draggable State
var draggingState = false;
script.api.isDragging = isDragging;
script.getIsDragging = isDragging;

function isDragging() {
    return draggingState;
}

function setupDraggableConstraint() {
    // Create a collider that we'll use as the target for the draggable constraint.
    var constraintObj = scene.createSceneObject("DragConstraintTarget");
    if (script.physicsProbe===PhysicsProbe.World_Component &&script.worldComponent) {
        constraintObj.setParent(script.worldComponent.getSceneObject());
    }
    return constraintObj;   
}

// The physics probe exposes the rayCast() function, as well as collision filter settings.
// We can create probes that raycast across all worlds, or a single world with:
// * Physics.createGlobalProbe(): Raycast across all worlds.
// * Physics.createRootProbe(): Raycast in just the implicit root world.
// * worldComponent.createProbe(): Raycast within the give world, from its component.
function setupProbe() {
    var physics_probe;  
    switch (script.physicsProbe) {
        case PhysicsProbe.World_Component:
            if (!script.worldComponent) {
                print("ERROR: World Component is not set");
                return; 
            }  
            physics_probe = script.worldComponent.createProbe();
            break;
        case PhysicsProbe.Root:
            physics_probe = Physics.createRootProbe();
            break;
        default:
            physics_probe = Physics.createGlobalProbe();
    }

    physics_probe.filter.includeStatic = script.includeStatic;
    physics_probe.filter.includeIntangible = script.includeIntangible; 
    physics_probe.filter.includeDynamic = script.includeDynamic;    
       
    physics_probe.debugDrawEnabled = script.debugDrawEnabled; // Show ray casts as debug lines and spheres.   
    return physics_probe;  
}

// Form a ray starting at the camera through the touch position into the world.
function getRayEnd(touchPos, rayStart, rayLen) {
    var rayDir;
    if (global.deviceInfoSystem.isSpectacles()) {
        rayDir = cameraTr.back;
    } else {
        var touchWorldPos = script.camera.screenSpaceToWorldSpace(touchPos, 0.0);
        rayDir = touchWorldPos.sub(rayStart).normalize();
    }
    return rayStart.add(rayDir.uniformScale(rayLen));
}

// On touch, cast a ray into the world to find a draggable body.
var touchStartEvent = script.createEvent("TouchStartEvent");
touchStartEvent.bind(function(e) {
    if (dragTouchId != -1) { // Ignore new touches while drag in progress.
        return;
    } 
    dragTouchId = e.getTouchId();
    var rayStart = cameraTr.getWorldPosition();

    currentTouchPos = e.getTouchPosition();

    var rayEnd = getRayEnd(currentTouchPos, rayStart, 10000.0);
    if (script.rayCastType === RayCastType.rayCast) {
        rayCast(rayStart,rayEnd);    
    } else {
        rayCastAll(rayStart,rayEnd);
    }   

});

function checkValidDraggableBody(hit) {
   
    var colliderObj = hit.collider.getSceneObject();
    var bodyComponent = colliderObj.getComponent("Physics.BodyComponent");
    if (isNull(bodyComponent)) {
        return false;
    }
    
    if (!filterDragObject(bodyComponent)) {
        return false;
    }
    return true; 
}

function setDraggableBody(hit) {
    var colliderObj = hit.collider.getSceneObject();
    var bodyComponent = colliderObj.getComponent("Physics.BodyComponent");

    if (probe.filter.includeStatic && !bodyComponent.dynamic) {
        bodyComponent.dynamic = true;
        dragStatic = true;
    }

    draggingState = true;
    // Start the drag, using the initial distance as camera depth.
    dragBodyComponent = bodyComponent;
    dragDepth = hit.distance;
    
    // Move the target collider to the hit position.
    targetObj.getTransform().setWorldPosition(hit.position);
    
    // The target motion will effectively apply an impulse to the constraint, so clear it to
    // prevent this from affecting the grabbed body.
    // Alternatively, we could create the target at the start of each drag, but this is simpler.
    targetColliderComponent.clearMotion();
    
    // Attach a point constraint between the source and target.
    sourceConstraintComponent = dragBodyComponent.addPointConstraint(targetColliderComponent, hit.position); 

}

function rayCast(rayStart,rayEnd) {
    probe.rayCast(rayStart, rayEnd, function(hit) {
        if (hit == null) { // Indicates a miss.
            return;
        } 
        if (checkValidDraggableBody(hit)) {
            setDraggableBody(hit);
        }      
    });   
}

function rayCastAll(rayStart,rayEnd) {
    probe.rayCastAll(rayStart, rayEnd, function(hits) {
        if (hits.length==0) {
            return;
        }

        for (var i = 0; i<hits.length;i++) {
            var hit = hits[i];
            if (hit !== null && checkValidDraggableBody(hit)) { 
                setDraggableBody(hit);                          
                return;
            }
        }
    });    
}


function filterDragObject(collider) {
    switch (script.physicsFilterObjectsBy) {
        case "None":
        default:
            return true;
        
        case "This object":
            return collider.getSceneObject().isSame(localSceneObject);

        case "Other object":
            for (var i = 0; i < script.physicsAllowedObjects.length; i++) {
                if (collider.isSame(script.physicsAllowedObjects[i])) {
                    return true;
                }
            }
            return false;

        case "Other name":
            var nameMatchFunc;
            switch (script.physicsNameMatchType) {
                case "Equals":
                default:
                    nameMatchFunc = function(objName, targName) {
                        return objName == targName;
                    };
                    break;
                case "Starts With":
                    nameMatchFunc = function(objName, targName) {
                        return objName.startsWith(targName);
                    };
                    break;
                case "Regex":
                    nameMatchFunc = function(objName, targName) {
                        return !!objName.match(new RegExp(targName));
                    };
                    break;
            }

            var otherName = collider.getSceneObject().name;
            for (var j = 0; j < script.physicsAllowedNames.length; j++) {
                if (nameMatchFunc(otherName, script.physicsAllowedNames[j])) {
                    return true;
                }
            }

    }
}


// During update or while touch moving, update using last touch position if currently dragging
function onUpdate() {
    if (!isNull(dragBodyComponent) && !isNull(currentTouchPos)) {
        var rayStart = cameraTr.getWorldPosition();
        var rayEnd = getRayEnd(currentTouchPos, rayStart, dragDepth);
        targetObj.getTransform().setWorldPosition(rayEnd);    
    }
}

// While dragging, move the target collider to match the touch position.
var touchMoveEvent = script.createEvent("TouchMoveEvent");
touchMoveEvent.bind(function(e) {
    if (!dragBodyComponent) {
        draggingState = false;
        return;
    }
    if (e.getTouchId() != dragTouchId) {
        return;
    }
    currentTouchPos = e.getTouchPosition();
    onUpdate();
});

// On release, remove the constraint.
var touchEndEvent = script.createEvent("TouchEndEvent");
touchEndEvent.bind(function(e) {
    if (e.getTouchId() != dragTouchId) {
        return;
    }
    dragTouchId = -1;
    currentTouchPos = null;
    if (!dragBodyComponent) {
        return;
    }
    draggingState = false;
    
    if (!isNull(dragBodyComponent) && !isNull(sourceConstraintComponent)) {
        dragBodyComponent.removeConstraint(sourceConstraintComponent);
    }
    if (dragStatic) {
        dragBodyComponent.dynamic = false; 
        dragStatic = false;
    }
    
    dragBodyComponent = null;
    sourceConstraintComponent = null;
});

script.createEvent("UpdateEvent").bind(onUpdate);
