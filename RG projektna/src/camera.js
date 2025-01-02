import * as THREE from "three";
function takePictureFromCamera(cameraToCapture, renderer, scene) {
    renderer.render(scene, cameraToCapture);
  
    const imageData = renderer.domElement.toDataURL("image/png");
    // debuging
    // Create a link to download the image
    // const link = document.createElement("a");
    // link.href = imageData;
    // link.download = "camera_capture.png";
    // link.click();
  
    // Return the image data (optional)
    return imageData;
  }
  
export { takePictureFromCamera };