using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraKitAPIEditor : ICameraKit
{
    public void InvokeCameraKit(CameraKitConfiguration config)  
    {
        Debug.Log("InvokeCameraKit::Camera Kit is not available when running from Editor.");
        Debug.Log("When running from mobile, Camera Kit will be invoked with the following options" +
            $"\n Lens Id: {config.LensID}" +
            $"\n Group Id: {config.LensGroupID}" +
            $"\n Render Mode: {config.RenderMode}" +
            $"\n Remote API Spec: {config.RemoteAPISpecId}" +
            $"\n LaunchParameters: {config.LaunchParameters}");
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
