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
    const rain = new THREE.Points(rainGeometry, new THREE.PointsMaterial({ color: 0xabbbff, size: 0.06 }));
    scene.add(rain);

    return { rain };
}
export { initRain };
