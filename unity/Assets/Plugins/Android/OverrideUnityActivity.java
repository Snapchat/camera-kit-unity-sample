package com.snap.camerakit.plugin;

import android.os.Bundle;
import android.widget.FrameLayout;

import com.unity3d.player.UnityPlayerActivity;

public abstract class OverrideUnityActivity extends UnityPlayerActivity
{
    public static OverrideUnityActivity instance = null;

    abstract protected void invokeCameraKit(
        String lensId,
        String groupId,
        String remoteApiSpecId,
        String[] lensLaunchDataKeys,
        String[] lensLaunchDataValues, 
        int renderMode,
        int cameraMode,
        int shutterButtonMode,
        int unloadLensAfterDismiss
    );

    abstract protected void updateLensState(
        String[] lensLaunchDataKeys,
        String[] lensLaunchDataValues
    );

    abstract protected void dismissCameraKit();

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