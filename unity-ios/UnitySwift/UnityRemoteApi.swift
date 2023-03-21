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
            return IgnoredRemoteApiServiceCall()
        } else if (request.endpointId == "unityRequestState") {
            DispatchQueue.main.async {
                let appDelegate = UIApplication.shared.delegate as! AppDelegate
                appDelegate.unityFramework?.sendMessageToGO(withName: "CameraKitHandler", functionName: "OnLensRequestedState", message: "")
            }
            return LensRequestStateApiServiceCall(responseHandler: responseHandler, request: request)
        }
        else {
            return IgnoredRemoteApiServiceCall()
        }
        
    }
}

class IgnoredRemoteApiServiceCall: NSObject, LensRemoteApiServiceCall {
    let status: LensRemoteApiServiceCallStatus = .ignored

    func cancelRequest() {
        // no-op
    }
}

class LensRequestStateApiServiceCall: NSObject, LensRemoteApiServiceCall {
    private static var appState: [String:String] = [:]
    private static var responseHandler: (LensRemoteApiServiceCallStatus, LensRemoteApiResponseProtocol) -> Void = {_,_ in }
    private static var request: LensRemoteApiRequest? = nil;
    
    let status: LensRemoteApiServiceCallStatus = .ongoing
    
    init(responseHandler: @escaping (LensRemoteApiServiceCallStatus, LensRemoteApiResponseProtocol) -> Void, request: LensRemoteApiRequest)
    {
        super.init()
        LensRequestStateApiServiceCall.responseHandler = responseHandler;
        LensRequestStateApiServiceCall.request = request
    }
    
    private static func buildResponse(request: LensRemoteApiRequest) -> LensRemoteApiResponse {
//        let body = try? NSKeyedArchiver.archivedData(withRootObject: LensRequestStateApiServiceCall.appState, requiringSecureCoding: false)
        do
        {
            let jsonData = try JSONSerialization.data(withJSONObject: LensRequestStateApiServiceCall.appState)
            let apiResponse = LensRemoteApiResponse (
                request: request,
                status: .success,
                metadata: [:],
                body: jsonData
            )
            return apiResponse;
        } catch {
            return LensRemoteApiResponse(request: request, status: .internalServiceError, metadata: ["error": "could not parse state to lens"], body: nil)
        }
    }
    
    public static func updateAppState(appState: [String:String]) {
        self.appState = appState;
        guard let req = self.request else {
            return
        }
        self.responseHandler(.answered, self.buildResponse(request: req))
    }
    
    func cancelRequest() {
        LensRequestStateApiServiceCall.responseHandler = {_,_ in }
    }
}
