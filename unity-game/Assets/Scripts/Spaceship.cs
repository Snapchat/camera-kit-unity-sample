using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Spaceship : MonoBehaviour
{
    public GameObject bulletPrefab;
    public float bulletIntervalSeconds = .1f;
    private Bounds _earthBounds;
    private bool _canSendMessage = true;

    // Start is called before the first frame update
    void Start()
    {
        StartCoroutine("ShootBullets");
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

    IEnumerator ShootBullets() {
     for(;;) {
         Instantiate(bulletPrefab, transform.position, Quaternion.identity);
         yield return new WaitForSeconds(bulletIntervalSeconds);
     }
 }
}
