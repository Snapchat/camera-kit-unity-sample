#if UNITY_IOS
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Runtime.InteropServices;
using System;

public class CameraKitAPIiOS : ICameraKit
{
    public CameraKitAPIiOS() {

    }

    [DllImport("__Internal")]
    static extern void invokeCameraKit(
        string lensId,
        string groupId,
        string remoteApiSpecId,
        IntPtr lensLaunchDataKeys, int lensLaunchDataKeysLength,
        IntPtr lensLaunchDataValues, int lensLaunchDataValuesLength,        
        int renderMode,
        int cameraMode,
        int shutterButtonMode,
        int unloadLensAfterDismiss
    );

    [DllImport("__Internal")]
    static extern void updateLensState(
        IntPtr lensLaunchDataKeys, int lensLaunchDataKeysLength,
        IntPtr lensLaunchDataValues, int lensLaunchDataValuesLength
    );
    
    [DllImport("__Internal")]
    static extern void dismissCameraKit();

    public void InvokeCameraKit(CameraKitConfiguration config) {
        string[] launchDataKeys = new string[0];
        string[] launchDataValues = new string[0];
        if (config.LaunchParameters != null) {
            launchDataKeys = new List<string>(config.LaunchParameters.Keys).ToArray();
            launchDataValues = new List<string>(config.LaunchParameters.Values).ToArray();
        }
        var unsafeptr_DataKeys = marshalStringArray(launchDataKeys);
        var unsafeptr_DataValues = marshalStringArray(launchDataValues);

        invokeCameraKit(
            config.LensID,
            config.LensGroupID,
            config.RemoteAPISpecId,
            unsafeptr_DataKeys, launchDataKeys.Length,
            unsafeptr_DataValues, launchDataValues.Length,
            (int)config.RenderMode,
            (int)config.StartWithCamera,
            (int)config.ShutterButtonMode,
            config.UnloadLensAfterDismiss ? 1 : 0
        );

        cleanUpNativeStrArray(unsafeptr_DataKeys, launchDataKeys.Length);
        cleanUpNativeStrArray(unsafeptr_DataValues, launchDataKeys.Length);
        
    }

    public void Validate(CameraKitConfiguration config) {
        
    }

    public void UpdateLensState(Dictionary<string, string> lensParams)
    {
        string[] launchDataKeys = new string[0];
        string[] launchDataValues = new string[0];
        if (lensParams != null) {
            launchDataKeys = new List<string>(lensParams.Keys).ToArray();
            launchDataValues = new List<string>(lensParams.Values).ToArray();
        }
        var unsafeptr_DataKeys = marshalStringArray(launchDataKeys);
        var unsafeptr_DataValues = marshalStringArray(launchDataValues);

        updateLensState(
            unsafeptr_DataKeys, launchDataKeys.Length,
            unsafeptr_DataValues, launchDataValues.Length
        );

        cleanUpNativeStrArray(unsafeptr_DataKeys, launchDataKeys.Length);
        cleanUpNativeStrArray(unsafeptr_DataValues, launchDataKeys.Length);
    }

    public void DismissCameraKit()
    {
        dismissCameraKit();
    }

    private IntPtr marshalStringArray(string[] strArr) {
        IntPtr[] dataArr = new IntPtr[strArr.Length];
        for (int i = 0; i < strArr.Length; i++)
        {
            dataArr[i] = Marshal.StringToCoTaskMemAnsi(strArr[i]);
        }
        IntPtr dataNative = Marshal.AllocCoTaskMem(Marshal.SizeOf(typeof(IntPtr)) * strArr.Length);
        Marshal.Copy(dataArr, 0, dataNative, dataArr.Length);
    
        return dataNative;
    }

    private static void cleanUpNativeStrArray(IntPtr dataPtr, int arraySize)
    {
        var dataPtrArray = new IntPtr[arraySize];
        Marshal.Copy(dataPtr, dataPtrArray, 0, arraySize);
        for (int i = 0; i < arraySize; i++)
        {
            Marshal.FreeCoTaskMem(dataPtrArray[i]);
        }
        Marshal.FreeCoTaskMem(dataPtr);
    }
}
#endif