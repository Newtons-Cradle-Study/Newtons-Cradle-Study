export class UIManager {
  constructor() {
    this.energyElement = null;
    this.energyMeter = null;
    this.energyAvg = null;
    this.pauseButton = null;
    this.resetButton = null;

    this.onPause = null;
    this.onReset = null;
    this.onLaunchBalls = null;
    this.onParameterChange = null;
    this.onExport = null;
    this.onCameraCommand = null;
    this.onEnlargeBall = null;
    this.onToggleLeftPanel = null;

    this._elements = {};
  }

  init() {
    const $ = (id) => document.getElementById(id);

    this.energyElement = $("energyDisplay");
    this.energyMeter = $("energyMeter");
    this.energyAvg = $("energyAvg");
    this.pauseButton = $("pauseButton");
    this.resetButton = $("resetButton");

    this._elements.exportCsv = $("exportCsv");
    this._elements.exportJson = $("exportJson");
    this._elements.initialAngle = $("initialAngle");
    this._elements.raisedBalls = $("raisedBalls");
    this._elements.launchButton = $("launchButton");
    this._elements.enlargeBallBtn = $("enlargeBallBtn");
    this._elements.hideLeftPanelBtn = $("hideLeftPanelBtn");

    this._elements.params = {
      count: $("param_count"),
      length: $("param_length"),
      radius: $("param_radius"),
      mass: $("param_mass"),
      gravity: $("param_gravity"),
      damping: $("param_damping"),
      restitution: $("param_restitution"),
      timeScale: $("param_timeScale"),
    };

    this._elements.lab = {
      damping: $("lab_damping"),
      airDrag: $("lab_airDrag"),
      collisions: $("lab_collisions"),
      gravity: $("lab_gravity"),
      showVectors: $("lab_showVectors"),
      energyAnalysis: $("lab_energyAnalysis"),
      momentumAnalysis: $("lab_momentumAnalysis"),
      ballDetails: $("lab_ballDetails"),
    };

    this.pauseButton?.addEventListener("click", () => this.onPause?.());
    this.resetButton?.addEventListener("click", () => this.onReset?.());

    this._elements.exportCsv?.addEventListener("click", () => this.onExport?.("csv"));
    this._elements.exportJson?.addEventListener("click", () => this.onExport?.("json"));

    this._elements.launchButton?.addEventListener("click", () => {
      const n = parseInt(this._elements.raisedBalls.value, 10) || 1;
      const angle = parseFloat(this._elements.initialAngle.value) || 35;
      this.onLaunchBalls?.(n, angle);
    });

    this._elements.enlargeBallBtn?.addEventListener("click", () => {
      this.onEnlargeBall?.();
    });

    this._elements.hideLeftPanelBtn?.addEventListener("click", () => {
      this.onToggleLeftPanel?.();
    });

    document.querySelectorAll("[data-launch]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.getAttribute("data-launch");
        const angle = parseFloat(this._elements.initialAngle.value) || 35;
        if (mode === "1-both") this.onLaunchBalls?.(1, angle, { bothSides: true });
        if (mode === "2-both") this.onLaunchBalls?.(2, angle, { bothSides: true });
      });
    });

    Object.entries(this._elements.params).forEach(([name, el]) => {
      if (!el) return;
      el.addEventListener("change", () => {
        this.onParameterChange?.(name, el.value);
      });
    });

    Object.entries(this._elements.lab).forEach(([name, el]) => {
      if (!el) return;
      el.addEventListener("change", () => {
        this.onParameterChange?.(name, el.checked);
      });
    });

    document.querySelectorAll("[data-cam]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cmd = btn.getAttribute("data-cam");
        this.onCameraCommand?.(cmd);
      });
    });

    document.querySelectorAll(".collapsible > .card-head.clickable").forEach((head) => {
      head.addEventListener("click", () => {
        head.parentElement.classList.toggle("collapsed");
      });
    });

    this._setupKeyboardShortcuts();
  }

  _setupKeyboardShortcuts() {
    window.addEventListener("keydown", (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      const angle = parseFloat(this._elements.initialAngle?.value) || 35;

      switch (e.key.toLowerCase()) {
        case "a":
          this.onLaunchBalls?.(1, angle, { bothSides: true });
          break;
        case "s":
          this.onLaunchBalls?.(2, angle, { bothSides: true });
          break;
        case " ":
          e.preventDefault();
          this.onPause?.();
          break;
        case "r":
          this.onReset?.();
          break;
        case "arrowleft":
          this.onCameraCommand?.("left");
          break;
        case "arrowright":
          this.onCameraCommand?.("right");
          break;
        case "arrowup":
          this.onCameraCommand?.("up");
          break;
        case "arrowdown":
          this.onCameraCommand?.("down");
          break;
        case "+":
        case "=":
          this.onCameraCommand?.("zoomIn");
          break;
        case "-":
          this.onCameraCommand?.("zoomOut");
          break;
        default:
          break;
      }
    });
  }

  setPauseLabel(isPaused) {
    if (!this.pauseButton) return;
    this.pauseButton.textContent = isPaused ? "استئناف" : "إيقاف";
  }

  updateEnergyDisplay(totalEnergy, averageEnergy) {
    if (this.energyElement) {
      this.energyElement.textContent = `${totalEnergy.toFixed(4)} J`;
    }
    if (this.energyAvg) {
      this.energyAvg.textContent = `المتوسط لكل كرة: ${averageEnergy.toFixed(4)} J`;
    }
    this._peakEnergy = Math.max(this._peakEnergy || 0, totalEnergy, 1e-6);
    if (this.energyMeter) {
      const pct = Math.max(0, Math.min(100, (totalEnergy / this._peakEnergy) * 100));
      this.energyMeter.style.width = `${pct}%`;
    }
  }

  getParameter(name) {
    return this._elements?.params?.[name]?.value;
  }
}

export default UIManager;