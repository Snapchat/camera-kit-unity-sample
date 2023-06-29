package com.snap.camerakitsamples.unity.android

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.LinearLayout
import androidx.activity.result.contract.ActivityResultContract
import androidx.core.view.isVisible
import com.snap.camerakit.support.app.CameraActivity
import com.snap.camerakit.support.widget.CameraLayout
import com.snap.camerakit.support.widget.SnapButtonView
import com.snap.camerakit.support.widget.cameralayout.R
import com.snap.camerakit.support.app.cameraactivity.R as CameraActivityResources


class CustomCameraActivity : CameraActivity() {

    /**
     * Defines a contract to start a capture flow in the [CameraActivity] with custom parameters expressed as the
     * [CameraActivity.Configuration] and to receive results in the form of the [CameraActivity.Capture.Result] using
     * the [androidx.activity.result.ActivityResultCaller.registerForActivityResult] method.
     */
    object Capture : ActivityResultContract<Configuration, CustomCameraActivity.Capture.Result>() {

        /**
         * Defines all the possible capture result states that a [CameraActivity] can produce.
         * A [Result] can be obtained from the [CameraActivity] which was started via the
         * [androidx.activity.result.ActivityResultCaller.registerForActivityResult] method that accepts the [Capture]
         * contract.
         */
        sealed class Result {

            /**
             * Indicates a successful capture flow with a result media [type] saved to a [uri].
             */
            sealed class Success(open val uri: Uri, open val type: String) : Result() {

                /**
                 * Successful capture of a video media [type], typically an mp4, saved to a [uri].
                 */
                data class Video(override val uri: Uri, override val type: String) : Success(uri, type)

                /**
                 * Successful capture of an image media [type], typically a jpeg, saved to a [uri].
                 */
                data class Image(override val uri: Uri, override val type: String) : Success(uri, type)
            }

            /**
             * Indicates a failure which occurred during the use of a [CameraActivity].
             */
            data class Failure(val exception: Exception) : Result()

            /**
             * Indicates a cancelled capture flow - either due to a user abandoning a [CameraActivity] or other causes
             * such as missing or incomplete arguments passed when starting a [CameraActivity].
             */
            object Cancelled : Result()
        }

        override fun createIntent(context: Context, configuration: Configuration): Intent {
            return intentFor(context, configuration)
        }

        override fun parseResult(resultCode: Int, intent: Intent?): Result {
            return if (intent != null) {
                if (resultCode == Activity.RESULT_OK) {
                    val uri = intent.data
                    val type = intent.type
                    if (uri != null && type != null) {
                        when {
                            type.startsWith("image/") -> {
                                Result.Success.Image(uri, type)
                            }
                            type.startsWith("video/") -> {
                                Result.Success.Video(uri, type)
                            }
                            else -> {
                                Result.Cancelled
                            }
                        }
                    } else {
                        Result.Cancelled
                    }
                } else if (resultCode == Activity.RESULT_CANCELED) {
                    Result.Cancelled
                } else if (resultCode == RESULT_CODE_FAILURE) {
                    val exception = intent.getSerializableExtra(EXTRA_EXCEPTION) as? Exception
                    if (exception != null) {
                        Result.Failure(exception)
                    } else {
                        Result.Cancelled
                    }
                } else {
                    Result.Cancelled
                }
            } else {
                Result.Cancelled
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        cameraLayout = findViewById<CameraLayout>(CameraActivityResources.id.camera_layout).apply {
            configureLenses {
                remoteApiServiceFactory(UnityGenericApiService.Factory)
            }
            findViewById<SnapButtonView>(R.id.button_capture).isVisible = showShutterButton
            findViewById<LinearLayout>(R.id.control_strip).isVisible = showShutterButton
        }

//        cameraLayout.rootView
    }

    companion object {
        var showShutterButton: Boolean = true

        @JvmStatic
        fun intentFor(context: Context, configuration: Configuration): Intent {
            var intent = CameraActivity.intentFor(context, configuration)
            var newIntent = Intent(context, CustomCameraActivity::class.java)
            newIntent.putExtras(intent)

             // CAPTURE
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

            return newIntent
        }
    }
}