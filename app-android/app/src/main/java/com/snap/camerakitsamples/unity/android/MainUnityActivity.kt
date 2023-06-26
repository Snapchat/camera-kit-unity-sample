package com.snap.camerakitsamples.unity.android

import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.activity.result.ActivityResultLauncher
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.isVisible
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import com.snap.camerakit.Session
import com.snap.camerakit.connectOutput
import com.snap.camerakit.lenses.*
import com.snap.camerakit.newBuilder
import com.snap.camerakit.support.app.CameraActivity
import com.snap.camerakit.plugin.OverrideUnityActivity
import com.snap.camerakit.support.app.CameraActivity.Capture.Result
import com.snap.camerakit.support.camerax.CameraXImageProcessorSource
import com.snap.camerakit.support.widget.CameraLayout
import com.unity3d.player.UnityPlayer
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.invoke
import kotlinx.coroutines.runBlocking
import org.json.JSONObject
import java.io.Closeable
import java.io.File
import java.io.FileOutputStream
import com.snap.camerakit.support.widget.cameralayout.R as CameraLayoutResources
import com.fictionalcompany.mygame.R

private const val REQUEST_CODE_CAMERA_KIT_CAPTURE = 1
private const val REQUEST_CODE_CAMERA_KIT_PLAY = 2
private const val TAG = "MainUnityActivity"

class MainUnityActivity : AppCompatActivity() {
    lateinit var cameraLayout:CameraLayout
    lateinit var camerakitSession: Session
    lateinit var cameraControls: View
    var appliedLens: LensesComponent.Lens? = null
    val customCameraLifecycle:CameraLifecycleOwner = CameraLifecycleOwner()
    private val closeOnDestroy = mutableListOf<Closeable>()
    private var lensLaunchParams = mapOf<String, String>()
    lateinit var fullscreenCaptureLauncher : ActivityResultLauncher<CameraActivity.Configuration>
    private var unloadAfterDismiss = false


    companion object {
        lateinit var instance: MainUnityActivity
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.camkit_unity_layout)

        val camkitApiToken = applicationContext.applicationInfo.metaData.getString("com.snap.camerakit.api.token")

        cameraLayout = findViewById<CameraLayout>(R.id.camera_layout).apply {
            val imageProcessor = CameraXImageProcessorSource(this.context, customCameraLifecycle)
            cameraControls = this.findViewById(CameraLayoutResources.id.control_strip)

            configureSession {
                imageProcessorSource(imageProcessor)
                apiToken(camkitApiToken)
            }
            configureLenses {
                remoteApiServiceFactory(UnityGenericApiService.Factory)
            }
            onSessionAvailable { session ->
                camerakitSession = session
                // An example of how dynamic launch data can be used. Vendor specific metadata is added into
                // LaunchData so it can be used by lens on launch.
                val reApplyLensWithVendorData = { lens: LensesComponent.Lens ->
                    if (lensLaunchParams.isNotEmpty()) {
                        val launchData = LensesComponent.Lens.LaunchData {
                            for ((key, value) in lensLaunchParams) {
                                putString(key, value)
                            }
                        }
                        session.lenses.processor.apply(lens, launchData) { success ->
                            Log.d(TAG, "Apply lens [$lens] with launch data [$launchData] success: $success")
                        }
                    }
                }

                // This block demonstrates how to receive and react to lens lifecycle events. When Applied event is received
                // we keep the ID of applied lens to persist and restore it via savedInstanceState later on.
                session.lenses.processor.observe { event ->
                    Log.d(TAG, "Observed lenses processor event: $event")
                    runOnUiThread {
                        event.whenApplied { event ->
                            reApplyLensWithVendorData(event.lens)
                            appliedLens = event.lens
                        }
                        event.whenIdle {
                            appliedLens = null
                        }
                    }
                }.addTo(closeOnDestroy)

                // By default, CameraKit does not reset lens state when app is backgrounded and resumed, however it is
                // possible to do so by simply tracking the last applied lens and applying it with the "reset" flag set
                // to true when app resumes to match the behavior of the Snapchat app.
                val lifecycleObserver = object : DefaultLifecycleObserver {
                    override fun onResume(owner: LifecycleOwner) {
                        appliedLens
                            ?.let { lens ->
                                session.lenses.processor.apply(lens, reset = true)
                            }
                    }
                }
                customCameraLifecycle.lifecycle.addObserver(lifecycleObserver)
                Closeable {
                    customCameraLifecycle.lifecycle.removeObserver(lifecycleObserver)
                }.addTo(closeOnDestroy)
            }
        }

