#if UNITY_IOS
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Runtime.InteropServices;

public class CameraKitAPIiOS : ICameraKit
{
    public CameraKitAPIiOS() {

    }

    [DllImport("__Internal")]
    static extern void invokeCameraKit(
        string[] lensGroupIds, 
        string startingLensId, 
        string[] lensLaunchDataKeys, 
        string[] lensLaunchDataValues, 
        int cameraKitMode);

    public void InvokeCameraKit(
        string[] lensGroupIds, 
        string startingLensId, 
        string[] lensLaunchDataKeys, 
        string[] lensLaunchDataValues, 
        int cameraKitMode
    ) {
        invokeCameraKit(lensGroupIds, startingLensId, lensLaunchDataKeys, lensLaunchDataValues, cameraKitMode);
    }
}
#endif