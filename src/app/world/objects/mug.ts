import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import { getApp } from '../../index.ts';
import { getObjectBounds } from '@/lib/object-bounds.ts';
import { applyTextureToMeshes } from '@/lib/apply-texture-to-meshes.ts';
import {
  createTutorialFakeShadowMesh,
  syncTutorialFakeShadow,
} from '@/lib/fake-shadow.ts';
import {
  createCoffeeSmokePlaneGeometry,
  createCoffeeSmokeShaderMaterial,
} from '../shaders/mug-coffee-smoke-material.ts';

export default class Mug {
  parent: THREE.Object3D;
  group: THREE.Group;
  private shadow: THREE.Mesh | null = null;
  private floorYLocal: number;
  private smokeMaterial: THREE.ShaderMaterial | null = null;

  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = gltf.scene.clone(true);

    const desk = getObjectBounds('desk_mat');
    this.floorYLocal = desk.size.y;

    this.setPosition();
    this.setTexture();

    this.group.updateWorldMatrix(true, false);
    const box = new THREE.Box3().setFromObject(this.group);
    const sz = new THREE.Vector3();
    box.getSize(sz);
    const planeSize = Math.max(1.5, Math.max(sz.x, sz.z));

    this.shadow = createTutorialFakeShadowMesh({
      name: 'mug_fake_shadow',
      planeSize,
    });

    this.parent.add(this.group);
    this.parent.add(this.shadow);
    syncTutorialFakeShadow(this.shadow, this.group, this.floorYLocal, {
      bounceY: 0,
    });
  }

  setPosition() {
    const deskMatBounds = getObjectBounds('desk_mat');

    this.group.position.set(
      deskMatBounds.position.x + deskMatBounds.size.x / 3.75,
      deskMatBounds.size.y,
      deskMatBounds.position.z - 1.5
    );
  }

  setTexture() {
    applyTextureToMeshes(this.group, [
      {
        name: 'mug',
        type: 'matcap',
        options: {
          color: 0xeae6df,
        },
      },
      {
        name: 'fill',
        type: 'matcap',
        options: {
          color: 0x4b2e2b,
        },
      },
    ]);

    this.loadCoffeeSmoke();
  }

  private loadCoffeeSmoke(): void {
    const loader = new THREE.TextureLoader();
    loader.load(
      '/textures/perlin.png',
      (tex) => {
        tex.colorSpace = THREE.NoColorSpace;

        const mat = createCoffeeSmokeShaderMaterial(tex);
        const geo = createCoffeeSmokePlaneGeometry();
        const smoke = new THREE.Mesh(geo, mat);
        smoke.name = 'mug_coffee_smoke';

        this.group.updateWorldMatrix(true, false);
        const box = new THREE.Box3().setFromObject(this.group);
        const size = box.getSize(new THREE.Vector3());
        const centerW = box.getCenter(new THREE.Vector3());

        const topW = new THREE.Vector3(
          centerW.x,
          box.max.y + size.y * 0.015,
          centerW.z
        );
        const local = topW.clone();
        this.group.worldToLocal(local);
        smoke.position.copy(local);

        const w = Math.min(size.x, size.z) * 0.36;
        const h = size.y * 0.52;
        smoke.scale.set(w, h, w);

        smoke.renderOrder = 2;
        this.group.add(smoke);
        this.smokeMaterial = mat;
      },
      undefined,
      () => {
        console.warn('[Mug] /textures/perlin.png 로드 실패 — 연기 셰이더 생략');
      }
    );
  }

  update(): void {
    const t = getApp().time.elapsed * 0.001;
    if (this.smokeMaterial) {
      this.smokeMaterial.uniforms.uTime.value = t;
    }

    if (!this.shadow) return;
    syncTutorialFakeShadow(this.shadow, this.group, this.floorYLocal, {
      bounceY: 0,
    });
  }
}
