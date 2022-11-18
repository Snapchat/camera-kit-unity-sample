#if UNITY_IOS
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Runtime.InteropServices;

public class NativeAPIiOS : INativeAPI
{
    public NativeAPIiOS() {

    }

    [DllImport("__Internal")]
    static extern void invokeCameraKit(int alienShotCount);

    public void SpaceshipLanded(int alienShotCount) {
        Debug.Log("Sending message from Unity to iOS ");
        Debug.Log("Alien shot count " + alienShotCount);
        invokeCameraKit(alienShotCount);
    }
}
#endif