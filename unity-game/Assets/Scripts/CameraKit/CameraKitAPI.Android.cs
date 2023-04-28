#if UNITY_ANDROID
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

public class CameraKitAPIAndroid : ICameraKit
{
    public CameraKitAPIAndroid() {
        
    }

    public void InvokeCameraKit(CameraKitConfiguration config) {
        string[] launchDataKeys = new string[0];
        string[] launchDataValues = new string[0];

        if (config.LaunchParameters != null) {
            launchDataKeys = new List<string>(config.LaunchParameters.Keys).ToArray();
            launchDataValues = new List<string>(config.LaunchParameters.Values).ToArray();
        }
        
        callNativeJavaMethod(
            "invokeCameraKit", 
            config.LensID, 
            config.LensGroupID, 
            launchDataKeys, 
            launchDataValues, 
            (int) config.RenderMode, 
            config.RemoteAPISpecId
        );
    }

    public void Validate(CameraKitConfiguration config)
    {
        throw new System.NotImplementedException("Validate is not implemented on Camera Kit Android");
    }

    public void UpdateLensState(Dictionary<string, string> lensParams)
    {
        throw new System.NotImplementedException("Update Lens State is not implemented on Camera Kit Android");
    }

    public void DismissCameraKit()
    {
        throw new System.NotImplementedException("Dismiss Camera Kit is not implemented on Camera Kit Android");
    }

    private void callNativeJavaMethod(string methodName, params object[] args)
    {
        AndroidJavaClass jc = new AndroidJavaClass("com.snap.camerakit.plugin.OverrideUnityActivity");
        AndroidJavaObject overrideActivity = jc.GetStatic<AndroidJavaObject>("instance");
        overrideActivity.Call(methodName, args);        
    }
}
#endif