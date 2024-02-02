using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEditor.Callbacks;
using Debug = UnityEngine.Debug;
using System.Text.RegularExpressions;
#if UNITY_IOS
using UnityEditor.iOS.Xcode;
#endif
using UnityEngine;

[Serializable]
public class CamKitSettings
{
    public string ApiToken;
    public string AppId;
    
    // IOS Settings
    public string CocoaPodsAbsolutePath = "/usr/local/bin/pod";
    public string IosWrapperProjectRelativePath = "../../../app-ios/";

    // Android Settings
    public string AndroidWrapperProjectRelativePath = "../../../app-android/";
}

public class CameraKitSettingsWindow : EditorWindow
{
    private static CamKitSettings Config = new CamKitSettings();
    private static string CONFIG_PATH = Application.dataPath + "/Scripts/CameraKit/Editor/CamkitSettings.json";

    [MenuItem("Camera Kit/Camera Kit Settings")]
    public static void ShowWindow() {
        Config = ReadSettingsFromDisk();    
        EditorWindow.GetWindow(typeof(CameraKitSettingsWindow), false, "Camera Kit Settings", true);
    }

    public static void OnDestroy() {
        Debug.Log("Window was closed");
    }

    void OnGUI() {
        
        EditorGUILayout.LabelField("Camera Kit Version: " + Constants.CAMERA_KIT_VERSION, new GUIStyle(GUI.skin.label) { alignment=TextAnchor.MiddleCenter}, GUILayout.ExpandWidth(true));

        EditorGUILayout.Separator();

        Config.ApiToken = EditorGUILayout.TextField("API Token: ", Config.ApiToken);
        Config.AppId = EditorGUILayout.TextField("App ID: ", Config.AppId);

        EditorGUILayout.Separator();

        var buildTarget = EditorGUILayout.BeginBuildTargetSelectionGrouping();
        if (buildTarget == BuildTargetGroup.Android) {

        }
        if (buildTarget == BuildTargetGroup.iOS) {
            Config.CocoaPodsAbsolutePath = EditorGUILayout.TextField("Cocoapods Executable Path: ", Config.CocoaPodsAbsolutePath);
            Config.IosWrapperProjectRelativePath = EditorGUILayout.TextField("Xcode Wrapper Path", Config.IosWrapperProjectRelativePath);
            // if (GUILayout.Button("DEBUG - Run IOS Postprocess")) {
            //     var pathToBuiltProject = Path.Combine(Application.dataPath, "../exports/unity-ios-export/");
            //     OnPostProcessBuild(BuildTarget.iOS, pathToBuiltProject);
            // }
        } else if (buildTarget == BuildTargetGroup.Android) {
            Config.AndroidWrapperProjectRelativePath = EditorGUILayout.TextField("Android Wrapper Path: ", Config.AndroidWrapperProjectRelativePath);
            // if (GUILayout.Button("DEBUG - Run Android Postprocess")) {
            //     var pathToBuiltProject = Path.Combine(Application.dataPath, "../exports/unity-android-export/");
            //     OnPostProcessBuild(BuildTarget.Android, pathToBuiltProject);
            // }
        }
        EditorGUILayout.EndBuildTargetSelectionGrouping();
        
        EditorGUILayout.Separator();

        if (GUILayout.Button("Save")) {
            WriteSettingsToDisk(Config);
        }  
    }

    private static CamKitSettings ReadSettingsFromDisk() 
    {
        if (!File.Exists(CONFIG_PATH)) {
            Debug.LogWarning("Camera Kit Settings did not exist. Creating new: " + CONFIG_PATH);
            var settings = new CamKitSettings();
            WriteSettingsToDisk(settings);
            return settings;
        } else {
            var strContent = File.ReadAllText(CONFIG_PATH);
            try {
                return JsonUtility.FromJson<CamKitSettings>(strContent);
            } catch (Exception ex){
                Debug.LogError("Could not parse Camera Kit settings file. " + ex.Message);
                return new CamKitSettings();
            }
        }
    }

    private static void WriteSettingsToDisk(CamKitSettings settings) 
    {
        var jsonString = JsonUtility.ToJson(settings, true);
        File.WriteAllText(CONFIG_PATH, jsonString);
    }

