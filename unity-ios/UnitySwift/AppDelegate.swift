//
//  AppDelegate.swift
//  UnitySwift
//
//  Created by derrick on 2021/10/30.
//

import SCSDKCameraKit
import SCSDKCameraKitReferenceUI
import UIKit
import UnityFramework

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UnityFrameworkListener {
    fileprivate var supportedOrientations: UIInterfaceOrientationMask = .allButUpsideDown
    fileprivate var cameraController: SampleCameraController = .init()
    fileprivate var cameraViewController: CameraViewController?

    var window: UIWindow?
    var appLaunchOpts: [UIApplication.LaunchOptionsKey: Any]?
    var unitySampleView: UnityUIView!
    var didQuit: Bool = false

    @objc var unityFramework: UnityFramework?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        unityFramework = getUnityFramework()

        appLaunchOpts = launchOptions

        let storyboard = UIStoryboard(name: "Main", bundle: .main)
        let viewController = storyboard.instantiateViewController(withIdentifier: "Host")

//        self.window = UIWindow.init(frame: UIScreen.main.bounds)

        if let nativeWindow = window {
            nativeWindow.rootViewController = viewController
            nativeWindow.makeKeyAndVisible()
        }

        initUnity()

        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        if let unityFramework {
            unityFramework.appController()?.applicationWillResignActive(application)
        }
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        if let unityFramework {
            unityFramework.appController()?.applicationDidEnterBackground(application)
        }
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        if let unityFramework {
            unityFramework.appController()?.applicationWillEnterForeground(application)
        }
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        if let unityFramework {
            unityFramework.appController()?.applicationDidBecomeActive(application)
        }
    }

    func application(_ application: UIApplication, supportedInterfaceOrientationsFor window: UIWindow?) -> UIInterfaceOrientationMask {
        supportedOrientations
    }

    func applicationWillTerminate(_ application: UIApplication) {
        if let unityFramework {
            unityFramework.appController()?.applicationWillTerminate(application)
        }
    }

    // MARK: Unity API

    private func getUnityFramework() -> UnityFramework? {
        let bundlePath: String = Bundle.main.bundlePath + "/Frameworks/UnityFramework.framework"

        let bundle = Bundle(path: bundlePath)
        if bundle?.isLoaded == false {
            bundle?.load()
        }

        let ufw = bundle?.principalClass?.getInstance()
        if ufw?.appController() == nil {
            let machineHeader = UnsafeMutablePointer<MachHeader>.allocate(capacity: 1)
            machineHeader.pointee = _mh_execute_header

            ufw!.setExecuteHeader(machineHeader)
        }
        return ufw
    }

    func unityIsInitialized() -> Bool {
        unityFramework != nil && unityFramework?.appController() != nil
    }

    func initUnity() {
        if let nativeWindow = window {
            if unityIsInitialized() {
                UnitySampleUtils.showAlert(
                    Constants.ERRORMESSAGES.ALREADY_INIT,
                    Constants.ERRORMESSAGES.UNLOAD_FIREST,
                    window: nativeWindow
                )
                return
            }

            if didQuit {
                UnitySampleUtils.showAlert(
                    Constants.ERRORMESSAGES.CANNOTBE_INITIALIZED,
                    Constants.ERRORMESSAGES.USE_UNLOAD,
                    window: nativeWindow
                )
                return
            }
        }

        unityFramework = getUnityFramework()

        if let unityframework = unityFramework {
            unityframework.setDataBundleId("com.unity3d.framework")
            unityframework.register(self)
            NSClassFromString("FrameworkLibAPI")?.registerAPIforNativeCalls(self)
            unityframework.runEmbedded(
                withArgc: CommandLine.argc,
                argv: CommandLine.unsafeArgv,
                appLaunchOpts: appLaunchOpts
            )

            attachUnityView()
        }
    }

    func attachUnityView() {
        guard let unityRootView = unityFramework?.appController()?.rootView else {
            return
        }

        unitySampleView = UnityUIView(frame: UIScreen.main.bounds)
        unityRootView.addSubview(unitySampleView)
    }

    func unloadButtonTouched(_ sender: UIButton) {
        unloadUnity()
    }

    func quitButtonTouched(_ sender: UIButton) {
        if !unityIsInitialized() {
            UnitySampleUtils.showAlert(
                Constants.ERRORMESSAGES.NOT_INITIALIZED,
                Constants.ERRORMESSAGES.INIT_FIREST,
                window: window
            )
        } else {
            if let unityFramework = getUnityFramework() {
                unityFramework.quitApplication(0)
            }
        }
    }

    private func unloadUnityInternal() {
        if let unityFramework {
            unityFramework.unregisterFrameworkListener(self)
        }
        unityFramework = nil

        if let nativeWindow = window {
            nativeWindow.makeKeyAndVisible()
        }
    }

    private func unloadUnity() {
        if !unityIsInitialized() {
            UnitySampleUtils.showAlert(
                Constants.ERRORMESSAGES.NOT_INITIALIZED,
                Constants.ERRORMESSAGES.INIT_FIREST,
                window: window
            )
            return
        } else {
            if let unityFramework = getUnityFramework() {
                unityFramework.unloadApplication()
            }
        }
    }

    func unityDidUnload(_ notification: Notification!) {
        unloadUnityInternal()
    }

    func unityDidQuit(_ notification: Notification!) {
        unloadUnityInternal()
        didQuit = true
    }
}

