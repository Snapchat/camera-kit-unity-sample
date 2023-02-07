using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public abstract class CameraKitConfiguration 
{
    private CameraKitConfiguration() {}

    public enum CameraKitMode {
        Play = 0,
        Capture = 1,
    }

    public CameraKitMode CameraMode;
    public string RemoteAPISpecId;

    public class LensGroupsConfig : CameraKitConfiguration {        
        public List<string> LensGroupIDs;
        public string StartWithSelectedLensID;
    }

    public class LensSingleConfig : CameraKitConfiguration{
        public string LensID;
        public string GroupID;
        public Dictionary<string, string> LensLaunchData;
    }

    public static LensGroupsConfig CreateWithLensGroups(List<string> lensGroupIds, string startingLensId, string remoteApiSpecId)
    {
        var config = new LensGroupsConfig();
        config.LensGroupIDs = lensGroupIds;
        config.StartWithSelectedLensID = startingLensId;
        config.RemoteAPISpecId = remoteApiSpecId;
        return config;
    }

    public static LensSingleConfig CreateWithSingleLens(string lensId, string groupID, string remoteApiSpecId, Dictionary<string, string> lensLaunchData) 
    {
        var config = new LensSingleConfig();
        config.LensLaunchData = lensLaunchData;
        config.LensID = lensId;
        config.GroupID = groupID;
        config.RemoteAPISpecId = remoteApiSpecId;
        return config;
    }   

    
}
