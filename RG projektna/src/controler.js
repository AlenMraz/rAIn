import { takePictureFromCamera } from "./camera";
import { compressImage } from "./compress";
import { animateWiper } from "./wiperAnimation.js";
import { screenColor } from "./screen.js";
import { sendImage } from "./net";

function removeAllDroplets(scene) {
    scene.children
      .filter((child) => child.name === "Droplet") 
      .forEach((droplet) => scene.remove(droplet)); 
  }

  function addPictureToView(capturedImage, classification) {
    // Define colors based on classification
    const classificationColors = {
        "not": "green",
        "drizzle": "yellow",
        "mid": "orange",
        "high": "red",
    };

    const classificationLabels = {
        "not": "N: No Rain",
        "drizzle": " L: Low rain intensity",
        "mid": "M: Medium rain intensity",
        "high": "H High rain intensity",
    };

    // Create a container for the image and classification box
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.bottom = "10px"; // Position at the bottom
    container.style.right = "10px"; // Position at the right
    container.style.border = "2px solid #000"; // Add a border
    container.style.borderRadius = "8px";
    container.style.overflow = "hidden";
    container.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.3)";

    // Create an image element for the captured image
    const img = document.createElement("img");
    img.src = capturedImage; // Set the Base64 image data
    img.alt = "Captured Scene";
    img.style.width = "240px"; // Set a fixed width for the image
    img.style.height = "240px"; // Set a fixed height for the image

    // Create a classification box below the image
    const classificationBox = document.createElement("div");
    classificationBox.style.backgroundColor = classificationColors[classification] || "gray";
    classificationBox.style.color = "black";
    classificationBox.style.textAlign = "center";
    classificationBox.style.padding = "8px";
    classificationBox.style.fontSize = "14px";
    classificationBox.style.fontWeight = "bold";
    classificationBox.innerText = classificationLabels[classification] || "Unknown";

    // Append the image and classification box to the container
    container.appendChild(img);
    container.appendChild(classificationBox);

    // Append the container to the body (or a specific parent element if needed)
    document.body.appendChild(container);
}


  
async function Controler(camera, renderer, scene, wipers, phoneScreen) {
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  while (true) {
    const capturedImage = takePictureFromCamera(camera, renderer, scene);
    console.log('Captured image:');
    //sendImage(capturedImage);
    //console.log('Droplets:', countAllDroplets(scene));
    removeAllDroplets(scene);
    //const compressedImage = compressImage(capturedImage);

     const classification = await sendImage(capturedImage);
    //const classification = "high";

    // view image
    addPictureToView(capturedImage, classification);

    if (classification) {
        console.log('Classification:', classification);
        
        animateWipersInLoop(wipers, classification);
        screenColor(phoneScreen, classification);
    } else {
        console.warn('Failed to get classification');
    }

    await delay(8000);
  }
}
function animateWipersInLoop(wipers, classification) {
  function loop() {
    animateWiper(wipers, classification);
    requestAnimationFrame(loop);
  }
  loop();
}

export { Controler };
