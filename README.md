# Camera Kit Unity Template
This repository contains a template project that allows you to build a Unity application and leverage Snap's Camera Kit technology. It supports both iOS and Android builds. 

## Requirements
- Unity 2022.1.23f1
- Camera Kit SDK 1.20.0 (compatible with Lens Studio v4.40)
- Android: 
  - Android Studio Bumblebee (Min SDK version 22, Target SDK version 33)
  - Gradle 7.2
- iOS:
  - XCode 14.1
  - Cocoapods

## Project structure
This project makes use of [Unity as a Library](https://github.com/Unity-Technologies/uaal-example) to integrate an Unity project with Camera Kit's native iOS and Android SDKs. The fact that we're using Unity as a Library means that the main build of your app will be performed via native build tools (XCode for iOS and Android Studio for Android). The Unity IDE will not be responsible for building and deploying your code. It will instead export source code that is then referenced by the two native apps. That being said, you won't be required to write any native (Swift/Kotlin) code and can still build and configure your app from inside of Unity.

The project contains the following folders:
- [ios-app/](ios-app/): iOS wrapper
- [android-app/](android-app/): Android wrapper
- [unity/](unity/): Unity Project 
- [lenses/](lenses/): Lenses used in the demo

## How to use this template 
The recommended way to use this template is to start by following the App Setup section below and making sure that you can run the space shooter demo and invoke Camera Kit successfully on your desired platform(s). After that, you can remove the contents of the Sprites, Scripts, Prefabs and Scenes folders which effectively turns your Unity project into a blank project that is set up to build with Camera Kit.

### Development flow
After the initial setup described below, you will develop your game/app in Unity as normal. The only difference is during build time. You will ask Unity to export a project source code and then shift focus to the native IDE (XCode or Android Studio) and build from there. 

### Application behavior
The native apps that wrap your Unity application have the sole purpose of connecting Unity with Camera Kit. Your Unity project is the main application logic and will be invoked as soon as the app starts. From Unity's C# code you can invoke Camera Kit. 


## App Setup
### Step 1: Account Setup 
Follow the steps on the [Camera Kit Documentation](https://docs.snap.com/snap-kit/camera-kit/guides/quick-start/integrate-sdk/setting-up-accounts) to set up your developer account. Before moving on to the steps below you should have access to the [Camera Kit Portal](https://camera-kit.snapchat.com/), from where you'll be able to copy the following information:
   * An App ID 
   * An API Token
   * A Lens Group ID 
  
### Step 2: Android Setup

1. In Unity: 
   1. Open the Unity Project ([unity/](unity/))
   2. Go to Build Settings and change the Platform to **Android**
   3. Still in the Build Settings dialog, check the box **Export Project**
   4. Go to Player Settings -> Settings for Android -> Other Settings, and make sure these options are set
      * Minimum API level: 22
      * Scripting Backend: IL2CPP
      * API Compatibility Level: .NET Standard 2.1
      * Target architectures: ARMv7, ARM64 
   5. Now click **Export** and select as an output folder [unity/exports/unity-android-e](unity/exports/unity-android-e/). **⚠️ Important:** If you select a different folder, the wrapper application will not work.
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
   1. Open the Unity Project ([unity/](unity/))
   2. Open the Camera Kit menu (Camera Kit -> Camera Kit Settings)
   3. Input your API Token and App ID (found in the Camera Kit portal) and hit save
   4. (Optionally, if you have a different install path for Cocoapods, or have the wrapper app in a different folder, you can configure them in the iOS settings tab)
   5. Go to Build Settings and change the Platform to **iOS**
   6. Click on **Build**  and select as output folder: [exports/unity-ios-export/](exports/unity-ios-export/). **⚠️ Important:** If you select a different folder, the wrapper application will not work.
2. Click build. Unity will run some postprocessing scripts to prepare your iOS wrapper application
3. Open [unity-ios/main.xcworkspace](unity-ios/main.xcworkspace/). Here you'll have 3 projects:
   * Unity-iPhone: autogenerated code created by your Unity app
   * Pods: autogenerated code created by Cocoapods
   * UnityWithCameraKit: wrapper native application
4. In XCode: 
   1. Click on **UnityWithCameraKit** -> Signing and Capabilities, and configure your application's provisioning profile and bundle identifier
   2. Click on **Pods** -> Signing and Capabilities, select the SCSDKCameraKitReferenceUI target and choose your Apple Developer team to sign the build
   3. Right-click [Unity-iPhone/Libraries/Plugins/iOS/NativeCallProxy.h](unity/exports/unity-ios-export/Libraries/Plugins/iOS/NativeCallProxy.h) select "Show File Inspector" and in the the right-side Inspector, Target Membership, where the UnityFramework target is selected, change the visibility from "Project" to "Public"
   4. Right-click [Unity-iPhone/Data/](unity/exports/unity-ios-export/Data) folder, select "Show File Inspector" and in the right side Inspector, Target Membership, de-select Unity-iPhone and select UnityFramework
5. **Ready!** Now you're be ready to build your application. Building from XCode should be a familiar step since this is the default workflow for Unity developers. Simply remember that your main project is not Unity-iPhone anymore, it's **UnityWithCameraKit** instead.

## Camera Kit C# API

### Invoking Camera Kit
```csharp
// 1. Configure Camera Kit to Launch with a Single Lens, passing launch data
var config = CameraKitConfiguration.CreateWithSingleLens(lensId, groupId, launchData);

// 2. Invoke Camera Kit
CameraKit.InvokeCameraKit(config);
```


### Getting Capture Result
```csharp
// 1. Assign a callback go the Remote API Reponse event
void OnEnable()
{
   CameraKitHandler.OnCaptureFinished += OnCameraKitCaptured;
}

// 3. Handle the callback
void OnCameraKitCaptured(string capturedFileUri)
{
   Debug.Log("Camera Kit captured. File " + capturedFileUri);
}

```

## Optional: Sending data from Lens to Unity

With the setup above, you're able to invoke a Lens that receives data from your Unity logic. This could be sufficient for use cases like using Lenses for try-on, product display, or shareable moments. But if you want to get data back from your Lens into your C# logic, you'll need to make use of Remote APIs.

Note: Remote APIs have this name because they were originally planned to communicate with remote services via HTTP calls. But on Camera Kit, what the Lens invokes as a Lens API actually triggers native code. So we are leveraging what the Lens understands as a Remote API invocation to trigger local logic in the app, and pass data back to Unity. No server-side logic will be required to callback to your Unity app.

### Remote API Set up
In order to get a callback from your app, you'll need to configure a Remote API. You can [read more about Remote APIs here](https://docs.snap.com/camera-kit/guides/tutorials/communicating-between-lenses-and-app)
1. Open the API Dashboard here: [my-lenses.snapchat.com/apis](https://my-lenses.snapchat.com/apis)
2. Select Add API, and fill out the information as below:
   1. Target platforms: `CAMERA_KIT`
   2. Visibility: `Private`
   3. Host: `unity`
   4. Security Scheme: `NONE`
   5.  Click **Next**
3. In the following screen, add an Endpoint with information as below:
   1.  Reference ID: `unitySendData`
   2.  Path: `sendData`
   3.  Method: `POST`
4. Click **Add Parameter**, and add a Parameter with information as below:
   1. Name: `unityData`
   2. Parameter Location: `HEADER`
   3. External Name: `unitySendData`
   4. Optional: `YES`
   5. Constant: `NO`
5. Check the confirmation box and click **Submit API**

In the end, your API should look like this:

<img src="readme-images/RemoteAPIconfig.png" width="400px">

From this moment on, you have a **Remote API Spec ID** in the portal, which you will need for the steps below.

### Invoking Remote API from Lens (Javascript)
You can refer to our documentation portal for information on how to use Remote APIs from your Lens :  [Using API Spec in Lens Studio](https://docs.snap.com/camera-kit/guides/tutorials/communicating-between-lenses-and-app#using-api-spec-in-lens-studio)

You can also refer to the Lens sample included in this repository for a working example on how to properly use this API. The relevant code is in [ShipSelector.js](lens/lens0/Public/ShipSelector.js)

### Handling Remote API callback from Unity (C#)

```csharp
// 1. Modify this class to reflect your API Response
public class SerializedResponseFromLens
{
   ...
}

// 2. Pass your Remote API Spec ID when invoking CameraKit
var config = CameraKitConfiguration.CreateWithSingleLens(...);
config.RemoteApiSpecId = "YOUR-REMOTE-API-SPEC-ID";
CameraKitHandler.InvokeCameraKit(config);
        
// 3. Assign a callback go the Remote API Reponse event
void OnEnable()
{
   CameraKitHandler.OnResponseFromLensEvent += OnCameraKitAPIResponse;
}

// 4. Handle the callback
void OnCameraKitAPIResponse(SerializedResponseFromLens responseObj)
{
   ...
}

```

## Optional: Sending data from Unity to Lens
Since lenses are not set up to receive a constant stream of data from the enclosing app, we are leveraging scheduled Remote API calls (see above) to ping the Unity application multiple times per second and get an updated state from the Unity logic. The script that does this in Lens Studio is configurable so that you can define how many calls per second you want to fire. You can see the script in action in the lens included with this repository. For that, please look at the `RequestUnityState.js` file. The definition of "state" here is always a `Dictionary<string,string>` that will be converted to a JSON string and parsed by the lens.

Define a new API endpoint in your Unity API with the following settings:
   1.  Reference ID: `unityRequestState`
   2.  Path: `unityRequestState`
   3.  Method: `GET`

After that, you can subscribe to the event and update the Lens State, like so:

```csharp
   void OnEnable()
    {   
        CameraKitHandler.OnLensRequestedUpdatedState += OnLensRequestedState;
    }

    void OnDisable() 
    {
        CameraKitHandler.OnLensRequestedUpdatedState -= OnLensRequestedState;
    }

    private void OnLensRequestedState() {
        var updatedState = new Dictionary<string, string>() {
            { "shotsOnInvader", _shotsOnAlien.ToString() }
        };
        CameraKitHandler.UpdateLensState(updatedState);
    }
```

# CameraKitHandler

## Events
### ⚡️ `OnResponseFromLensEvent` 
Fires when the CameraKit Lens invokes the `unitySendData` endpoint of the Remote API. 
This event will contain a `SerializedResponseFromLens` object with data passed by the lens. You can modify the `SerializedResponseFromLens` class to match the data sent by your lens.

### ⚡️ `OnCameraDismissed`
Fires when CameraKit is dismissed.

### ⚡️ `OnCaptureFinished`
Fires when CameraKit finishes capturing. This event will contain an `string` object that contains a path to the captured file.

### ⚡️ `OnLensRequestedUpdatedState`
Fires when CameraKit is asking for an updated State from Unity. You can set your Lens logic to request this at specific times, or on a schedule (multiple times per second) as in the example provided with this repository. To properly respond to this event, call `CameraKitHandler.UpdateLensState` in the event handler.

## Methods
### ▶️ `DismissCameraKit()`
Stops camera and rendering. Sets unity view background color to black. 

### ▶️ `UpdateLensState(Dictionary<string,string> state)`
Updates lens state that will be fetched next stime the lens requests it. 

### ▶️ `InvokeCameraKit(CameraKitConfiguration config)`
Starts Camera Kit with the provided configuration
