using System;
using System.Collections.Generic;

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
    // Lens-to-Unity events. These are inbound events we are receiving from the Coin Collection Lens
    public const string HAND_DETECTED = "handDetected";
    public const string HAND_LOST = "handLost";
    public const string COIN_GRABBED = "grabDetected";
    public const string COIN_DEPOSITED = "coinDeposited";

    // Unity-to-Lens events. These are outbound events we are sending to the Physics Lens
    public const string BUTTON_PRESS_EVENT = "isPressingButton";
}
