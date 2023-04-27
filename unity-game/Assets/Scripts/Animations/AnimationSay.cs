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
        _text.gameObject.SetActive(true);
        _text.text = "";
        StartCoroutine(TypewriterText());
    }

    private IEnumerator TypewriterText() {
        foreach (char c in _whatToSay) {
            _text.text += c;
            yield return new WaitForSeconds(0.02f);
        }
        Finished();
    }

}
