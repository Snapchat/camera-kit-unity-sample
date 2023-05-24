// HandTrackingController.js
// Version: 0.0.1
// Event: Lens Initialized
// Description: Handles HandTrcking for Both Hands

//@input Component.ObjectTracking3D handTracking

//@ui {"widget":"separator"}
//@input bool showJoints
//@input int colorMode {"showIf":"showJoints","widget":"combobox","values":[{"value":"0","label":"By Finger"},{"value":"1","label":"By Roots"}]}
//@input SceneObject jointIndicators {"showIf":"showJoints"}
//@input SceneObject jointStatsIndicator{"showIf":"showJoints","label":"Stats Indicator"}

//@ui {"widget":"separator"}
//@input bool showBones
//@input SceneObject boneIndicator {"showIf":"showBones"}
 
const JOINT_NAMES = ["wrist","thumb-0","thumb-1","thumb-2","thumb-3","index-0","index-1","index-2","index-3","mid-0","mid-1","mid-2","mid-3","ring-0","ring-1","ring-2","ring-3","pinky-0","pinky-1","pinky-2","pinky-3","wrist_to_thumb","wrist_to_index","wrist_to_mid","wrist_to_ring","wrist_to_pinky"];
const JOINT_NAME_BY_FINGER = ["wrist", "thumb", "index", "mid", "ring", "pinky"];
const JOINT_NAME_BY_ROOT = ["to", "0", "1", "2", "3", "wrist"];

const COLOR_MODE = {
    FINGER: 0,
    ROOT: 1
};

var joints = {};
var bones = [];

var BONE_SCALE_MULT = 0.1;

//handSizeOffset uses median distance from wrist to index-0 and compare it to 10
//in order to normalize distance check for joints for hands of different sizes
var handSizeOffset = 1;

var initialized = false;

initialize();

function Joint(jointName) {
    this.name = jointName;
    this.jointIndicator = null;

    var jointNameInclude;
    
    switch (script.colorMode) {
        case COLOR_MODE.FINGER:
            jointNameInclude = JOINT_NAME_BY_FINGER;
            break;
        case COLOR_MODE.ROOT:
            jointNameInclude = JOINT_NAME_BY_ROOT;
            break;
        default:
            jointNameInclude = JOINT_NAME_BY_FINGER;
    }

    if (script.jointIndicators) {
        if (script.jointIndicators.getChildrenCount() < 6) {
            this.jointIndicator = script.getSceneObject().copyWholeHierarchy(script.jointIndicators);
        } else {
            for (var i = 0; i < jointNameInclude.length; i++) {
                if (jointName.includes(jointNameInclude[i])) {
                    this.jointIndicator = script.getSceneObject().copyWholeHierarchy(script.jointIndicators.getChild(i));
                    break;
                }
            }
        }
    } else {
        print("WARNING! Please input objects to Joint Indicators");
    }
      
    
    
    this.object = script.handTracking.createAttachmentPoint(jointName);
    
    if (this.object) {
        this.objectTransform = this.object.getTransform();
        this.position = this.objectTransform.getWorldPosition();
        this.rotation = this.objectTransform.getWorldRotation();
        this.localRotationRaw = this.objectTransform.getLocalRotation().toEulerAngles();
        this.localRotation = this.localRotationRaw.uniformScale(180 / Math.PI);
    }
    
    if (this.jointIndicator) {
        this.jointIndicatorTransform = this.jointIndicator.getTransform();
        this.jointIndicator.enabled = false;
    }

    this.showStats = false;
    this.jointStatsIndicator = null;
    if (script.jointStatsIndicator) {
        this.jointStatsIndicator = script.getSceneObject().copyWholeHierarchy(script.jointStatsIndicator);
        this.jointStatsIndicatorTransform = this.jointStatsIndicator.getTransform();
        this.jointNameIndicator = this.jointStatsIndicator.getChild(0).getComponent("Component.Text");
        this.jointNameIndicator.text = this.name;
        this.jointRotationIndicator = this.jointStatsIndicator.getChild(1).getComponent("Component.Text");
        this.jointRotationIndicator.text = "";
        this.jointStatsIndicator.enabled = false;
    }
    this.showRotationAxis = "";//xyz means to show all axis, "" means show none
}

