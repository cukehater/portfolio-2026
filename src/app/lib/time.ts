import EventEmitter from './event-emitter.ts';

export default class Time extends EventEmitter {
  start: number;
  current: number;
  elapsed: number;
  delta: number;

  private readonly scheduleTick = (): void => {
    window.requestAnimationFrame(this.boundTick);
  };

  private readonly boundTick = (): void => {
    const currentTime = Date.now();
    this.delta = currentTime - this.current;
    this.current = currentTime;
    this.elapsed = this.current - this.start;
    this.trigger('tick');
    this.scheduleTick();
  };

  constructor() {
    super();
    const now = Date.now();
    this.start = now;
    this.current = now;
    this.elapsed = 0;
    this.delta = 16;
    this.scheduleTick();
  }
}
