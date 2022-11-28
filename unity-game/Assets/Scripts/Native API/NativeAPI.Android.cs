#if UNITY_ANDROID
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

public class NativeAPIAndroid : INativeAPI
{
    public NativeAPIAndroid() {
        
    }

    public void SpaceshipLanded(int alienShotCount) {
        try
        {
            AndroidJavaClass jc = new AndroidJavaClass("com.snap.samples.OverrideUnityActivity");
            AndroidJavaObject overrideActivity = jc.GetStatic<AndroidJavaObject>("instance");
            overrideActivity.Call("invokeCameraKit", alienShotCount);
        } catch(Exception e)
        {
            throw new Exception ("Exception during NativeAPIAndroid.SpaceshipLanded: " + e.Message);
        }
    }
}
#endif