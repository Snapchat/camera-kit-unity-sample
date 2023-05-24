// SetFollowHandHelper.js
// Version: 0.0.1
// Event: Lens Initialized
// Description: Set object to follow median points of certain joints from 3d hand

//@input int handType = 0 {"widget":"combobox","values":[{"value":"0","label":"Any"},{"value":"1","label":"Left"},{"value":"2","label":"Right"}]}
//@input int followType = 0 {"widget":"combobox","values":[{"value":"0","label":"Position"},{"value":"1","label":"Rotation"},{"value":"2","label":"Position & Rotation"}]}
//@ui{"widget":"separator"}
//@input SceneObject followObject
//@input string[] positionJointNames {"label":"Position Joints Median"}
//@input string[] rotationJointNames {"label":"Rotation Joints Median"}
//@input float positionSmooth = 0.2 {"widget":"slider","min":"0.00","max":"1.00","step":"0.01"}
//@input float rotationSmooth = 0.2 {"widget":"slider","min":"0.00","max":"1.00","step":"0.01"}

//@ui{"widget":"separator"}
//@input bool logMessage

//@ui{"widget":"separator"}
//@input bool advanced
//@ui{"widget":"separator","showIf":"advanced"}
//@input bool resetRotation {"showIf":"advanced"}
//@input bool resetPosition {"showIf":"advanced"}

//@ui{"widget":"separator","showIf":"advanced"}
//@input int followCondition = 0 {"showIf":"advanced","widget":"combobox","values":[{"value":"0","label":"Always"},{"value":"1","label":"On Triggers"},{"value":"2","label":"Check Distance"}, {"value":"3","label":"Distance & Trigger"}]}

//@ui{"widget":"separator","showIf":"advanced"}
//@input float distanceThreshold = 10  {"showIf":"advanced"}
//@input bool ignoreDepth {"showIf":"advanced"}
//@ui {"label":"If IgnoreDepth is checked,","showIf":"ignoreDepth"}
//@ui {"label":"Distance will be compared with ScreenSpace instead.","showIf":"ignoreDepth"}
//@input Component.Camera sceneCamera {"showIf":"ignoreDepth"}

//@input string[] startFollowTriggers {"showIf":"advanced"}
//@input string[] endFollowTriggers {"showIf":"advanced"}

var followObject;

var startAction = false;
var startFollowTriggered = false;

var setPosition = (script.followType == 0 || script.followType == 2);
var setRotation = (script.followType == 1 || script.followType == 2);

var targetPos, objPos;
var targetRot, objRot;
var getJointsAveragePosition, getJointsAverageRotation;
var handController;
var proxyObject, originPosProxy, followObjectParent;

var originPos, originRot;

//Give it some time for hand tracking to stablize in scene if not using triggers
const startFollowDelay = 0.3;
var startFollowDelayTimer = 0;

var averageJointPos;

function initialize() {
    
    followObject = script.followObject;
    if (!followObject) {
        followObject = script.getSceneObject();
    }

    followObjectParent = followObject.getParent();

    originPos = followObject.getTransform().getWorldPosition();
    originRot = followObject.getTransform().getWorldRotation();

    //create a proxy object to remember local pos and rotation
    originPosProxy = global.scene.createSceneObject("Local Proxy");
    originPosProxy.setParent(followObjectParent);
    originPosProxy.getTransform().setWorldPosition(originPos);
    originPosProxy.getTransform().setWorldRotation(originRot);
    
    //create a proxy object as container of the follow object, mostly to better calculcate quaternion rotation
    proxyObject = global.scene.createSceneObject("ProxyObject");


    switch (script.handType) {
        case 1:
            handController = global.leftHand();
            break;
        case 2:
            handController = global.rightHand();
            break;
    }
    
    if (handController) {
        getJointsAveragePosition = handController.api.getJointsAveragePosition;
        getJointsAverageRotation = handController.api.getJointsAverageWorldRotation;
    }
    
    
    if (script.followCondition == 0) {
        //Always following
        startFollow();
    } else if (script.followCondition == 1 || script.followCondition == 3) {
        for (var i=0; i < script.startFollowTriggers.length; i ++) {
            global.behaviorSystem.addCustomTriggerResponse(script.startFollowTriggers[i], triggerStartFollow);
        }

        for (var j=0; j < script.endFollowTriggers.length; j ++) {
            global.behaviorSystem.addCustomTriggerResponse(script.endFollowTriggers[j], triggerEndFollow);
        }
    }
    

    
    script.createEvent("UpdateEvent").bind(onUpdate);
}
initialize();

