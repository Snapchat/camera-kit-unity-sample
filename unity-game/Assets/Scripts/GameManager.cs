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

    private void OnCameraKitAPIResponse(SerializedResponseFromLens responseObj)
    {
        // --- Obtaining a response from CameraKit ---
        // In order to pass data from the Lens to the Unity project, your Lens needs to use Remote APIs
        // The source code for the lens used in this project is part of the Github project. 
        // Please check the ShipSelector.js script in the lens included in this repository.
        // More info: https://docs.snap.com/camera-kit/guides/tutorials/communicating-between-lenses-and-app#lens-studio-best-practices-for-remote-apis  
        Debug.Log("Got response from lens: Event " + responseObj.eventName + "( "+ responseObj.eventValue+" )");
        if (_activeLensId == Constants.LENS_ID_COLLECT_COINS) {
            CollectCoinsHandleEnvet(responseObj);
        } else if (_activeLensId == Constants.LENS_ID_INK_SPLASH) {
            InkSplashHandleEvent(responseObj);
        }
    }

    private void DismissCameraKit()
    {
        CameraKitHandler.DismissCameraKit();
    }

    private void OnCameraKitCaptured(string capturedFileUri)
    {
        animationManager.PlayScene("MediaCaptured");
    }

    private void OnCameraKitDismissed()
    {
        Debug.Log("Camera Kit dismissed.");
    }

    private void OnLensRequestedState() {
        //no-op
        // leave request open until we're ready to update state
    }

    void OnApplicationFocus(bool hasFocus)
    {
        pauseLabel.gameObject.SetActive(!hasFocus);
    }

    void OnApplicationPause(bool pauseStatus) {
        pauseLabel.gameObject.SetActive(pauseStatus);     
    }

    #region Ink Splash Tutorial
    void InkSplashHandleEvent(SerializedResponseFromLens eventObj)
    {

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

    public void OnCollectCoinsSelected() {
        animationManager.PlayScene("StartCollectCoinsLens");
        var config = new CameraKitConfiguration() {
            LensGroupID = Constants.LENS_GROUP_ID,
            LensID = Constants.LENS_ID_COLLECT_COINS,
            RenderMode = CameraKitRenderMode.BehindUnity,     
            StartWithCamera = CameraKitDevice.BackCamera,
            RemoteAPISpecId = Constants.API_SPEC_ID
        };

        CameraKitHandler.InvokeCameraKit(config);

        _activeLensId = Constants.LENS_ID_COLLECT_COINS;
        ResetCoinCollectTutorial();
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
