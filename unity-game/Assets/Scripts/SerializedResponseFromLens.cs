using System;

// This is the object that is returned from your API
// Please modify this object to match what is passed from your Lens
// See ShipSelector.js script in the lens included in this repository
[Serializable]
public class SerializedResponseFromLens
{
    public bool isEmpty;
    public string shipSelected;
}
