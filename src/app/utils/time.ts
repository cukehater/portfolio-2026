/**
 * Time — requestAnimationFrame 기반 루프
 *
 * - 매 프레임 delta(이전 프레임과의 시간차), elapsed(시작 이후 경과) 갱신
 * - "tick" 이벤트로 App.update()가 호출됨 → 카메라·월드·렌더 한 사이클
 */
import EventEmitter from './event-emitter.ts';

export default class Time extends EventEmitter {
  start: number;
  current: number;
  elapsed: number;
  delta: number;

  constructor() {
    super();

    this.start = Date.now();
    this.current = this.start;
    this.elapsed = 0;
    this.delta = 16;

    window.requestAnimationFrame(this.tick.bind(this));
  }

  tick(): void {
    const currentTime = Date.now();
    this.delta = currentTime - this.current;
    this.current = currentTime;
    this.elapsed = this.current - this.start;

    this.trigger('tick');
    window.requestAnimationFrame(this.tick.bind(this));
  }
}
