import { takePictureFromCamera } from "./camera";
import { compressImage } from "./compress";
import { animateWiper } from "./wiperAnimation.js";
import { screenColor } from "./screen.js";
function removeAllDroplets(scene) {
    scene.children
      .filter((child) => child.name === "Droplet") 
      .forEach((droplet) => scene.remove(droplet)); 
  }

  
async function Controler(camera, renderer, scene, wipers, phoneScreen) {
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  while (true) {
    const capturedImage = takePictureFromCamera(camera, renderer, scene);
    //console.log('Droplets:', countAllDroplets(scene));
    removeAllDroplets(scene);
    //const compressedImage = compressImage(capturedImage);

    // const classification = await sendImage(compressedImage);
    const classification = "high";

    if (classification) {
        //TODO: implement da se brisalec premakne in odstrani kapljice
        console.log('Classification:', classification);
        animateWiper(wipers, classification);
        screenColor(phoneScreen, classification);
    } else {
        console.warn('Failed to get classification');
    }

    await delay(1000);
  }
}
export { Controler };
