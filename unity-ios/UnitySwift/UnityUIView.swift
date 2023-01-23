//
//  UnityUISampleView.swift
//  UnitySwift
//
//  Created by derrick on 2021/12/16.
//

import UIKit

class UnityUIView: UIView {
    private var delegate: AppDelegate?

    public let nativeTitleLable: UILabel = {
        let label = UILabel()
        label.frame = CGRect(x: 400, y: 20, width: 250, height: 30)
        label.text = "Native UI Buttons"
        label.textAlignment = NSTextAlignment.center
        label.backgroundColor = UIColor.blue
        label.textColor = UIColor.white
        label.font = UIFont.boldSystemFont(ofSize: 20)
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()

    let unloadButton: UIButton = {
        let button = UIButton()
        button.frame = CGRect(x: 400, y: 60, width: 100, height: 30)
        button.setTitleColor(.white, for: .normal)
        button.backgroundColor = UIColor.systemPink
        button.titleLabel?.font = UIFont.boldSystemFont(ofSize: 20)
        button.setTitle("Unload", for: .normal)
        button.translatesAutoresizingMaskIntoConstraints = false
        button.addTarget(self, action: #selector(unloadButtonTouched), for: .primaryActionTriggered)
        return button
    }()

    let quitButton: UIButton = {
        let button = UIButton()
        button.frame = CGRect(x: 510, y: 60, width: 100, height: 30)
        button.setTitleColor(.white, for: .normal)
        button.titleLabel?.font = UIFont.boldSystemFont(ofSize: 20)
        button.setTitle("Quit", for: .normal)
        button.backgroundColor = UIColor.systemBlue
        button.translatesAutoresizingMaskIntoConstraints = false
        button.addTarget(self, action: #selector(quitButtonTouched), for: .primaryActionTriggered)
        return button
    }()

    override init(frame: CGRect) {
        super.init(frame: frame)
        commonInit()
    }

    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        commonInit()
    }

    private func commonInit() {
        if let temDelegate = UIApplication.shared.delegate as? AppDelegate {
            delegate = temDelegate
        } else {
        }
    }

    @objc
    func unloadButtonTouched(sender: UIButton) {
        if let delegate {
            delegate.unloadButtonTouched(sender)
        } else {
        }
    }

    @objc
    func quitButtonTouched(sender: UIButton) {
        if let delegate {
            delegate.quitButtonTouched(sender)
        } else {
        }
    }
}
