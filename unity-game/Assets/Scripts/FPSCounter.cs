using UnityEngine;
using TMPro;

public class FPSCounter : MonoBehaviour
{
    public TextMeshProUGUI fpsLabel; // reference to the TextMeshPro text label to update
    public float updateInterval = 0.5F; // how often to update the FPS counter
    public Color goodColor = Color.green; // color to use when the FPS is good
    public Color warningColor = Color.yellow; // color to use when the FPS is getting low
    public Color badColor = Color.red; // color to use when the FPS is too low

    private float accum = 0; // FPS accumulated over the interval
    private int frames = 0; // Frames drawn over the interval
    private float timeleft; // Left time for current interval
    private int cubeCount; // Count of cubes on the screen

    void Start()
    {
        timeleft = updateInterval;
    }

    void Update()
    {
        timeleft -= Time.deltaTime;
        accum += Time.timeScale / Time.deltaTime;
        frames++;

        if (timeleft <= 0.0)
        {
            // calculate average FPS and update the label
            float fps = accum / frames;
            fpsLabel.text = $"FPS: {fps:F2}";

            // update the color of the label based on the FPS
            if (fps >= 60)
                fpsLabel.color = goodColor;
            else if (fps >= 30)
                fpsLabel.color = warningColor;
            else
                fpsLabel.color = badColor;

            // reset FPS counter for the next interval
            timeleft = updateInterval;
            accum = 0;
            frames = 0;
        }
    }
}