//@input Component.ScriptComponent getPositionScript

//@input SceneObject rotateObject

//@input vec3 rotationAmount
//@input bool reverseDirection

//@input bool useVFX
//@input Component.VFXComponent vfxEffect {"showIf":"useVFX"}
//@input string vfxValue {"showIf":"useVFX"}

//---ROTATE WITH ACCELERATION---
var rotateAmount;
var addedRotation = 0;
var finalAddedRotation = 0;
var vfxLerpedVal = 0;

var curPos = new vec3(0,0,0);
var prevPos = curPos;
var acceleration;

function initialize() {
    rotateAmount = script.rotateObject.getTransform().getLocalRotation().toEulerAngles();
    script.createEvent("UpdateEvent").bind(onUpdate);
}
initialize();

function onUpdate() {
    
    if (!script.getPositionScript) {
        print("ERROR! Please input GetJointPositionHelper into getPositionScript on " + script.getSceneObject().name);        
        return;
    }
    
    if (global.getActiveHandController()) {
        //----ROTATE WITH ACCELERATION----
        curPos = script.getPositionScript.api.getPosition();
        
        acceleration = curPos.distance(prevPos);
        addedRotation = acceleration* getDeltaTime() * 2;
        
        
        
        if (script.reverseDirection) {
            addedRotation *= -1;
        }
    } else {
        addedRotation = lerp(addedRotation, 0, 0.1);
    }

    finalAddedRotation = lerp(finalAddedRotation, addedRotation, 0.5);
    vfxLerpedVal = lerp(vfxLerpedVal, finalAddedRotation * 0.4, 0.02);
    rotateAmount = rotateAmount.add(script.rotationAmount.uniformScale(finalAddedRotation));

    script.vfxEffect.asset.properties[script.vfxValue] = vfxLerpedVal * 2;
    
    script.rotateObject.getTransform().setLocalRotation(quat.fromEulerVec(rotateAmount));
    
    prevPos = curPos;
}

function lerp(start, end, t) {
    return (1-t)*start+t*end;
}