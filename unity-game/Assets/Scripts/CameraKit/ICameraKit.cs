using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public interface ICameraKit 
{
    void InvokeCameraKit(CameraKitConfiguration config);

    void Validate(CameraKitConfiguration config);
}
