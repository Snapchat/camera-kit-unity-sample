//
//  UnitySampleConstant.swift
//  UnitySwift
//
//  Created by derrick on 2021/12/16.
//

import Foundation

struct Constants {
    struct ERRORMESSAGES {
        static let ALREADY_INIT: String = "Unity already initialized"
        static let UNLOAD_FIREST: String = "Unload Unity first"
        static let INIT_FIREST: String = "Initialize Unity first"
        static let CANNOTBE_INITIALIZED: String = "Unity cannot be initialized after quit"
        static let USE_UNLOAD: String = "Use unload instead"
        static let NOT_INITIALIZED: String = "Unity is not initialized"
    }
    
    struct COLOR {
        static let RED: String = "RED"
        static let BLUE: String = "BLUE"
        static let WHITE: String = "WHITE"
    }
}
