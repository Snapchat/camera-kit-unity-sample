using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraKitConfiguration 
{
    public enum CameraKitMode {
        Play = 0,
        Capture = 1,
    }

    public List<string> LensGroupIDs;
    public Dictionary<string, string> LensLaunchData;
    public string StartWithSelectedLensID; 
    public CameraKitMode CameraMode;

    public void Validate() {
        if (LensGroupIDs == null || LensGroupIDs.Count == 0) {
            throw new System.Exception("You need to provide Lens Group IDs");
        }
    } 
}
