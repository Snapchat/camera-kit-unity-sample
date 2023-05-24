using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class AnimationShowButtons : BaseAnimation
{
    [SerializeField]
    private GameObject[] _buttons;

    [SerializeField]
    private bool _visible;

    public override void Play()
    {
        StartCoroutine(ShowButtons());
    }

    private IEnumerator ShowButtons() {
        yield return new WaitForSeconds(0.3f);
        
        foreach (var button in _buttons) {
            button.gameObject.SetActive(_visible);
            yield return new WaitForSeconds(0.3f);
        }

        Finished();
    }
}
