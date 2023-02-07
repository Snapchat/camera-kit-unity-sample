//
//  UnityRemoteApi.swift
//  UnitySwift
//
//  Created by Edgar Neto on 07/02/2023.
//

import Foundation
import SCSDKCameraKit

class UnityRemoteApiServiceProvider: NSObject, LensRemoteApiServiceProvider {

    var supportedApiSpecIds: Set<String> = ["98821e72-0407-4125-be80-89a9c7933631"]

    func remoteApiService(for lens: Lens) -> LensRemoteApiService {
        return UnityRemoteApiService()
    }
}

class UnityRemoteApiService: NSObject, LensRemoteApiService {

    private let urlSession: URLSession = .shared

    func processRequest(
        _ request: LensRemoteApiRequest,
        responseHandler: @escaping (LensRemoteApiServiceCallStatus, LensRemoteApiResponseProtocol) -> Void
    ) -> LensRemoteApiServiceCall {
        print("Camera Kit got callback from Remote API")
        if (request.endpointId == "unitySendData") {
            DispatchQueue.main.async {
                let appDelegate = UIApplication.shared.delegate as! AppDelegate
                appDelegate.unityFramework?.sendMessageToGO(withName: "CameraKitHandler", functionName: "OnResponseFromLens", message: request.parameters["unityData"])
            }            
        }
        return IgnoredRemoteApiServiceCall()
    }
}

class IgnoredRemoteApiServiceCall: NSObject, LensRemoteApiServiceCall {
    let status: LensRemoteApiServiceCallStatus = .ignored

    func cancelRequest() {
        // no-op
    }
}
