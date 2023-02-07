package com.snap.camerakitsamples.unity.android

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.PersistableBundle
import android.util.Log
import com.snap.camerakit.support.app.CameraActivity
import com.snap.camerakit.support.widget.CameraLayout

class CustomCameraActivity : CameraActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        cameraLayout = findViewById<CameraLayout>(R.id.camera_layout).apply {
            configureLenses {
                remoteApiServiceFactory(UnityGenericApiService.Factory)
            }
        }
    }

    companion object {
        @JvmStatic
        fun intentFor(context: Context, configuration: Configuration, cameraKitMode: Int): Intent {
            var intent = CameraActivity.intentFor(context, configuration)
            var newIntent = Intent(context, CustomCameraActivity::class.java)
            newIntent.putExtras(intent)

            if (cameraKitMode == 0) { // PLAY
                newIntent.apply {
                    action = when (configuration) {
                        is Configuration.WithLenses -> {
                            ACTION_PLAY_WITH_LENSES
                        }
                        is Configuration.WithLens -> {
                            ACTION_PLAY_WITH_LENS
                        }
                    }
                }
            } else { // CAPTURE
                newIntent.apply {
                    action = when (configuration) {
                        is Configuration.WithLenses -> {
                            ACTION_CAPTURE_WITH_LENSES
                        }
                        is Configuration.WithLens -> {
                            ACTION_CAPTURE_WITH_LENS
                        }
                    }
                }
            }


            return newIntent
        }
    }
}