        fullscreenCaptureLauncher = registerForActivityResult(CustomCameraActivity.Capture) { result ->
            Log.d("camkit-unity", "Activity result here")
            if (result is CustomCameraActivity.Capture.Result.Success) {
                val externalDir = application.getExternalFilesDir(null) // Get the external files directory

                val originalFile = File(result.uri.path) // Retrieve the original file using the URI
                val copiedFile = File(externalDir, "CameraKitOutput.png") // Create a new file with the same name in the external directory

                originalFile.inputStream().use { input ->
                    FileOutputStream(copiedFile).use { output ->
                        input.copyTo(output) // Copy the file contents from the original file to the new file
                    }
                }
                UnityPlayer.UnitySendMessage("CameraKitHandler", "MessageCameraKitCaptureResult", copiedFile.absolutePath)
            } else if (result is CustomCameraActivity.Capture.Result.Cancelled) {
                UnityPlayer.UnitySendMessage("CameraKitHandler", "MessageCameraKitDismissed", "")
            }
        }

        instance = this
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
        this.unloadAfterDismiss = unloadLensAfterDismiss
        if (shutterButtonMode == Constants.ShutterButtonMode.ONLY_ON_FRONT_CAMERA.value) {
            Log.d("camkit-unity", "CameraKitShutterButtonMode.OnlyOnFrontCamera is not available on Android yet. Defaulting to ON")
        }
        if (lensLaunchDataKeys != null && lensLaunchDataKeys.isNotEmpty()) {
            var mapLaunchParams = mutableMapOf<String, String>()
            for (i in lensLaunchDataKeys.indices) {
                mapLaunchParams.put(lensLaunchDataKeys[i], lensLaunchDataValues!![i])
            }
            lensLaunchParams = mapLaunchParams
        }
        if (remoteApiSpecId != null)
        {
            UnityGenericApiService.Factory.supportedApiSpecIds = setOf(remoteApiSpecId)
        }

        if (renderMode == Constants.RenderMode.BEHIND_UNITY.value) {
            cameraLayout.apply {
                configureLensesCarousel {
                    observedGroupIds = linkedSetOf(groupId!!)
                }
            }
            camerakitSession.lenses.repository.get(LensesComponent.Repository.QueryCriteria.ById(lensId!!, groupId!!)) {
                it.whenHasFirst { lens ->
                    camerakitSession.lenses.processor.apply(lens)
                }
            }
            runBlocking {
                Dispatchers.Main.invoke {
                    customCameraLifecycle.start()
                    cameraLayout.startPreview(facingFront = (cameraMode == Constants.Device.FRONT_CAMERA.value))
                    cameraControls.isVisible = false
                }
            }
        } else if (renderMode == Constants.RenderMode.FULL_SCREEN.value) {
            var cameraFacingFront = (cameraMode == Constants.Device.FRONT_CAMERA.value)
            CustomCameraActivity.showShutterButton =  (shutterButtonMode == Constants.ShutterButtonMode.ON.value)
                    || (shutterButtonMode == Constants.ShutterButtonMode.ONLY_ON_FRONT_CAMERA.value)

            val config = CameraActivity.Configuration.WithLens(
                lensId!!,
                groupId!!,
                false,
                withLaunchData = {
                    for (key in lensLaunchParams.keys) {
                        this.putString(key, lensLaunchParams[key]!!)
                    }
                },
                cameraFacingFront = cameraFacingFront
            )
            fullscreenCaptureLauncher.launch(config)
        }


    }

    fun updateLensState(
        lensLaunchDataKeys: Array<out String>?,
        lensLaunchDataValues: Array<out String>?
    ) {
        Log.d(TAG,"Update Lens State")
        var responseJson = ""
        if (lensLaunchDataKeys != null && lensLaunchDataKeys.isNotEmpty()) {
            var paramsMap = mutableMapOf<String, String>()
            for (i in lensLaunchDataKeys.indices) {
                val key = lensLaunchDataKeys[i]
                val value = lensLaunchDataValues!![i]
                paramsMap[key]= value
            }

            responseJson = JSONObject(paramsMap as Map<String, String>?).toString()
        }
        var responseBody = responseJson.toByteArray(Charsets.UTF_8)

        UnityGenericApiService.Pending.statusUpdateResponse?.accept(
            UnityGenericApiService.Pending.statusUpdateRequest?.toSuccessResponse(body=responseBody))
    }

    fun dismissCameraKit() {
        runBlocking {
            Dispatchers.Main.invoke {
                customCameraLifecycle.stop()
                if (unloadAfterDismiss) {
                    camerakitSession.lenses.processor.clear()
                }

            }
        }
        closeOnDestroy.forEach { it.close() }
    }

    override fun onDestroy() {
        closeOnDestroy.forEach { it.close() }
        super.onDestroy()
    }

}