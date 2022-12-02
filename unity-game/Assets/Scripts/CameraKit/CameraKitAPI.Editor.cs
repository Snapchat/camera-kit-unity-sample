using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraKitAPIEditor : ICameraKit
{
    public void InvokeCameraKit(
        string[] lensGroupIds, 
        string startingLensId, 
        string[] lensLaunchDataKeys, 
        string[] lensLaunchDataValues, 
        int cameraKitMode
    ) {
        Debug.Log("When you're testing on device, Camera Kit will be invoked now");
        Debug.Log(string.Format("Params: Group IDs {0}, startingLensId {1}, dataKeys: {2}, dataValues: {3}, mode: {4} ", lensGroupIds, startingLensId, lensLaunchDataKeys, lensLaunchDataValues, cameraKitMode));
    }
}
