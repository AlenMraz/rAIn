import * as THREE from "three";

function countAllDroplets(scene) {
    return scene.children.filter((child) => child.name === "Droplet").length;
}
function takePictureFromCamera(cameraToCapture, renderer, scene) {
    const originalWidth = renderer.domElement.width;
    const originalHeight = renderer.domElement.height;

    renderer.setSize(480, 480);
    cameraToCapture.aspect = 1; 
    cameraToCapture.updateProjectionMatrix(); 

    renderer.render(scene, cameraToCapture);

    const imageData = renderer.domElement.toDataURL("image/png");
    const dropletsCount = countAllDroplets(scene);
    let classification = "not";
    if (dropletsCount > 0 && dropletsCount < 20) {
        classification = "low";
    } else if (dropletsCount >= 20 && dropletsCount < 75) {
        classification = "medium";
    } else if (dropletsCount >= 75) {
        classification = "high";
    }

    const now = new Date();
    const timestamp = now.toISOString().replace(/:/g, '-').split('.')[0];

    // Create a link to download the image
    // For AI model samples
    // const link = document.createElement("a");
    // link.href = imageData;
    // link.download = `${timestamp}_${classification}.png`;
    // link.click();

    renderer.setSize(originalWidth, originalHeight);
    cameraToCapture.aspect = originalWidth / originalHeight; 
    cameraToCapture.updateProjectionMatrix();   

    return imageData;
}


export { takePictureFromCamera };