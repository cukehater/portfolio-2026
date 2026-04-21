import * as THREE from 'three';
export const applyMatcapToMeshes = (
  src: string,
  group: THREE.Group,
  color?: number
) => {
  new THREE.TextureLoader().load(src, (matcap) => {
    const prev = new Set<THREE.Material>();
    group.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const m = mesh.material;
      if (Array.isArray(m)) m.forEach((x) => prev.add(x));
      else if (m) prev.add(m);
      mesh.material = new THREE.MeshMatcapMaterial({
        matcap,
        color: color ?? undefined,
      });
    });
    matcap.colorSpace = THREE.SRGBColorSpace;
    prev.forEach((m) => m.dispose());
  });
};
