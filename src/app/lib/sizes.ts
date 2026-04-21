import EventEmitter from './event-emitter.ts';
export default class Sizes extends EventEmitter {
  width: number;
  height: number;
  pixelRatio: number;
  constructor() {
    super();
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
  }
  resize(): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.trigger('resize');
  }
}
