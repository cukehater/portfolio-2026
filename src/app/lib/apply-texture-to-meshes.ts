import * as THREE from 'three';

type MatcapItem = {
  name: string;
  type: 'matcap';
  src?: string;
  options?: Omit<THREE.MeshMatcapMaterialParameters, 'matcap'>;
};

type BasicItem = {
  name: string;
  type: 'basic';
  options?: THREE.MeshBasicMaterialParameters;
};

type TextureItem = MatcapItem | BasicItem;

const textureLoader = new THREE.TextureLoader();
const matcapTexturePromises = new Map<string, Promise<THREE.Texture>>();

function loadMatcapTexture(url: string): Promise<THREE.Texture> {
  let pending = matcapTexturePromises.get(url);
  if (!pending) {
    pending = new Promise<THREE.Texture>((resolve, reject) => {
      textureLoader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          resolve(texture);
        },
        undefined,
        () => {
          matcapTexturePromises.delete(url);
          reject(new Error(`Matcap을 로드하는데 실패했습니다: ${url}`));
        }
      );
    });
    matcapTexturePromises.set(url, pending);
  }
  return pending;
}

export function applyTextureToMeshes(
  group: THREE.Group,
  items: TextureItem[]
): void {
  const defaultMatcap = '/textures/matcaps/gray.png';
  const byName = new Map<string, TextureItem>();

  for (const item of items) {
    byName.set(item.name, item);
  }

  group.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    const target = byName.get(child.name);
    if (!target) return;

    switch (target.type) {
      case 'matcap':
        void loadMatcapTexture(target.src ?? defaultMatcap).then((matcap) => {
          child.material = new THREE.MeshMatcapMaterial({
            matcap,
            ...target.options,
          });
        });
        break;
      default:
        child.material = new THREE.MeshBasicMaterial({
          ...target.options,
        });
        break;
    }
  });
}
