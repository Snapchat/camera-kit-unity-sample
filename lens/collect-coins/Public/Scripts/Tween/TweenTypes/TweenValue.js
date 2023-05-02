// TweenValue.js
// Version: 0.1.3
// Event: Any Event
// Description: Runs a tween on a generic data type
// ----- USAGE -----
// Attach this script as a component after the Tween Manager script on either the same scene object or in a lower scene object in the Objects Panel.
//
// Obtain the current value of this Tween while it is playing using the Tween Manager
// -----------------

//@input string tweenName
//@input bool playAutomatically = true
//@ui {"widget":"separator"}
//@input int loopType = 0 {"widget":"combobox", "values":[{"label":"None", "value":0}, {"label":"Loop", "value":1}, {"label":"Ping Pong", "value":2}, {"label":"Ping Pong Once", "value":3}]}
//@ui {"widget":"separator"}
//@input int dataType = 0 {"widget":"combobox", "values":[{"label":"Int", "value": 0 }, {"label":"Float", "value": 1}, {"label":"Vec2", "value": 2}, {"label":"Vec3", "value": 3}, {"label":"Vec4", "value": 4}, {"label":"Color RGB", "value": 5}, {"label":"Color RGBA", "value": 6}]}
//@input int startInt = 0 {"showIf": "dataType", "showIfValue": 0, "label":"Start"}
//@input int endInt = 1 {"showIf": "dataType", "showIfValue": 0, "label":"End"}
//@input float startFloat = 0 {"showIf": "dataType", "showIfValue": 1, "label":"Start"}
//@input float endFloat = 1.0 {"showIf": "dataType", "showIfValue": 1, "label":"End"}
//@input vec2 startVector2 = {0,0} {"showIf": "dataType", "showIfValue": 2, "label":"Start"}
//@input vec2 endVector2 = {1,1} {"showIf": "dataType", "showIfValue": 2, "label":"End"}
//@input vec3 startVector3 = {0,0,0} {"showIf": "dataType", "showIfValue": 3, "label":"Start"}
//@input vec3 endVector3 = {1,1,1} {"showIf": "dataType", "showIfValue": 3, "label":"End"}
//@input vec4 startVector4 = {0,0,0,0} {"showIf": "dataType", "showIfValue": 4, "label":"Start"}
//@input vec4 endVector4 = {1,1,1,1} {"showIf": "dataType", "showIfValue": 4, "label":"End"}
//@input vec3 startRGB = {0,0,0} {"showIf": "dataType", "showIfValue": 5, "label":"Start", "widget" : "color"}
//@input vec3 endRGB = {1,1,1} {"showIf": "dataType", "showIfValue": 5, "label":"End", "widget" : "color"}
//@input vec4 startRGBA = {0,0,0,0} {"showIf": "dataType", "showIfValue": 6, "label":"Start", "widget" : "color"}
//@input vec4 endRGBA = {1,1,1,1} {"showIf": "dataType", "showIfValue": 6, "label":"End", "widget" : "color"}
//@input float time = 1.0
//@input float delay = 0.0
//@ui {"widget":"separator"}
//@input int callbackType = 0 {"label": "On Update Callback", "widget":"combobox", "values":[{"label":"None", "value":0}, {"label":"Set API property", "value":1}, {"label":"Call API function", "value":2}, {"label":"Set Material Parameter", "value":3}, {"label":"Set VFX Asset Parameter", "value":4}]}
//@input Component.ScriptComponent propTargetScript {"showIf" : "callbackType", "showIfValue" : 1, "label" : "Script"}
//@input string propName {"showIf" : "callbackType", "showIfValue" : 1, "label" : "Name"}
//@input Component.ScriptComponent funcTargetScript {"showIf" : "callbackType", "showIfValue" : 2}
//@input string funcName {"showIf" : "callbackType", "showIfValue" : 2}
//@input Component.MaterialMeshVisual materialMeshVisual {"showIf" : "callbackType", "showIfValue" : 3, "label" : "Mesh Visual"}
//@input Asset.Material material {"showIf" : "callbackType", "showIfValue" : 3}
//@input string materialScriptName = "baseColor" {"showIf" : "callbackType", "showIfValue" : 3, "label" : "Property"}
//@input Component.VFXComponent vfxComponent {"showIf" : "callbackType", "showIfValue" : 4, "label" : "Component"}
//@input Asset.VFXAsset vfxAsset {"showIf" : "callbackType", "showIfValue" : 4, "label" : "Asset"}
//@input string vfxScriptName = "baseColor" {"showIf" : "callbackType", "showIfValue" : 4, "label" : "Property"}

