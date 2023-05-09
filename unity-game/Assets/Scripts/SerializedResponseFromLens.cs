using System;

// This is the object that is returned from your API
// Please modify this object to match what is passed from your Lens
// See ShipSelector.js script in the lens included in this repository
[Serializable]
public class SerializedResponseFromLens
{
    public string eventName;
    public string eventValue;
}

[Serializable]
public class ResponseRoot
{
    public SerializedResponseFromLens unityData;
}

public static class LensEvents 
{
    public const string HAND_DETECTED = "handDetected";
    public const string HAND_LOST = "handLost";
    public const string COIN_GRABBED = "grabDetected";
    public const string COIN_DEPOSITED = "coinDeposited";
}
