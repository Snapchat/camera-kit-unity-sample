//
//  ViewController.swift
//  UnitySwift
//
//  Created by derrick on 2021/10/30.
//

import UIKit

class ViewController: UIViewController {
    
    private var delegate:AppDelegate?
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        guard let appDelegate = UIApplication.shared.delegate as? AppDelegate else {
            return
        }
        self.delegate = appDelegate
        
    }
    
    @IBAction func startUnity(_ sender: Any) {
        guard let appDelegate = self.delegate else {
            return
        }
        appDelegate.initUnity()
        
    }
    
}

