using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Spaceship : MonoBehaviour
{
    public GameObject bulletPrefab;
    public float bulletIntervalSeconds = .1f;
    private Bounds _earthBounds;
    private bool _canSendMessage = true;
    private bool _isPaused = false;
    private bool _isShooting = false;

    // Start is called before the first frame update
    void Start()
    {
        StartShooting();
        _earthBounds = GameManager.Instance.earth.GetComponent<Renderer>().bounds;
    }

    // Update is called once per frame
    void Update()
    {
        var myBounds = this.gameObject.GetComponent<Renderer>().bounds;
        if (!myBounds.Intersects(_earthBounds)) {
            _canSendMessage = true;
        }

        if (myBounds.Intersects(_earthBounds)) {
            if (_canSendMessage)
            {
                GameManager.Instance.SpaceshipLanded();
                _canSendMessage = false;
            }
        }

    }

    void OnApplicationPause(bool pauseStatus) {
        _isPaused = pauseStatus;
        if (_isPaused) {
            StopShooting();
        } else {
            StartShooting();
        }
    }

    void OnApplicationFocus(bool hasFocus) {
        _isPaused = !hasFocus;
        if (_isPaused) {
            StopShooting();
        } else {
            StartShooting();
        }
    }

    void StartShooting() {
        if (!_isShooting) {
            InvokeRepeating("ShootBullet", 0f, bulletIntervalSeconds);
            _isShooting = true;
        }
    }

    void StopShooting() {
        CancelInvoke();
        _isShooting = false;
    }

    void ShootBullet() {
        Instantiate(bulletPrefab, transform.position, Quaternion.identity);
    }
}