     static void CopyDirectory(string sourceDir, string destinationDir, bool recursive)
    {
        var dir = new DirectoryInfo(sourceDir);
        if (!dir.Exists)
            throw new DirectoryNotFoundException($"Source directory not found: {dir.FullName}");

        DirectoryInfo[] dirs = dir.GetDirectories();
        Directory.CreateDirectory(destinationDir);
        foreach (FileInfo file in dir.GetFiles())
        {
            string targetFilePath = Path.Combine(destinationDir, file.Name);
            file.CopyTo(targetFilePath, true);
        }
        if (recursive)
        {
            foreach (DirectoryInfo subDir in dirs)
            {
                string newDestinationDir = Path.Combine(destinationDir, subDir.Name);
                CopyDirectory(subDir.FullName, newDestinationDir, true);
            }
        }
    }

    #region ANDROID

    #if UNITY_ANDROID
    // Android Post-processing
    [PostProcessBuild]
    static void OnPostProcessBuild(BuildTarget buildTarget, string pathToBuiltProject) {
        Debug.Log("Android postprocess started");
        Config = ReadSettingsFromDisk();
        Android_PrepareManifestFile(pathToBuiltProject);
        Android_RewriteImports(pathToBuiltProject);
        Android_PrepareGradeFiles(pathToBuiltProject);
        Android_CopyAssets(pathToBuiltProject);
        Debug.Log("Android postprocess finished");
    }

    static void Android_PrepareGradeFiles(string pathToBuiltProject) {
        var templatePath = Path.Combine(Application.dataPath, "Plugins/Android/buildgradleTemplate");
        var destGradlePath = Path.Combine(pathToBuiltProject, Config.AndroidWrapperProjectRelativePath, "build.gradle");
        var gradleContent = File.ReadAllText(templatePath);

        gradleContent = gradleContent.Replace("$CAMERAKITVERSION", Constants.CAMERA_KIT_VERSION);

        File.WriteAllText(destGradlePath, gradleContent);

        var propertiesPath = Path.Combine(pathToBuiltProject, "local.properties");
        var destPropertiesPath = Path.Combine(pathToBuiltProject, Config.AndroidWrapperProjectRelativePath, "local.properties");
        File.Copy(propertiesPath, destPropertiesPath, true);
        
        Debug.Log("Finished writing gradle files");
    }

    static void Android_PrepareManifestFile(string pathToBuiltProject) {
        var templatePath = Path.Combine(Application.dataPath, "Plugins/Android/AndroidManifestTemplate");
        var destManifestPath = Path.Combine(pathToBuiltProject, Config.AndroidWrapperProjectRelativePath, "app/src/main/AndroidManifest.xml");
        var manifestContent = File.ReadAllText(templatePath);
        
        manifestContent = manifestContent.Replace("$APPNAME", Application.productName);
        manifestContent = manifestContent.Replace("$BUNDLEIDENTIFIER", Application.identifier);
        manifestContent = manifestContent.Replace("$CAMERAKITAPPID", Config.AppId);
        manifestContent = manifestContent.Replace("$CAMERAKITAPITOKEN", Config.ApiToken);

        File.WriteAllText(destManifestPath, manifestContent);
        Debug.Log("Finished writing manifest file to " + destManifestPath);
    }

    static void Android_RewriteImports(string pathToBuiltProject) {
        var filesToRewriteImports = new string[] {"MainUnityActivity.kt", "UnityPlayerFragment.kt"};
        foreach (var file in filesToRewriteImports) {
            var filePath = Path.Combine(pathToBuiltProject, Config.AndroidWrapperProjectRelativePath, "app/src/main/java/com/snap/camerakitsamples/unity/android", file);
            var content = File.ReadAllText(filePath);
            content = content.Replace("com.snap.camerakit.mydemogame", Application.identifier);
            File.WriteAllText(filePath, content);
        }
        Debug.Log("Finished rewriting imports");
    }

    static void Android_CopyAssets(string pathToBuiltProject) {
        var allMipmapfolders = Directory.GetDirectories(Path.Combine(pathToBuiltProject, "launcher/src/main/res"), "mipmap*", SearchOption.AllDirectories);
        var destDir = Path.Combine(pathToBuiltProject, Config.AndroidWrapperProjectRelativePath, "app/src/main/res");
        foreach(var mipmapFolder in allMipmapfolders) {
            
            var destMipmap = Path.Combine(destDir, new DirectoryInfo(mipmapFolder).Name);
            CopyDirectory(mipmapFolder, destMipmap, true);
        }        
        Debug.Log("Finished copying assets");
    }

    #endif



    #endregion

