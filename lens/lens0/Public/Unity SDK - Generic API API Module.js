/* // NOTE: This file contains code for accessing an external API encapsulated as a JS module. You should not modify this file.
 * // Instead, you should modify the "Unity SDK - Generic API API" script and access the functions through the imported class wrapper.
*/

/*
 * @param {RemoteApiResponse} response A raw API response from an Unity SDK - Generic API API
 * @param {function} cb A callback to call with error and result data once the response has been parsed and error checked
 *
*/

function handleAPIResponse(response, cb) {
    if (response.statusCode !== 1) {
        print("ERROR: The API call did not succeed!. Please check your request");
        cb(true);
    } else {
        try {
            var parsedBody = JSON.parse(response.body);
            if (cb) {
                cb(false, parsedBody);
            }
        } catch (e) {
            print("ERROR: Failed to parse response");
            if (cb) {
                cb(true);
            }
        }
    }
}

function ApiModule(remoteServiceModule) {
    this.remoteServiceModule = remoteServiceModule;
}


ApiModule.prototype.unitySendData = function(unityData, cb) {
    var req = global.RemoteApiRequest.create();
    req.endpoint = "unitySendData";
    req.parameters = {
        "unityData": unityData,
    };
    this.remoteServiceModule.performApiRequest(req, function(response) {
        if(cb) {
            handleAPIResponse(response, cb);
        }
    });
};

module.exports.ApiModule = ApiModule;
