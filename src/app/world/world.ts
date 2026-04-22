import type * as THREE from 'three';
import App from '../index.ts';
import Lights from './lights.ts';
import { type Car, createSceneModels } from './objects/index.ts';
import type BookStack from './objects/book-stack.ts';
import type Laptop from './objects/laptop.ts';
import type { ObjectBoundKey } from './types/index.ts';
import type Mug from './objects/mug.ts';
import type Phone from './objects/phone.ts';

export default class World {
  app: App;
  scene: THREE.Scene;
  lights: Lights;
  car: Car | null;
  laptop: Laptop | null;
  bookStack: BookStack | null;
  phone: Phone | null;
  mug: Mug | null;
  objectBounds: ObjectBoundKey;

  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    this.lights = new Lights(this.scene, this.app);
    this.objectBounds = {};
    this.car = null;
    this.laptop = null;
    this.bookStack = null;
    this.phone = null;
    this.mug = null;

    this.app.resources.on('objectsReady', () => {
      createSceneModels(this.scene);
      // this.car = new Car(this.scene);
    });
  }

  update(): void {
    this.car?.update();
    this.laptop?.update();
    this.bookStack?.update();
    this.phone?.update();
    this.mug?.update();
  }
}