    #region IOS

    #if UNITY_IOS
    // iOS Post-processing
    [PostProcessBuild]
    static void OnPostProcessBuild(BuildTarget buildTarget, string pathToBuiltProject)
    {
        Debug.Log("iOS: Post process started");
        Config = ReadSettingsFromDisk();
        iOSTask_ConfigureInfoPlist(pathToBuiltProject);
        iOSTask_ConfigureXcodeProject(pathToBuiltProject);
        iOSTask_RunCocoapods(pathToBuiltProject);
        Debug.Log("iOS: Post process finished");
    }

    static void iOSTask_RunCocoapods(string pathToBuiltProject)
    {
        var podfileStr = File.ReadAllText(Application.dataPath + "/Plugins/iOS/Podfile");
        podfileStr = podfileStr.Replace("$CAMKITVERSION", Constants.CAMERA_KIT_VERSION);
        var newPodfilePath = Path.Combine(pathToBuiltProject, Config.IosWrapperProjectRelativePath, "Podfile");
        File.WriteAllText(newPodfilePath, podfileStr);
        Debug.Log("Pod file copied to " + newPodfilePath);
        Debug.Log("Going to run Cocoapods");
        var proc = new Process
			{
				StartInfo =
				{
					WorkingDirectory = Path.GetDirectoryName(newPodfilePath),
					FileName = Config.CocoaPodsAbsolutePath,
					Arguments = "install",
					UseShellExecute = false,
					RedirectStandardOutput = true,
					CreateNoWindow = true
				}
			};
        proc.StartInfo.RedirectStandardError = true;
        proc.StartInfo.RedirectStandardOutput = true;
        proc.StartInfo.EnvironmentVariables.Add("LANG", "en_US.UTF-8");
        proc.Start();
        string output = proc.StandardOutput.ReadToEnd();
        string errorOut = proc.StandardError.ReadToEnd();        
        proc.WaitForExit();
        if (!String.IsNullOrEmpty(output)) { Debug.Log("Cocoapods output: " + output); }
        if (!String.IsNullOrEmpty(errorOut)) { Debug.LogError("Cocoapods Error output: " + errorOut); }
        Debug.Log("Finished running Cocoapods");
        
    }

    static void iOSTask_ConfigureXcodeProject(string pathToBuiltProject)
    {
        Debug.Log("Going to copy assets");
        var destAssets = Path.Combine(pathToBuiltProject, Config.IosWrapperProjectRelativePath, "UnityWithCameraKit/Assets.xcassets");
        var srcAssets = Path.Combine(pathToBuiltProject, "Unity-iPhone/Images.xcassets");
        CopyDirectory(srcAssets, destAssets, true);
        Debug.Log("Finished copying assets");
        Debug.Log("Going to update bundle identifier");
        var pbxPath = Path.Combine(pathToBuiltProject, Config.IosWrapperProjectRelativePath, "UnityWithCameraKit.xcodeproj/project.pbxproj");
        var pbxProject = new PBXProject();
        pbxProject.ReadFromFile(pbxPath);
        var targetGuid = pbxProject.TargetGuidByName("UnityWithCameraKit");
        Debug.Log("pbxPath " + pbxPath);
        Debug.Log("targetGuid " + targetGuid);
        Debug.Log("bundle id " + Application.identifier);
        pbxProject.SetBuildProperty(targetGuid, "PRODUCT_BUNDLE_IDENTIFIER", Application.identifier);
        pbxProject.WriteToFile(pbxPath);
        Debug.Log("Finished updating bundle identifier");
    }

    static void iOSTask_ConfigureInfoPlist(string pathToBuiltProject)
    {
        Debug.Log("Going to edit Info.plist");
        var infoPlistPath = Path.Combine(pathToBuiltProject, Config.IosWrapperProjectRelativePath, "UnityWithCameraKit/Info.plist");
        var plist = new PlistDocument();
        plist.ReadFromString(File.ReadAllText(infoPlistPath));


        var rootDict = plist.root;
        rootDict["SCCameraKitClientID"] = new PlistElementString(Config.AppId);
        rootDict["SCCameraKitAPIToken"] = new PlistElementString(Config.ApiToken);
        rootDict["CFBundleIdentifier"] = new PlistElementString(Application.identifier);

        File.WriteAllText(infoPlistPath, plist.WriteToString());
        Debug.Log("Finished editing Info.plist");
    }
    #endif

    #endregion
   
}
