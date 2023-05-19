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

    private string _activeLensId;

    private AnimationSay _animationSay;

    void Awake()
    {
       if (Instance != null) {
        Debug.LogError("There is more than one instance!");
        return;
        }

        Instance = this;

        _animationSay = GetComponent<AnimationSay>();
    }

    void OnEnable()
    {   
        // --- Listening to response callback from CameraKit's Remote APIs  ---
        CameraKitHandler.OnResponseFromLensEvent += OnLensDataSentToUnity;
        CameraKitHandler.OnCaptureFinished += OnCameraKitCaptured;
        CameraKitHandler.OnCameraDismissed += OnCameraKitDismissed;
        CameraKitHandler.OnLensRequestedUpdatedState += OnLensRequestedState;
    }

    void OnDisable() 
    {
        CameraKitHandler.OnResponseFromLensEvent -= OnLensDataSentToUnity;
        CameraKitHandler.OnCaptureFinished -= OnCameraKitCaptured;
        CameraKitHandler.OnCameraDismissed -= OnCameraKitDismissed;
        CameraKitHandler.OnLensRequestedUpdatedState -= OnLensRequestedState;
    }

    private void InvokeCameraKit_MaskLens(string mask)
    {
        var config = new CameraKitConfiguration()
        {
            LensID = Constants.LENS_ID_MASK_TRYON,
            LensGroupID = Constants.LENS_GROUP_ID,
            RenderMode = CameraKitRenderMode.Fullscreen,
            StartWithCamera = CameraKitDevice.FrontCamera,
            ShutterButtonMode = CameraKitShutterButtonMode.On,
            LaunchParameters = new Dictionary<string, string>() {
                {"selectedMask", mask}
            },
            UnloadLensAfterDismiss = false
        };
        CameraKitHandler.InvokeCameraKit(config);
    }

    private void InvokeCameraKit_CoinsLens()
    {
        var config = new CameraKitConfiguration()
        {
            LensID = Constants.LENS_ID_COLLECT_COINS,
            LensGroupID = Constants.LENS_GROUP_ID,
            RemoteAPISpecId = Constants.API_SPEC_ID,
            RenderMode = CameraKitRenderMode.BehindUnity,
            StartWithCamera = CameraKitDevice.BackCamera,
            ShutterButtonMode = CameraKitShutterButtonMode.Off,
            UnloadLensAfterDismiss = true
        };
        CameraKitHandler.InvokeCameraKit(config);
    }

    private void InvokeCameraKit_PhysicsLens()
    {
        var config = new CameraKitConfiguration()
        {
            LensID = Constants.LENS_ID_PHYSICS,
            LensGroupID = Constants.LENS_GROUP_ID,
            RemoteAPISpecId = Constants.API_SPEC_ID,
            RenderMode = CameraKitRenderMode.BehindUnity,
            StartWithCamera = CameraKitDevice.BackCamera,
            ShutterButtonMode = CameraKitShutterButtonMode.Off,
            UnloadLensAfterDismiss = true
        };
        CameraKitHandler.InvokeCameraKit(config);        
    }

    private void OnLensDataSentToUnity(SerializedResponseFromLens responseObj)
    {
        // --- Obtaining a response from CameraKit ---
        // In order to pass data from the Lens to the Unity project, your Lens needs to use Remote APIs
        // The source code for the lens used in this project is part of the Github project. 
        // Please check the ShipSelector.js script in the lens included in this repository.
        // More info: https://docs.snap.com/camera-kit/guides/tutorials/communicating-between-lenses-and-app#lens-studio-best-practices-for-remote-apis  
        if (_activeLensId == Constants.LENS_ID_COLLECT_COINS) {
            // For the purposes of this demo, the only time we're responding to 
            // Lens events is when the coin collection lens is active
            CollectCoinsHandleEnvet(responseObj);
        }
    }

    private void DismissCameraKit()
    {
        CameraKitHandler.DismissCameraKit();
    }

    private void OnCameraKitCaptured(string capturedFileUri)
    {
        // This handles the event of when media is captured in Camera Kit
        animationManager.PlayScene("MediaCaptured");
        _activeLensId = null;
    }

    private void OnCameraKitDismissed()
    {
        // This is triggered every time Camera Kit is dismissed
        _activeLensId = null;
    }

    private void OnLensRequestedState() {
        // This is triggered every time Camera Kit requests an updated state
        
        // (no-op. leave request open until we're ready to update state)
    }

    #region Pause Events
    void OnApplicationFocus(bool hasFocus)
    {
        pauseLabel.gameObject.SetActive(!hasFocus);
    }

    void OnApplicationPause(bool pauseStatus) {
        pauseLabel.gameObject.SetActive(pauseStatus);     
    }
    #endregion

    #region Physics Lens Tutorial
    
    public void OnControllerButtonPressed() {
        CameraKitHandler.UpdateLensState(new Dictionary<string, string>() {
            {LensEvents.BUTTON_PRESS, "true"}
        });
    }

    public void OnControllerButtonReleased() {
        CameraKitHandler.UpdateLensState(new Dictionary<string, string>() {
            {LensEvents.BUTTON_PRESS, "false"}
        });
    }

    public void OnResetButtonTapped() {
        CameraKitHandler.UpdateLensState(new Dictionary<string, string>() {
            {LensEvents.RESET_SCENE, "true"}
        });
    }

    #endregion

    #region Coin Collection Tutorial

    private bool _hasGrabbedCoinOnce;
    private bool _hasDepositedCoinOnce;
    private int _coinsDeposited;
    
    private void CoinLens_HandDetectedEvent() {
        
        if (!_hasGrabbedCoinOnce)
        {
            _animationSay.Play("Great! Now try to grab the coin with your virtual hand.");
        }
    }

    private void CoinLens_DepositedEvent() {
        _coinsDeposited++;
        _hasDepositedCoinOnce = true;
        _animationSay.Play("You got a new coin. Your total is: " + _coinsDeposited);
    }

    private void CoinLens_GrabbedEvent() {
        _hasGrabbedCoinOnce = true;
        if (!_hasDepositedCoinOnce)
        {
            _animationSay.Play("Now try to release the coin in the red backpack.");
        }
    }

    private void CoinLens_HandLostEvent() {
        if (!_hasGrabbedCoinOnce)
        {
            _animationSay.Play("Try showing your hand to the camera");
        }
    }

    private void ResetCoinCollectTutorial()
    {
        _hasGrabbedCoinOnce = false;
        _hasDepositedCoinOnce = false;
        _coinsDeposited = 0;
    }

    private void CollectCoinsHandleEnvet(SerializedResponseFromLens eventObj) {
        switch(eventObj.eventName) {
            case LensEvents.HAND_DETECTED:
                CoinLens_HandDetectedEvent();
                break;
            case LensEvents.HAND_LOST:
                CoinLens_HandLostEvent();
                break;
            case LensEvents.COIN_DEPOSITED:
                CoinLens_DepositedEvent();
                break;
            case LensEvents.COIN_GRABBED:
                CoinLens_GrabbedEvent();
                break;
        }
    }

    #endregion

    #region Button Handlers 
    public void OnMaskTryOnSelected() {
        animationManager.PlayScene("ShowMasks");
    }

    public void OnCollectCoinsSelected()
    {
        animationManager.PlayScene("StartCollectCoinsLens");        
        InvokeCameraKit_CoinsLens();
        ResetCoinCollectTutorial();
        _activeLensId = Constants.LENS_ID_COLLECT_COINS;
    }

    public void OnPhysicsLensSelected()
    {
        animationManager.PlayScene("StartPhysicsLens");        
        InvokeCameraKit_PhysicsLens();
        _activeLensId = Constants.LENS_ID_PHYSICS;
    }

    public void OnMaskSelected(string mask)
    {
        InvokeCameraKit_MaskLens(mask);
        _activeLensId = Constants.LENS_ID_MASK_TRYON;
    }

    public void OnCloseButtonClicked() 
    {
        animationManager.PlayScene("LensClosed");
        CameraKitHandler.DismissCameraKit();
        _activeLensId = null;
    }


    #endregion
}
