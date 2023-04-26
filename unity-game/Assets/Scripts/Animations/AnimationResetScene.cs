using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class AnimationResetScene : BaseAnimation
{
    [SerializeField]
    private GameObject _speechBubble;

    [SerializeField]
    private GameObject _mainAvatar;

    void OnEnable() {
        _mainAvatar.transform.position = new Vector3(4, -1.99f, 0);
        _speechBubble.gameObject.SetActive(false);
    }

    public override void Play() {
        Finished();
    }
}
