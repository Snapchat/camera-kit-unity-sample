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
        _nativeBridge.Validate(config);
        _nativeBridge.InvokeCameraKit(config);
    }
}

