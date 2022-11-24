using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class NativeAPIEditor : INativeAPI
{
    public void SpaceshipLanded(int alienShotCount) {
        Debug.Log("Spaceship Landed!");
        Debug.Log("When you're testing on device, Camera Kit will be invoked now");
    }
}
