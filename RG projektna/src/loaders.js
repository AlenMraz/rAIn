import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { applyTransformations } from './transformations.js';

function loadGLTF(scene, url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now(); // Start tracking time
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        applyTransformations(model, options);
        scene.add(model);
        
        const endTime = performance.now(); // End tracking time
        console.log(`${url} loaded in ${(endTime - startTime)}ms`);
        resolve(model);
      },
      (xhr) => console.log(`${url}: ${(xhr.loaded / xhr.total) * 100}% loaded`),
      (error) => {
        console.error(`Error loading GLTF:`, error);
        reject(error);
      }
    );
  });
}

function loadOBJ(scene, url, name, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now(); // Start tracking time
    const loader = new OBJLoader();
    loader.load(
      url,
      (object) => {
        applyTransformations(object, options);
        object.name = name;
        scene.add(object);
        
        const endTime = performance.now(); // End tracking time
        console.log(`${url} loaded in ${(endTime - startTime)}ms`);
        resolve(object);
      },
      (xhr) => console.log(`${url}: ${(xhr.loaded / xhr.total) * 100}% loaded`),
      (error) => {
        console.error(`Error loading ${url}`, error);
        reject(error);
      }
    );
  });
}

function loadOBJWithMTL(scene, objUrl, mtlUrl, name, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now(); // Start tracking time
    const mtlLoader = new MTLLoader();
    mtlLoader.load(
      mtlUrl,
      (materials) => {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(
          objUrl,
          (object) => {
            applyTransformations(object, options);
            object.name = name;
            scene.add(object);
            const endTime = performance.now(); // End tracking time
            console.log(`${objUrl} with materials loaded in ${(endTime - startTime)}ms`);
            resolve(object);
          },
          (xhr) => console.log(`${objUrl}: ${(xhr.loaded / xhr.total) * 100}% loaded`),
          (error) => {
            console.error(`Error loading ${objUrl}`, error);
            reject(error);
          }
        );
      },
      (xhr) => console.log(`${mtlUrl}: ${(xhr.loaded / xhr.total) * 100}% loaded`),
      (error) => {
        console.error(`Error loading ${mtlUrl}`, error);
        reject(error);
      }
    );
  });
}

export { loadGLTF, loadOBJ, loadOBJWithMTL };
