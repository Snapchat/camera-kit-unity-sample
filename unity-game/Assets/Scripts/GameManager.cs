using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class GameManager : MonoBehaviour
{
    public GameObject enemy;
    public GameObject earth;
    public TextMeshProUGUI alienCounter;
    public TextMeshProUGUI pauseLabel;

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

    // Update is called once per frame
    void Update()
    {
        
    }

    public void AlienHit() {
        _shotsOnAlien++;
        alienCounter.text = "Shots on Alien: " + _shotsOnAlien;
    }

    public void SpaceshipLanded() {
        Debug.Log("Spaceship Landed");

        // --- Configuring CameraKit ---
        // In order to pass launchData to the Lens, the Lens needs to be built to interpret it 
        // The source code for the lens used in this project is part of the Github project. 
        // Please check the ParamsManager.js script in the lens included in this repository.
        // More info: https://docs.snap.com/lens-studio/references/guides/distributing/snap-kit/        
        var launchData = new Dictionary<string, string> {
            {"shotsOnInvader", _shotsOnAlien.ToString()}
        };
        var lensId = "8e8bfaac-df3f-44fc-87c6-4f28652d54ec";
        var groupId = "42947d70-639e-4349-bd36-6ea9617060d6";
        var config = CameraKitConfiguration.CreateWithSingleLens(lensId, groupId, launchData);
        
        // --- Invoking CameraKit ---
        CameraKit.InvokeCameraKit(config);
    }

    void OnApplicationFocus(bool hasFocus)
    {
        pauseLabel.gameObject.SetActive(!hasFocus);
    }

    void OnApplicationPause(bool pauseStatus) {
        pauseLabel.gameObject.SetActive(pauseStatus);     
    }
}
