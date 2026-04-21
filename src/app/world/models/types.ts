import type { Scene } from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
export type ModelSource = {
  name: string;
  type: string;
  path: string;
};
export type ModelConfig = {
  source: ModelSource;
  place(scene: Scene, model: GLTF): void;
};
