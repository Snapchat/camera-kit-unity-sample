package com.snap.camerakitsamples.unity.android

import android.app.Activity
import android.content.Context
import android.content.Intent
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
import com.snap.camerakit.support.widget.CameraLayout
import com.unity3d.player.UnityPlayer

private const val REQUEST_CODE_CAMERA_KIT_CAPTURE = 1
private const val REQUEST_CODE_CAMERA_KIT_PLAY = 2
private const val TAG = "MainUnityActivity"

class MainUnityActivity : AppCompatActivity() {
//    lateinit var unityFragment : UnityPlayerFragment
//    lateinit var camerakitSession : Session
//    lateinit var mUnityPlayer: UnityPlayer;
//    lateinit var fl_forUnity : FrameLayout;

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.camkit_unity_layout)

        invokeCameraKit(
            "\"5f126934-ec0b-4dcf-a270-95b2a5d8b83e\"",
            "726c9036-31bd-4713-804c-e6d1b52cbea1",
            "98821e72-0407-4125-be80-89a9c7933631",
            Array<String>(1) {"selectedMask"},
            Array<String>(1){ "halloween"},
            Constants.RenderMode.FULL_SCREEN.value,
            Constants.Device.FRONT_CAMERA.value,
            Constants.ShutterButtonMode.ON.value,
            unloadLensAfterDismiss = true
        )
    }

//    override fun onCreateView(
//        parent: View?,
//        name: String,
//        context: Context,
//        attrs: AttributeSet
//    ): View? {
//        val view = super.onCreateView(parent, name, context, attrs)
//        mUnityPlayer.requestFocus()
//        mUnityPlayer.windowFocusChanged(true)
//        return view
//    }

//    override fun onStart() {
//        mUnityPlayer.resume()
//        mUnityPlayer.alpha = 0.0f
//        mUnityPlayer.setBackgroundColor(Color.TRANSPARENT)
//        mUnityPlayer.view.alpha = 0.0f
//        mUnityPlayer.view.setBackgroundColor(Color.TRANSPARENT)
//        val unitySurfaceView = findViewById<SurfaceView>(R.id.unitySurfaceView)
//        unitySurfaceView.alpha = 0.0f
//        unitySurfaceView.setBackgroundColor(Color.TRANSPARENT)
//
//        super.onStart()
//    }

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
        findViewById<CameraLayout>(R.id.camera_layout).apply {
            configureSession {
                apiToken("eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNjY2MDIxNTA5LCJzdWIiOiIwMTM2MWYzZi1jNjVlLTQyYWYtYjQ4Yy00MzdlOTUyZTIyYmZ-U1RBR0lOR34zOTU2MmRiMi1mNzUzLTQzODgtYWY0MS05M2Q3YThhMzkyYWQifQ.QWXI1YRWGcLoj4_3gw1B2mUBEx4bomcbO1MnCIfhtJc")
            }
            configureLensesCarousel {
                observedGroupIds = linkedSetOf("726c9036-31bd-4713-804c-e6d1b52cbea1")
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


        //TODO: Implement logic here for dismissing camera kit, leaving only Unity view

        Log.d(TAG,"Dismiss Camera Kit")
    }

}