function onUpdate() {
    
    if (script.handType == 0 && !handController) {
        handController = global.getActiveHandController();
        getJointsAveragePosition = global.getJointsAveragePosition;
        getJointsAverageRotation = global.getJointsAverageWorldRotation;
    }

    if (!handController) {
        //HAND IS NOT TRACKING
        if (startAction) {
            endFollow();
        }
        startFollowDelayTimer = 0;

    } else {
        //HAND IS TRACKING
        
        averageJointPos = getJointsAveragePosition(script.positionJointNames);
        
        if (!startAction) {
            if (startFollowDelayTimer < startFollowDelay) {
                startFollowDelayTimer += getDeltaTime();
            } else {
                startFollow();
                startFollowDelayTimer = 0;
            }
        }
    }
    
    updateObject(startAction);

}


function startFollow() {
    //skip if followCondition is usingTriggers and trigger hasn't been called
    if ((script.followCondition == 1 || script.followCondition == 3) && !startFollowTriggered) {
        return;
    }

    //skip if followCondition is distance check and distance is out of range
    if ((script.followCondition == 2 || script.followCondition == 3)
    && (getDistanceToTarget() > script.distanceThreshold)) {        
        return;
    }
    
    if (setPosition && script.positionJointNames.length == 0) {
        print("ERROR! No Joint Names Input for Position Joints Median on " + script.getSceneObject().name);
        return;
    }
    
    if (setRotation && script.rotationJointNames.length == 0) {
        print("ERROR! No Joint Names Input for Rotation Joints Median on " + script.getSceneObject().name);
        return;
    }

    objPos = followObject.getTransform().getWorldPosition();
    objRot = followObject.getTransform().getWorldRotation();

    proxyObject.getTransform().setWorldPosition(followObject.getTransform().getWorldPosition());
    //proxyObject.getTransform().setWorldRotation(getJointsAverageRotation(script.rotationJointNames));
    
    //set followObject's parent so its rotation will be applied from proxy object
    followObject.setParent(proxyObject);

    //set follow object local pos to 0 (aka to its current pos)
    //and its rotation to its current rot
    followObject.getTransform().setLocalPosition(new vec3(0,0,0));
    followObject.getTransform().setWorldRotation(objRot);
    
    if (script.sendFollowTriggerss) {
        global.behaviorSystem.sendCustomTrigger(script.startFollowTrigger);
    }
    
    if (script.logMessage) {
        logMessage("SetFollowHand Start on " + script.getSceneObject().name);
    }

    startAction = true;
}


function endFollow() {
    if (!startAction) {
        return;
    }
    
    //get current pos and rot from followObject
    var currentPos = followObject.getTransform().getWorldPosition();
    var currentRot = followObject.getTransform().getWorldRotation();

    //apply that to proxyObject
    proxyObject.getTransform().setWorldPosition(currentPos);
    proxyObject.getTransform().setWorldRotation(currentRot);

    //set local pos and rot of followObject to 0
    followObject.getTransform().setLocalPosition(new vec3(0,0,0));
    followObject.getTransform().setLocalRotation(new quat(0,0,0,0));

    if (script.sendFollowTriggerss) {
        global.behaviorSystem.sendCustomTrigger(script.endFollowTrigger);
    }
    
    if (script.logMessage) {
        logMessage("SetFollowHand End on " + script.getSceneObject().name);
    }
    
    startAction = false;
}

function triggerStartFollow() {
    startFollowTriggered = true;
}

function triggerEndFollow() {
    startFollowTriggered = false;
    endFollow();
}

function updateObject(isFollowing) {
    if (isFollowing) {
        //Object starts to lerp to target position and rotation from the hand
        if (setPosition) {
            targetPos = getJointsAveragePosition(script.positionJointNames);
        }        
        
        if (setRotation) {
            targetRot = getJointsAverageRotation(script.rotationJointNames);
        }

    } else {
        //Object returns to original state if resetPosition or resetRotation is checked
        if (setPosition && script.resetPosition) {
            targetPos = originPosProxy.getTransform().getWorldPosition();
        }
            
        if (setRotation && script.resetRotation) {
            targetRot = originPosProxy.getTransform().getWorldRotation();
        }
    }

    if (objPos && targetPos) {
        objPos = vec3.lerp(objPos, targetPos, (1 - script.positionSmooth));
        proxyObject.getTransform().setWorldPosition(objPos);
    }
    

    if (objRot && targetRot) {
        objRot = quat.slerp(objRot, targetRot, (1 - script.rotationSmooth));
        proxyObject.getTransform().setWorldRotation(objRot);
    }
    

}

function getDistanceToTarget() {
    if (!averageJointPos) {
        return;
    }    
    
    var dist;
    if (script.ignoreDepth) {
        var targetScreenPos = script.sceneCamera.worldSpaceToScreenSpace(averageJointPos);
        var objScreenPos = script.sceneCamera.worldSpaceToScreenSpace(followObject.getTransform().getWorldPosition());
        dist = targetScreenPos.distance(objScreenPos);
    } else {
        dist = averageJointPos.distance(followObject.getTransform().getWorldPosition());
    }
    return dist;
}

function logMessage(message) {
    if (script.logMessage) {
        print(message);
    }
}