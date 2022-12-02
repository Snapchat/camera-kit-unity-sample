using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public static class CameraKit
{
    private static ICameraKit _nativeBridge;

    static CameraKit() {
#if UNITY_IOS && !UNITY_EDITOR
        _nativeBridge = new CameraKitAPIiOS();
#elif UNITY_ANDROID && !UNITY_EDITOR
        _nativeBridge = new CameraKitAPIAndroid();
#else
        _nativeBridge = new CameraKitAPIEditor();
#endif
    }

    public static void InvokeCameraKit(CameraKitConfiguration config)
    {
        config.Validate();

        string[] launchDataKeys = new string[0];
        string[] launchDataValues = new string[0];
        if (config.LensLaunchData != null) {
            launchDataKeys = new List<string>(config.LensLaunchData.Keys).ToArray();
            launchDataValues = new List<string>(config.LensLaunchData.Values).ToArray();
        }
        _nativeBridge.InvokeCameraKit(config.LensGroupIDs.ToArray(), config.StartWithSelectedLensID, launchDataKeys, launchDataValues, (int) config.CameraMode);
    }
}

