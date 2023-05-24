using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public interface ICameraKit 
{
    void InvokeCameraKit(CameraKitConfiguration config);

    void Validate(CameraKitConfiguration config);

    void UpdateLensState(Dictionary<string, string> lensState);

    void DismissCameraKit();
}
