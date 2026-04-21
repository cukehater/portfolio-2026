/**
 * BookStack — 책 한 종류(GLTF)를 여러 권 쌓아 자연스러운 더미로 렌더
 *
 * - GLB 오리진이 비어 있으면 AABB 중심으로 맞춘 뒤 쌓음
 * - 권당 두께(y 간격)는 고정값
 * - Y축만 아주 살짝 랜덤 회전(로드마다 조금씩 다름)
 */
import {
  getObjectBoundPosition,
  getObjectBoundSize,
} from '@/lib/objectBounds.ts';
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';

const BOOK_CONFIG = {
  list: [
    { name: 'JavaScript', matcap: '/textures/matcaps/js.png' },
    { name: 'TypeScript', matcap: '/textures/matcaps/ts.png' },
    { name: 'React', matcap: '/textures/matcaps/ts.png' },
    { name: 'Next', matcap: '/textures/matcaps/black.png' },
  ],
  thickness: 0.7375,
  rotateYHalfSpan: 0.125,
} as const;

export default class BookStack {
  parent: THREE.Object3D;
  group: THREE.Group;

  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = new THREE.Group();

    const textureLoader = new THREE.TextureLoader();

    for (let i = 0; i < BOOK_CONFIG.list.length; i++) {
      const book = gltf.scene.clone(true);
      const rotY = (Math.random() - 0.5) * 5 * BOOK_CONFIG.rotateYHalfSpan;

      book.position.set(0, i * BOOK_CONFIG.thickness, 0);
      book.rotation.set(0, rotY, 0);

      book.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;

        if (child.name === 'book_cover') {
          textureLoader.load(BOOK_CONFIG.list[i].matcap, (matcap) => {
            child.material = new THREE.MeshMatcapMaterial({ matcap });
            matcap.colorSpace = THREE.SRGBColorSpace;
          });
        } else
          child.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      });

      this.group.add(book);
    }

    const deskMatSize = getObjectBoundSize('desk_mat');
    const deskMatPosition = getObjectBoundPosition('desk_mat');

    this.group.position.set(
      deskMatPosition.x - deskMatSize.x / 2 + 3,
      deskMatSize.y,
      deskMatPosition.z
    );

    this.parent.add(this.group);
  }
}