//@ui {"widget":"separator"}
//@input string easingFunction = "Quadratic" {"widget":"combobox", "values":[{"label":"Linear", "value":"Linear"}, {"label":"Quadratic", "value":"Quadratic"}, {"label":"Cubic", "value":"Cubic"}, {"label":"Quartic", "value":"Quartic"}, {"label":"Quintic", "value":"Quintic"}, {"label":"Sinusoidal", "value":"Sinusoidal"}, {"label":"Exponential", "value":"Exponential"}, {"label":"Circular", "value":"Circular"}, {"label":"Elastic", "value":"Elastic"}, {"label":"Back", "value":"Back"}, {"label":"Bounce", "value":"Bounce"}]}
//@input string easingType = "Out" {"widget":"combobox", "values":[{"label":"In", "value":"In"}, {"label":"Out", "value":"Out"}, {"label":"In / Out", "value":"InOut"}]}

var properties = ["x", "y", "z", "w"];

var startEndValues = {
    "start": [script.startInt, script.startFloat, script.startVector2, script.startVector3, script.startVector4, script.startRGB, script.startRGBA],
    "end": [script.endInt, script.endFloat, script.endVector2, script.endVector3, script.endVector4, script.endRGB, script.endRGBA]
};
// Setup the external API

script.api.tweenObject = script.getSceneObject();
script.api.tweenType = "value";
script.api.tweenName = script.tweenName;
script.api.time = script.time;
script.api.startTween = startTween;
script.api.resetObject = resetObject;
script.api.tween = null;
script.api.setupTween = setupTween;
script.api.setupTweenBackwards = setupTweenBackwards;
script.api.updateToStart = updateToStart;
script.api.updateToEnd = updateToEnd;
script.api.loopType = script.loopType;
script.api.value = getRawByName("start");
script.api.start = null;
script.api.end = null;
script.api.setStart = setStart;
script.api.setEnd = setEnd;
script.api.manualStart = false;
script.api.manualEnd = false;
script.api.playAutomatically = script.playAutomatically;
script.createEvent("OnDestroyEvent").bind(stopTween);


if (global.tweenManager && global.tweenManager.addToRegistry) {
    global.tweenManager.addToRegistry(script);
}
script.propertiesCount = script.dataType > 4 ? script.dataType - 2 : script.dataType;

// Manually set start value
function setStart(start) {
    script.api.manualStart = true;
    script.api.start = getValueFromRaw(start);
}

// Manually set end value
function setEnd(end) {
    script.api.manualEnd = true;
    script.api.end = getValueFromRaw(end);
}

// Update the tween to its start
function updateToStart() {
    updateValue(script.api.start);
}

// Update the tween to its end
function updateToEnd() {
    updateValue((script.loopType == 3) ? script.api.start : script.api.end);
}

// Play it automatically if specified
if (script.playAutomatically) {
    // Start the tween
    startTween();
}

// Create the tween with passed in parameters
function startTween() {
    if (!global.tweenManager) {
        print("Tween Value: Tween Manager not initialized. Try moving the TweenManager script to the top of the Objects Panel or changing the event on this TweenType to \"Lens Turned On\".");
        return;
    }

    script.api.tween = setupTween();

    if (script.api.tween) {
        // Start the tween
        script.api.tween.start();
    }
}

// Stops active tween
function stopTween() {
    if (script.api.tween) {
        script.api.tween.stop();
        script.api.tween = null;
    }
}

// Create the tween with passed in parameters
function setupTween() {

    if (!script.api.manualStart) {
        var startRaw = getRawByName("start");
        script.api.start = getValueFromRaw(startRaw);

    }

    if (!script.api.manualEnd) {
        var endRaw = getRawByName("end");
        script.api.end = getValueFromRaw(endRaw);
    }

    var startValue = script.api.start;
    var endValue = script.api.end;

    var tween = null;

    // Reset object to start
    resetObject();
    script.onUpdateCallback = getCallbackFunction();
    // Create the tween
    tween = new global.TWEEN.Tween(startValue)
        .to(endValue, script.api.time * 1000.0)
        .delay(script.delay * 1000.0)
        .easing(global.tweenManager.getTweenEasingType(script.easingFunction, script.easingType))
        .onUpdate(updateValue);

    if (tween) {
        // Configure the type of looping based on the inputted parameters
        global.tweenManager.setTweenLoopType(tween, script.loopType);

        // Save reference to tween
        script.api.tween = tween;

        return tween;
    } else {
        return;
    }
}

// Create the tween with swapped start and end parameters
function setupTweenBackwards() {
    var startValue = (script.loopType == 3) ? script.api.start : script.api.end;

    var endValue = (script.loopType == 3) ? script.api.end : script.api.start;

    var tween = null;

    var easingType = global.tweenManager.getSwitchedEasingType(script.easingType);

    // Create the tween
    tween = new global.TWEEN.Tween(startValue)
        .to(endValue, script.api.time * 1000.0)
        .delay(script.delay * 1000.0)
        .easing(global.tweenManager.getTweenEasingType(script.easingFunction, easingType))
        .onUpdate(updateValue);

    if (tween) {
        // Configure the type of looping based on the inputted parameters
        global.tweenManager.setTweenLoopType(tween, script.api.loopType);

        return tween;
    } else {
        return;
    }
}

