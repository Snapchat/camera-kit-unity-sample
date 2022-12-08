using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraKitAPIEditor : ICameraKit
{
    public void InvokeCameraKit(CameraKitConfiguration config)  {
        Debug.Log("When you're testing on device, Camera Kit will be invoked now");
        if (config.GetType() == typeof(CameraKitConfiguration.LensGroupsConfig)) {
            Debug.Log("...Invoking Camera Kit with lens group ids ");
        }
        else if (config.GetType() == typeof(CameraKitConfiguration.LensSingleConfig)) {
            Debug.Log("...Invoking Camera Kit with a single lens");
        }
    }

    public void Validate(CameraKitConfiguration config) 
    {

    }
}
