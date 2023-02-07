package com.snap.camerakitsamples.unity.android

import android.util.Log
import com.snap.camerakit.common.Consumer
import com.snap.camerakit.lenses.LensesComponent
import com.snap.camerakit.lenses.toSuccessResponse
import com.unity3d.player.UnityPlayer

internal object UnityGenericApiService : LensesComponent.RemoteApiService {
    object Factory : LensesComponent.RemoteApiService.Factory {

        override var supportedApiSpecIds: Set<String> = setOf("")

        override fun createFor(lens: LensesComponent.Lens): LensesComponent.RemoteApiService = UnityGenericApiService
    }

    override fun process(
        request: LensesComponent.RemoteApiService.Request,
        onResponse: Consumer<LensesComponent.RemoteApiService.Response>
    ): LensesComponent.RemoteApiService.Call {
        return when (val endpointId = request.endpointId) {
            "unitySendData" -> {
                Log.d("unity-camkit", "Params from Lens ${request.parameters.toString()}")
                UnityPlayer.UnitySendMessage("CameraKitHandler", "OnResponseFromLens", request.parameters["unityData"])
                onResponse.accept(request.toSuccessResponse())
                LensesComponent.RemoteApiService.Call.Answered
            }
            else -> LensesComponent.RemoteApiService.Call.Ignored
        }
    }

    override fun close() {
        // no-op
    }

}