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
        // --- Configuring CameraKit ---
        // In order to pass launchData to the Lens, the Lens needs to be built to interpret it 
        // The source code for the lens used in this project is part of the Github project. 
        // Please check the ParamsManager.js script in the lens included in this repository.
        // More info: https://docs.snap.com/lens-studio/references/guides/distributing/snap-kit/  
        var launchData = new Dictionary<string, string>() { };
        // var lensId = "24a3242e-661f-47e6-852f-2d3cd5028370"; // DEFAULT
        // // var lensId = "bbb0bd20-1598-47bb-9f4e-886b0186df7c"; // SURTUR - original
        // var groupId = "42947d70-639e-4349-bd36-6ea9617060d6";

        var lensId = "57988410875";
        var groupId = "5701736840822784";
        var remoteApiSpecId= "98821e72-0407-4125-be80-89a9c7933631";
        var config = CameraKitConfiguration.CreateWithSingleLens(lensId, groupId, remoteApiSpecId, launchData);
        config.CameraMode = CameraKitConfiguration.CameraKitMode.Capture;

        // --- Invoking CameraKit ---
        CameraKitHandler.InvokeCameraKit(config);
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
        Debug.Log("Mask selected " + mask);
    } 


    #endregion
}
