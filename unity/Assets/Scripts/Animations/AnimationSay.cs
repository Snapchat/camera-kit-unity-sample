using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;
using TMPro;

public class AnimationSay : BaseAnimation
{
    [SerializeField]
    public string _whatToSay;

    [SerializeField]
    private bool _mirrorBubble;

    [SerializeField]
    private UnityEngine.UI.Image _bubble;

    [SerializeField]
    private TextMeshProUGUI _text;

    private int _currentCharacterIndex;
    private float _timer;
    private float _delayBetweenCharacters = 0.02f;
    private bool _isPlaying;


    override public void Play()
    {
        _bubble.gameObject.SetActive(true);
        _text.gameObject.SetActive(true);
        SendInterruptSignalToOthers();
        StartAnimating();
    }

    public void Play(string whatToSay) 
    {
        _whatToSay = whatToSay;
        Play();
    }

    void Update()
    {
        if (_isPlaying)
        {
            _timer += Time.deltaTime;

            if (_timer >= _delayBetweenCharacters)
            {
                _text.text = _whatToSay
        .Substring(0, _currentCharacterIndex + 1);
                _currentCharacterIndex++;

                if (_currentCharacterIndex >= _whatToSay
        .Length)
                {
                    _isPlaying = false;
                    Finished();
                }

                _timer = 0f;
            }
        }
    }

    public void StopAnimating()
    {
        _isPlaying = false;
    }

    void StartAnimating() 
    {
        _text.text = "";
        _isPlaying = true;
        _currentCharacterIndex = 0;
        _timer = 0f;
    }
    
    void SendInterruptSignalToOthers()
    {
        AnimationSay[] animationSays = FindObjectsOfType<AnimationSay>();
        foreach (AnimationSay animationSay in animationSays)
        {
            animationSay.StopAnimating();
        }
    }

}
