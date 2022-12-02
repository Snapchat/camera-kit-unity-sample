using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public interface ICameraKit 
{
    void InvokeCameraKit(
        string[] lensGroupIds, 
        string startingLensId, 
        string[] lensLaunchDataKeys, 
        string[] lensLaunchDataValues, 
        int cameraKitMode
    );
}
