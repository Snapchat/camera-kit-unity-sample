package com.snap.camerakitsamples.unity.android

import android.util.Log
import com.snap.camerakit.common.Consumer
import com.snap.camerakit.lenses.LensesComponent
import com.snap.camerakit.lenses.toSuccessResponse
import com.unity3d.player.UnityPlayer
import java.io.Closeable

internal object UnityGenericApiService : LensesComponent.RemoteApiService {
    object Factory : LensesComponent.RemoteApiService.Factory {

        override var supportedApiSpecIds: Set<String> = setOf("")

        override fun createFor(lens: LensesComponent.Lens): LensesComponent.RemoteApiService = UnityGenericApiService
    }

    object Pending {
        var statusUpdateResponse: Consumer<LensesComponent.RemoteApiService.Response>? = null
        var statusUpdateRequest: LensesComponent.RemoteApiService.Request? = null
    }

    override fun process(
        request: LensesComponent.RemoteApiService.Request,
        onResponse: Consumer<LensesComponent.RemoteApiService.Response>
    ): LensesComponent.RemoteApiService.Call {
        return when (val endpointId = request.endpointId) {
            "unity_send_data" -> {
                Log.d("unity-camkit", "Params from Lens ${request.parameters.toString()}")
                UnityPlayer.UnitySendMessage("CameraKitHandler", "MessageResponseFromLens", request.parameters["unityData"])
                onResponse.accept(request.toSuccessResponse())
                LensesComponent.RemoteApiService.Call.Answered
            }
            "unity_request_state" -> {
                Log.d("unity-camkit", "Params from Lens ${request.parameters.toString()}")
                UnityPlayer.UnitySendMessage("CameraKitHandler", "MessageLensRequestedState", "")
                Pending.statusUpdateRequest = request
                Pending.statusUpdateResponse = onResponse
                LensesComponent.RemoteApiService.Call.Ongoing(Closeable {
                    Log.d("unity-camkit", "closeable is being invoked now")
                })
            }
            else -> LensesComponent.RemoteApiService.Call.Ignored
        }
    }

    override fun close() {
        // no-op
    }

}