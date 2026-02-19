import EventEmitter from "./event-emitter.js";

export default class Sizes extends EventEmitter {
  constructor() {
    super();

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.pixelRatio = Math.min(window.devicePixelRatio, 2);

    this.resize();
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.pixelRatio = Math.min(window.devicePixelRatio, 2);

    this.trigger("resize");
  }
}
