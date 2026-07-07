import { Time } from "./Time.js";

export class Engine {
  constructor() {
    this.isRunning = false;
    this.isPaused = false;

    this.time = new Time();

    this.updateCallback = null;
  }

  start(updateCallback) {
    this.isRunning = true;
    this.isPaused = false;

    this.updateCallback = updateCallback;

    this.time.reset();

    requestAnimationFrame(this.animate);
  }

  animate = (currentTime = 0) => {
    if (!this.isRunning) return;

    if (this.isPaused) {
      requestAnimationFrame(this.animate);
      return;
    }

    const deltaTime = this.time.update(currentTime);

    if (this.updateCallback) {
      this.updateCallback(deltaTime);
    }

    requestAnimationFrame(this.animate);
  };

  pause() {
    if (!this.isRunning || this.isPaused) return;

    this.isPaused = true;
  }

  resume() {
    if (!this.isRunning || !this.isPaused) return;

    this.isPaused = false;
    this.time.reset();
  }

  stop() {
    this.isRunning = false;
  }
}
