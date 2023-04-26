using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;
using TMPro;

public class AnimationSay : BaseAnimation
{
    [SerializeField]
    private string _whatToSay;

    [SerializeField]
    private bool _mirrorBubble;

    [SerializeField]
    private UnityEngine.UI.Image _bubble;

    [SerializeField]
    private TextMeshProUGUI _text;


    override public void Play()
    {
        _bubble.gameObject.SetActive(true);
        _text.text = _whatToSay;
        _text.gameObject.SetActive(true);
        Finished();
    }

}
