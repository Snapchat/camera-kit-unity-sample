using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraKitConfiguration 
{
    private CameraKitConfiguration() {}

    public enum RenderMode {
        Fullscreen = 0,
        BehindUnity = 1,
    }

    public RenderMode OpenIn;
    public string RemoteAPISpecId;

    public string LensID;

    public List<string> LensGroupID;
    
}
