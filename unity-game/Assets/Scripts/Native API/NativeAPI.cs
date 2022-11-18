using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public static class NativeAPI
{
    private static INativeAPI _nativeBridge;

    static NativeAPI() {
#if UNITY_IOS && !UNITY_EDITOR
			_nativeBridge = new NativeAPIiOS();
#elif UNITY_ANDROID && !UNITY_EDITOR
			_nativeBridge = new NativeAPIAndroid();
#endif
    }

    public static void SpaceshipLanded(int alienShotCount)
    {
        _nativeBridge.SpaceshipLanded(alienShotCount);
    }
}
