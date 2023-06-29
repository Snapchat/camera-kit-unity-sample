package com.snap.camerakitsamples.unity.android

class Constants {
    enum class RenderMode(val value: Int) {
        FULL_SCREEN(0),
        BEHIND_UNITY(1)
    }

    enum class ShutterButtonMode(val value: Int) {
        OFF(0),
        ON(1),
        ONLY_ON_FRONT_CAMERA(2)
    }

    enum class Device(val value: Int) {
        FRONT_CAMERA(0),
        BACK_CAMERA(1)
    }
}