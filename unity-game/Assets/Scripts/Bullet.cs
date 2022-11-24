using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Bullet : MonoBehaviour
{

    private const float SPEED = 3f;
    private Bounds _enemyBounds;
    private float _maxY;
    private bool _isPaused = false;
    
    void OnEnable()
    {
        _enemyBounds = GameManager.Instance.enemy.GetComponent<Renderer>().bounds;
        Vector3 stageDimensions = Camera.main.ScreenToWorldPoint(new Vector3(Screen.width, Screen.height,0));
        _maxY = stageDimensions.y;
    }

    void OnApplicationPause(bool pauseStatus) {
        _isPaused = pauseStatus;
    }

    void OnApplicationFocus(bool hasFocus) {
        _isPaused = !hasFocus;
    }

    // Update is called once per frame
    void Update()
    {
        if (_isPaused) {
            return;
        }

        transform.position = transform.position + new Vector3(0, SPEED * Time.deltaTime, 0);

        var myBounds = this.gameObject.GetComponent<Renderer>().bounds;

        if (myBounds.min.y > _maxY) {
            DestroyImmediate(this.gameObject);
        }

        if (myBounds.Intersects(_enemyBounds)) {
            GameManager.Instance.AlienHit();
            DestroyImmediate(this.gameObject);
        }
    }
}
