using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class GameManager : MonoBehaviour
{
    public GameObject enemy;
    public GameObject earth;
    public TextMeshProUGUI alienCounter;
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
        NativeAPI.SpaceshipLanded(_shotsOnAlien);
    }
}
