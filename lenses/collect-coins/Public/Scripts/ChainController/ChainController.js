// ChainController.js
// Version: 0.0.1
// Event: Lens Initialized
// Description: A controller script that allows you to create a chain like movement of an array of sceneObjects attached by the fist link 

//@input SceneObject[] joints

//@ui {"widget" : "separator"}

//@input float stiffness = 1.0 {"widget":"slider","min":"0.01","max":"1.0", "step": " 0.1"}
//@input int type = 0 {"widget":"combobox", "values" : [{"label" : "Rigid", "value" : "0"}, {"label" : "Elastic", "value" : "1"}]}
//@input int iterations = 1 {"widget":"slider","min":"1","max":"30", "step": "1"}
//@input float timeSpeed = 1.0

//@ui {"widget" : "separator"}

//@input vec3 force = {0.0, -1.0, 0.0}
//@input bool isRelative = false
//@input SceneObject relativeTo {"showIf" : "isRelative"}

//@ui {"widget" : "separator"}

//@input bool addRotation = false

//@ui {"widget" : "separator"}

var points = [];
var constraints = [];
var links = [];

var updatePin = true;
var timeSpeed = 33.0 * script.timeSpeed;
var deltaTime = 0.033;

var relativeToTransform;
var acc;

if (checkValid()) {
    initialize();
}

function checkValid() {
    if (!global.MathLib) {
        print("ChainController, Error, please add a JSMathLibrary.js script to the scene and put it before the ChainController script");
        return false;
    }

    if (!global.MathLib.vec3 || !global.MathLib.quat) {
        print("ChainController, Error, please select 'vec3' and 'quat' options under the settings tab of a JSMathLibrary.js script");
        return false;
    }

    if (!global.Point || !global.Constraint) {
        print("ChainController, Error, please add a PositionBasedDynamicsHelpers.js script to the scene and put it before the ChainController script");
        return false;
    }

    if (script.isRelative) {
        if (!script.relativeTo) {
            print("ChainController, Warning, please set the RelativeTo sceneobject force is relative to");
            return false;
        }
        relativeToTransform = script.relativeTo.getTransform();
    }

    if (script.iterations <= 0) {
        print("ChainController, Warning, iteration count should be > 0");
        return false;
    }

    for (var i = 0; i < script.joints.length; i++) {
        if (!script.joints[i]) {
            print("ChainController, Warning, some of the chain joints are not set, simulation will not run. Set a joint or delete empty field");
            return false;
        }
    }
    return true;
}

function initialize() {
    for (var i = 0; i < script.joints.length; i++) {
        var transform = script.joints[i].getTransform();
        links.push({
            transform: transform,
            startLocalRot: transform.getLocalRotation(),
            startLocalPos: transform.getLocalPosition()
        });
        var pos = global.MathLib.vec3.fromEngine(transform.getWorldPosition());
        var p;
        if (i == 0) {
            p = new global.Point(0.0, pos);//static particle
            points.push(p);
            continue;
        } else {
            p = new global.Point(1.0, pos);
            points.push(p);
            var c = new global.Constraint(points[i - 1], points[i], script.stiffness, script.type == 0);
            constraints.push(c);
        }
    }
    acc = global.MathLib.vec3.fromEngine(script.force);

    if (points.length > 0 && script.iterations > 0) {
        script.createEvent("UpdateEvent").bind(onUpdate);
    }
}

function onUpdate() {
    updatePhysics(deltaTime, script.iterations);//calculate point positions
    applyTransforms();
}

function updatePhysics(dt, iteration) {

    if (updatePin) {
        points[0].setPosition(global.MathLib.vec3.fromEngine(links[0].transform.getWorldPosition()));
    }

    if (script.isRelative) {
        acc = global.MathLib.vec3.fromEngine(relativeToTransform.getWorldTransform().multiplyDirection(script.force));
    }
    for (var i = 1; i < points.length; i++) {
        points[i].update(dt * timeSpeed, acc);
    }
    for (var j = 0; j < iteration; j++) {
        for (var k = 0; k < constraints.length; k++) {
            constraints[k].solve(dt * timeSpeed);
        }
    }
}

function applyTransforms() {
    for (var i = 0; i < points.length; i++) {
        var worldPos = global.MathLib.vec3.toEngine(points[i].getPosition());
        if (i > 0 && script.addRotation) {
            links[i - 1].transform.setLocalRotation(links[i - 1].startLocalRot);
            links[i].transform.setWorldPosition(worldPos);
            var localPos = links[i].transform.getLocalPosition();
            links[i].transform.setLocalPosition(links[i].startLocalPos);
            var rot = quat.rotationFromTo(links[i].startLocalPos, localPos);
            links[i - 1].transform.setLocalRotation(rot.multiply(links[i - 1].startLocalRot));
        }
        links[i].transform.setWorldPosition(worldPos);
    }
}
