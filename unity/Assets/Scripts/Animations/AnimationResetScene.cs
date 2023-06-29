using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class AnimationResetScene : BaseAnimation
{
    [SerializeField]
    private GameObject _speechBubble;

    [SerializeField]
    private GameObject _mainAvatar;

    [SerializeField]
    private Vector2 _avatarStartPosition;

    [SerializeField]
    private GameObject _buttonsParent;

    void OnEnable() {
        _mainAvatar.transform.position = new Vector3(_avatarStartPosition.x, _avatarStartPosition.y, 0);
        _speechBubble.gameObject.SetActive(false);
        var allButtons = _buttonsParent.GetComponentsInChildren<Button>();
        foreach (var child in allButtons) {
            if (child != _buttonsParent.transform) {
                child.gameObject.SetActive(false);
            }
        }
    }

    public override void Play() {
        Finished();
    }
}
