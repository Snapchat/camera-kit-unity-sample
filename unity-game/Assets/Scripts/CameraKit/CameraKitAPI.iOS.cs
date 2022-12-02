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
        IntPtr lensGroupIds, int lensGroupIdsLength,
        IntPtr lensLaunchDataKeys, int lensLaunchDataKeysLength,
        IntPtr lensLaunchDataValues, int lensLaunchDataValuesLength,
        string startingLensId,
        int cameraKitMode
    );

    public void InvokeCameraKit(
        string[] lensGroupIds, 
        string startingLensId, 
        string[] lensLaunchDataKeys, 
        string[] lensLaunchDataValues, 
        int cameraKitMode
    ) {
        var unsafeptr_LensGroupIds = marshalStringArray(lensGroupIds);
        var unsafeptr_DataKeys = marshalStringArray(lensLaunchDataKeys);
        var unsafeptr_DataValues = marshalStringArray(lensLaunchDataValues);


        invokeCameraKit(
            unsafeptr_LensGroupIds, lensGroupIds.Length, 
            unsafeptr_DataKeys, lensLaunchDataKeys.Length, 
            unsafeptr_DataValues, lensLaunchDataKeys.Length, 
            startingLensId, 
            cameraKitMode);

        CleanUpNativeStrArray(unsafeptr_LensGroupIds, lensGroupIds.Length);
        CleanUpNativeStrArray(unsafeptr_DataKeys, lensLaunchDataKeys.Length);
        CleanUpNativeStrArray(unsafeptr_DataValues, lensLaunchDataKeys.Length);
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