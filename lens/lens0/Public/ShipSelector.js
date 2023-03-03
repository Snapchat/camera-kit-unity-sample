// -----JS CODE-----
// @input Component.Image targetImage
// @input Asset.RemoteReferenceAsset targetTexture
// @input string shipName
// @input Component.ScriptComponent unityApi

var event = script.createEvent("TouchEndEvent");

event.bind(function(eventData)
{
    print("tap!")
    script.targetTexture.downloadAsset(function (asset) { // download success
        script.targetImage.mainPass.baseTex = asset;
    }, 
    function () { // download failure
        print("Texture failed to download");
    });
    var dataToSend = {
        isEmpty : false,
        shipSelected : script.shipName
    };
    script.unityApi.api.callUnity(dataToSend);
});