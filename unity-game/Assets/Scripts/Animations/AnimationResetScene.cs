using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class AnimationResetScene : BaseAnimation
{
    [SerializeField]
    private GameObject _speechBubble;

    [SerializeField]
    private GameObject _mainAvatar;

    [SerializeField]
    private Vector2 _avatarStartPosition;

    void OnEnable() {
        _mainAvatar.transform.position = new Vector3(_avatarStartPosition.x, _avatarStartPosition.y, 0);
        _speechBubble.gameObject.SetActive(false);
    }

    public override void Play() {
        Finished();
    }
}
