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
            lensGroupIds = lensGroupIds,
            applyLensById = startingLensId
        );
        var intent = if (cameraKitMode == 0) CameraActivity.intentForPlayWith(applicationContext, cameraConfig) else CameraActivity.intentForCaptureWith(applicationContext, cameraConfig);
        startActivityForResult(intent, 1);
    }

    override fun invokeCameraKitWithSingleLens(
        lensId: String,
        groupId: String,
        lensLaunchDataKeys: Array<out String>?,
        lensLaunchDataValues: Array<out String>?,
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

//    override fun invokeCameraKitWithSingleLens(
//        lensGroupIds: Array<out String>?,
//        startingLensId: String?,
//        lensLaunchDataKeys: Array<out String>?,
//        lensLaunchDataValues: Array<out String>?,
//        cameraKitMode: Int
//    ) {
//        Log.d("camkit", "Invoking Camera Kit")
//        var cameraConfig = CameraActivity.Configuration.WithLenses(lensGroupIds,
//        startingLensId);
//        var intent = CameraActivity.intentForPlayWith(applicationContext, cameraConfig);
//        intent.putExtra(CameraActivity.EXTRA_LENS_LAUNCH_DATA, )
//
//        startActivityForResult(intent, 1);

//        var playLauncher = (App.mainActivity as ComponentActivity).registerForActivityResult(CameraActivity.Play) { result ->
//            Log.d("camkit", "Got play result: $result")
//            when (result) {
//                is CameraActivity.Play.Result.Completed -> {
//                    Log.d("camkit", "Capture completed")
//                }
//                is CameraActivity.Play.Result.Failure -> {
//                    Log.d("camkit", "Capture failed")
//                }
//            }
//        }
//        playLauncher.launch(CameraActivity.Configuration.WithLenses(arrayOf("42947d70-639e-4349-bd36-6ea9617060d6")));
//    }
}