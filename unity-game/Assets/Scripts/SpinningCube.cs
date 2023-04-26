using UnityEngine;

public class SpinningCube : MonoBehaviour
{
    public float spinSpeed = 50f; // adjust this value to change the speed of rotation

    void Update()
    {
        transform.Rotate(spinSpeed * Time.deltaTime, 0f, 0f); // rotate the game object around its X axis
    }
}