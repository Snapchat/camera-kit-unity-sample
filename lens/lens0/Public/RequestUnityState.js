// -----JS CODE-----
// @input Asset.RemoteServiceModule remoteServiceModule
// @input Component.Text stateText
// @input float timeBetweenUpdatesInSeconds

// Import module
const Module = require("./Unity SDK - Generic API API Module");
const ApiModule = new Module.ApiModule(script.remoteServiceModule);

if (typeof(global.timeSinceLastUpdate) === 'undefined')
{
    global.timeSinceLastUpdate = 0;
}
global.timeSinceLastUpdate += getDeltaTime();

if (global.timeSinceLastUpdate >= script.timeBetweenUpdatesInSeconds) {
    requestUpdatedStateFromUnity()
    global.timeSinceLastUpdate = 0;
}

function requestUpdatedStateFromUnity() 
{
    //requesting update from unity
    ApiModule.unityRequestState(function(err, response) {
        if (err) {
            print("error")
        } else {
            // success. got updated state from unity
            if (response.shotsOnInvader) {
                script.stateText.text = "Invader was hit " + response.shotsOnInvader + " times";
            }
        }
    })
}
