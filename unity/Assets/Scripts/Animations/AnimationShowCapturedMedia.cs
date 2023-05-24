using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using System.IO;

public class AnimationShowCapturedMedia : BaseAnimation
{
    [SerializeField]
    private Image _uiImage;

    public override void Play()
    {
        Texture2D loadedImage = LoadTextureFromFile(Application.persistentDataPath + "/CameraKitOutput.png");
        if (loadedImage != null) {
            _uiImage.gameObject.SetActive(true);
            _uiImage.sprite = Sprite.Create(loadedImage, new Rect(0, 0, loadedImage.width, loadedImage.height), Vector2.zero);
        } else {
            Debug.Log("There's no captured media to display");
        }
        Finished();        
    }

    private Texture2D LoadTextureFromFile(string filePath)
    {
        Texture2D texture = null;

        // Check if the file exists at the specified path
        if (File.Exists(filePath))
        {
            // Load the image data from the file
            byte[] imageData = File.ReadAllBytes(filePath);

            // Create a new texture from the loaded image data
            texture = new Texture2D(2, 2);
            texture.LoadImage(imageData);
        }
        else
        {
            Debug.LogError("Image file not found at path: " + filePath);
        }

        return texture;
    }
}
