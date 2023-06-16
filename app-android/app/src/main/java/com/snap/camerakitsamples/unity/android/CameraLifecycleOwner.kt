package com.snap.camerakitsamples.unity.android

import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LifecycleRegistry

class CameraLifecycleOwner : LifecycleOwner {
    private var lifecycleRegistry:LifecycleRegistry = LifecycleRegistry(this)

    init {
        lifecycleRegistry.currentState = Lifecycle.State.CREATED
    }

    public fun start() {
        lifecycleRegistry.currentState = Lifecycle.State.STARTED
    }

    public fun stop() {
        lifecycleRegistry.currentState = Lifecycle.State.DESTROYED
    }

    public fun resume() {
        lifecycleRegistry.currentState = Lifecycle.State.RESUMED
    }

    public fun initialize() {
        lifecycleRegistry.currentState = Lifecycle.State.INITIALIZED
    }

    override fun getLifecycle(): Lifecycle {
        return lifecycleRegistry
    }


}