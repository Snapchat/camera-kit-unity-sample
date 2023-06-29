//sets material of corresponding sphere based on left or right tilt
//@input Component.MaterialMeshVisual objectLeft
//@input Component.MaterialMeshVisual objectRight

//@input Asset.Material matGreen
//@input Asset.Material matGrey

script.api.onLeft = function () {
     script.objectRight.mainMaterial = script.matGrey;
     script.objectLeft.mainMaterial = script.matGreen;
}

script.api.onRight = function () {
     script.objectRight.mainMaterial = script.matGreen;
     script.objectLeft.mainMaterial = script.matGrey;
}

script.api.onReset = function () {
     script.objectRight.mainMaterial = script.matGrey;
     script.objectLeft.mainMaterial = script.matGrey;
}