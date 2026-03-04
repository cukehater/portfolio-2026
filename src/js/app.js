/**
 * App — 전체 3D 앱의 루트 클래스 (싱글톤)
 *
 * 역할:
 * - 캔버스, 씬(Scene), 카메라, 렌더러, 월드(오브젝트들)를 생성하고 연결
 * - 창 크기 변경 시 리사이즈 이벤트 전달
 * - 매 프레임마다 tick 이벤트로 카메라·월드 업데이트 후 렌더링
 */
import * as THREE from 'three';

import Sizes from './utils/sizes.js';
import World from './world/world.js';
import Camera from './camera.js';
import Renderer from './renderer.js';
import Time from './utils/time.js';
import Resources from './utils/resources.js';
import sources from './sources.js';

let instance = null;

export default class App {
  constructor(_canvas) {
    // 싱글톤: 이미 인스턴스가 있으면 새로 만들지 않고 기존 인스턴스 반환
    if (instance) return instance;
    instance = this;

    this.canvas = _canvas;

    // 유틸: 화면 크기, 시간(델타), 리소스 로더
    this.sizes = new Sizes();
    this.time = new Time();
    this.resources = new Resources(sources);
    // Three.js 씬 (3D 공간 컨테이너)
    this.scene = new THREE.Scene();
    // 카메라·렌더러·월드는 내부에서 new App()으로 이 인스턴스를 참조함
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.world = new World();

    // 창 크기 변경 시 카메라 비율·렌더러 크기 갱신
    this.sizes.on('resize', this.resize.bind(this));
    // requestAnimationFrame마다 update 호출 → 카메라·월드 업데이트 후 렌더
    this.time.on('tick', this.update.bind(this));
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  /** 매 프레임 호출: 카메라(차 추적) → 월드(차 이동 등) → 렌더 */
  update() {
    this.camera.update();
    this.world.update();
    this.renderer.update();
  }
}
