# Camera Kit Unity Template
This repository contains a template project that allows you to build a Unity application and leverage Snap's Camera Kit technology. It supports both iOS and Android builds. 

## Requirements
- Unity 2022.1.23f1
- Camera Kit SDK 1.23.0 (compatible with Lens Studio v4.47)
- Android: 
  - Android Studio Flaming (Min SDK version 22, Target SDK version 33)
  - Gradle 7.2
- iOS:
  - XCode 14.1
  - Cocoapods

## Project structure
This project makes use of [Unity as a Library](https://github.com/Unity-Technologies/uaal-example) to integrate an Unity project with Camera Kit's native iOS and Android SDKs. The fact that we're using Unity as a Library means that the main build of your app will be performed via native build tools ([XCode](https://developer.apple.com/xcode/) for iOS and [Android Studio](https://developer.android.com/studio) for Android). The Unity IDE will not be responsible for building and deploying your code. It will instead export your project as a library tha  is then referenced by the two native apps. That being said, you won't be required to write any native (Swift/Kotlin) code and can still build and configure your app from inside of Unity.

The project contains the following folders:

- [ios-app/](ios-app/): iOS wrapper
- [android-app/](android-app/): Android wrapper
- [unity/](unity/): Unity Project
- [lenses/](lenses/): Lenses used in the demo

## How to use this template

The recommended way to use this template is to start by following the App Setup section below and making sure that you can run demo scene and invoke all 3 lenses. After that, you can create your own scenes and delete the assets for the demo scene, which effectively turns your Unity project into a blank project that is set up to build with Camera Kit.

### Development flow

After the initial setup described below, you will develop your game/app in Unity as normal. The only difference is during build time. You will ask Unity to export a project source code and then shift focus to the native IDE (XCode or Android Studio) and build your native app from there.

### Application behavior

The native apps that wrap your Unity application have the sole purpose of connecting Unity with Camera Kit. Your Unity project is the main application logic and will be invoked as soon as the app starts. From Unity's C# code you can invoke Camera Kit. You are not expected to maintain or write new code in Kotlin/Swift.

## App Setup

### Step 1: Account Setup

Follow the steps on the [Camera Kit Documentation](https://docs.snap.com/snap-kit/camera-kit/guides/quick-start/integrate-sdk/setting-up-accounts) to set up your developer account. You should also upload the sample lenses to your own account via [Lens Studio](https://docs.snap.com/lens-studio/references/guides/publishing/submitting/submitting-your-lens). Before moving on to the steps below you should have access to the [Camera Kit Portal](https://camera-kit.snapchat.com/), from where you'll be able to copy the following information:

- An App ID
- An API Token
- A Lens Group ID
  
### Step 2: Android Setup

1. **In Unity**:
   1. Open the Unity Project ([unity/](unity/))
   2. From the toolbar, open the Menu **Camera Kit** -> **Camera Kit Settings...**
   3. In the dialog that appears, enter your API Key and App ID and press **Save**
   4. Go to Build Settings and change the Platform to **Android**
   5. Still in the Build Settings dialog, check the box **Export Project**
   6. Go to Player Settings -> Settings for Android -> Other Settings, and make sure these options are set
      - Minimum API level: 22
      - Scripting Backend: IL2CPP
      - API Compatibility Level: .NET Standard 2.1
      - Target architectures: ARMv7, ARM64 
   7. Now click **Export** and select as an output folder [unity/exports/unity-android-export](unity/exports/unity-android-export/). **⚠️ Important:** If you select a different folder, you will need to specify its path in the Camera Kit Settings dialog.

2. **In Android Studio**:
   1. File -> Open Project and select the folder [android-app/](android-app/)

3. **Ready!**
   
   Now you're be ready to build your application. You can read here more information on [how to build to a device](https://developer.android.com/studio/run) or emulator from Android Studio.

**Note:** This is a one-time set-up.

### Step 3: iOS Setup
1. In Unity:
   1. Open the Unity Project ([unity/](unity/))
   2. From the toolbar, open the Menu **Camera Kit** -> **Camera Kit Settings...**
   3. In the dialog that appears, enter your API Key and App ID and press **Save**
   4. Go to Build Settings and change the Platform to **iOS**
   5. Click on **Build**  and select as output folder: [exports/unity-ios-export/](exports/unity-ios-export/). **⚠️ Important:** If you select a different folder, you will need to specify its path in the Camera Kit Settings dialog.
2. Click build. Unity will run some postprocessing scripts to prepare your iOS wrapper application
3. Open [unity-ios/main.xcworkspace](unity-ios/main.xcworkspace/). Here you'll have 3 projects:
   - Unity-iPhone: autogenerated code created by your Unity app
   - Pods: autogenerated code created by Cocoapods
   - UnityWithCameraKit: wrapper native application. That's your main application now, the one you will be deploying. 
4. In XCode:
   1. Click on **UnityWithCameraKit** -> Signing and Capabilities, and configure your application's provisioning profile and bundle identifier
   2. Click on **Pods** -> Signing and Capabilities, select the `SCSDKCameraKitReferenceUI` target and choose your Apple Developer team to sign the build
   3. Right-click [Unity-iPhone/Libraries/Plugins/iOS/NativeCallProxy.h](unity/exports/unity-ios-export/Libraries/Plugins/iOS/NativeCallProxy.h) select "Show File Inspector" and in the the right-side Inspector, Target Membership, where the UnityFramework target is selected, change the visibility from "Project" to "Public"
   4. Right-click [Unity-iPhone/Data/](unity/exports/unity-ios-export/Data) folder, select "Show File Inspector" and in the right side Inspector, Target Membership, de-select Unity-iPhone and select UnityFramework
5. **Ready!** Now you're be ready to build your application. Building from XCode should be a familiar step since this is the default workflow for Unity developers. Simply remember that your main project is not Unity-iPhone anymore, it's **`UnityWithCameraKit`** instead.

## Camera Kit Guides and Samples

### 1. Sample: Invoking Camera Kit
```csharp
// 1. Configure Camera Kit to Launch with a Single Lens, passing launch data
var config = new CameraKitConfiguration() 
{ 
   LensId = "abcde-12345-edcba-54321",
   LensGroupId = "aabbcc-112233-eeddcc-554433",
   //...
};


// 2. Invoke Camera Kit
CameraKit.InvokeCameraKit(config);
```


### 2. Sample: Getting Capture Result
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

### 3. Guide: Sending data from Lens to Unity

With the setup above, you're able to invoke a Lens that receives data from your Unity logic. This could be sufficient for use cases like using Lenses for try-on, product display, or shareable moments. But if you want to get data back from your Lens into your C# logic, you'll need to make use of Remote APIs.

Note: Remote APIs have this name because they were originally planned to communicate with remote services via HTTP calls. But on Camera Kit, what the Lens invokes as a Lens API actually triggers native code. So we are leveraging what the Lens understands as a Remote API invocation to trigger local logic in the app, and pass data back to Unity. No server-side logic will be required to callback to your Unity app.

#### 3.1 Remote API Set up
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

From this moment on, you have a **Remote API Spec ID** in the portal, which you will need for the steps below.

#### 3.2 Sending Remote API calls from Lens (Javascript)

You can refer to our documentation portal for information on how to use Remote APIs from your Lens :  [Using API Spec in Lens Studio](https://docs.snap.com/camera-kit/guides/tutorials/communicating-between-lenses-and-app#using-api-spec-in-lens-studio)

You can also refer to the [Coin Collection Lens Sample](lenses/collect-coins/) included in this repository for a working example on how to properly use this API. The relevant code is in [`CoinCollectionController.js`](lenses/collect-coins/Public/Scripts/CoinCollectionController.js)

```javascript
function sendEventToUnity(eventName, eventValue) {
    var dataToSend = {
        "eventName" : eventName,
        "eventValue" : eventValue
    };
    UnityApi.unitySendData(JSON.stringify(dataToSend), function(err, r){
        print("Data sent to Unity");
        print("Error? " + err);
        print("Result? " + r);
    })
}
```

#### 3.3 Responding to Remote API calls from Unity (C#)

```csharp
// 1. Modify this class to reflect your API Response
public class SerializedResponseFromLens
{
   string eventName;
   string eventValue;
   //...
   // You can change this class to match the format of objects you're sending from javascript.
}

// 2. Pass your Remote API Spec ID when invoking CameraKit
var config = new CameraKitConfiguration() {
   //...
   RemoteApiSpecId = "aabbcc-112233-ccbbaa-332211";
   //...
}
CameraKitHandler.InvokeCameraKit(config);
        
// 3. Assign a callback go the Remote API Reponse event
void OnEnable()
{
   CameraKitHandler.OnResponseFromLensEvent += OnCameraKitAPIResponse;
}

// 4. Handle the callback
void OnCameraKitAPIResponse(SerializedResponseFromLens responseObj)
{
   Debug.Log("Received event! " + responseObj.eventName);
}

```

### 4. Guide: Sending data from Unity to Lens
Since lenses are not set up to receive a constant stream of data from the enclosing app, we are leveraging scheduled Remote API calls (see above) to ping the Unity application multiple times per second and get an updated state from the Unity logic. The script that does this in Lens Studio is configurable so that you can define how many calls per second you want to fire. You can see the script in action in the lens included with this repository. For that, please look at the `RequestUnityState.js` file. The definition of "state" here is always a `Dictionary<string,string>` that will be converted to a JSON string and parsed by the lens.

#### 4.1 Remote API Set up

Define a new API endpoint in your Unity API with the following settings:
   1.  Reference ID: `unityRequestState`
   2.  Path: `unityRequestState`
   3.  Method: `GET`


#### 4.2 From Lens, ask Unity to send updated data (Javascript)
Since there is no direct method for a lens to receive pushes from an outside context, the lens needs to poll Unity and wait for its response. The provided [Physics Racing Card Demo Lens](lenses/physics-objects/) shows how to fire a request to Unity and keep that request open until Unity is ready to update the Lens State. There relevant script is [**`RequestUnityState.js`**](lenses/physics-objects/Public/Scripts/RequestUnityState.js)

```javascript
script.api.requestUpdatedStateFromUnity = function() 
{   
    ApiModule.unityRequestState(script.api.handleUnityUpdate)
}

script.api.handleUnityUpdate = function(err, response) {
   if (response) {
      if (response.isPressingButton == "true") {
            global.behaviorSystem.sendCustomTrigger("Unity_ButtonDown");
      } 
      else if (response.isPressingButton == "false") { 
            global.behaviorSystem.sendCustomTrigger("Unity_ButtonUp");
      } 
   }
   
   // As soon as the response is processed, we immediately poll Unity again, leaving another open request, so Unity can send another update to the lens
   script.api.requestUpdatedStateFromUnity()
}

// Leave first request open as soon as the lens starts
script.api.requestUpdatedStateFromUnity();
```

#### 4.2 From Unity, send updated data to Lens (C#)

After that, you can subscribe to the event and update the Lens State, like so:

```csharp
    public void OnControllerButtonPressed() {
        CameraKitHandler.UpdateLensState(new Dictionary<string, string>() {
            {"isPressingButton", "true"}
        });
    }

    public void OnControllerButtonReleased() {
        CameraKitHandler.UpdateLensState(new Dictionary<string, string>() {
            {"isPressingButton", "false"}
        });
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
