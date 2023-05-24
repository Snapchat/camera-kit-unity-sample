//
//  UnitySampleConstant.swift
//  UnitySwift
//
//  Created by derrick on 2021/12/16.
//

import Foundation

struct Constants {
    enum ErrorMessages {
        static let alreadyInitialized: String = "Unity already initialized"
        static let unloadFirst: String = "Unload Unity first"
        static let initFirst: String = "Initialize Unity first"
        static let cannotBeInitialized: String = "Unity cannot be initialized after quit"
        static let useUnload: String = "Use unload instead"
        static let notInitialized: String = "Unity is not initialized"
    }
    
    enum RenderMode {
        static let FullScreen: NSNumber = 0
        static let BehindUnity: NSNumber = 1
    }
    
    enum ShutterButtonMode {
        static let Off: NSNumber = 0
        static let On: NSNumber = 1
        static let OnlyOnFrontCamera: NSNumber = 2
    }
    
    enum Device {
        static let FrontCamera: NSNumber = 0
        static let BackCamera: NSNumber = 1
    }
}