extension AppDelegate: AppOrientationDelegate {
    func lockOrientation(_ orientation: UIInterfaceOrientationMask) {
        supportedOrientations = orientation
    }

    func unlockOrientation() {
        supportedOrientations = .allButUpsideDown
    }
}

extension AppDelegate: NativeCallsProtocol {
    func invokeCameraKit(
        withSingleLens lensId: String!,
        withGroupID groupId: String!,
        withLaunchData launchData: [String: String]!,
        withCamerMode cameraMode: NSNumber!
    ) {
        cameraController.launchDataFromUnity = launchData
        cameraController.cameraKit.lenses.repository.addObserver(self, specificLensID: lensId, inGroupID: groupId)
        invokeCameraKit()
    }
    func invokeCameraKit(
        withLensGroupIds lensGroupIDs: [String]!,
        withStartingLensId lensId: String!,
        withCamerMode cameraMode: NSNumber!
    ) {
        cameraController.groupIDs = lensGroupIDs
        cameraController.startingLensId = lensId
        for groupid in lensGroupIDs {
            cameraController.cameraKit.lenses.repository.addObserver(self, groupID: groupid)
        }
        invokeCameraKit()
    }

    func invokeCameraKit() {
        if cameraViewController == nil {
            cameraViewController = CameraViewController(cameraController: cameraController)
            cameraViewController?.appOrientationDelegate = self
            cameraViewController?.modalPresentationStyle = .formSheet
        }

        unityFramework?.pause(true)
        unityFramework?.appController().rootViewController.present(cameraViewController!, animated: true)
        if cameraController.initialLens != nil {
            cameraController.cameraKit.lenses.processor?.apply(
                lens: cameraController.initialLens!,
                launchData: cameraController.buildLaunchData()
            )
        }
    }
}

extension AppDelegate: LensRepositorySpecificObserver, LensRepositoryGroupObserver {
    func repository(_ repository: LensRepository, didUpdateLenses lenses: [Lens], forGroupID groupID: String) {
        lenses.forEach {
            if $0.id == cameraController.startingLensId {
                cameraController.initialLens = $0
            }
        }
    }

    func repository(_ repository: LensRepository, didFailToUpdateLensesForGroupID groupID: String, error: Error?) {
        print("failed to update lenses")
    }

    func repository(_ repository: LensRepository, didUpdate lens: Lens, forGroupID groupID: String) {
        cameraController.initialLens = lens
    }
    func repository(
        _ repository: LensRepository,
        didFailToUpdateLensID lensID: String,
        forGroupID groupID: String,
        error: Error?
    ) {
        print("Error loading lens " + lensID)
    }
}

extension CameraViewController {
    override open func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        if isBeingDismissed {
            let appDelegate = UIApplication.shared.delegate as! AppDelegate
            appDelegate.unityFramework?.pause(false)
        }
    }
}

class SampleCameraController: CameraController {
    fileprivate var launchDataFromUnity: [String: String]?
    fileprivate var startingLensId: String?
    fileprivate var initialLens: Lens?

    override func configureDataProvider() -> DataProviderComponent {
        DataProviderComponent(
            deviceMotion: nil, userData: UserDataProvider(), lensHint: nil, location: nil,
            mediaPicker: lensMediaProvider, remoteApiServiceProviders: []
        )
    }

    func buildLaunchData() -> LensLaunchData {
        let launchDataBuilder = LensLaunchDataBuilder()
        launchDataFromUnity?.forEach {
            launchDataBuilder.add(string: $1, key: $0)
        }
        return launchDataBuilder.launchData ?? EmptyLensLaunchData()
    }
}
