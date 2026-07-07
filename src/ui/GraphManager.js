export class GraphManager {
  constructor() {
    this.maxSamples = 600;
    this.buffers = {
      energy: [],
      velocity: [],
      momentum: [],
      angle: [],
    };

    this.colors = {
      energy: "#fbbf24",
      velocity: "#34d399",
      momentum: "#60a5fa",
      angle: "#f472b6",
    };

    this.canvas = document.getElementById("graphCanvas");
    if (!this.canvas) return;

    this._resize();
    window.addEventListener("resize", () => this._resize());

    this.ctx = this.canvas.getContext("2d");
  }

  _resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  push(sample) {
    Object.keys(this.buffers).forEach((k) => {
      this.buffers[k].push(sample[k] ?? 0);
      if (this.buffers[k].length > this.maxSamples) this.buffers[k].shift();
    });
  }

  draw() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = (h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const drawLine = (arr, color) => {
      if (!arr || arr.length === 0) return;
      const max = Math.max(...arr);
      const min = Math.min(...arr);
      const span = max - min || 1;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      for (let i = 0; i < arr.length; i++) {
        const x = (i / (arr.length - 1 || 1)) * w;
        const v = (arr[i] - min) / span;
        const y = h - v * (h - 6) - 3;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    drawLine(this.buffers.energy, this.colors.energy);
    drawLine(this.buffers.velocity, this.colors.velocity);
    drawLine(this.buffers.momentum, this.colors.momentum);
    drawLine(this.buffers.angle, this.colors.angle);
  }
}

export default GraphManager;