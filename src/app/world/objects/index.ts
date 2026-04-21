import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import OfficeDesk from './officeDesk.ts';
import { getApp } from '../../index.ts';
import DeskMat from './deskMat.ts';
import BookStack from './bookStack.ts';
import Laptop from './laptop.ts';
export { default as Car } from './car.ts';
export function createSceneModels(scene: THREE.Scene): BookStack {
  const items = getApp().resources.items as Record<string, GLTF>;
  const mapGroup = new THREE.Group();
  new OfficeDesk(mapGroup, items['office_desk']);
  new DeskMat(mapGroup, items['desk_mat']);
  const bookStack = new BookStack(mapGroup, items['book']);
  new Laptop(mapGroup, items['laptop']);
  scene.add(mapGroup);
  return bookStack;
}
