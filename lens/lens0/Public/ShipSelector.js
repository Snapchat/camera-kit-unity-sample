// -----JS CODE-----
// @input Component.Image targetImage
// @input Asset.Texture targetTexture
// @input string shipName
// @input Component.ScriptComponent unityApi

var event = script.createEvent("TouchEndEvent");

event.bind(function(eventData)
{
    script.targetImage.mainPass.baseTex = script.targetTexture;
    var dataToSend = {
        isEmpty : false,
        shipSelected : script.shipName
    };
    script.unityApi.api.callUnity(dataToSend);
});