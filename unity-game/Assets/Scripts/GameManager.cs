using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;
using System;

public class GameManager : MonoBehaviour
{
    public GameObject enemy;
    public GameObject earth;
    public TextMeshProUGUI alienCounter;
    public TextMeshProUGUI pauseLabel;
    public Sprite UFOSprite;
    public Sprite SatelliteSprite;
    public Sprite InvaderSprite;
    public SpriteRenderer EnemyRenderer;

    private int _shotsOnAlien;


    public static GameManager Instance { get; private set; }

    void Awake()
    {
        _shotsOnAlien = 0;

        if (Instance != null) {
        Debug.LogError("There is more than one instance!");
        return;
        }

        Instance = this;
    }

    void OnEnable()
    {   
        // --- Listening to response callback from CameraKit's Remote APIs  ---
        CameraKitHandler.OnResponseFromLensEvent += OnCameraKitResponse;
    }

    void OnDisable() 
    {
        CameraKitHandler.OnResponseFromLensEvent -= OnCameraKitResponse;
    }

    private void InvokeCameraKit()
    {
        // --- Configuring CameraKit ---
        // In order to pass launchData to the Lens, the Lens needs to be built to interpret it 
        // The source code for the lens used in this project is part of the Github project. 
        // Please check the ParamsManager.js script in the lens included in this repository.
        // More info: https://docs.snap.com/lens-studio/references/guides/distributing/snap-kit/  
        var launchData = new Dictionary<string, string>() {
            { "shotsOnInvader", _shotsOnAlien.ToString() }
        };
        var lensId = "89203528-8b0d-41df-9cd2-cf754f393f75";
        var groupId = "42947d70-639e-4349-bd36-6ea9617060d6";
        var remoteApiSpecId= "98821e72-0407-4125-be80-89a9c7933631";
        var config = CameraKitConfiguration.CreateWithSingleLens(lensId, groupId, remoteApiSpecId, launchData);
        config.CameraMode = CameraKitConfiguration.CameraKitMode.Capture;

        // --- Invoking CameraKit ---
        CameraKitHandler.InvokeCameraKit(config);
    }

    private void OnCameraKitResponse(SerializedResponseFromLens responseObj)
    {
        // --- Obtaining a response from CameraKit ---
        // In order to pass data from the Lens to the Unity project, your Lens needs to use Remote APIs
        // The source code for the lens used in this project is part of the Github project. 
        // Please check the ShipSelector.js script in the lens included in this repository.
        // More info: https://docs.snap.com/camera-kit/guides/tutorials/communicating-between-lenses-and-app#lens-studio-best-practices-for-remote-apis  
        Debug.Log("Ship selected: "+ responseObj.shipSelected);
        ChangeSpaceshipAppearance(responseObj.shipSelected);
    }

    public void AlienHit() {
        _shotsOnAlien++;
        alienCounter.text = "Shots on Alien: " + _shotsOnAlien;
    }

    public void SpaceshipLanded() {
        Debug.Log("Spaceship Landed");

        InvokeCameraKit();
    }

    private void ChangeSpaceshipAppearance(string appearance)
    {
        switch (appearance) {
            case "UFO": 
                EnemyRenderer.sprite = UFOSprite;
                break;
            case "Satellite": 
                EnemyRenderer.sprite = SatelliteSprite;
                break;
            case "Invader": 
                EnemyRenderer.sprite = InvaderSprite;
                break;
            default:
                break;
        }
    }

    void OnApplicationFocus(bool hasFocus)
    {
        pauseLabel.gameObject.SetActive(!hasFocus);
    }

    void OnApplicationPause(bool pauseStatus) {
        pauseLabel.gameObject.SetActive(pauseStatus);     
    }
}
