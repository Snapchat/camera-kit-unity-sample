using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class AnimationChangeStage : BaseAnimation
{
    [SerializeField]
    private Texture2D _targetTexture;

    [SerializeField]
    private RawImage _bg;

    [SerializeField]
    private GameObject _buttonsRoot;

    [SerializeField]
    private bool _showButtons;

    [SerializeField]
    private GameObject _xOutButton;

    
    public override void Play() {
        _bg.texture = _targetTexture;
        _buttonsRoot.gameObject.SetActive(_showButtons);
        _xOutButton.gameObject.SetActive(!_showButtons);
        Finished();
    }
}
