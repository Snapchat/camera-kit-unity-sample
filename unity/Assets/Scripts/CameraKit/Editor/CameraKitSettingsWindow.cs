using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEditor.Callbacks;
using Debug = UnityEngine.Debug;
using UnityEditor.Build;
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
    
    // Changing this string will update camera kit references on iOS and Android
    public string CameraKitVersion = "1.23.0"; 

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
        
        EditorGUILayout.LabelField("Camera Kit Version: " + Config.CameraKitVersion, new GUIStyle(GUI.skin.label) { alignment=TextAnchor.MiddleCenter}, GUILayout.ExpandWidth(true));

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
            if (GUILayout.Button("DEBUG - Run Android Postprocess")) {
                var pathToBuiltProject = Path.Combine(Application.dataPath, "../exports/unity-android-export/");
                OnPostProcessBuild(BuildTarget.Android, pathToBuiltProject);
            }
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
        Android_PrepareGradeFiles(pathToBuiltProject);
        Debug.Log("Android postprocess finished");
    }

    static void Android_PrepareGradeFiles(string pathToBuiltProject) {
        var templatePath = Path.Combine(Application.dataPath, "Plugins/Android/buildgradleTemplate");
        var destGradlePath = Path.Combine(pathToBuiltProject, Config.AndroidWrapperProjectRelativePath, "build.gradle");
        var gradleContent = File.ReadAllText(templatePath);

        gradleContent = gradleContent.Replace("$CAMERAKITVERSION", Config.CameraKitVersion);

        File.WriteAllText(destGradlePath, gradleContent);
        Debug.Log("Finished writing gradle file to " + destGradlePath);        
    }

    static void Android_PrepareManifestFile(string pathToBuiltProject) {
        var templatePath = Path.Combine(Application.dataPath, "Plugins/Android/AndroidManifestTemplate");
        var destManifestPath = Path.Combine(pathToBuiltProject, Config.AndroidWrapperProjectRelativePath, "app/src/main/AndroidManifest.xml");
        var manifestContent = File.ReadAllText(templatePath);
        
        manifestContent = manifestContent.Replace("$CAMERAKITAPPID", Config.AppId);
        manifestContent = manifestContent.Replace("$CAMERAKITAPITOKEN", Config.ApiToken);

        File.WriteAllText(destManifestPath, manifestContent);
        Debug.Log("Finished writing manifest file to " + destManifestPath);
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
        podfileStr = podfileStr.Replace("$CAMKITVERSION", Config.CameraKitVersion);
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
        var destAssets = Path.Combine(pathToBuiltProject, Config.IosWrapperProjectRelativePath, "UnitySwift/Assets.xcassets");
        var srcAssets = Path.Combine(pathToBuiltProject, "Unity-iPhone/Images.xcassets");
        CopyDirectory(srcAssets, destAssets, true);
        Debug.Log("Finished copying assets");
    }

    static void iOSTask_ConfigureInfoPlist(string pathToBuiltProject)
    {
        Debug.Log("Going to edit Info.plist");
        var infoPlistPath = Path.Combine(pathToBuiltProject, Config.IosWrapperProjectRelativePath, "UnitySwift/Info.plist");
        var plist = new PlistDocument();
        plist.ReadFromString(File.ReadAllText(infoPlistPath));


        var rootDict = plist.root;
        rootDict["SCCameraKitClientID"] = new PlistElementString(Config.AppId);
        rootDict["SCCameraKitAPIToken"] = new PlistElementString(Config.ApiToken);

        File.WriteAllText(infoPlistPath, plist.WriteToString());
        Debug.Log("Finished editing Info.plist");
    }
    #endif

    #endregion
   
}
