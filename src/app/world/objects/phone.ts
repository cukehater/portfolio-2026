/**
 * Phone — 전화기
 */
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import { getObjectBounds } from '../../utils/objectBounds.ts';

/**
 * 나를 소개하는 인터랙션
 * - 자동차 오브젝트가 가까이 오면 진동, 화면 켜짐 (New Message 알림)
 * - 화면 클릭시(Ray casting) 간략한 소개 모달
 * - 자동차 오브젝트가 멀어지면 진동, 화면 꺼짐
 */

export default class Phone {
  parent: THREE.Object3D;
  group: THREE.Group;

  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = gltf.scene.clone(true);

    const deskMatBounds = getObjectBounds('desk_mat');

    this.group.scale.setScalar(45);
    this.group.position.set(
      deskMatBounds.size.x / 2 - 2.5,
      deskMatBounds.size.y,
      deskMatBounds.position.z / 2 + 6
    );
    this.group.rotation.set(0, Math.PI / 0.75, 0);

    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });

    this.parent.add(this.group);
  }
}
