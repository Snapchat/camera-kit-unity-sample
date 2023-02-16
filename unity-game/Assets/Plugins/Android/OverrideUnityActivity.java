package com.snap.camerakit.plugin;

import android.os.Bundle;
import android.widget.FrameLayout;

import com.unity3d.player.UnityPlayerActivity;

public abstract class OverrideUnityActivity extends UnityPlayerActivity
{
    public static OverrideUnityActivity instance = null;

    abstract protected void invokeCameraKitWithGroup(
        String[] lensGroupIds, 
        String startingLensId,
        int cameraKitMode,
        String remoteApiSpecId);

    abstract protected void invokeCameraKitWithSingleLens(
        String lensId,
        String groupId,
        String[] lensLaunchDataKeys, 
        String[] lensLaunchDataValues, 
        int cameraKitMode,
        String remoteApiSpecId);

    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        instance = this;
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        instance = null;
    }
}