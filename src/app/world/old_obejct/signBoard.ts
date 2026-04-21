import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import App, { getApp } from '../../../index.ts';
import Debug from '@/lib/debug.ts';
import { getObjectBoundSize } from '@/lib/objectBounds.ts';
export default class SignBoard {
  app: App;
  debug: Debug;
  parent: THREE.Object3D;
  group: THREE.Group;
  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.app = getApp();
    this.debug = this.app.debug;
    this.parent = parent;
    this.group = gltf.scene.clone(true);
    const officeDeskSize = getObjectBoundSize('office_desk');
    this.group.scale.setScalar(5);
    this.group.position.set(officeDeskSize.x / 2 - 2.25, 0, 3.5);
    this.group.rotation.set(0, Math.PI, 0);
    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });
    this.parent.add(this.group);
  }
}
