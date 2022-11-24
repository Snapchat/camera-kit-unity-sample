//
//  AppDelegate.swift
//  UnitySwift
//
//  Created by derrick on 2021/10/30.
//

import UIKit
import UnityFramework
import SCSDKCameraKit
import SCSDKCameraKitReferenceUI

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UnityFrameworkListener    {
    fileprivate var supportedOrientations: UIInterfaceOrientationMask = .allButUpsideDown
    fileprivate var cameraController: SampleCameraController = SampleCameraController()
    fileprivate var cameraViewController: CameraViewController? = nil
    
    var window: UIWindow?
    var appLaunchOpts: [UIApplication.LaunchOptionsKey: Any]?
    var unitySampleView: UnityUIView!
    var didQuit: Bool = false
    
    @objc var unityFramework: UnityFramework?
    
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        unityFramework = getUnityFramework()
        
        appLaunchOpts = launchOptions
        
        let storyboard = UIStoryboard(name: "Main", bundle: .main)
        let viewController = storyboard.instantiateViewController(withIdentifier: "Host")
        
//        self.window = UIWindow.init(frame: UIScreen.main.bounds)
        
        if let nativeWindow = self.window {
            nativeWindow.rootViewController = viewController;
            nativeWindow.makeKeyAndVisible()
        }
        
        initUnity()
        
        return true
    }
    
    func applicationWillResignActive(_ application: UIApplication) {
        
        if let unityFramework = self.unityFramework {
            unityFramework.appController()?.applicationWillResignActive(application)
        }
        
    }
    
    func applicationDidEnterBackground(_ application: UIApplication) {
        if let unityFramework = self.unityFramework {
            unityFramework.appController()?.applicationDidEnterBackground(application)
        }
        
    }
    
    func applicationWillEnterForeground(_ application: UIApplication) {
        if let unityFramework = self.unityFramework {
            unityFramework.appController()?.applicationWillEnterForeground(application)
        }
    }
    
    func applicationDidBecomeActive(_ application: UIApplication) {
        
        if let unityFramework = self.unityFramework {
            unityFramework.appController()?.applicationDidBecomeActive(application)
        }
        
    }
    
    func application(_ application: UIApplication, supportedInterfaceOrientationsFor window: UIWindow?) -> UIInterfaceOrientationMask {
        return supportedOrientations
    }
    
    func applicationWillTerminate(_ application: UIApplication) {
        
        if let unityFramework = self.unityFramework {
            unityFramework.appController()?.applicationWillTerminate(application)
        }
    }
    
    // MARK: Unity API
    
    private func getUnityFramework() -> UnityFramework? {
        let bundlePath: String = Bundle.main.bundlePath + "/Frameworks/UnityFramework.framework"
        
        let bundle = Bundle(path: bundlePath )
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
    
    func unityIsInitialized( ) -> Bool {
        return (self.unityFramework != nil && self.unityFramework?.appController() != nil)
    }
    
    func initUnity() {
        
        if let nativeWindow = self.window {
            if unityIsInitialized() {
                UnitySampleUtils.showAlert(Constants.ERRORMESSAGES.ALREADY_INIT, Constants.ERRORMESSAGES.UNLOAD_FIREST, window: nativeWindow)
                return
            }
            
            if didQuit {
                UnitySampleUtils.showAlert(Constants.ERRORMESSAGES.CANNOTBE_INITIALIZED, Constants.ERRORMESSAGES.USE_UNLOAD, window:nativeWindow)
                return
            }
            
        }
        
        
        self.unityFramework = getUnityFramework()
        
        if let unityframework = self.unityFramework {
            unityframework.setDataBundleId("com.unity3d.framework")
            unityframework.register(self)
            NSClassFromString("FrameworkLibAPI")?.registerAPIforNativeCalls(self)
            unityframework.runEmbedded(withArgc: CommandLine.argc, argv: CommandLine.unsafeArgv, appLaunchOpts: appLaunchOpts)
            
            attachUnityView()
        }
        
        
    }
    
    
    func attachUnityView() {
        
        guard let unityRootView = unityFramework?.appController()?.rootView else {
            return
        }
        
        self.unitySampleView = UnityUIView(frame: UIScreen.main.bounds)
        unityRootView.addSubview(self.unitySampleView)
        
        
    }
    
    func unloadButtonTouched(_ sender: UIButton) {
        unloadUnity()
    }
    
    func quitButtonTouched(_ sender: UIButton) {
        if !unityIsInitialized() {
            UnitySampleUtils.showAlert(Constants.ERRORMESSAGES.NOT_INITIALIZED, Constants.ERRORMESSAGES.INIT_FIREST, window: self.window)
        } else {
            if let unityFramework = getUnityFramework() {
                unityFramework.quitApplication(0)
            }
            
        }
    }
    
    private func unloadUnityInternal() {
        if let unityFramework = self.unityFramework {
            unityFramework.unregisterFrameworkListener(self)
            
        }
        self.unityFramework = nil
        
        if let nativeWindow = self.window {
            nativeWindow.makeKeyAndVisible()
        }
        
        
    }
    
    private func unloadUnity() {
        if !unityIsInitialized() {
            UnitySampleUtils.showAlert(Constants.ERRORMESSAGES.NOT_INITIALIZED, Constants.ERRORMESSAGES.INIT_FIREST, window: self.window)
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
        self.didQuit = true
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
    
    func invokeCameraKit(_ alienShotCount: Int32) {
        cameraController.groupIDs = ["42947d70-639e-4349-bd36-6ea9617060d6"]
        cameraController.alienShotCount = Int(alienShotCount)
        cameraController.cameraKit.lenses.repository.addObserver(self, specificLensID: "8e8bfaac-df3f-44fc-87c6-4f28652d54ec", inGroupID: "42947d70-639e-4349-bd36-6ea9617060d6")
        
        if (cameraViewController == nil) {
            cameraViewController = CameraViewController(cameraController: cameraController)
            cameraViewController?.appOrientationDelegate = self
            cameraViewController?.modalPresentationStyle = .formSheet
        }

        self.unityFramework?.pause(true)
        self.unityFramework?.appController().rootViewController.present(cameraViewController!, animated: true)
        
    }
}

extension AppDelegate: LensRepositorySpecificObserver {
    
    func repository(_ repository: LensRepository, didUpdate lens: Lens, forGroupID groupID: String) {
        cameraController.applyLens(lens);
        cameraViewController?.cameraView.carouselView.selectItem(CarouselItem(lensId: lens.id, groupId: groupID))
    }
    func repository(_ repository: LensRepository, didFailToUpdateLensID lensID: String, forGroupID groupID: String, error: Error?) {
        print("Error loading lens " + lensID)
    }
    
}

extension CameraViewController {
    open override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        if isBeingDismissed {
            let appDelegate = UIApplication.shared.delegate as! AppDelegate
            appDelegate.unityFramework?.pause(false);
        }
    }
}

class SampleCameraController: CameraController {
    
    fileprivate var alienShotCount = 0;
    
    override func configureDataProvider() -> DataProviderComponent {
        DataProviderComponent(
            deviceMotion: nil, userData: UserDataProvider(), lensHint: nil, location: nil,
            mediaPicker: lensMediaProvider, remoteApiServiceProviders: [])
    }
    
    override func launchData(for lens: Lens) -> LensLaunchData {
        let launchDataBuilder = LensLaunchDataBuilder()
        launchDataBuilder.add(string: String(self.alienShotCount), key: "shotsOnInvader")
        return launchDataBuilder.launchData ?? EmptyLensLaunchData()
    }
}