// Resets the object to its start
function resetObject() {
    updateValue(script.api.start);
}

// Return the updated value from Tween.js
function updateValue(value) {
    if (script.propertiesCount <= 1) {
        script.api.value = (script.propertiesCount == 0) ? Math.floor(value.a) : value.a;
    } else {
        for (var i = 0; i < script.propertiesCount; i++) {
            script.api.value[properties[i]] = value[properties[i]];
        }
    }
    if (script.onUpdateCallback != null) {
        script.onUpdateCallback(script.api.value);
    }
}


// Get appropriate start value based on dataType
function getRawByName(valueName) {
    var value = startEndValues[valueName][script.dataType];
    if (script.dataType <= 1) {
        return value;
    } else {
        return value.uniformScale(1.0);
    }
}

function getValueFromRaw(rVal) {
    var val = {};
    if (script.propertiesCount <= 1) {
        val = {
            "a": rVal
        };
    } else {
        for (var i = 0; i < script.propertiesCount; i++) {
            var propName = properties[i];
            val[propName] = rVal[propName];
        }
    }

    return val;
}

function getCallbackFunction() {

    switch (script.callbackType) {

        case (0):

            return null;

        case (1):
            if (script.propTargetScript == null) {
                print("[Tween Value], Warning, Script Component is not set");
                break;
            }
            if (script.propName == "") {
                print("[Tween Value], Warning, Property name is not set");
                break;
            }

            return function(v) {
                script.propTargetScript.api[script.propName] = v;
            };

        case (2):
            if (script.funcTargetScript == null) {
                print("[Tween Value], Warning, Script Component is not set");
                break;
            }
            if (script.funcName == "") {
                print("[Tween Value], Warning, Function name is not set");
                break;
            }

            return function(v) {
                script.funcTargetScript.api[script.funcName](v);
            };

        case (3):
            var pass;
            if (script.materialMeshVisual && script.materialMeshVisual.mainMaterial) {
                pass = script.materialMeshVisual.mainMaterial.mainPass;
            } else if (script.material) {
                pass = script.material.mainPass;
            }
            if (!pass) {
                print("[Tween Value], Warning, Please set Material ot Mesh Visual with Material");
                break;
            }
            if (script.materialScriptName == "") {
                print("[Tween Value], Warning, Material property name is not set");
                break;
            }
            if (pass[script.materialScriptName] == undefined) {
                print("[Tween Value], Warning, Material " + script.material.name + " doesn't have a " + script.materialScriptName + " property");
                break;
            }
            if (!typeIsMatching(script.api.value, pass[script.materialScriptName])) {
                print("[Tween Value], Warning, Material " + script.material.name + " " + script.materialScriptName + " property does not match tween value type");
                break;
            }
            return function(materialPass, scriptName) {
                return function(v) {
                    materialPass[scriptName] = v;
                };
            }(pass, script.materialScriptName);
        case (4):
            var vfxAsset;

            if (script.vfxComponent) {
                vfxAsset = script.vfxComponent.asset;
            } else if (script.vfxAsset) {
                vfxAsset = script.vfxAsset;
            }
            if (vfxAsset == undefined) {
                print("[Tween Value], Warning, Please set VFX component or asset");
                break;
            }
            if (script.vfxScriptName == "") {
                print("[Tween Value], Warning, VFX asset property name is not set");
                break;
            }
            if (vfxAsset.properties[script.vfxScriptName] == undefined) {
                print("[Tween Value], Warning, VFXAsset " + vfxAsset.name + " doesn't have a " + script.vfxScriptName + " property");
                break;
            }
            if (!typeIsMatching(script.api.value, vfxAsset.properties[script.vfxScriptName])) {
                print("[Tween Value], Warning, VFXAsset " + vfxAsset.name + " " + script.vfxScriptName + " property does not match tween value type");
                break;
            }
            return function(asset, scriptName) {
                return function(v) {
                    asset.properties[scriptName] = v;
                };
            }(vfxAsset, script.vfxScriptName);
    }
    return null;
}


function typeIsMatching(val, prop) {
    if (typeof val == "number" && typeof prop == "number") {
        return true;
    } else {
        var haveSameProperty = false;
        for (var i = 0; i < properties.length; i++) {
            if ((val[properties[i]] == undefined) == (prop[properties[i]] == undefined)) {
                if (val[properties[i]] != undefined) {
                    haveSameProperty = true;
                }
            } else {
                return false;
            }
        }
        return haveSameProperty;// have at least one matching property
    }
}
