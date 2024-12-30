function applyTransformations(object, options) {
    const { position, scale, rotation } = Object.assign(
      { position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, rotation: { x: 0, y: 0, z: 0 } },
      options
    );
    object.position.set(position.x, position.y, position.z);
    object.scale.set(scale.x, scale.y, scale.z);
    object.rotation.set(rotation.x, rotation.y, rotation.z);
  }
export { applyTransformations };