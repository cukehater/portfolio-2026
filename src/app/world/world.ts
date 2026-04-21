import * as THREE from 'three';
import App from '../index.ts';
import Lights from './lights.ts';
import BookStack from './objects/bookStack.ts';
import { Car, createSceneModels } from './objects/index.ts';
export type ObjectBoundEntry = {
  size: THREE.Vector3;
  position: THREE.Vector3;
};
export type ObjectBoundKey = Record<string, ObjectBoundEntry>;
export default class World {
  app: App;
  scene: THREE.Scene;
  lights: Lights;
  car: Car | null;
  bookStack: BookStack | null;
  objectBounds: ObjectBoundKey;
  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    this.lights = new Lights(this.scene, this.app);
    this.objectBounds = {};
    this.car = null;
    this.bookStack = null;
    this.app.resources.on('objectsReady', () => {
      this.bookStack = createSceneModels(this.scene);
      this.car = new Car(this.scene);
    });
  }
  update(): void {
    this.car?.update();
  }
}
