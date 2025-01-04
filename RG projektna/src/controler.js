import { takePictureFromCamera } from "./camera";
import { compressImage } from "./compress";
function removeAllDroplets(scene) {
  scene.children
    .filter((child) => child.name === "Droplet")
    .forEach((droplet) => scene.remove(droplet));
}

async function Controler(camera, renderer, scene, object) {
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  requestAnimationFrame((t) => {
    animate(camera, renderer, scene, object);
  });
}

const duration = 1000;
const zero = performance.now();
let currentTime = 0;

function animate(camera, renderer, scene, object) {
  // run for 2 seconds

  requestAnimationFrame((t) => {
    //console.log(t);
    if (t - currentTime > 2000) {
      currentTime = t;

      animate(camera, renderer, scene, object);
      console.log("done");
      takePictureFromCamera(camera, renderer, scene, object);
    } else {
      animate(camera, renderer, scene, object);
    }
  }); 
}

export { Controler };