Joint.prototype.showDetails = function(rotationAxis) {
    this.showStats = true;
    this.jointStatsIndicator.enabled = true;
    this.showRotationAxis = rotationAxis;
};

Joint.prototype.update = function() {    
    this.position = this.objectTransform.getWorldPosition();
    this.rotation = this.objectTransform.getWorldRotation();
    this.localRotationRaw = this.objectTransform.getLocalRotation().toEulerAngles();
    var localRot = this.localRotationRaw.uniformScale(180 / Math.PI);
    localRot.x = localRot.x % 180;
    localRot.y = localRot.y % 180;
    localRot.z = localRot.z % 180;
    this.localRotation = localRot;
    
    if (script.showJoints && this.jointIndicatorTransform) {
        this.jointIndicatorTransform.setWorldPosition(this.position);
        this.jointIndicatorTransform.setWorldRotation(this.rotation);
    }
    
    if (!script.jointStatsIndicator) {
        print("WARNING! Please input an object for Stats Indicator!");
        return;
    }    
    
    if (this.showStats) {
        this.jointStatsIndicator.enabled = true;
        this.jointStatsIndicatorTransform.setWorldPosition(this.position);
        if (this.showRotationAxis != "") {
            var newstr = "";
            if (this.showRotationAxis.includes("x")) {
                newstr += "x:";
                newstr += this.localRotation.x.toFixed(0);
            }
            if (this.showRotationAxis.includes("y")) {
                newstr += "y:";
                newstr += this.localRotation.y.toFixed(0);
            }
            if (this.showRotationAxis.includes("z")) {
                newstr += "z:";
                newstr += this.localRotation.z.toFixed(0);
            }
            this.jointRotationIndicator.text = newstr;
        }
    } else {
        this.jointStatsIndicator.enabled = false;
    }

};

function Bone(jointa, jointb) {
    if (!jointa.object || !jointb.object) {
        return;
    }
    
    this.startJoint = jointa;
    this.endJoint = jointb;
    this.direction = this.endJoint.position.sub(this.startJoint.position);

    this.object = null;
    if (script.showBones && script.boneIndicator) {
        this.object = script.getSceneObject().copyWholeHierarchy(script.boneIndicator);
        this.objectTransform = this.object.getTransform();
        this.orgRot = this.object.getTransform().getWorldRotation();
        this.object.enabled = false;
    }
    
    
}

Bone.prototype.update = function() {
    this.length = this.startJoint.position.distance(this.endJoint.position) * BONE_SCALE_MULT;
    this.direction = this.endJoint.position.sub(this.startJoint.position);
    if (this.objectTransform) {
        this.objectTransform.setLocalScale(new vec3(1,1,1 * this.length));
        this.objectTransform.setWorldPosition(this.startJoint.position);
        var ang = rotateTowards(this.startJoint.position, this.endJoint.position, vec3.forward());
        if (ang.x) {
            this.objectTransform.setWorldRotation(ang);
        }
    }
};

//--------------INITIALIZING--------------
function initialize() {
    if (initialized) {
        return;
    }
    initializeJoints();
    initializeBones();
    initialized = true;
    
    script.createEvent("UpdateEvent").bind(onUpdate);
}

function initializeJoints() {
    for (var i=0; i<JOINT_NAMES.length; i++) {
        joints[JOINT_NAMES[i]] = new Joint(JOINT_NAMES[i]);
    }
}

function initializeBones() {
    for (var k in joints) {
        if (!joints[k].object) {
            return;
        }

        var connectedJName = null;
        if (joints[k].name == "wrist") {
            for (var j in joints) {
                if (joints[j].name.includes("wrist_to")) {
                    bones.push(new Bone(joints[k], joints[j]));
                }
            }
        } else if (joints[k].name.includes("wrist_to")) {
            connectedJName = joints[k].name.replace("wrist_to_","") + "-0";
        } else if (joints[k].name.includes("-") && !joints[k].name.includes("3")) {
            var jointNameSplit = joints[k].name.split("-");
            var idx = parseInt(jointNameSplit[1]) + 1;
            connectedJName = jointNameSplit[0] + "-" + idx.toString();
        }

        var connectedJ = getJoint(connectedJName);

        if (connectedJ) {
            bones.push(new Bone(joints[k], connectedJ));
        }
        
        
    }
}

