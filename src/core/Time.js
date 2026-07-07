export class Time {
  constructor(maxDelta = 0.05) {
    this.startTime = 0;

    this.currentTime = 0;

    this.previousTime = 0;

    this.deltaTime = 0;

    this.elapsedTime = 0;

    this.frameCount = 0;

    this.fps = 0;

    this.timeScale = 1.0;

    this._fpsAccumulator = 0;

    this._fpsTimestamp = 0;

    this._maxDelta = maxDelta;

    this.reset();
  }

  _now() {
    if (
      typeof performance !== "undefined" &&
      typeof performance.now === "function"
    ) {
      return performance.now() * 0.001;
    }

    return Date.now() * 0.001;
  }

  _normalizeTime(timeStamp) {
    return timeStamp > 1e5 ? timeStamp * 0.001 : timeStamp;
  }

  reset(timeStamp) {
    const now =
      typeof timeStamp === "number"
        ? this._normalizeTime(timeStamp)
        : this._now();

    this.startTime = now;
    this.currentTime = now;
    this.previousTime = now;
    this.deltaTime = 0;
    this.elapsedTime = 0;
    this.frameCount = 0;
    this.fps = 0;
    this._fpsAccumulator = 0;
    this._fpsTimestamp = now;

    return this;
  }

  update(timeStamp) {
    const now =
      typeof timeStamp === "number"
        ? this._normalizeTime(timeStamp)
        : this._now();

    this.currentTime = now;
    this.deltaTime = Math.min(
      Math.max(now - this.previousTime, 0),
      this._maxDelta,
    );
    this.previousTime = now;
    this.elapsedTime = now - this.startTime;
    this.frameCount += 1;

    this._fpsAccumulator += 1;
    const fpsInterval = now - this._fpsTimestamp;
    if (fpsInterval >= 1) {
      this.fps = Math.round(this._fpsAccumulator / fpsInterval);
      this._fpsAccumulator = 0;
      this._fpsTimestamp = now;
    }

    const scale =
      Number.isFinite(this.timeScale) && this.timeScale > 0
        ? this.timeScale
        : this.timeScale < 0
          ? Math.abs(this.timeScale)
          : 0;

    return this.deltaTime * scale;
  }

  getDeltaTime() {
    return this.deltaTime;
  }

  getElapsedTime() {
    return this.elapsedTime;
  }

  getFPS() {
    return this.fps;
  }

  getFixedDeltaTime() {
    return 1 / 120;
  }
}