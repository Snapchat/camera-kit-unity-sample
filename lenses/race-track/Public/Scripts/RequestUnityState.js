// -----JS CODE-----
// @input Asset.RemoteServiceModule remoteServiceModule
// @input int maximumConsecutiveErrors


// Import module
const Module = require("./Camera Kit Unity Bridge API Module");
const ApiModule = new Module.ApiModule(script.remoteServiceModule);

if (typeof(global.consecutiveErrorCount) === 'undefined')
{
    global.consecutiveErrorCount = 0;
}

script.api.requestUpdatedStateFromUnity = function() 
{
    
    print("requesting unity update")
    //requesting update from unity
    ApiModule.unity_request_state(script.api.handleUnityUpdate)
}

script.api.handleUnityUpdate = function(err, response) {
    if (err) {
        global.consecutiveErrorCount += 1
        print("Unity state: error " + global.consecutiveErrorCount);
        if (global.consecutiveErrorCount >= script.maximumConsecutiveErrors) {
            print("Too many errors. giving up on getting state from Unity")
        } else {
            script.api.requestUpdatedStateFromUnity()
        }
    } else {
        print("Success. got updated state from unity")
        global.consecutiveErrorCount = 0
        print(JSON.stringify(response))
        if (response) {
            if (response.isPressingButton == "true") {
                global.behaviorSystem.sendCustomTrigger("Unity_ButtonDown");
            } 
            else if (response.isPressingButton == "false") { 
                global.behaviorSystem.sendCustomTrigger("Unity_ButtonUp");
            } 
            else if (response.resetScene == "true") {
                global.behaviorSystem.sendCustomTrigger("Unity_ResetScene");
            }
        }
        
        // Remote APIs are stateless, and there's no two-way connection
        // In order to receive updates from Unity we have to send a request
        // that will be left "hanging" until Unity is ready to respond with a new update
        // this way we can simulate a push from Unity to the Lens.
        // We will likely revisit that to create a proper push/pull stream between Unity and Lens
        // For now, as soon as the response is processed, we immediately leave another open request.
        script.api.requestUpdatedStateFromUnity()

    }
    
}

script.api.requestUpdatedStateFromUnity();