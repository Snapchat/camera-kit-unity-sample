package com.snap.camerakitsamples.unity.android

import android.content.Intent
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

    override fun invokeCameraKit(alienHitCount: Int) {
        Log.d("camkit", "Invoking Camera Kit")
        var builder = LensesLaunchData.newBuilder()
        builder.putString("shotsOnInvader", alienHitCount.toString())


        var cameraConfig = CameraActivity.Configuration.WithLens("8e8bfaac-df3f-44fc-87c6-4f28652d54ec",
        "42947d70-639e-4349-bd36-6ea9617060d6", true, {this.putString("shotsOnInvader", alienHitCount.toString())});
        var intent = CameraActivity.intentForPlayWith(applicationContext, cameraConfig);

        startActivityForResult(intent, 1);

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
    }
}