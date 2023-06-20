package com.snap.camerakitsamples.unity.android

import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LifecycleRegistry

class CameraLifecycleOwner : LifecycleOwner {
    private var lifecycleRegistry:LifecycleRegistry = LifecycleRegistry(this)

    init {
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_CREATE)
    }

    public fun start() {
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_START)
    }

    public fun stop() {
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_STOP)
    }


    override fun getLifecycle(): Lifecycle {
        return lifecycleRegistry
    }


}