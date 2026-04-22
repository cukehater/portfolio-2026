import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import OfficeDesk from './office-desk.ts';
import { getApp } from '../../index.ts';
import DeskMat from './desk-mat.ts';
import BookStack from './book-stack.ts';
import Laptop from './laptop.ts';
import Phone from './phone.ts';
import Mug from './mug.ts';
export { default as Car } from './car.ts';

export const createSceneModels = (scene: THREE.Scene): void => {
  const items = getApp().resources.items as Record<string, GLTF>;
  const mapGroup = new THREE.Group();

  new OfficeDesk(mapGroup, items['office_desk']);
  new DeskMat(mapGroup, items['desk_mat']);

  getApp().world.bookStack = new BookStack(mapGroup, items['book']);
  getApp().world.laptop = new Laptop(mapGroup, items['laptop']);
  getApp().world.phone = new Phone(mapGroup, items['phone']);
  getApp().world.mug = new Mug(mapGroup, items['mug']);

  scene.add(mapGroup);
};
