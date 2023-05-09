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
import CoreLocation

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UnityFrameworkListener {
    fileprivate var supportedOrientations: UIInterfaceOrientationMask = .allButUpsideDown
    fileprivate var cameraController: UnityCameraController = .init()
    fileprivate var cameraViewController: UnityCameraViewController?

    var window: UIWindow?
    var appLaunchOpts: [UIApplication.LaunchOptionsKey: Any]?
    var unitySampleView: UnityUIView!
    var didQuit: Bool = false
    var locationManager: CLLocationManager?


    @objc public var unityFramework: UnityFramework?

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
                    Constants.ErrorMessages.alreadyInitialized,
                    Constants.ErrorMessages.unloadFirst,
                    window: nativeWindow
                )
                return
            }

            if didQuit {
                UnitySampleUtils.showAlert(
                    Constants.ErrorMessages.cannotBeInitialized,
                    Constants.ErrorMessages.useUnload,
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
        }
    }

    func unloadButtonTouched(_ sender: UIButton) {
        unloadUnity()
    }

    func quitButtonTouched(_ sender: UIButton) {
        if !unityIsInitialized() {
            UnitySampleUtils.showAlert(
                Constants.ErrorMessages.notInitialized,
                Constants.ErrorMessages.initFirst,
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
                Constants.ErrorMessages.notInitialized,
                Constants.ErrorMessages.initFirst,
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
        withLens lensId: String!,
        withGroupID groupId: String!,
        withLaunchData launchData: [String: String]!,
        withRenderMode renderMode: NSNumber!,
        withRemoteAPISpecId remoteApiSpecId: String!
    ) {
        cameraController.cameraKit.lenses.repository.addObserver(self, specificLensID: lensId, inGroupID: groupId)
        cameraController.cameraKit.lenses.repository.addObserver(self, groupID: groupId)
        
        if (cameraViewController == nil) {
            cameraViewController = UnityCameraViewController(cameraController: cameraController)
        }
        cameraViewController?.appOrientationDelegate = self
        cameraViewController?.applyLensId = lensId;
        cameraViewController?.applyGroupId = groupId;
        cameraViewController?.launchDataFromUnity = launchData;
        
        if (renderMode == 1) { 
            invokeCameraKitAsBackgroundLayer()
        } else {
            invokeCameraKitAsModalFullScreen()
        }
        
    }
    
    func invokeCameraKitAsModalFullScreen() {
        
        unityFramework?.pause(true)
        
        let navVC = UINavigationController(rootViewController: cameraViewController!)
        navVC.modalPresentationStyle = .fullScreen
        unityFramework?.appController().rootViewController.present(navVC, animated: true);
        cameraViewController?.hideCameraUiControls(hide: false);
    }

    func invokeCameraKitAsBackgroundLayer() {
        if let nativeWindow = window {
            unityFramework?.appController().rootView.backgroundColor = UIColor.black.withAlphaComponent(0.0);
            nativeWindow.rootViewController?.add(cameraViewController!, frame: UIScreen.main.bounds)
        }
        cameraViewController?.hideCameraUiControls(hide: true);
    }
    
    func updateLensState(_ launchData: [String : String]!) {
        LensRequestStateApiServiceCall.updateAppState(appState: launchData)
    }
    
    func dismissCameraKit() {
        unityFramework?.appController().rootView.backgroundColor = UIColor.black;
//        cameraController.cameraKit.lenses.processor?.clear()
//        cameraController.cameraKit.stop()
        cameraViewController?.remove();
    }
}

extension AppDelegate: LensRepositorySpecificObserver, LensRepositoryGroupObserver {
    func repository(_ repository: LensRepository, didUpdateLenses lenses: [Lens], forGroupID groupID: String) {
        print("Loaded group " + groupID)
        cameraController.cameraKit.lenses.prefetcher.prefetch(lenses: lenses)
    }

    func repository(_ repository: LensRepository, didFailToUpdateLensesForGroupID groupID: String, error: Error?) {
        self.unityFramework?.sendMessageToGO(withName: "CameraKitHandler", functionName: "MessageCameraKitInitFailed", message:"Failed to upload lenses")
        print("Failed to update lenses")
    }

    func repository(_ repository: LensRepository, didUpdate lens: Lens, forGroupID groupID: String) {
        print("Loaded lens " + lens.id)
    }
    
    func repository(
        _ repository: LensRepository,
        didFailToUpdateLensID lensID: String,
        forGroupID groupID: String,
        error: Error?
    ) {
        self.unityFramework?.sendMessageToGO(withName: "CameraKitHandler", functionName: "MessageCameraKitInitFailed", message:"Error loading lens " + lensID)
        print("Error loading lens " + lensID)
    }
}

extension AppDelegate: CLLocationManagerDelegate {
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        manager.requestWhenInUseAuthorization()
    }
}




