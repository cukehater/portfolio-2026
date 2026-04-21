import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import App from '../../../index.ts';
import Debug from '@/lib/debug.ts';
const GUITAR_OFFSET = {
  position: [0.035, 0.075, 0.1] as [number, number, number],
  rotationX: 18.62,
};
export default class Guitar {
  parent: THREE.Object3D;
  group: THREE.Group;
  app: App;
  debug: Debug;
  constructor(parent: THREE.Object3D, gltfGuitar: GLTF, gltfStand: GLTF) {
    this.parent = parent;
    this.app = new App();
    this.debug = this.app.debug;
    this.group = new THREE.Group();
    this.group.scale.setScalar(8);
    this.group.position.set(-20, 0.12, -5);
    this.group.rotation.set(0, Math.PI / 4, 0);
    const stand = gltfStand.scene.clone(true);
    stand.position.set(0, 0, 0);
    stand.rotation.set(0, 0, 0);
    this.applyShadow(stand);
    this.group.add(stand);
    const guitar = gltfGuitar.scene.clone(true);
    guitar.position.set(...GUITAR_OFFSET.position);
    guitar.rotation.set(GUITAR_OFFSET.rotationX, 0, 0);
    this.applyShadow(guitar);
    this.group.add(guitar);
    this.parent.add(this.group);
    this.setGui();
  }
  private applyShadow(obj: THREE.Object3D): void {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });
  }
  setGui(): void {
    this.debug.gui
      .add(this.group.position, 'y')
      .min(-60)
      .max(60)
      .step(0.01)
      .name('Guitar Y');
    this.debug.gui
      .add(this.group.position, 'x')
      .min(-60)
      .max(60)
      .step(0.01)
      .name('Guitar X');
    this.debug.gui
      .add(this.group.position, 'z')
      .min(-60)
      .max(60)
      .step(0.01)
      .name('Guitar Z');
    this.debug.gui
      .add(this.group.rotation, 'x')
      .min(-60)
      .max(60)
      .step(0.01)
      .name('Guitar X Rotation');
  }
}
