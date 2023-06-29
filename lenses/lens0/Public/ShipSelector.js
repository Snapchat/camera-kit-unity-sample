    // -----JS CODE-----
// @input Asset.RemoteReferenceAsset leftTargetTexture
// @input string leftShipName
// @input Asset.RemoteReferenceAsset rightTargetTexture
// @input string rightShipName
// @input Component.ScriptComponent unityApi
// @input Component.Image targetImage

script.api.onLeft = function()
{
    print("onLeft")
    shipSelected(script.leftTargetTexture, script.leftShipName);
}

script.api.onRight = function()
{
    print("onRight")
    shipSelected(script.rightTargetTexture, script.rightShipName);
}

function shipSelected(remoteAsset, shipName) {
    print("ship selected! " + shipName)
    remoteAsset.downloadAsset(function (asset) { // download success
        script.targetImage.mainPass.baseTex = asset;
    }, 
    function () { // download failure
        print("Texture failed to download");
    });
    var dataToSend = {
        isEmpty : false,
        shipSelected : shipName
    };
    script.unityApi.api.callUnity(dataToSend);   
}