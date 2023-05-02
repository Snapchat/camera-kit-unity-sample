// SingleGestureTrigger.js
// Version: 0.0.1
// Event: Lens Initialized
// Description: Send triggers if a hand gesture is detected

/*
Check out SequencedGestureTrigger.js to send out triggers when a single gesture is detected
*/


//@input int handType = 0 {"widget":"combobox","values":[{"value":"0","label":"Any"},{"value":"1","label":"Left"},{"value":"2","label":"Right"}]}
//@input Component.Text hintText
//@input string noGestureHint
//@input string gestureName
//@input bool logMessage


var gestureDetected = script.gestureName + "_Detected";
//gestureDetected will trigger when this gesture is detected
var gestureLost = script.gestureName + "_Lost";
//gestureLost will trigger when this gesture is lost


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

var previousGestureDetected = false;
var currentGestureDetected = false;

var toleranceTimer = 0;
var toleranceTimeMax = 0.2;

var handString;

function initialize() {

    setUpTracking();
    
    if (!script.hintText) {
        print("HINT! Add text component to Hint Text on " + script.getSceneObject().name);
    }    
    script.createEvent("UpdateEvent").bind(onUpdate);
}
initialize();


function onUpdate() {
    getTracking();

    if (!isHandTracking) {
        updateText();
        if (currentGestureDetected) {
            sendBehaviorTriggers(gestureLost);
            currentGestureDetected = false;
            previousGestureDetected = currentGestureDetected;
        }
        return;
    }

    currentGestureDetected = getGesture();
    
    if (previousGestureDetected != currentGestureDetected) {

        if (toleranceTimer < toleranceTimeMax) {
            toleranceTimer += getDeltaTime();
        } else {

            if (currentGestureDetected) {
                updateText(gestureDetected);
                sendBehaviorTriggers(gestureDetected);
            } else {
                updateText(gestureLost);
                sendBehaviorTriggers(gestureLost);
            }

            toleranceTimer = 0;
            previousGestureDetected = currentGestureDetected;
        }
        
    }

}

function getGesture() {
    
    /*returns true if distance between
    thumb tip and mid tip
    thumb tip and index tip
    are smaller than 5
    if so then we'll consider the GRAB action is detected
    other fingers are free to do whatever they like unless defined
    */
    return checkLength([getDistance("thumb-3","mid-3"), getDistance("thumb-3","index-3")], 0, 5);
    
/*    
    //the following condition provides an 'OK' hand gesture
    //try replacing the conditions in the if() statement with your own
    //to create your own custom gesture!
    if(checkLength(getDistance("index-3","thumb-3"), 0, 3)
    && checkLength([getDistance("mid-3","wrist"),getDistance("ring-3","wrist"),getDistance("pinky-3","wrist")], 12, 100)){
        return true;
    }else{
        return false;
    }
*/
}

function updateText(txt) {
    if (script.hintText) {
        script.hintText.text = isHandTracking ? (handString + txt) : script.noGestureHint;
    }
}

function setUpTracking() {
    var hand = null;

    switch (script.handType) {
        case HAND_TYPE.ANY:
            checkLength = global.checkLength;
            getDistance = global.getJointsDistance;
            //getJointsAveragePosition = global.getJointsAveragePosition;
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
        //getJointsAveragePosition = hand.api.getJointsAveragePosition;
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