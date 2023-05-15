using System;
using UnityEngine;

public class BaseAnimation: MonoBehaviour 
{
    public virtual void Play() {}
    public event Action OnAnimationFinished;
    protected virtual void Finished() {
        if (OnAnimationFinished != null) {
            OnAnimationFinished.Invoke();
            OnAnimationFinished = null; // only invoke the callback once
        }
    }
}
