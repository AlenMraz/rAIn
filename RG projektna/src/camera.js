import * as THREE from "three";
function takePictureFromCamera(cameraToCapture, renderer, scene) {
    const originalWidth = renderer.domElement.width;
    const originalHeight = renderer.domElement.height;

    renderer.setSize(480, 480);
    cameraToCapture.aspect = 1; 
    cameraToCapture.updateProjectionMatrix(); 

    renderer.render(scene, cameraToCapture);

    const imageData = renderer.domElement.toDataURL("image/png");

    // Debugging: Create a link to download the image
    // const link = document.createElement("a");
    // link.href = imageData;
    // link.download = "camera_capture.png";
    // link.click();

    renderer.setSize(originalWidth, originalHeight);
    cameraToCapture.aspect = originalWidth / originalHeight; 
    cameraToCapture.updateProjectionMatrix();

    return imageData;
}

export { takePictureFromCamera };