package com.snap.camerakitsamples.unity.android

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import com.snap.camerakit.support.app.CameraActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        App.mainActivity = this
        setContentView(R.layout.activity_main)
    }

    override fun onStart() {
        super.onStart()
        var intent = Intent(this, MainUnityActivity::class.java);
        intent.setFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        startActivity(intent);
    }
}

object App {
    var mainActivity : MainActivity? = null
}