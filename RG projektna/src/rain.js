import * as THREE from "three";
function initRain(scene, count) {
    const rainGeometry = new THREE.BufferGeometry();
    const rainCount = count;
    const rainPositions = Array.from({ length: rainCount }, () => [
    Math.random() * 10 - 5,
    Math.random() * 10 + 5,
    Math.random() * 10 - 5,
    ]).flat();

    rainGeometry.setAttribute("position", new THREE.Float32BufferAttribute(rainPositions, 3));

    const textureLoader = new THREE.TextureLoader();
    const rainTexture = textureLoader.load('/assets/circle5.png');

    const rainMaterial = new THREE.PointsMaterial({
        color: 0x333388,
        size: 0.15, 
        map: rainTexture, 
        transparent: true, 
        alphaTest: 0.01, 
        depthWrite: false, 
        blending: THREE.AdditiveBlending, 
        opacity: 0.8,
    });
    const rain = new THREE.Points(rainGeometry, rainMaterial);
    scene.add(rain);

    return { rain };
}
export { initRain };
