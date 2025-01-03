import { takePictureFromCamera } from "./camera";
import { compressImage } from "./compress";
function removeAllDroplets(scene) {
    scene.children
      .filter((child) => child.name === "Droplet") 
      .forEach((droplet) => scene.remove(droplet)); 
  }

function countAllDroplets(scene) {
    return scene.children.filter((child) => child.name === "Droplet").length;
}
  
async function Controler(camera, renderer, scene, object) {
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  while (true) {
    const capturedImage = takePictureFromCamera(camera, renderer, scene);
    console.log('Droplets:', countAllDroplets(scene));
    removeAllDroplets(scene);
    //const compressedImage = compressImage(capturedImage);

    // const classification = await sendImage(compressedImage);

    // if (classification) {
    //     //TODO: implement da se brisalec premakne in odstrani kapljice
    //     console.log('Classification:', classification);
    // } else {
    //     console.warn('Failed to get classification');
    // }

    await delay(1000);
  }
}
export { Controler };
