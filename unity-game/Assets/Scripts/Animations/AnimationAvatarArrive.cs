using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;
using UnityEngine.UI;

public class AnimationAvatarArrive : BaseAnimation
{
    [SerializeField]
    private SpriteRenderer _avatar;
    [SerializeField]
    private float _startPosition;
    [SerializeField]
    private float _endPosition;
    [SerializeField]
    private float _speed;

    void Awake()
    {

    }

    override public void Play()
    {
        var startPos = new Vector3(_startPosition, _avatar.transform.position.y, 0);
        var endPos = new Vector3(_endPosition, _avatar.transform.position.y, 0);
        StartCoroutine(MoveFromTo(startPos, endPos, _speed));
    }

    IEnumerator MoveFromTo(Vector3 a, Vector3 b, float speed) {
        float step = (speed / (a - b).magnitude) * Time.fixedDeltaTime;
        float t = 0;
        while (t <= 1.0f) {
            t += step; // Goes from 0 to 1, incrementing by step each time
            _avatar.transform.position = Vector3.Lerp(a, b, t); // Move objectToMove closer to b
            yield return new WaitForFixedUpdate();         // Leave the routine and return here in the next frame
        }
        _avatar.transform.position = b;
        yield return new WaitForSeconds(0.5f);
        Finished();
    }


}
