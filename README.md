# Camera Kit Unity Template
This repository contains a template project that allows you to build a Unity application and leverage Snap's Camera Kit technology. It supports both iOS and Android builds. 

<img src="readme-images/ck-demo.gif" width="200px">

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

## How to use this template

 
The recommended way to use this template is to start by following the App Setup section below and making sure that you can run the space shooter demo and invoke Camera Kit successfully on your desired platform(s). After that, you can remove the contents of the Sprites, Scripts, Prefabs and Scenes folders which effectively turns your Unity project into a blank project that is set up to build with Camera Kit.

### Development flow
After the initial setup described below, you will develop your game/app in Unity as normal. The only difference is during build time. You will ask Unity to export a project source code and then shift focus to the native IDE (XCode or Android Studio) and build from there. This also means that application metadata (icons, descriptions) will not be handled by Unity and will need to be set up in the native IDEs.

### Application behavior
The native apps that wrap your Unity application have the sole purpose of connecting Unity with Camera Kit. Your Unity project is the main application logic and will be invoked as soon as the app starts. From Unity's C# code you can invoke Camera Kit. Camera Kit is invoked as an Form Sheet Modal on iOS (where swiping down returns to the game) and a full screen activity on Android (where pressing the back button returns to the game). A Unity pause signal is sent to your application whenever Camera Kit is invoked/dismissed so make sure to respond to Application Pause events in your Unity logic


## App Setup
### Step 1: Account Setup 
Follow the steps on the [Camera Kit Documentation](https://docs.snap.com/snap-kit/camera-kit/guides/quick-start/integrate-sdk/setting-up-accounts) to set up your developer account. Before moving on to the steps below you should have access to the [Camera Kit Portal](https://camera-kit.snapchat.com/), from where you'll be able to copy the following information:
   * An App ID 
   * An API Token
   * A Lens Group ID 
  
### Step 2: Android Setup

1. In Unity: 
   1. Open the Unity Project ([unity-game/](unity-game/))
   2. Go to Build Settings and change the Platform to **Android**
   3. Still in the Build Settings dialog, check the box **Export Project**
   4. Go to Player Settings -> Settings for Android -> Other Settings, and make sure these options are set
      * Minimum API level: 22
      * Scripting Backend: IL2CPP
      * API Compatibility Level: .NET Standard 2.1
      * Target architectures: ARMv7, ARM64 
   5. Now click **Export** and select as an output folder [unity-game/unity-android-build](unity-game/unity-android-build/). **⚠️ Important:** If you select a different folder, the wrapper application will not work.
2. In Android Studio:
   1. File -> Open Project and select the folder [unity-android/](unity-android/)
   2. Add your API Key and App ID to [unity-android/app/src/main/AndroidManifest.xml](unity-android/app/src/main/AndroidManifest.xml), replacing the placeholder strings
   3. Copy the `ndk.dir` property from [unity-game/unity-android-build/local.properties](unity-game/unity-android-build/local.properties) and append it to [unity-android/local.properties](unity-android/local.properties)
   4. Open the file [unity-game/unity-android-build/unityLibrary/src/main/AndroidManifest.xml](unity-game/unity-android-build/unityLibrary/src/main/AndroidManifest.xml) and add the property `android:exported="true"` to `UnityPlayerActivity`. It should look like this: `
<activity android:name="com.unity3d.player.UnityPlayerActivity" android:exported="true" ... >`
1. **Ready!** Now you're be ready to build your application. You can read here more information on [how to build to a device](https://developer.android.com/studio/run) or emulator from Android Studio.

**Note:** This is a one-time set-up. However, if you ever delete your output folder when exporting from Unity, you'll need to perform steps 7 and 8 again.

### Step 3: iOS Setup
1. In Unity:
   1. Open the Unity Project ([unity-game/](unity-game/))
   2. Go to Build Settings and change the Platform to **iOS**
   3. Click on **Build**  and select as output folder: [unity-game/unity-ios-build/](unity-game/unity-ios-build/). **⚠️ Important:** If you select a different folder, the wrapper application will not work.
2. Run `pod install` on [unity-ios/](unity-ios) to install [Cocoapods](https://cocoapods.org/) dependencies 
3. Open [unity-ios/main.xcworkspace](unity-ios/main.xcworkspace/). Here you'll have 3 projects:
   * Unity-iPhone: autogenerated code created by your Unity app
   * Pods: autogenerated code created by Cocoapods
   * UnitySwift: wrapper native application
4. In XCode: 
   1. Click on **UnitySwift** -> Signing and Capabilities, and configure your application's provisioning profile and bundle identifier
   2. Click on **Pods** -> Signing and Capabilities, select the SCSDKCameraKitReferenceUI target and choose your Apple Developer team to sign the build
   3. Right-click [Unity-iPhone/Libraries/Plugins/iOS/NativeCallProxy.h](unity-game/unity-ios-build/Libraries/Plugins/iOS/NativeCallProxy.h) select "Show File Inspector" and in the the right-side Inspector, Target Membership, where the UnityFramework target is selected, change the visibility from "Project" to "Public"
   4. Right-click [Unity-iPhone/Data/](unity-game/unity-ios-build/Data) folder, select "Show File Inspector" and in the right side Inspector, Target Membership, de-select Unity-iPhone and select UnityFramework
   5. Open [UnitySwift/Info.plist](unity-ios/UnitySwift/Info.plist) and add your API Key and App ID, replacing the placeholder strings
5. **Ready!** Now you're be ready to build your application. Building from XCode should be a familiar step since this is the default workflow for Unity developers. Simply remember that your main project is not Unity-iPhone anymore, it's UnitySwift instead.

## Camera Kit C# API

### Invoking Camera Kit
```csharp
// Configuring Camera Kit to Launch with a Single Lens, passing launch data
var config = CameraKitConfiguration.CreateWithSingleLens(lensId, groupId, launchData);

// Invoking Camera Kit
CameraKit.InvokeCameraKit(config);
```

### Using Remote APIs
```csharp

```

### Getting Capture Result
```csharp

```


## Camera Kit Features supported
- [x] Open Camera Kit with multiple Lens Groups in carousel
- [x] Define Lens that should be initially selected
- [x] Open Camera Kit with a Single Lens
- [x] Send Launch Params on a Single Lens
- [x] Use Remote API to get data back from Lenses
- [ ] Send Launch Params to all lenses in a collection of Lens Groups (WIP)

