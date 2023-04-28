using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public enum CameraKitRenderMode {
    Fullscreen = 0,
    BehindUnity = 1,
}

public class CameraKitConfiguration 
{
    public CameraKitRenderMode RenderMode;
    public string RemoteAPISpecId;
    public string LensID;
    public string LensGroupID;
    public Dictionary<string, string> LaunchParameters;    
}
