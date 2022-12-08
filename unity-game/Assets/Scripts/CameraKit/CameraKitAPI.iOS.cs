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
    static extern void invokeCameraKitWithLensGroups(
        IntPtr lensGroupIds, int lensGroupIdsLength,
        string startingLensId,
        int cameraKitMode
    );

    [DllImport("__Internal")]
    static extern void invokeCameraKitWithSingleLens(
        string startingLensId,
        string groupId,
        IntPtr lensLaunchDataKeys, int lensLaunchDataKeysLength,
        IntPtr lensLaunchDataValues, int lensLaunchDataValuesLength,        
        int cameraKitMode
    );

    public void InvokeCameraKit(CameraKitConfiguration config) {
        var cameraMode = config.CameraMode;

        // Invoking Camera Kit with Lens Groups
        if (config.GetType() == typeof(CameraKitConfiguration.LensGroupsConfig)) {
            var castConfig = (CameraKitConfiguration.LensGroupsConfig)config;
            var lensGroupIds = castConfig.LensGroupIDs.ToArray();
            var unsafeptr_LensGroupIds = marshalStringArray(lensGroupIds);
            var startingLensId = castConfig.StartWithSelectedLensID;

            invokeCameraKitWithLensGroups(
                unsafeptr_LensGroupIds, lensGroupIds.Length,
                startingLensId,
                (int) cameraMode
            );

            CleanUpNativeStrArray(unsafeptr_LensGroupIds, lensGroupIds.Length);

        } 
        // Invoking Camera Kit with Single Lens
        else if (config.GetType() == typeof(CameraKitConfiguration.LensSingleConfig)) {
            var castConfig = (CameraKitConfiguration.LensSingleConfig)config;
            var lensId = castConfig.LensID;
            var groupId = castConfig.GroupID;
            string[] launchDataKeys = new string[0];
            string[] launchDataValues = new string[0];
            if (castConfig.LensLaunchData != null) {
                launchDataKeys = new List<string>(castConfig.LensLaunchData.Keys).ToArray();
                launchDataValues = new List<string>(castConfig.LensLaunchData.Values).ToArray();
            }
            var unsafeptr_DataKeys = marshalStringArray(launchDataKeys);
            var unsafeptr_DataValues = marshalStringArray(launchDataValues);

            invokeCameraKitWithSingleLens(
                lensId,
                groupId,
                unsafeptr_DataKeys, launchDataKeys.Length,
                unsafeptr_DataValues, launchDataValues.Length,
                (int)cameraMode
            );

            CleanUpNativeStrArray(unsafeptr_DataKeys, launchDataKeys.Length);
            CleanUpNativeStrArray(unsafeptr_DataValues, launchDataKeys.Length);
        }
    }

    public void Validate(CameraKitConfiguration config) {
        if (config.CameraMode == CameraKitConfiguration.CameraKitMode.Play) {
            Debug.Log("CameraKit: iOS does not support CameraKitMode.Play");
        }
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

    private static void CleanUpNativeStrArray(IntPtr dataPtr, int arraySize)
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