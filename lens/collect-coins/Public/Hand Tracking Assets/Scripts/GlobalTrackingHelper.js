// GlobalTrackingHelper.js
// Version: 0.0.1
// Event: Lens Initialized
// Description: Handles HandTrcking for Both Hands

//@input Component.ScriptComponent leftHandTrackingScript
//@input Component.ScriptComponent rightHandTrackingScript
//@input SceneObject distanceLogger

//Get the current active hand's controller script
global.getActiveHandController = function() {
    if (global.leftHand().api.isTracking()) {
        return script.leftHandTrackingScript;
    }
    if (global.rightHand().api.isTracking()) {
        return script.rightHandTrackingScript;
    }
    return null;
};

//returns a string based on currently active hand
global.getHand = function() {
    if (global.getActiveHandController() == script.leftHandTrackingScript) {
        return "L";
    } else if (global.getActiveHandController() == script.rightHandTrackingScript) {
        return "R";
    }
    return null;
};

//returns tracking controller accordingly
global.leftHand = function() {
    return script.leftHandTrackingScript;
};

global.rightHand = function() {
    return script.rightHandTrackingScript;
};

//get joint object based on name of actively tracked hand
global.getJoint = function(jName) {
    if (global.getActiveHandController()) {
        return global.getActiveHandController().api.getJoint(jName);
    } else {
        return null;
    }
};

//--------------------GET DISTANCE BETWEEN 2 JOINTS OR 2 JOINT GROUPS--------------------
//get distance in-between 2 median points of list of joints (or could be 2 joints)
//jArray1 and jArray2 can be a single array or array of joints
global.getJointsDistance = function(jArray1, jArray2) {
    if (global.getActiveHandController()) {
        return global.getActiveHandController().api.getJointsDistance(jArray1, jArray2);
    } else {
        return null;
    }
};

//-----UNCOMMENT EXAMPLE BELOW-----
//script.createEvent("UpdateEvent").bind(function(){
//    print(global.getJointsDistance("wrist",["index-0","mid-0","pinky-0"]));
//    print(global.getJointsDistance("pinky-3","index-3"));
//});


//-------------------- SHOW LOCAL ROTATION OF JOINT OR JOINT GROUPS --------------------
global.showJointsStats = function(jointNames, axis) {
    if (global.getActiveHandController()) {
        return global.getActiveHandController().api.showJointsStats(jointNames, axis);
    } else {
        return null;
    }
};


//-------------------- CHECK IF LOCAL ROTATION OR JOINT OR JOINT GROUPS FIT INTO A RANGE --------------------
//check if local rotation of certain joints of a certain axis is within range between min and max
//jointArray can be a single joint or an array of joints
//min and max are angles between 0 and 180
//for angles bigger than 180 it will automatically minus 180
//use global.showJointsStats(jointNameArray, axis) to log out real time local rotation values
global.checkJointAngles = function(jointArray, min, max, axis) {
    if (global.getActiveHandController()) {
        return global.getActiveHandController().api.checkJointAngles(jointArray, min, max, axis);
    } else {
        return null;
    }
};
//-------------------- UNCOMMENT EXAMPLES BELOW THEN REFRESH --------------------
//script.createEvent("UpdateEvent").bind(function(){
//    global.showJointsStats(["wrist","index-2","pinky-0"], "xy");
//    global.showJointsStats(["thumb-2"], "x");
//    var isThumbBending = global.checkJointAngles("thumb-2", 40, 90, "x");
//});


global.checkLength = function(lengthArray, min, max) {
    if (global.getActiveHandController()) {
        return global.getActiveHandController().api.checkLength(lengthArray, min, max);
    } else {
        return null;
    }
};

//-------------------- CHECK AVERAGE POSITION OF AN ARRAY OF JOINTS --------------------
global.getJointsAveragePosition = function(jointNames) {
    if (global.getActiveHandController()) {
        return global.getActiveHandController().api.getJointsAveragePosition(jointNames);
    } else {
        return null;
    }
};

//-------------------- GET AVERAGE WORLD ROTATION IN QUATERNION OF AN ARRAY OF JOINTS --------------------
//-------------------- CONVERT TO EULER BY CALLING global.getJointsAverageWorldRotation.getAngle() --------------------
global.getJointsAverageWorldRotation = function(jointNames) {
    if (global.getActiveHandController()) {
        return global.getActiveHandController().api.getJointsAverageWorldRotation(jointNames);
    } else {
        return null;
    }
};

//-------------------- GET AVERAGE WORLD ROTATION IN EULER OF AN ARRAY OF JOINTS --------------------
global.getJointsAverageLocalRotation = function(jointNames) {
    if (global.getActiveHandController()) {
        return global.getActiveHandController().api.getJointsAverageLocalRotation(jointNames);
    } else {
        return null;
    }
};