//--------------UPDATE--------------

function onUpdate() {
    if (!isTracking()) {
        return;
    }

    handSizeOffset = getJoint("mid-0").position.distance(getJoint("wrist").position) / 10;
    for (var i in joints) {
        joints[i].update();
    }
    for (var j=0; j<bones.length;j++) {
        bones[j].update();
    }
    // for (var k=0; k<medians.length;k++) {
    //     medians[k].update();
    // }

}

//--------------TRACKING START / END && TOGGLE VISUALS && SEND TRIGGERS-----------------
script.handTracking.onTrackingStarted = function() {
    toggleVisual(true);
    global.behaviorSystem.sendCustomTrigger(script.getSceneObject().name + "_DETECTED");
};


script.handTracking.onTrackingLost = function() {
    toggleVisual(false);
    global.behaviorSystem.sendCustomTrigger(script.getSceneObject().name + "_LOST");
};

function toggleVisual(isVisible) {

    for (var j in joints) {
        if (joints[j].jointIndicator) {
            joints[j].jointIndicator.enabled = (isVisible && script.showJoints);
        }
        if (joints[j].jointStatsIndicator) {
            joints[j].jointStatsIndicator.enabled = (isVisible && script.showJoints);
        }
    }    

    
    for (var i=0; i< bones.length; i++) {
        if (bones[i].object) {
            bones[i].object.enabled = (isVisible && script.showBones);
        }
    }

    
    // for (var w=0; w<medians.length; w++) {
    //     if (medians[w].object) {
    //         medians[w].object.enabled = (isVisible && medians[w].showVisual);
    //     }
    //     if (medians[w].textObject) {
    //         medians[w].textObject.enabled = (isVisible && medians[w].showVisual);
    //     }
    // }
}


//--------------PUBLIC FUNCTIONS--------------
function getHandSizeOffset() {
    return handSizeOffset;
}

function getJoint(jName) {
    return joints[jName];
}



function showJointsStats(jointNames, showAxis) {
    if (!initialized) {
        initialize();
    }
    if (!showAxis) {
        showAxis = "";
    }
    
    if (!Array.isArray(jointNames)) {
        getJoint(jointNames).showDetails(showAxis);
    } else {
        for (var i=0; i < jointNames.length; i ++) {
            getJoint(jointNames[i]).showDetails(showAxis);
        }
    }
}


//get distance inbetween any 2 joint arrays
function getJointsDistance(jointArray1, jointArray2, isVisible, returnRawDistance) {
    return getJointsAveragePosition(jointArray1).distance(getJointsAveragePosition(jointArray2));
}

function getJointsAveragePosition(jointNames) {
    if (!Array.isArray(jointNames)) {
        if (getJoint(jointNames)) {
            return getJoint(jointNames).position;
        } else {
            print("ERROR! No Joint Named of " + jointNames);
        }
    } else {
        var vec3arr = [];
        for (var i=0; i < jointNames.length; i ++) {
            if (getJoint(jointNames[i])) {
                vec3arr.push(getJoint(jointNames[i]).position);
            }
        }
        return getAverageVec3(vec3arr);
    }
}

function getJointsAverageWorldRotation(jointNames) {
    var quatArr = [];
    if (!Array.isArray(jointNames)) {
        if (getJoint(jointNames)) {
            quatArr.push(getJoint(jointNames).rotation);
        }
    } else {
        for (var i=0; i < jointNames.length; i ++) {
            if (getJoint(jointNames[i])) {
                quatArr.push(getJoint(jointNames[i]).rotation);
            }
        }
    }
    return getAverageQuat(quatArr);
}

function getJointsAverageLocalRotation(jointNames) {
    var quatArr = [];
    if (!Array.isArray(jointNames)) {
        if (getJoint(jointNames)) {
            quatArr.push(getJoint(jointNames).localRotationRaw);
        }
    } else {
        for (var i=0; i < jointNames.length; i ++) {
            if (getJoint(jointNames[i])) {
                quatArr.push(getJoint(jointNames[i]).localRotationRaw);
            }
        }
    }
    return getAverageQuat(quatArr);
}



