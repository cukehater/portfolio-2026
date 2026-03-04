/**
 * Sizes — 뷰포트 크기·픽셀비 추적
 *
 * - width, height, pixelRatio를 보관
 * - resize 이벤트 시 갱신 후 "resize" 트리거 → App이 카메라·렌더러 리사이즈에 사용
 */
import EventEmitter from './event-emitter.js';

export default class Sizes extends EventEmitter {
  constructor() {
    super();

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);

    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.trigger('resize');
  }
}
