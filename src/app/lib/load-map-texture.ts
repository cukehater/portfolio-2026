import * as THREE from 'three';

export function loadMapTexture(
  url: string,
  repeat: { x: number; y: number }
): THREE.Texture {
  const texture = new THREE.TextureLoader().load(url);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat.x, repeat.y);
  texture.colorSpace = THREE.SRGBColorSpace;

  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipMapLinearFilter;

  return texture;
}
