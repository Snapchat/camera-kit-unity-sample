package com.snap.camerakitsamples.unity.android

import android.content.Intent
import android.graphics.Camera
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import com.snap.camerakit.lenses.LensesComponent
import com.snap.camerakit.lenses.LensesLaunchData
import com.snap.camerakit.support.app.CameraActivity
import com.snap.samples.OverrideUnityActivity

class MainUnityActivity : OverrideUnityActivity() {
    // Setup activity layout
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val intent = intent
        handleIntent(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
        setIntent(intent)
    }

    fun handleIntent(intent: Intent?) {
        if (intent == null || intent.extras == null) return
        if (intent.extras!!.containsKey("doQuit")) if (mUnityPlayer != null) {
            finish()
        }
    }

    override fun invokeCameraKitWithGroup(
        lensGroupIds: Array<String>,
        startingLensId: String?,
        cameraKitMode: Int
    ) {
        var cameraConfig = CameraActivity.Configuration.WithLenses(
            lensGroupIds,
            startingLensId
        );
        var intent = if (cameraKitMode == 0) CameraActivity.intentForPlayWith(applicationContext, cameraConfig) else CameraActivity.intentForCaptureWith(applicationContext, cameraConfig);
        startActivityForResult(intent, 1);
    }

    override fun invokeCameraKitWithSingleLens(
        lensId: String,
        groupId: String,
        lensLaunchDataKeys: Array<String>?,
        lensLaunchDataValues: Array<String>?,
        cameraKitMode: Int
    ) {

        var cameraConfig = CameraActivity.Configuration.WithLens(
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
        );
        var intent = if (cameraKitMode == 0) CameraActivity.intentForPlayWith(applicationContext, cameraConfig) else CameraActivity.intentForCaptureWith(applicationContext, cameraConfig);
        startActivityForResult(intent, 1);
    }
}