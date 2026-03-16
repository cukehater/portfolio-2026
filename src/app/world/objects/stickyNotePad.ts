/**
 * StickyNotePad — 스티커 노트 패드
 */
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import App from '../../index.ts';
import Debug from '../../utils/debug.ts';

export default class StickyNotePad {
  app: App;
  debug: Debug;
  parent: THREE.Object3D;
  group: THREE.Group;

  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.app = new App();
    this.debug = this.app.debug;

    this.parent = parent;
    this.group = gltf.scene.clone(true);

    this.group.scale.setScalar(50);
    this.group.position.set(-4, 5.297, -12);
    this.group.rotation.set(0, Math.PI / 7, 0);

    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });

    const box = new THREE.Box3().setFromObject(this.group);
    const size = new THREE.Vector3();
    box.getSize(size);

    this.parent.add(this.group);
    this.setGui();
  }

  setGui(): void {
    this.debug.gui
      .add(this.group.position, 'y')
      .min(-60)
      .max(60)
      .step(0.01)
      .name('StickyNote Y');
    this.debug.gui
      .add(this.group.position, 'z')
      .min(-60)
      .max(60)
      .step(0.01)
      .name('StickyNote Z');
  }
}
