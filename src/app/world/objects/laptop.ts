import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import { getObjectBounds } from '@/lib/objectBounds.ts';

const LAPTOP_DUMMY_VIDEO = '/models/laptop/dummy.mp4';

function createScreenVideoTexture(): HTMLVideoElement {
  const video = document.createElement('video');
  video.src = LAPTOP_DUMMY_VIDEO;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.crossOrigin = 'anonymous';

  video.play();

  return video;
}

export default class Laptop {
  parent: THREE.Object3D;
  group: THREE.Group;

  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = gltf.scene.clone(true);
    const textureLoader = new THREE.TextureLoader();
    const deskMatBounds = getObjectBounds('desk_mat');
    const screenVideoTex = createScreenVideoTexture();

    this.group.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      if (child.name === 'laptop') {
        const matcap = textureLoader.load('/textures/matcaps/metal.png');
        matcap.colorSpace = THREE.SRGBColorSpace;
        child.material = new THREE.MeshMatcapMaterial({
          matcap,
        });
      }
      if (child.name === 'screen') {
        child.material = new THREE.MeshBasicMaterial({
          map: new THREE.VideoTexture(screenVideoTex),
        });
      }
      if (child.name === 'keypad') {
        const matcap = textureLoader.load('/textures/matcaps/black.png');
        matcap.colorSpace = THREE.SRGBColorSpace;
        child.material = new THREE.MeshMatcapMaterial({
          matcap,
          color: 0x666666,
        });
      }
    });
    this.group.position.set(
      deskMatBounds.position.x,
      deskMatBounds.size.y,
      deskMatBounds.position.z
    );
    this.parent.add(this.group);
  }
}
