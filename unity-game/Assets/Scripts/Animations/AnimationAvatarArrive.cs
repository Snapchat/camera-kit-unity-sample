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
        Debug.Log("Avatar Arrive playing...");
        var startPos = new Vector3(_startPosition, -1.99f, 0);
        var endPos = new Vector3(_endPosition, -1.99f, 0);
        StartCoroutine(MoveFromTo(startPos, endPos, _speed));
    }

    IEnumerator MoveFromTo(Vector3 a, Vector3 b, float speed) {
        Debug.Log("Started coroutine");
        float step = (speed / (a - b).magnitude) * Time.fixedDeltaTime;
        float t = 0;
        while (t <= 1.0f) {
            t += step; // Goes from 0 to 1, incrementing by step each time
            _avatar.transform.position = Vector3.Lerp(a, b, t); // Move objectToMove closer to b
            yield return new WaitForFixedUpdate();         // Leave the routine and return here in the next frame
        }
        _avatar.transform.position = b;
        Finished();
    }


}
