// -----JS CODE-----
// @input Asset.RemoteServiceModule remoteServiceModule
// @input Component.Text stateText
// @input int maximumConsecutiveErrors


// Import module
const Module = require("./Unity SDK - Generic API API Module");
const ApiModule = new Module.ApiModule(script.remoteServiceModule);

if (typeof(global.consecutiveErrorCount) === 'undefined')
{
    global.consecutiveErrorCount = 0;
}

script.api.requestUpdatedStateFromUnity = function() 
{
    print("requesting unity update")
    //requesting update from unity
    ApiModule.unityRequestState(script.api.handleUnityUpdate)
}

script.api.handleUnityUpdate = function(err, response) {
    if (err) {
        print("error")
        global.consecutiveErrorCount += 1
        if (global.consecutiveErrorCount >= script.maximumConsecutiveErrors) {
            print("too many errors. giving up on getting state from Unity")
        } else {
            script.api.requestUpdatedStateFromUnity()
        }
    } else {
        print("success. got updated state from unity")
        global.consecutiveErrorCount = 0
        if (response.shotsOnInvader) {
            script.stateText.text = "Invader was hit " + response.shotsOnInvader + " times";
        }
        script.api.requestUpdatedStateFromUnity()

    }
    
}

script.api.requestUpdatedStateFromUnity();
