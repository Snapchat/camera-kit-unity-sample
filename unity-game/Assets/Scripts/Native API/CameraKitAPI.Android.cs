#if UNITY_ANDROID
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

public class CameraKitAPIAndroid : ICameraKit
{
    public CameraKitAPIAndroid() {
        
    }

    public void InvokeCameraKit(
        string[] lensGroupIds, 
        string startingLensId, 
        string[] lensLaunchDataKeys, 
        string[] lensLaunchDataValues, 
        int cameraKitMode
    ) {
        try
        {
            AndroidJavaClass jc = new AndroidJavaClass("com.snap.samples.OverrideUnityActivity");
            AndroidJavaObject overrideActivity = jc.GetStatic<AndroidJavaObject>("instance");
            overrideActivity.Call("invokeCameraKit", lensGroupIds, startingLensId, lensLaunchDataKeys, lensLaunchDataValues, cameraKitMode);
        } catch(Exception e)
        {
            throw new Exception ("Exception during NativeAPIAndroid.InvokeCameraKit: " + e.Message);
        }
    }
}
#endif