package com.snap.camerakitsamples.unity.android

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.Camera
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
import com.snap.camerakit.support.camerax.CameraXImageProcessorSource
import com.snap.camerakit.support.widget.CameraLayout
import com.unity3d.player.UnityPlayer
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.invoke
import kotlinx.coroutines.runBlocking
import org.json.JSONObject
import java.io.Closeable

private const val REQUEST_CODE_CAMERA_KIT_CAPTURE = 1
private const val REQUEST_CODE_CAMERA_KIT_PLAY = 2
private const val TAG = "MainUnityActivity"

class MainUnityActivity : AppCompatActivity() {
    lateinit var cameraLayout:CameraLayout
    lateinit var camerakitSession: Session
    var appliedLens: LensesComponent.Lens? = null
    val customCameraLifecycle:CameraLifecycleOwner = CameraLifecycleOwner()
    private val closeOnDestroy = mutableListOf<Closeable>()
    private var lensLaunchParams = mapOf<String, String>()


    companion object {
        lateinit var instance: MainUnityActivity
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.camkit_unity_layout)

        val camkitApiToken = applicationContext.applicationInfo.metaData.getString("com.snap.camerakit.api.token")
//        val remoteApiSpecId = applicationContext.applicationInfo.metaData.getString("com.snap.camerakit.remoteapi.id")
//        UnityGenericApiService.Factory.supportedApiSpecIds = setOf(remoteApiSpecId!!)

        cameraLayout = findViewById<CameraLayout>(R.id.camera_layout).apply {
            val imageProcessor = CameraXImageProcessorSource(this.context, customCameraLifecycle)

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

        instance = this
    }

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
                }
            }
        } else if (renderMode == Constants.RenderMode.FULL_SCREEN.value) {
            val config = CameraActivity.Configuration.WithLens(
                lensId!!,
                groupId!!,
                true,
                {
                    for (key in lensLaunchParams.keys) {
                        this.putString(key, lensLaunchParams[key]!!)
                    }
                }
            )
            val requestCode = REQUEST_CODE_CAMERA_KIT_CAPTURE
            val intent = CustomCameraActivity.intentFor(this, config, 0)
            startActivityForResult(intent, requestCode)
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
            }
        }
        closeOnDestroy.forEach { it.close() }
    }

    override fun onDestroy() {
        closeOnDestroy.forEach { it.close() }
        super.onDestroy()
    }

}