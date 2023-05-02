// SequencedGestureTrigger.js
// Version: 0.0.1
// Event: Lens Initialized
// Description: Send triggers if a sequenced hand gesture set is detected (start gesture and end gesture)

/*
this script would detect two gestures in sequence to each other defined in getGesture()
NOTE: If first gesture is lost before second gesture is detected, second gesture will not be triggered
Only if the 2 gestures are performed one after another will all the gesture triggers get called

Check out SingleGestureTrigger.js to send out triggers when a single gesture is detected

*/

//@input int handType = 0 {"widget":"combobox","values":[{"value":"0","label":"Any"},{"value":"1","label":"Left"},{"value":"2","label":"Right"}]}
//@input Component.Text gestureHintText
//@input Component.Text trackingHintText
//@input string gestureName
//@input bool logMessage

var gestureInitiated = script.gestureName + "_Initialized";
//gestureInitiated will trigger when first gesture is detected

var gesturePassed = script.gestureName + "_Passed";
//gesturePassed will trigger when first gesture is lost and immediately switched to second gesture

var gestureFinished = script.gestureName + "_Finished";
//gestureFinished will trigger when second gesture is lost

var gesturePassedHint = "Awesome!";

var gestureStatus = {
    NULL: 0,
    FIRST: 1,
    SECOND: 2
};

const HAND_TYPE = {
    ANY: 0,
    LEFT: 1,
    RIGHT: 2
};

var checkLength;   
//use the following to get average position of joints (see later in script)
//var getJointsAveragePosition;
var getDistance;
var isHandTracking;

var currentGesture = "";
var previousGesture = "";
var toleranceTimer = 0;
var toleranceTimeMax = 0.2;

var handString;

var passed = false;

function initialize() {

    setUpTracking();
    
    if (!script.trackingHintText) {
        print("Add text component to TrackingHintText on " + script.getSceneObject().name);
    }
    
    if (!script.gestureHintText) {
        print("Add text component to GestureHintText on " + script.getSceneObject().name);
    } else {
        script.gestureHintText.text = "Make " + script.gestureName + " Gesture!";
    }
    
    script.createEvent("UpdateEvent").bind(onUpdate);
}
initialize();


function onUpdate() {
    getTracking();
    
    if (!isHandTracking) {
        updateText();
        if (currentGesture != gestureStatus.NULL) {
            sendBehaviorTriggers(gestureFinished);
            currentGesture = gestureStatus.NULL;
            previousGesture = currentGesture;
        }
        return;
    }

    currentGesture = getGesture();
    
    if (previousGesture != currentGesture) {

        if (toleranceTimer < toleranceTimeMax) {
            toleranceTimer += getDeltaTime();
        } else {
            if (currentGesture == gestureStatus.FIRST) {
                updateText(gestureInitiated);
                sendBehaviorTriggers(gestureInitiated);
            } else if (currentGesture == gestureStatus.SECOND && previousGesture == gestureStatus.FIRST) {
                updateText(gesturePassed);
                sendBehaviorTriggers(gesturePassed);
                script.gestureHintText.text = gesturePassedHint;
                passed = true;
            } else if (passed) {
                updateText(gestureFinished);
                sendBehaviorTriggers(gestureFinished);
                passed = false;
            } else {
                updateText("No Gesture");
            }

            toleranceTimer = 0;
            previousGesture = currentGesture;
        }
    } else if (currentGesture == gestureStatus.NULL) {
        updateText("No Gesture");
    }
}

function getGesture() {
    
    //make sure pinky and ring fingers are curved in, and index and mid fingers are straightened
    if (checkLength([getDistance("thumb-3","pinky-3"),getDistance("wrist","pinky-3"), getDistance("wrist","ring-3")], 0, 8)
    && checkLength([getDistance("wrist","index-3"), getDistance("wrist","mid-3")], 12, 100)) {

        //first gesture (scissors open) will be triggered if index and mid finger tips distance is larger than 3.5
        //second gesture (scissors closed) will be triggered if index and mid finger tips are closed (distance smaller than 3.5)
        if (checkLength(getDistance("index-3","mid-3"), 3.5, 100)) {
            return gestureStatus.FIRST;
        } else {
            return gestureStatus.SECOND;
        }
    }

    //Comment above code and Uncomment the following code to try other gestures!
    /*
    //Conditions for the Pinch gesture
    if (checkLength(getDistance("thumb-3","index-3"), 8, 100) || checkLength(getDistance("thumb-3","mid-3"), 8, 100)) {
        return gestureStatus.FIRST;
    }
    if (checkLength(getDistance("thumb-3","index-3"), 0, 8) || checkLength(getDistance("thumb-3","mid-3"), 0, 8)) {
        return gestureStatus.SECOND;
    }
    //------------------------------
    //Conditions for the Grab gesture
    if (checkLength([getDistance("thumb-3","mid-3"), getDistance("mid-3","pinky-3"), getDistance("thumb-3","pinky-3"), getDistance("thumb-3","index-3"),getDistance("thumb-3","ring-3")], 6, 100)) {
        return gestureStatus.FIRST;
    }
    if (checkLength([getDistance("thumb-3","mid-3"), getDistance("mid-3","pinky-3"), getDistance("thumb-3","pinky-3"), getDistance("thumb-3","index-3"),getDistance("thumb-3","ring-3")], 0, 6)) {
        return gestureStatus.SECOND;
    }
    */

    return gestureStatus.NULL;
}

function updateText(txt) {
    if (script.trackingHintText) {
        script.trackingHintText.text = isHandTracking ? (handString + txt) : "No Hand Tracked";        
    }
}

function setUpTracking() {
    var hand = null;

    switch (script.handType) {
        case HAND_TYPE.ANY:
            checkLength = global.checkLength;
            getDistance = global.getJointsDistance;
            break;
        case HAND_TYPE.LEFT:
            hand = global.leftHand();
            break;
        case HAND_TYPE.RIGHT:
            hand = global.rightHand();
            break;
    }
    if (hand) {
        checkLength = hand.api.checkLength;
        getDistance = hand.api.getJointsDistance;
    }
}

function getTracking() {
    switch (script.handType) {
        case HAND_TYPE.ANY:
            isHandTracking = (global.getActiveHandController() == null) ? false : true ;
            handString = global.getHand() + ": ";
            break;
        case HAND_TYPE.LEFT:
            if (global.leftHand() && global.leftHand().api.isTracking) {
                isHandTracking = global.leftHand().api.isTracking();
                handString = "L: ";
            }
            break;
        case HAND_TYPE.RIGHT:
            if (global.rightHand() && global.rightHand().api.isTracking) {
                isHandTracking = global.rightHand().api.isTracking();
                handString = "R: ";
            }
            break;
    }
}

function sendBehaviorTriggers(triggerString) {
    logMessage(triggerString);
    global.behaviorSystem.sendCustomTrigger(triggerString);
}

function logMessage(message) {
    if (script.logMessage) {
        print(message);
    }
}