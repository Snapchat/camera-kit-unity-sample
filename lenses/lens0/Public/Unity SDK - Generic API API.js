// @input Asset.RemoteServiceModule remoteServiceModule

// Import module
const Module = require("./Unity SDK - Generic API API Module");
const ApiModule = new Module.ApiModule(script.remoteServiceModule);

// Access functions defined in ApiModule like this:
//ApiModule.(function name)
script.api.callUnity = function(obj) {
    var serialized = JSON.stringify(obj);
    ApiModule.unitySendData(serialized, function(err, r) {
        print("Data sent to Unity");
        print("Error? " + err);
        print("Result? " + r);
    })
};

