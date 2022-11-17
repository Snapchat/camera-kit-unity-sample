using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class DragNDrop : MonoBehaviour
{
bool isDraggable;
bool isDragging;
Collider2D objectCollider;

// Start is called before the first frame update
void Start()
{
    objectCollider = GetComponent<Collider2D>();
    isDraggable = false;
    isDragging = false;
}

// Update is called once per frame
void Update()
{
    DragAndDrop();
}

void DragAndDrop()
{
    Vector2 mousePosition = Camera.main.ScreenToWorldPoint(Input.mousePosition);

    if (Input.GetMouseButtonDown(0))
    {
        if(objectCollider == Physics2D.OverlapPoint(mousePosition))
        {
            isDraggable = true;
        }
        else
        {
            isDraggable = false;
        }

        if (isDraggable)
        {
            isDragging = true;
        }
    }
     if (isDragging)
    {
        this.transform.position = mousePosition;
    }

    if (Input.GetMouseButtonUp(0))
    {
        isDraggable = false;
        isDragging = false;
    }
}
}