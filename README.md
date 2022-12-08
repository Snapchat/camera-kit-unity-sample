# Camera Kit Unity Template
This repository contains a template set up that allows you to build a Unity application and leverage Snap's CameraKit technology. It supports both iOS and Android builds. 

## Requirements
- Unity 2022.1.23f1
- Camera Kit SDK 1.18.1 (compatible with Lens Studio v4.34)
- Android: 
  - Android Studio Bumblebee (Min SDK version 22, Target SDK version 33)
  - Gradle 7.2
- iOS:
  - XCode 14.1
  - Cocoapods

## Project structure
This project makes use of [Unity as a Library](https://github.com/Unity-Technologies/uaal-example) to integrate an Unity project with Camera Kit's native iOS and Android SDKs. The fact that we're using Unity as a Library means that the main build of your app will be performed via native build tools (XCode for iOS and Android Studio for Android). The Unity IDE will not be responsible for building and deploying your code. It will instead export source code that is then referenced by the two native apps. We built this sample keeping in mind that the majority of Unity developers don't want to spend time in native code, so there will be a small amount of configuration needed in both native apps and all of the application logic will be written in Unity's managed code (C#).

The project contains the following folders:
- [unity-ios/](unity-ios/): iOS wrapper
- [unity-android/](unity-android/): Android wrapper
- [unity-game/](unity-game/): Unity Project 
- [lens/](lens/): Sample Dynamic Lens project

## What to expect
### Development flow
After the initial setup described below, you will develop your game/app in Unity as normal. The only difference is during build time. You will ask Unity to export a project source code and then shift focus to the native IDE (XCode or Android Studio) and build from there. This also means that application metadata (icons, descriptions) will not be handled by Unity and will need to be set up in the native IDEs.
### Application behavior
The native apps that wrap your Unity application have the sole purpose of connecting Unity with CameraKit. Your Unity project is the main application logic and will be invoked as soon as the app starts. From Unity's C# code you can invoke Camera Kit. Camera Kit is invoked as an Form Sheet Modal on iOS (where swiping down returns to the game) and a full screen activity on Android (where pressing the back button returns to the game). A Unity pause signal is sent to your application whenever Camera Kit is invoked/dismissed so make sure to respond to Application Pause events in your Unity logic

<!-- TODO: insert gif --> 

## App Setup
### Step 1: Account Setup 
Follow the steps on the [Camera Kit Documentation](https://docs.snap.com/snap-kit/camera-kit/guides/quick-start/integrate-sdk/setting-up-accounts) to set up your developer account. Before moving on to the steps below you should have access to the [Camera Kit Portal](https://camera-kit.snapchat.com/), from where you'll be able to copy the following information:
   * An App ID 
   * An API Token
   * A Lens Group ID 
  
### Step 2: Android Setup

**Note:** These steps should only be performed once. But if you ever clean your output folder when exporting from Unity, you'll need to perform steps 6 and 7 again.

1. In Unity, open the Unity Project ([unity-game/](unity-game/))
1. Go to Build Settings and change the Platform to **Android**
1. Still in the Build Settings dialog, check the box **Export Project**
1. Go to Player Settings -> Settings for Android -> Other Settings, and make sure these options are set
   * Minimum API level: 22
   * Scripting Backend: IL2CPP
   * API Compatibility Level: .NET Standard 2.1
   * Target architectures: ARMv7, ARM64 
1. Add your API Key and App ID to  [unity-android/app/src/main/AndroidManifest.xml](unity-android/app/src/main/AndroidManifest.xml), replacing the placeholder strings
1. Copy the `ndk.dir` property from [unity-game/unity-android-build/local.properties](unity-game/unity-android-build/local.properties) and append it to [unity-android/local.properties](unity-android/local.properties)
1. Open the file [unity-game/unity-android-build/unityLibrary/src/main/AndroidManifest.xml](unity-game/unity-android-build/unityLibrary/src/main/AndroidManifest.xml) and add the property `android:exported="true"` to `UnityPlayerActivity`. It should look like this: `
<activity android:name="com.unity3d.player.UnityPlayerActivity" android:exported="true" ... >`
1. Now you should be ready to build your application. You can read here more information on [how to build to a device](https://developer.android.com/studio/run) or emulator from Android Studio.




### Step 3: iOS Setup
1. In Unity, open Build Settings and change the project target to iOS
2. 
