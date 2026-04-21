import * as THREE from 'three';
import Sizes from './lib/sizes.ts';
import World from './world/world.ts';
import Camera from './camera.ts';
import Renderer from './renderer.ts';
import Time from './lib/time.ts';
import Resources from './lib/resources.ts';
import sources from './sources.ts';
import Debug from './lib/debug.ts';
let instance: App | null = null;
export function getApp(): App {
  return instance!;
}
export default class App {
  canvas!: HTMLCanvasElement | null;
  sizes!: Sizes;
  time!: Time;
  resources!: Resources;
  scene!: THREE.Scene;
  camera!: Camera;
  renderer!: Renderer;
  world!: World;
  debug!: Debug;
  constructor(_canvas?: HTMLCanvasElement) {
    if (instance) return instance;
    instance = this;
    if (!_canvas) throw new Error('캔버스 요소를 찾을 수 없습니다.');
    this.canvas = _canvas;
    this.sizes = new Sizes();
    this.time = new Time();
    this.resources = new Resources(sources);
    this.debug = new Debug();
    this.scene = new THREE.Scene();
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.world = new World();
    this.sizes.on('resize', this.resize.bind(this));
    this.time.on('tick', this.update.bind(this));
  }
  resize(): void {
    this.camera.resize();
    this.renderer.resize();
  }
  update(): void {
    this.camera.update();
    this.world.update();
    this.renderer.update();
  }
}
