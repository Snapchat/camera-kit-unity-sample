using UnityEngine;
using TMPro;

public class CubeSpawner : MonoBehaviour
{
    public int numCubes = 1000; // number of cubes to instantiate
    public float minZ = -5f; // minimum Z value for cube position
    public float maxZ = 5f; // maximum Z value for cube position
    public TextMeshProUGUI cubeCountLabel; // reference to the TextMeshPro text label to show the count of cubes on the screen
    
    private int cubeCount = 1; // Count of cubes on the screen

    public void SpawnCubes()
    {
        for (int i = 0; i < numCubes; i++)
        {
            Vector3 randomPosition = GetRandomPositionOnScreen(); // get a random position within the bottom half of the screen

            // create a cube primitive at the random position
            GameObject newCube = GameObject.CreatePrimitive(PrimitiveType.Cube);
            newCube.transform.position = randomPosition;

            // add a SpinningCube component to the new cube
            SpinningCube spinningCube = newCube.AddComponent<SpinningCube>();
            spinningCube.spinSpeed = Random.Range(50f, 100f);

            // randomly rotate the cube around the Y axis
            newCube.transform.rotation = Quaternion.Euler(0f, Random.Range(0f, 360f), 0f);
        }

        // update the count of cubes on the screen
        cubeCount += numCubes;
        cubeCountLabel.text = $"Cubes: {cubeCount}";
    }

    private Vector3 GetRandomPositionOnScreen()
    {
        Vector3 position = Vector3.zero;

        // get the screen bounds in world space
        float screenRatio = (float)Screen.width / (float)Screen.height;
        float screenOrthoSize = Camera.main.orthographicSize;
        float screenWidth = screenRatio * screenOrthoSize * 2f;
        float screenHeight = screenOrthoSize * 2f;
        Rect screenBounds = new Rect(-screenWidth / 2f, -screenHeight / 2f, screenWidth, screenHeight / 2f);

        // generate a random position within the bottom half of the screen
        do
        {
            position = new Vector3(Random.Range(screenBounds.xMin, screenBounds.xMax), Random.Range(screenBounds.yMin, screenBounds.yMax), Random.Range(minZ, maxZ));
        } while (!IsPositionValid(position));

        return position;
    }

    private bool IsPositionValid(Vector3 position)
    {
        // check if the position is within the bottom half of the screen and not too close to other cubes
        if (!Camera.main.pixelRect.Contains(Camera.main.WorldToViewportPoint(position)))
            return false;

        return true;
    }
}