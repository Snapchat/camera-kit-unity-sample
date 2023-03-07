using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

public class CameraKitHandler : MonoBehaviour
{	
    private static ICameraKit _nativeBridge;

	public static event Action<SerializedResponseFromLens> OnResponseFromLensEvent;
	public static event Action OnCameraDismissed;
	public static event Action<string> OnCaptureFinished;
	public static event Action OnLensRequestedUpdatedState;
	
	public static bool IsCameraKitShowing {get; private set;}
	
	static CameraKitHandler()
		{
			// try/catch this just in case a user sticks this class on a GameObject in the scene
			try
			{
				// first we see if we already exist in the scene
				var obj = FindObjectOfType<CameraKitHandler>();
				if (obj != null)
					return;

				// create a new GO for our manager. This name is crucial as all native code communicates with this class by its name.
				var managerGO = new GameObject("CameraKitHandler");
				managerGO.AddComponent<CameraKitHandler>();

				DontDestroyOnLoad(managerGO);

				#if UNITY_IOS && !UNITY_EDITOR
				_nativeBridge = new CameraKitAPIiOS();
				#elif UNITY_ANDROID && !UNITY_EDITOR
				_nativeBridge = new CameraKitAPIAndroid();
				#else
				_nativeBridge = new CameraKitAPIEditor();
				#endif
			}
			catch (UnityException)
			{
				Debug.LogWarning(
					"It looks like you have the CameraKitHandler on a GameObject in your scene. It will be added to your scene at runtime automatically for you. Please remove the script from your scene.");
			}
		}

		
		public static void InvokeCameraKit(CameraKitConfiguration config)
		{
			_nativeBridge.Validate(config);
        	_nativeBridge.InvokeCameraKit(config);		
			IsCameraKitShowing = true;
		}

		//--- Camera Kit Message Handlers ---
		// These are are invoked from native code via UnitySendMessage with the method name and GameObject name
		// It's important not to change the GameObject's name (CameraKitHandler), otherwise these methods will not get called.

        public void OnResponseFromLens(string responseJson)
        {
            var response = JsonUtility.FromJson<SerializedResponseFromLens>(responseJson);
			OnResponseFromLensEvent?.Invoke(response);
        }

		public void OnCameraKitDismissed() 
		{
			OnCameraDismissed?.Invoke();
		}

		public void OnCameraKitCaptureResult(string capturedFileUriPath) 
		{
			OnCaptureFinished?.Invoke(capturedFileUriPath);
		}

		public static void DismissCameraKit()
		{
			_nativeBridge.DismissCameraKit();
			IsCameraKitShowing = false;
		}

		public void OnLensRequestedState() {
			OnLensRequestedUpdatedState?.Invoke();
		}

		public static void UpdateLensState(Dictionary<string, string> lensParams)
		{
			_nativeBridge.UpdateLensState(lensParams);
		}

}
