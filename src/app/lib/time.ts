import EventEmitter from './event-emitter.ts';
export default class Time extends EventEmitter {
  start: number;
  current: number;
  elapsed: number;
  delta: number;
  constructor() {
    super();
    const now = Date.now();
    this.start = now;
    this.current = now;
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
