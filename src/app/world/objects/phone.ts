import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import { getObjectBounds } from '@/lib/object-bounds.ts';
import { applyTextureToMeshes } from '@/lib/apply-texture-to-meshes.ts';
import {
  createTutorialFakeShadowMesh,
  syncTutorialFakeShadow,
} from '@/lib/fake-shadow.ts';

/** 튜토리얼 구체의 `position.y`처럼 0~1로 쓰기 위한 높이 스케일(월드) */
const BOUNCE_HEIGHT_REF = 0.2;

export default class Phone {
  parent: THREE.Object3D;
  group: THREE.Group;
  private shadow: THREE.Mesh | null = null;
  private floorYLocal: number;

  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = gltf.scene.clone(true);

    const desk = getObjectBounds('desk_mat');
    this.floorYLocal = desk.size.y;

    this.setTexture();
    this.setPosition();

    this.group.updateWorldMatrix(true, false);
    const box = new THREE.Box3().setFromObject(this.group);
    const sz = new THREE.Vector3();
    box.getSize(sz);
    const planeSize = Math.max(1.5, Math.max(sz.x, sz.z));

    this.shadow = createTutorialFakeShadowMesh({
      name: 'phone_fake_shadow',
      planeSize,
    });

    this.parent.add(this.group);
    this.parent.add(this.shadow);
    syncTutorialFakeShadow(this.shadow, this.group, this.floorYLocal);
  }

  setPosition() {
    const deskMatBounds = getObjectBounds('desk_mat');

    this.group.position.set(
      deskMatBounds.position.x + deskMatBounds.size.x / 3.5,
      deskMatBounds.size.y,
      deskMatBounds.position.z + 1.5
    );
  }

  setTexture() {
    applyTextureToMeshes(this.group, [
      {
        name: 'phone_body',
        type: 'matcap',
        src: '/textures/matcaps/metal.png',
        options: { color: 0xffffff },
      },
      {
        name: 'phone_screen',
        type: 'matcap',
        options: { color: 0x111111 },
      },
      {
        name: 'phone_button',
        type: 'matcap',
      },
    ]);
  }

  update(): void {
    if (!this.shadow) return;

    const bounceY = Math.min(
      Math.max(
        (this.group.position.y - this.floorYLocal) / BOUNCE_HEIGHT_REF,
        0
      ),
      1
    );
    syncTutorialFakeShadow(this.shadow, this.group, this.floorYLocal, {
      bounceY,
    });
  }
}
