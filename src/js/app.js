import * as THREE from "three";

import Sizes from "./utils/sizes.js";
import World from "./world/world.js";
import Camera from "./camera.js";
import Renderer from "./renderer.js";
import Time from "./utils/time.js";
import Resources from "./utils/resources.js";
import sources from "./sources.js";

let instance = null;

export default class App {
  constructor(_canvas) {
    // Singleton
    if (instance) return instance;
    instance = this;

    this.canvas = _canvas;

    // Setup
    this.sizes = new Sizes();
    this.time = new Time();
    this.resources = new Resources(sources);
    this.scene = new THREE.Scene();
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.world = new World();

    // Resize Event
    this.sizes.on("resize", this.resize.bind(this));

    // Time tick event
    this.time.on("tick", this.update.bind(this));
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  update() {
    this.camera.update();
    this.world.update();

    this.renderer.update();
  }
}
