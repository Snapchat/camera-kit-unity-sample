using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;
using System;

public class GameManager : MonoBehaviour
{
    public AnimationManager animationManager;
    public TextMeshProUGUI pauseLabel;

    public static GameManager Instance { get; private set; }

    void Awake()
    {
       if (Instance != null) {
        Debug.LogError("There is more than one instance!");
        return;
        }

        Instance = this;
    }

    void OnEnable()
    {   
        // --- Listening to response callback from CameraKit's Remote APIs  ---
        CameraKitHandler.OnResponseFromLensEvent += OnCameraKitAPIResponse;
        CameraKitHandler.OnCaptureFinished += OnCameraKitCaptured;
        CameraKitHandler.OnCameraDismissed += OnCameraKitDismissed;
        CameraKitHandler.OnLensRequestedUpdatedState += OnLensRequestedState;
    }

    void OnDisable() 
    {
        CameraKitHandler.OnResponseFromLensEvent -= OnCameraKitAPIResponse;
        CameraKitHandler.OnCaptureFinished -= OnCameraKitCaptured;
        CameraKitHandler.OnCameraDismissed -= OnCameraKitDismissed;
        CameraKitHandler.OnLensRequestedUpdatedState -= OnLensRequestedState;
    }

    public void InvokeCameraKit()
    {
        //....
        // --- Invoking CameraKit ---
        // CameraKitHandler.InvokeCameraKit(config);
    }

    private void OnCameraKitAPIResponse(SerializedResponseFromLens responseObj)
    {
        // --- Obtaining a response from CameraKit ---
        // In order to pass data from the Lens to the Unity project, your Lens needs to use Remote APIs
        // The source code for the lens used in this project is part of the Github project. 
        // Please check the ShipSelector.js script in the lens included in this repository.
        // More info: https://docs.snap.com/camera-kit/guides/tutorials/communicating-between-lenses-and-app#lens-studio-best-practices-for-remote-apis  
        Debug.Log("Camera Kit API Response. Ship selected: "+ responseObj.shipSelected);
    }

    private void DismissCameraKit()
    {
        CameraKitHandler.DismissCameraKit();
    }

    private void OnCameraKitCaptured(string capturedFileUri)
    {
        Debug.Log("Camera Kit captured. File " + capturedFileUri);
    }

    private void OnCameraKitDismissed()
    {
        Debug.Log("Camera Kit dismissed.");
    }

    private void OnLensRequestedState() {
        //no-op
        // leave request open until we're ready to update state
        // in this case, whenever the spaceship is hit
    }

    void OnApplicationFocus(bool hasFocus)
    {
        pauseLabel.gameObject.SetActive(!hasFocus);
    }

    void OnApplicationPause(bool pauseStatus) {
        pauseLabel.gameObject.SetActive(pauseStatus);     
    }

    #region Button Handlers
    public void OnMaskTryOnSelected() {
        animationManager.PlayScene("ShowMasks");
    }

    public void OnCollectCoinsSelected() {
        animationManager.PlayScene("Oops");
    }

    public void OnInkSplashSelected() {
        animationManager.PlayScene("Oops");
    }

    public void OnMaskSelected(string mask) {
        var config = new CameraKitConfiguration() {
            LensGroupID = Constants.LENS_GROUP_ID,
            LensID = Constants.LENS_ID_MASK_TRYON,
            RenderMode = CameraKitRenderMode.Fullscreen,
            LaunchParameters = new Dictionary<string, string>() {
                {"selectedMask", mask}
            }
        };

        CameraKitHandler.InvokeCameraKit(config);
    } 


    #endregion
}
