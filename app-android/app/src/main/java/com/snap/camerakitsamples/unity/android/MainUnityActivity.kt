package com.snap.camerakitsamples.unity.android

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.Camera
import android.graphics.Color
import android.os.Bundle
import android.util.AttributeSet
import android.util.Log
import android.view.SurfaceView
import android.view.TextureView
import android.view.View
import android.widget.Button
import android.widget.FrameLayout
import android.widget.TextView
import android.widget.ToggleButton
import androidx.appcompat.app.AppCompatActivity
import androidx.core.graphics.component1
import androidx.fragment.app.FragmentActivity
import androidx.fragment.app.add
import androidx.fragment.app.commit
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import com.snap.camerakit.LegalProcessor
import com.snap.camerakit.Session
import com.snap.camerakit.connectOutput
import com.snap.camerakit.lenses.*
import com.snap.camerakit.newBuilder
import com.snap.camerakit.support.app.CameraActivity
import com.snap.camerakit.plugin.OverrideUnityActivity
import com.snap.camerakit.support.camerax.CameraXImageProcessorSource
import com.snap.camerakit.support.widget.CameraLayout
import com.unity3d.player.UnityPlayer
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.invoke
import kotlinx.coroutines.runBlocking

private const val REQUEST_CODE_CAMERA_KIT_CAPTURE = 1
private const val REQUEST_CODE_CAMERA_KIT_PLAY = 2
private const val TAG = "MainUnityActivity"

class MainUnityActivity : AppCompatActivity() {
    lateinit var cameraLayout:CameraLayout
    lateinit var camerakitSession: Session
    val customCameraLifecycle:CameraLifecycleOwner = CameraLifecycleOwner()

    companion object {
        lateinit var instance: MainUnityActivity
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.camkit_unity_layout)


        findViewById<CameraLayout>(R.id.camera_layout).apply {
            val imageProcessor = CameraXImageProcessorSource(this.context, customCameraLifecycle)
            configureSession {
                imageProcessorSource(imageProcessor)
                apiToken("eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNjY2MDIxNTA5LCJzdWIiOiIwMTM2MWYzZi1jNjVlLTQyYWYtYjQ4Yy00MzdlOTUyZTIyYmZ-U1RBR0lOR34zOTU2MmRiMi1mNzUzLTQzODgtYWY0MS05M2Q3YThhMzkyYWQifQ.QWXI1YRWGcLoj4_3gw1B2mUBEx4bomcbO1MnCIfhtJc")
            }
            configureLensesCarousel {
                observedGroupIds = linkedSetOf("726c9036-31bd-4713-804c-e6d1b52cbea1")
            }
            onSessionAvailable { session ->
                camerakitSession = session
            }
        }

        instance = this
    }

    private fun invokeCameraKitAsFullScreen(configuration: CameraActivity.Configuration) {

        //TODO: Implement logic here for full screen invocation

        Log.d(TAG,"Invoking Camera Kit as full screen")
    }

    private fun invokeCameraKitAsPartialView(configuration: CameraActivity.Configuration)
    {

        //TODO: Implement logic here for invocation behind translucent unity view

        Log.d(TAG,"Invoking Camera Kit as a partial")
    }

    fun invokeCameraKit(
        lensId: String?,
        groupId: String?,
        remoteApiSpecId: String?,
        lensLaunchDataKeys: Array<out String>?,
        lensLaunchDataValues: Array<out String>?,
        renderMode: Int,
        cameraMode: Int,
        shutterButtonMode: Int,
        unloadLensAfterDismiss: Boolean
    ) {
        runBlocking {
            Dispatchers.Main.invoke {
                customCameraLifecycle.start()
            }
        }
    }

    fun updateLensState(
        lensLaunchDataKeys: Array<out String>?,
        lensLaunchDataValues: Array<out String>?
    ) {
        //TODO: Implement logic here for responding to pending Remote API

        Log.d(TAG,"Update Lens State")
    }

    fun dismissCameraKit() {
        runBlocking {
            Dispatchers.Main.invoke {
                customCameraLifecycle.stop()
            }
        }
    }

}