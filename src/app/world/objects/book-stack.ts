import * as THREE from 'three';
import { applyTextureToMeshes } from '@/lib/apply-texture-to-meshes.ts';
import { getObjectBounds } from '@/lib/object-bounds.ts';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import { loadMapTexture } from '@/lib/load-map-texture.ts';
import {
  createTutorialFakeShadowMesh,
  syncTutorialFakeShadow,
} from '@/lib/fake-shadow.ts';

export default class BookStack {
  parent: THREE.Object3D;
  group: THREE.Group;
  private shadow: THREE.Mesh | null = null;
  private floorYLocal: number;

  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = new THREE.Group();

    const desk = getObjectBounds('desk_mat');
    this.floorYLocal = desk.size.y;

    this.setPosition();
    this.setTexture(gltf);

    this.group.updateWorldMatrix(true, false);
    const box = new THREE.Box3().setFromObject(this.group);
    const sz = new THREE.Vector3();
    box.getSize(sz);
    const planeSize = Math.max(1.5, Math.max(sz.x, sz.z));

    this.shadow = createTutorialFakeShadowMesh({
      name: 'book_stack_fake_shadow',
      planeSize,
    });

    this.parent.add(this.group);
    this.parent.add(this.shadow);
    syncTutorialFakeShadow(this.shadow, this.group, this.floorYLocal);
  }

  setPosition() {
    const deskBounds = getObjectBounds('desk_mat');

    this.group.position.set(
      deskBounds.position.x - deskBounds.size.x / 3,
      deskBounds.size.y,
      deskBounds.position.z
    );
  }

  setTexture(gltf: GLTF) {
    const BOOK_CONFIG = {
      list: [
        { name: 'JavaScript', color: 0x3a3a3a },
        { name: 'TypeScript', color: 0x5c5c5c },
        { name: 'React', color: 0x8c6a4a },
        { name: 'Next', color: 0x2e4057 },
      ],
      thickness: 0.7375,
      rotateYHalfSpan: 0.125,
    } as const;

    const map = loadMapTexture('/textures/maps/book_cover.jpg', {
      x: 2,
      y: 2,
    });

    for (let i = 0; i < BOOK_CONFIG.list.length; i++) {
      const book = gltf.scene.clone(true);
      const rotY = (Math.random() - 0.5) * 5 * BOOK_CONFIG.rotateYHalfSpan;

      book.position.set(0, i * BOOK_CONFIG.thickness, 0);
      book.rotation.set(0, rotY, 0);

      applyTextureToMeshes(book, [
        {
          name: 'book_cover',
          type: 'matcap',
          options: {
            color: BOOK_CONFIG.list[i].color,
            map,
          },
        },
        { name: 'book_pages', type: 'basic', options: { color: 0xeae6df } },
      ]);

      this.group.add(book);
    }
  }

  update(): void {
    if (!this.shadow) return;
    syncTutorialFakeShadow(this.shadow, this.group, this.floorYLocal, {
      bounceY: 0,
    });
  }
}
