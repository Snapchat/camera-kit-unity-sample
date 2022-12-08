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
        if (config.GetType() == typeof(CameraKitConfiguration.LensGroupsConfig)) {
            var castConfig = (CameraKitConfiguration.LensGroupsConfig)config;
            var lensGroupIds = castConfig.LensGroupIDs.ToArray();
            var startingLensId = castConfig.StartWithSelectedLensID;
            var cameraMode = castConfig.CameraMode;

            callNativeJavaMethod("invokeCameraKitWithGroup", lensGroupIds, startingLensId, (int) cameraMode);
        }
        else if (config.GetType() == typeof(CameraKitConfiguration.LensSingleConfig)) {
            var castConfig = (CameraKitConfiguration.LensSingleConfig)config;
            var startingLensId = castConfig.LensID;
            var cameraMode = castConfig.CameraMode;
            var groupId = castConfig.GroupID;
            string[] launchDataKeys = new string[0];
            string[] launchDataValues = new string[0];
            if (castConfig.LensLaunchData != null) {
                launchDataKeys = new List<string>(castConfig.LensLaunchData.Keys).ToArray();
                launchDataValues = new List<string>(castConfig.LensLaunchData.Values).ToArray();
            }
            
            callNativeJavaMethod("invokeCameraKitWithSingleLens", startingLensId, groupId, launchDataKeys, launchDataValues, (int) cameraMode);
        }
    }

    public void Validate(CameraKitConfiguration config)
    {

    }

    private void callNativeJavaMethod(string methodName, params object[] args)
    {
        AndroidJavaClass jc = new AndroidJavaClass("com.snap.samples.OverrideUnityActivity");
        AndroidJavaObject overrideActivity = jc.GetStatic<AndroidJavaObject>("instance");
        overrideActivity.Call(methodName, args);        
    }
}
#endif