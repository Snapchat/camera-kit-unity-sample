// BindTransform.js
// Version: 0.1.0
// Event: Lens Initialized
// Description: Provide functions to enable/disable one object's  
// children objects based on the initial state and bind 
// it's transform to another object(position, rotation, scale)
// @input SceneObject sourceObject
// @input SceneObject bindObject
// @input bool bindPosition
// @input bool bindRotation
// @input bool bindScale

global.behaviorSystem.addCustomTriggerResponse("Unity_ResetScene", function() {
    print("Handling unity event: Reset Scene")
    bindTransform();
});

if (!script.bindObject) {
    print("ERROR: Bind object is not set");
    return;
}

if (!script.sourceObject) {
    print("ERROR: Source object to copy transform from is not set");
    return;
}

var initialWorldTransform = getLocalTransform(script.bindObject);
var initialStates = getInitialStates(script.bindObject);

var transform = script.bindObject.getTransform();
var bindedTransform = script.sourceObject.getTransform();

var initPosition = transform.getLocalPosition();
var initRotation = transform.getLocalRotation();
var initScale = transform.getLocalScale();

script.api.bindTransform = bindTransform;
script.api.hideObject = hideObject;

hideObject();

function bindTransform() { 
    setToInitialState(script.bindObject,initialStates);
    applyLocalTransform(script.bindObject,initialWorldTransform);
    
    if (script.bindScale) {
        var scale = bindedTransform.getWorldScale();
        transform.setWorldScale(scale.mult(initScale));
    }    
    if (script.bindRotation) {
        var rotation = bindedTransform.getWorldRotation();
        transform.setWorldRotation(rotation.multiply(initRotation));
    }    
    if (script.bindPosition) {
        var position = bindedTransform.getWorldPosition();
        transform.setWorldPosition(position.add(initPosition));  
    }
}

function hideObject() {
    for (var i =0 ;i<script.bindObject.getChildrenCount();i++) {
        script.bindObject.getChild(i).enabled = false;
    }    
}

function getInitialStates() {
    var states =[];
    for (var i =0 ;i<script.bindObject.getChildrenCount();i++) {
        states.push(script.bindObject.getChild(i).enabled);        
    }
    return states;
}

function setToInitialState(obj,state) {
    for (var i =0 ;i<obj.getChildrenCount();i++) {
        obj.getChild(i).enabled = state[i];
    }   
}

function getLocalTransform(obj) {
    var trans =[];
    
    for (var i=0;i<obj.getChildrenCount();i++) {
        
        var pos = obj.getChild(i).getTransform().getLocalPosition();
        var scale =  obj.getChild(i).getTransform().getLocalScale();
        var rot= obj.getChild(i).getTransform().getLocalRotation();
        mat4.compose(pos,rot,scale);
        trans.push(mat4.compose(pos,rot,scale));
    }
    return trans;
}

function applyLocalTransform(obj,trans) {
    
    for (var i=0;i<obj.getChildrenCount();i++) {
        obj.getChild(i).getTransform().setLocalTransform(trans[i]);
    }
}
