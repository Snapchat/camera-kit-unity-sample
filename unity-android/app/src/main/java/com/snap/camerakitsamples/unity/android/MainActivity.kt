package com.snap.camerakitsamples.unity.android

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import com.snap.camerakit.support.app.CameraActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }

    override fun onStart() {
        super.onStart()
        val playLauncher = (this as ComponentActivity).registerForActivityResult(CameraActivity.Play) { result ->
            Log.d("camkit", "Got play result: $result")
            when (result) {
                is CameraActivity.Play.Result.Completed -> {
                    Log.d("camkit", "Capture completed")
                }
                is CameraActivity.Play.Result.Failure -> {
                    Log.d("camkit", "Capture failed")
                }
            }
        }

        playLauncher.launch(CameraActivity.Configuration.WithLenses(arrayOf("42947d70-639e-4349-bd36-6ea9617060d6")));
    }
}