global.getHandSizeOffset = function() {
    if (global.getActiveHandController()) {
        return global.getActiveHandController().api.getHandSizeOffset();
    } else {
        return null;
    }
};

//-------------------- DISTANCE LOGGER -------------------
var DISTANCE_INDICATOR_OFFSET = 0.25;
var distanceLoggers = [];

function DistanceLogger(position1, position2) {
    if (!script.distanceLogger) {
        print("ERROR! Please Input Distance Logger at " + script.getSceneObject().name);
        return;
    }

    this.sceneObject = script.getSceneObject().copyWholeHierarchy(script.distanceLogger);

    if (this.sceneObject.getChildrenCount() < 2) {
        print("ERROR! Distance Logger has to have at least 2 children, 1st as Indicator and 2nd as a text component!");
    }
    
    this.indicatorLine = this.sceneObject.getChild(0);
    this.indicatorLineTransform = this.sceneObject.getTransform();
    
    this.textContainer = this.sceneObject.getChild(1);
    this.textComponent = this.textContainer.getComponent("Component.Text");
    
    if (!this.textComponent && this.textContainer.getChildrenCount() > 0) {
        this.textComponent = this.textContainer.getChild(0).getComponent("Component.Text");
    }
    
    if (!this.textComponent) {
        print("WARNING! No Text Component attached to " + this.textContainer.name);
    }

    this.textContainer.setParent(null);

    this.distance = 0;

    this.sceneObject.enabled = false;
    this.textContainer.enabled = false;
    // this.showVisual = true;
    // this.showVisual = (isVisible === null) ? true : isVisible;

    this.position1 = position1;
    this.position2 = position2;

    this.showVisual = true;

}

DistanceLogger.prototype.update = function() {
    if (!this.indicatorLine || !this.textComponent) {
        return;
    }
    
    if (!global.getActiveHandController()) {
        this.sceneObject.enabled = false;
        this.textContainer.enabled = false;
        return;
    }
    
    if (!this.showVisual) {
        this.sceneObject.enabled = false;
        this.textContainer.enabled = false;
        return;
    }

    this.sceneObject.enabled = true;
    this.textContainer.enabled = true;


    this.startPos = getPositionOfType(this.position1);
    this.endPos = getPositionOfType(this.position2);
    
    this.distance = this.startPos.distance(this.endPos);
    this.normalizedDistance = this.distance * global.getHandSizeOffset();
    this.indicatorLength = this.distance * DISTANCE_INDICATOR_OFFSET;

    var midPos = this.startPos.add(this.endPos).uniformScale(0.5);
    var lerppedMidPos = vec3.lerp(this.indicatorLineTransform.getWorldPosition(), midPos, 0.5);
    this.indicatorLineTransform.setWorldPosition(lerppedMidPos);
    
    var dir = this.startPos.sub(this.endPos);
    var rot = quat.lookAt(dir, vec3.forward());
    this.indicatorLineTransform.setWorldRotation(rot);
    this.indicatorLineTransform.setLocalScale(new vec3(0.8, 1, this.indicatorLength));

    
    this.textContainer.getTransform().setWorldPosition(midPos);
    this.textComponent.text = this.distance.toFixed(2).toString();
};

DistanceLogger.prototype.setTextColor = function(indicatorColor) {
    this.textComponent.textFill.color = indicatorColor;
};

DistanceLogger.prototype.toggleVisual = function(isVisible) {
    this.showVisual = isVisible;
};


script.createEvent("UpdateEvent").bind(function() {
    for (var i = 0; i < distanceLoggers.length; i ++) {
        distanceLoggers[i].update();
    }
});

function getPositionOfType(positionInputType) {
    var finalPos;

    if (Array.isArray(positionInputType) || typeof positionInputType === "string") {    
        finalPos = global.getJointsAveragePosition(positionInputType);
    } else if (positionInputType.x != null) {
        finalPos = positionInputType;
    } else if (positionInputType.name != undefined) {
        finalPos = positionInputType.getTransform().getWorldPosition();
    }
    
    return finalPos;
}

global.createDistanceLogger = function(position1, position2) {
    var newDistanceLogger = new DistanceLogger(position1, position2);
    distanceLoggers.push(newDistanceLogger);
    return newDistanceLogger;
};

//-------------------- CHECK IF LENGTH IS WITHIN A RANGE -------------------- 
global.checkWithinRange = function(lengthArray, min, max) {
    if (!Array.isArray(lengthArray)) {
        if (lengthArray < min || lengthArray > max) {
            return false;
        }
    } else {
        for (var i=0; i<lengthArray.length; i ++) {
            if ((lengthArray[i] < min) || (lengthArray[i] > max)) {
                return false;
            }
        }
    }
    return true;
};