function getJointAngle(middleJoint) {
    var posStart, posEnd;
    var posMid = getJoint(middleJoint).position;
    var jname;
    if (middleJoint.includes("-1") || middleJoint.includes("-2")) {
        jname = middleJoint.split("-")[0];
        var jindex = parseInt(middleJoint.split("-")[1]);
        var startIdx = jindex - 1;
        var endIdx = jindex + 1;
        var startname = jname + "-" + startIdx.toString();
        var endname = jname + "-" + endIdx.toString();
        posStart = getJoint(startname).position;
        posEnd = getJoint(endname).position;
    } else if (middleJoint.includes("-0")) {
        posStart = getJoint("wrist").position;
        jname = middleJoint.split("-")[0];
        posEnd = getJoint(jname + "-1").position;
    } else {
        print("ERROR! Cannot get joint angle at joint: " + middleJoint);
        return null;
    }

    return getAngleByPosition(posMid, posStart, posEnd, posMid);
}




function checkJointAngles(jointArray, min, max, axis) {
    var impercision = Math.abs(max - min) / 2;
    min -= impercision;
    max += impercision;
    min %= 180;
    max %= 180;

    var angleArray = [];
    

    if (Array.isArray(jointArray)) {
        for (var j=0; j<jointArray.length; j++) {
            angleArray.push(jointArray[j]);
        }
    } else {
        angleArray.push(jointArray);
    }
    
    // print("min " + min);
    // print("max " + max);
    for (var i=0; i<angleArray.length; i ++) {
        var angle;
        if (!axis || axis == "x") {
            angle = getJoint(angleArray[i]).localRotation.x;
        } else if (axis == "y") {
            angle = getJoint(angleArray[i]).localRotation.y;
        } else if (axis == "z") {
            angle = getJoint(angleArray[i]).localRotation.z;
        }
        if (min < max) {
            if ((angle < min) || (angle > max)) {
                return false;
            }
        } else {
            if (angle > min && angle <= 180) {
                //angle is larger than min which is closer to 180
            } else if (angle < max) {
                //angle smaller than max
            } else {
                return false;
            }
        }
        
    }
    return true;
}

function isTracking() {
    return script.handTracking.isTracking();
}


//--------------FUNCTIONALITIES--------------
function getAverageQuat(quats) {
    var finalQuat = quats[0];
    var idx= 0;
    while (idx < quats.length) {
        if (idx > 0) {
            var slerpT = idx / (idx + 1);
            finalQuat = quat.slerp(finalQuat, quats[idx], slerpT);
        }
        idx ++;
    }
    return finalQuat;
}

function getAverageVec3(vecs) {
    var result = new vec3(0,0,0);
    for (var i=0; i < vecs.length; i ++) {
        result = result.add(vecs[i]);
    }
    result = result.uniformScale(1 / vecs.length);
    return result;
}

function rotateTowards(org, target, direction) {
    var dir = org.sub(target);
    return quat.lookAt(dir, direction);
}

function getAngleByPosition(pos1end, pos1start, pos2end, pos2start) {
    var dir1 = pos1end.sub(pos1start);
    var dir2 = pos2end.sub(pos2start);
    return (Math.acos(dir1.dot(dir2) / (dir1.length * dir2.length)) * 180/Math.PI);
}

/*
//Backup function for checking if two arrays are the same

function checkIfSameArray(arr1, arr2) {
    
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
        return (arr1 == arr2);
    } else if (arr1.length == arr2.length) {
        if (arr1 === arr2) {
            return true;
        }
        
        var array1 = arr1.sort();
        var array2 = arr2.sort();
        for (var i = 0; i < array1.length; ++i) {
            if (array1[i] !== array2[i]) {
                return false;
            }
        }
        return true;

    } else {
        return false;
    }
}*/

function checkLength(lengthArray, min, max) {

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
}

script.api.initialize = initialize;
script.api.getJoint = getJoint;
script.api.showJointsStats = showJointsStats;
script.api.getJointsDistance = getJointsDistance;
script.api.getJointsAveragePosition = getJointsAveragePosition;
script.api.getJointsAverageWorldRotation = getJointsAverageWorldRotation;
script.api.getJointsAverageLocalRotation = getJointsAverageLocalRotation;
script.api.getHandSizeOffset = getHandSizeOffset;
script.api.getJointAngle = getJointAngle;
script.api.checkJointAngles = checkJointAngles;
script.api.isTracking = isTracking;
script.api.checkLength = checkLength;