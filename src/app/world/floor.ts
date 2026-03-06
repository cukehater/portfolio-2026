/**
 * Floor — 바닥면 + 그리드
 */
import * as THREE from 'three';
import App from '../index.ts';

const DESK = {
  width: 60,
  depth: 40,
};

export default class Floor {
  app: App;
  // resources: InstanceType<typeof Resources>;
  scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.app = new App();
    this.scene = scene;
    // this.resources = this.app.resources;
    // this.resources.on('ready', this.setFloor.bind(this));
    this.setFloor();
  }

  setFloor(): void {
    // const woodColorTexture = this.resources.items
    //   .woodColorTexture as THREE.Texture;
    // const woodRoughnessTexture = this.resources.items
    //   .woodRoughnessTexture as THREE.Texture;
    // const woodNormalTexture = this.resources.items
    //   .woodNormalTexture as THREE.Texture;
    // woodColorTexture.colorSpace = THREE.SRGBColorSpace;

    const floorGeo = new THREE.BoxGeometry(DESK.width, DESK.depth, 0.1);
    const floorMat = new THREE.MeshStandardMaterial({
      // map: woodColorTexture,
      // roughnessMap: woodRoughnessTexture,
      // normalMap: woodNormalTexture,
      color: 0x5c3d1e,
    });

    // woodColorTexture.repeat.x = 20;
    // woodColorTexture.repeat.y = 20;

    // woodColorTexture.wrapS = THREE.RepeatWrapping;
    // woodColorTexture.wrapT = THREE.RepeatWrapping;

    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0x5c3d1e,
      roughness: 0.9,
    });
    const edges = [
      { w: DESK.width, h: 2, d: 0.5, x: 0, y: -0.5, z: DESK.depth / 2 }, // 앞
      { w: DESK.width, h: 2, d: 0.5, x: 0, y: -0.5, z: -DESK.depth / 2 }, // 뒤
      { w: 0.5, h: 2, d: DESK.depth, x: DESK.width / 2, y: -0.5, z: 0 }, // 우
      { w: 0.5, h: 2, d: DESK.depth, x: -DESK.width / 2, y: -0.5, z: 0 }, // 좌
    ];
    edges.forEach(({ w, h, d, x, y, z }) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), edgeMat);
      mesh.position.set(x, y, z);
      mesh.receiveShadow = true;
      this.scene.add(mesh);
    });
  }
}
