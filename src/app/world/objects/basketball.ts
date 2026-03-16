/**
 * Basketball — 농구공
 */
import * as THREE from 'three';

const BASKETBALL_SIZE = 1.2;

export default class Basketball {
  parent: THREE.Object3D;

  constructor(parent: THREE.Object3D) {
    this.parent = parent;

    const geometry = new THREE.SphereGeometry(BASKETBALL_SIZE, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });

    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(0, BASKETBALL_SIZE, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.parent.add(mesh);
  }
}
