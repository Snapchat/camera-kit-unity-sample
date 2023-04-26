using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class AnimationManager : MonoBehaviour
{
    [SerializeField]
    private List<BaseAnimation> _animations;

    // Start is called before the first frame update
    void Awake()
    {
        PlayAnimation(0);
    }

    private void PlayAnimation(int index) {
        Debug.Log("Playing animation " + index);
        var currentAnimation = _animations[index];
        if (index < (_animations.Count - 1)) {
            Debug.Log("attaching event handler to " + index + ", so it plays animation " + (index+1));
            currentAnimation.OnAnimationFinished += () => PlayAnimation(index+1);
        } 
        currentAnimation.Play();
    }
}
