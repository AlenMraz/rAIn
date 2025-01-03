import { takePictureFromCamera } from "./camera";
import { compressImage } from "./compress";

async function Controler(camera, renderer, scene, object) {
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    while (true) {
        const capturedImage = takePictureFromCamera(camera, renderer, scene);
        const compressedImage = compressImage(capturedImage);
        
        const classification = await sendImage(compressedImage);
        
        if (classification) {
            //TODO: implement da se brisalec premakne in odstrani kapljice
            console.log('Classification:', classification);
        } else {
            console.warn('Failed to get classification');
        }

        await delay(1000);
    }
}
