using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

[Serializable]
public struct NamedScene 
{
    public string name;
    public BaseAnimation[] animations;
}

public class AnimationManager : MonoBehaviour
{
    [SerializeField]
    private List<NamedScene> _scenes;

    // Start is called before the first frame update
    void Awake()
    {
        PlayScene("Intro");
    }

    public void PlayScene(string sceneName)
    {
        foreach (var namedScene in _scenes) {
            if (namedScene.name == sceneName) {
                PlayScene(namedScene.animations);
                return;
            }
        }
    }

    private void PlayScene(BaseAnimation[] animations, int index = 0) {
        var currentAnimation = animations[index];
        if (index < (animations.Length - 1)) {
            currentAnimation.OnAnimationFinished += () => PlayScene(animations, index+1);
        } 
        currentAnimation.Play();
    }
}
