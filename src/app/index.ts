/**
 * App — 전체 3D 앱의 루트 클래스 (싱글톤)
 *
 * 역할:
 * - 캔버스, 씬(Scene), 카메라, 렌더러, 월드(오브젝트들)를 생성하고 연결
 * - 창 크기 변경 시 리사이즈 이벤트 전달
 * - 매 프레임마다 tick 이벤트로 카메라·월드 업데이트 후 렌더링
 */
import * as THREE from 'three';

import Sizes from './utils/sizes.ts';
import World from './world/world.ts';
import Camera from './camera.ts';
import Renderer from './renderer.ts';
import Time from './utils/time.ts';
import Resources from './utils/resources.ts';
import sources from './sources.ts';
import Debug from './utils/debug.ts';

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

    console.time('App constructor');
    instance = this;

    this.canvas = _canvas ?? null;

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

    console.timeEnd('App constructor');
  }

  resize(): void {
    this.camera.resize();
    this.renderer.resize();
  }

  /** 매 프레임 호출: 카메라(차 추적) → 월드(차 이동 등) → 렌더 */
  update(): void {
    this.camera.update();
    this.world.update();
    this.renderer.update();
  }
}
