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
        throw new NotImplementedException();
    }
}
#endif