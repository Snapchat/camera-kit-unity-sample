package com.snap.camerakitsamples.unity.android

import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.core.graphics.component1
import com.snap.camerakit.support.app.CameraActivity
import com.snap.samples.OverrideUnityActivity
import com.unity3d.player.UnityPlayer

private const val REQUEST_CODE_CAMERA_KIT_CAPTURE = 1
private const val REQUEST_CODE_CAMERA_KIT_PLAY = 2
private const val TAG = "MainUnityActivity"

class MainUnityActivity : OverrideUnityActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val intent = intent
        handleIntent(intent)
//        setInstance(this)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
        setIntent(intent)
    }

    private fun handleIntent(intent: Intent?) {
        if (intent == null || intent.extras == null) return
        if (intent.extras!!.containsKey("doQuit")) if (mUnityPlayer != null) {
            finish()
        }
    }

    override fun invokeCameraKitWithGroup(
        lensGroupIds: Array<String>,
        startingLensId: String?,
        cameraKitMode: Int,
        remoteApiSpecId: String?
        ) {
        val cameraKitConfig = CameraActivity.Configuration.WithLenses(
            lensGroupIds,
            startingLensId
        )
        invokeCameraKit(cameraKitMode, remoteApiSpecId, cameraKitConfig)
    }

    private fun invokeCameraKit(
        cameraKitMode: Int,
        remoteApiSpecId: String?,
        cameraKitConfig: CameraActivity.Configuration
    ) {
        val (requestCode) = if (cameraKitMode == 0) {
            REQUEST_CODE_CAMERA_KIT_PLAY
        } else {
            REQUEST_CODE_CAMERA_KIT_CAPTURE
        }
        remoteApiSpecId?.let { UnityGenericApiService.Factory.supportedApiSpecIds = setOf(it) }
        val intent = CustomCameraActivity.intentFor(this, cameraKitConfig, cameraKitMode);
        startActivityForResult(intent, requestCode)
    }

    override fun invokeCameraKitWithSingleLens(
        lensId: String,
        groupId: String,
        lensLaunchDataKeys: Array<String>?,
        lensLaunchDataValues: Array<String>?,
        cameraKitMode: Int,
        remoteApiSpecId: String?
    ) {
        val cameraKitConfig = CameraActivity.Configuration.WithLens(
            lensId,
            groupId,
            true,
            {
                if (lensLaunchDataKeys != null && lensLaunchDataValues != null) {
                    for (i in lensLaunchDataKeys.indices) {
                        this.putString(lensLaunchDataKeys[i], lensLaunchDataValues[i]);
                    }
                }
            }
        )
        invokeCameraKit(cameraKitMode, remoteApiSpecId, cameraKitConfig);
    }


    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        when (requestCode) {
            REQUEST_CODE_CAMERA_KIT_PLAY -> {
                val result = CameraActivity.Play.parseResult(resultCode, data)
                Log.d(TAG, "Got Camera Kit play result: $result")
            }
            REQUEST_CODE_CAMERA_KIT_CAPTURE -> {
                val result = CameraActivity.Capture.parseResult(resultCode, data)
                Log.d(TAG, "Got Camera Kit capture result: $result")
            }
            else -> {
                Log.d(TAG, "Got unexpected requestCode [$requestCode] " +
                        "resultCode [$resultCode] back with data: $data")
                super.onActivityResult(requestCode, resultCode, data)
            }
        }
    }
}