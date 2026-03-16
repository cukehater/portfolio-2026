/**
 * CukehaterText — 데스크 위 "CUKEHATER" 3D 텍스트
 * FontLoader + TextGeometry + MeshMatcapMaterial (가이드 방식)
 */
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const TEXT = 'CUKEHATER';
const FONT_PATH = '/fonts/helvetiker_regular.typeface.json';
const MATCAP_PATH = '/textures/matcaps/1.png';

/** 데스크 위 배치: 데스크 상단 y=0 기준 */
const GROUP_POSITION = [0, 0.35, 25] as [number, number, number];
const GROUP_SCALE = 2.5;

/** TextGeometry 옵션 — 폴리곤 수 절약을 위해 curveSegments, bevelSegments 최소화 */
const TEXT_OPTIONS = {
  size: 0.18,
  depth: 0.04,
  curveSegments: 8,
  bevelEnabled: true,
  bevelThickness: 0.01,
  bevelSize: 0.01,
  bevelOffset: 0,
  bevelSegments: 3,
} as const;

export default class CukehaterText {
  parent: THREE.Object3D;
  group: THREE.Group;
  textMesh: THREE.Mesh | null = null;

  constructor(parent: THREE.Object3D) {
    this.parent = parent;
    this.group = new THREE.Group();
    this.group.position.set(...GROUP_POSITION);
    this.group.scale.setScalar(GROUP_SCALE);
    this.parent.add(this.group);

    const fontLoader = new FontLoader();
    const textureLoader = new THREE.TextureLoader();

    fontLoader.load(FONT_PATH, (font) => {
      const textGeometry = new TextGeometry(TEXT, {
        font,
        ...TEXT_OPTIONS,
      });
      textGeometry.center();

      const matcapTexture = textureLoader.load(MATCAP_PATH);
      matcapTexture.colorSpace = THREE.SRGBColorSpace;

      const material = new THREE.MeshMatcapMaterial({
        matcap: matcapTexture,
        color: 0x1a1a1a,
      });

      this.textMesh = new THREE.Mesh(textGeometry, material);
      this.textMesh.position.x = 10;
      this.textMesh.position.y = 0.25;
      this.textMesh.scale.setScalar(5);
      this.textMesh.castShadow = true;
      this.textMesh.receiveShadow = true;
      this.textMesh.name = 'CUKEHATER';
      this.group.add(this.textMesh);
    });
  }

  dispose(): void {
    if (this.textMesh) {
      this.group.remove(this.textMesh);
      this.textMesh.geometry.dispose();
      if (Array.isArray(this.textMesh.material)) {
        this.textMesh.material.forEach((m) => m.dispose());
      } else {
        this.textMesh.material.dispose();
      }
      this.textMesh = null;
    }
    this.parent.remove(this.group);
  }
}