class UnityCameraViewController: CameraViewController  {
    
    fileprivate var launchDataFromUnity: [String: String]?
    fileprivate var applyLensId: String?
    fileprivate var applyGroupId: String?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        title = ""
        navigationItem.leftBarButtonItem = UIBarButtonItem(title: "Done", style: .done, target: self, action: #selector(dismissSelf) )
        
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        let appDelegate = UIApplication.shared.delegate as! AppDelegate
        let lens = cameraController.cameraKit.lenses.repository.lens(id: applyLensId!, groupID: applyGroupId!)
        let launchDataBuilder = LensLaunchDataBuilder()
        launchDataFromUnity?.forEach {
            launchDataBuilder.add(string: $1, key: $0)
        }
        let launchDataToLens = launchDataBuilder.launchData ?? EmptyLensLaunchData()
        if (lens != nil) {
            cameraController.cameraKit.lenses.processor?.apply(lens: lens!, launchData: launchDataToLens)
        }
    }

    
    @objc private func dismissSelf() {
        dismiss(animated: true)
    }
    
    override open func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        let appDelegate = UIApplication.shared.delegate as! AppDelegate
        appDelegate.unityFramework?.pause(false)
        appDelegate.unityFramework?.sendMessageToGO(withName: "CameraKitHandler", functionName: "MessageCameraKitDismissed", message:"")
    }
    
    fileprivate func hideCameraUiControls(hide: Bool) {
        cameraView.cameraActionsView.isHidden = hide
    }
    
}
    
class UnityCameraController: CameraController {
    override func configureDataProvider() -> DataProviderComponent {
        DataProviderComponent(
            deviceMotion: nil, userData: UserDataProvider(), lensHint: nil, location: nil,
            mediaPicker: lensMediaProvider, remoteApiServiceProviders: [UnityRemoteApiServiceProvider()]
        )
    }
    
    override func takePhoto(completion: ((UIImage?, Error?) -> Void)?) {
        super.takePhoto(completion: {image, error in
            let pathToSavedImage = self.saveImageToDocumentsDirectory(image: image!, withName: "CameraKitOutput.png")
            if (pathToSavedImage == nil) {
                print("Error. Failed to save image")
            }
            DispatchQueue.main.async {
                let appDelegate = UIApplication.shared.delegate as! AppDelegate
                appDelegate.unityFramework?.sendMessageToGO(withName: "CameraKitHandler", functionName: "MessageCameraKitCaptureResult", message: pathToSavedImage)
                appDelegate.cameraViewController?.dismiss(animated: true)
            }
        })
        
    }
    
    override func finishRecording(completion: ((URL?, Error?) -> Void)?) {
        super.finishRecording(completion: {url, error in
            DispatchQueue.main.async {
                let appDelegate = UIApplication.shared.delegate as! AppDelegate
                appDelegate.unityFramework?.sendMessageToGO(withName: "CameraKitHandler", functionName:  "MessageCameraKitCaptureResult", message: url?.absoluteString)
                appDelegate.cameraViewController?.dismiss(animated: true)
            }
        })
    }
    
    func getDocumentDirectoryPath() -> NSString {
        let paths = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true)
        let documentsDirectory = paths[0]
        return documentsDirectory as NSString
    }
    
    func saveImageToDocumentsDirectory(image: UIImage, withName: String) -> String? {
        if let data = image.pngData() {
            let dirPath = getDocumentDirectoryPath()
            let imageFileUrl = URL(fileURLWithPath: dirPath.appendingPathComponent(withName) as String)
            do {
                try data.write(to: imageFileUrl)
                print("Successfully saved image at path: \(imageFileUrl)")
                return imageFileUrl.absoluteString
            } catch {
                print("Error saving image: \(error)")
            }
        }
        return nil
    }
}

@nonobjc extension UIViewController {
    func add(_ child: UIViewController, frame: CGRect? = nil) {
        addChild(child)

        if let frame = frame {
            child.view.frame = frame
        }

        view.insertSubview(child.view, at: 1)
//        view.addSubview(child.view)
        child.didMove(toParent: self)
    }
    

    func remove() {
        willMove(toParent: nil)
        view.removeFromSuperview()
        removeFromParent()
    }
}
