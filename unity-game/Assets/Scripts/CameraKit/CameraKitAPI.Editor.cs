using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraKitAPIEditor : ICameraKit
{
    public void InvokeCameraKit(CameraKitConfiguration config)  
    {
        Debug.Log("InvokeCameraKit::Camera Kit is not available when running from Editor.");
    }

    public void Validate(CameraKitConfiguration config) 
    {
        // no-op
    }

    public void UpdateLensState(Dictionary<string, string> lensParams)
    {
        // no-op
    }

    public void DismissCameraKit()
    {
        // no-op
    }
}
