import * as THREE from "three";

import { Engine } from "./core/Engine.js";
import PendulumSystem from "./physics/PendulumSystem.js";


import { CollisionSolver } from "./physics/CollisionSolver.js";

import { CradleFactory } from "./physics/CradleFactory.js";

import { SceneManager } from "./rendering/SceneManager.js";
import { Frame } from "./rendering/Frame.js";
import { Ball } from "./components/Ball.js";
import { createBallMaterial } from "./rendering/materials.js";
import { UIManager } from "./ui/UIManager.js";
import DebugPanel from "./ui/DebugPanel.js";
import GraphManager from "./ui/GraphManager.js";
export class App {
  constructor() {
    this.engine = null;
    this.sceneManager = null;
    this.frame = null;

    this.pendulumSystem = null;
    this.groups = [];

    this.ui = null;

    this.lastLogTime = 0;
    this.isPaused = false;
    this.debugPanel = null;

    this.showVectors = false;
    this.showEnergyAnalysis = true;
    this.showMomentumAnalysis = true;
    this.showBallDetails = true;

    this.initialEnergy = 0;
  }

  async init() {
    console.log("🚀 بدء المشروع");

    this.engine = new Engine();
    this.sceneManager = new SceneManager();
    this.sceneManager.init();

    this.ui = new UIManager();
    this.ui.init();
    this.ui.onPause = () => this.togglePause();
    this.ui.onReset = () => this.resetSimulation();
    this.ui.onLaunchBalls = (n, angleDeg, opts) =>
      this.launchBalls(n, angleDeg, opts);
    this.ui.onParameterChange = (name, value) =>
      this.onParameterChange(name, value);
    this.ui.onExport = (type) => this.exportData(type);
    this.ui.onCameraCommand = (cmd) => this.cameraCommand(cmd);
    this.ui.onEnlargeBall = () => this.enlargeOneBall();
    this.ui.onToggleLeftPanel = () => this.toggleLeftPanel();

    this.frame = new Frame();
    const frameObject = this.frame.getObject3D();
    frameObject.position.set(0, 0, 0);
    this.sceneManager.scene.add(frameObject);

    const initialDamping = this.ui.getParameter("damping") || "0.02";
    const dampingEnabled = this.ui._elements?.lab?.damping?.checked ?? true;
    this.pendulumSystem = CradleFactory.createCradle({
      length: parseFloat(this.ui.getParameter("length")) || undefined,
      radius: parseFloat(this.ui.getParameter("radius")) || undefined,
      count: parseInt(this.ui.getParameter("count"), 10) || undefined,
      mass: parseFloat(this.ui.getParameter("mass")) || undefined,
      damping: dampingEnabled ? parseFloat(initialDamping) || 0.02 : 0,
    });
    this._setupPendulumGroups();

    this.pendulumSystem.getAllPendulums().forEach((ball) => {
      ball.angle = 0;
      ball.angularVelocity = 0;
      ball.angularAcceleration = 0;
    });
    this.syncPhysicsSettings();
    this.debugPanel = new DebugPanel();
    this.debugPanel.init();
    this.graphs = new GraphManager();
    this.setupMouseInteraction();
    this.engine.start((deltaTime) => this.update(deltaTime));
    console.log("✅ المشروع работает");
  }

  launchBalls(n, angleDeg = 35, opts = {}) {
    if (!this.pendulumSystem) return;

    CollisionSolver.resetCollisionCount();

    const pendulums = this.pendulumSystem.getAllPendulums();
    const angleRad = (angleDeg * Math.PI) / 180;
    n = Math.min(Math.max(n, 1), pendulums.length);

    for (const p of pendulums) {
      p._initialAngle = 0;
      p._initialAngularVelocity = 0;
      p.reset();
    }

    if (opts.bothSides) {
      const half = Math.floor(pendulums.length / 2);
      const take = Math.min(n, half);
      for (let i = 0; i < take; i++) {
        const left = pendulums[i];
        left._initialAngle = -angleRad;
        left._initialAngularVelocity = 0;
        left.reset();
        const right = pendulums[pendulums.length - 1 - i];
        right._initialAngle = angleRad;
        right._initialAngularVelocity = 0;
        right.reset();
      }
    } else {
      for (let i = 0; i < n; i++) {
        const p = pendulums[i];
        p._initialAngle = -angleRad;
        p._initialAngularVelocity = 0;
        p.reset();
      }
    }

    this.syncPhysicsSettings();
    if (this.isPaused && this.engine) {
      this.engine.resume();
      this.isPaused = false;
      this.ui.setPauseLabel(false);
    }

    let e0 = 0;
    for (const p of pendulums) e0 += p.getTotalEnergy();
    this.initialEnergy = e0 > 0 ? e0 : 0;

    this.groups.forEach((ball) => ball.update());
  }

  cameraCommand(cmd) {
    const cam = this.sceneManager?.cameraManager;
    if (!cam) return;
    switch (cmd) {
      case "left":
        cam.rotateLeft();
        break;
      case "right":
        cam.rotateRight();
        break;
      case "up":
        cam.rotateUp();
        break;
      case "down":
        cam.rotateDown();
        break;
      case "zoomIn":
        cam.zoomIn();
        break;
      case "zoomOut":
        cam.zoomOut();
        break;
      case "reset":
        cam.resetView();
        break;
      default:
        break;
    }
  }

  enlargeOneBall() {
    if (!this.groups || this.groups.length === 0) return;
    const idx = Math.floor(this.groups.length / 2);
    const ball = this.groups[idx];
    const phys = ball.physics;
    const baseRadius = parseFloat(this.ui.getParameter("radius")) || 0.32;

    if (ball._enlarged) {
      phys.radius = baseRadius;
      ball._rebuildGeometry(baseRadius);
      ball._enlarged = false;
    } else {
      const newR = baseRadius * 1.4;
      phys.radius = newR;
      ball._rebuildGeometry(newR);
      ball._enlarged = true;
    }
    ball.update();
  }

  toggleLeftPanel() {
    const panel = document.getElementById("debugPanel");
    if (panel) panel.classList.toggle("hidden");
  }

  onParameterChange(name, value) {
    if (!this.pendulumSystem) return;

    const dampingEnabled = this.ui._elements?.lab?.damping?.checked ?? true;
    const dampingValue = parseFloat(this.ui.getParameter("damping"));
    const gravityEnabled = this.ui._elements?.lab?.gravity?.checked ?? true;
    const gravityValue = parseFloat(this.ui.getParameter("gravity"));

    switch (name) {
      case "length":
      case "radius":
      case "mass":
      case "count": {
        const options = {
          length: parseFloat(this.ui.getParameter("length")) || undefined,
          radius: parseFloat(this.ui.getParameter("radius")) || undefined,
          count: parseInt(this.ui.getParameter("count"), 10) || undefined,
          mass: parseFloat(this.ui.getParameter("mass")) || undefined,
          damping: dampingEnabled
            ? isFinite(dampingValue)
              ? dampingValue
              : 0.02
            : 0,
        };
        this.groups.forEach((g) => g.dispose && g.dispose());
        this.groups = [];
        this.pendulumSystem = CradleFactory.createCradle(options);
        this._setupPendulumGroups();
        this.syncPhysicsSettings();
        break;
      }
      case "gravity": {
        const gravity = gravityEnabled
          ? typeof value === "boolean"
            ? isFinite(gravityValue)
              ? gravityValue
              : 9.81
            : parseFloat(value) || gravityValue || 9.81
          : 0;
        this.pendulumSystem
          .getAllPendulums()
          .forEach((p) => (p.gravity = gravity));
        break;
      }
      case "damping": {
        const damping = dampingEnabled
          ? typeof value === "boolean"
            ? isFinite(dampingValue)
              ? dampingValue
              : 0.02
            : parseFloat(value) || dampingValue || 0.02
          : 0;
        this.pendulumSystem
          .getAllPendulums()
          .forEach((p) => {
            p.damping = damping;
            p.pivotFriction = damping;
          });
        break;
      }
      case "collisions":
        if (typeof value === "boolean") {
          this.pendulumSystem.collisionSolver.enabled = value;
        }
        break;
      case "airDrag":
        if (typeof value === "boolean") {
          this.pendulumSystem
            .getAllPendulums()
            .forEach((p) => (p.enableAirDrag = value));
        }
        break;
      case "showVectors":
        this.showVectors = !!value;
        this.groups.forEach((g) => g.setVectorVisible && g.setVectorVisible(this.showVectors));
        break;
      case "energyAnalysis":
        this.showEnergyAnalysis = !!value;
        break;
      case "ballDetails":
        this.showBallDetails = !!value;
        break;
      case "momentumAnalysis":
        this.showMomentumAnalysis = !!value;
        break;
      case "restitution":
        if (!isNaN(parseFloat(value))) {
          this.pendulumSystem.collisionSolver.constructor.setCOR(
            parseFloat(value),
          );
        }
        break;
      case "timeScale":
        if (!isNaN(parseFloat(value))) {
          this.engine.time.timeScale = parseFloat(value);
        }
        break;
      default:
        break;
    }

    this.syncPhysicsSettings();
  }

  exportData(type) {
    const pendulums = this.pendulumSystem.getAllPendulums();
    const t = this.engine.time.elapsedTime;
    const rows = pendulums.map((p) => ({
      time: t,
      id: p.id,
      angle: p.angle,
      angularVelocity: p.angularVelocity,
      tangentialVelocity: p.getTangentialVelocity(),
      ke: p.getKineticEnergy(),
      pe: p.getPotentialEnergy(),
      totalEnergy: p.getTotalEnergy(),
      momentum: p.getMomentum(),
    }));

    if (type === "json") {
      const blob = new Blob([JSON.stringify(rows, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `physics_export_${Math.floor(t)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (type === "csv") {
      const keys = Object.keys(rows[0] || {});
      const csv = [
        keys.join(","),
        ...rows.map((r) => keys.map((k) => r[k]).join(",")),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `physics_export_${Math.floor(t)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  togglePause() {
    if (!this.engine) return;

    if (this.isPaused) {
      this.engine.resume();
      this.isPaused = false;
    } else {
      this.engine.pause();
      this.isPaused = true;
    }
    this.ui.setPauseLabel(this.isPaused);
  }

  resetSimulation() {
    if (!this.pendulumSystem) return;

    this.pendulumSystem.reset();

CollisionSolver.resetCollisionCount();


    this.syncPhysicsSettings();
    this.lastLogTime = 0;
    this.ui.updateEnergyDisplay(0, 0);
  }

  syncPhysicsSettings() {
    if (!this.pendulumSystem) return;

    const dampingEnabled = this.ui._elements?.lab?.damping?.checked ?? true;
    const dampingValue = parseFloat(this.ui.getParameter("damping")) || 0.02;
    const gravityEnabled = this.ui._elements?.lab?.gravity?.checked ?? true;
    const gravityValue = parseFloat(this.ui.getParameter("gravity")) || 9.81;
    const airDragEnabled = this.ui._elements?.lab?.airDrag?.checked ?? true;
    const restitutionValue =
      parseFloat(this.ui.getParameter("restitution")) || 0.98;
    const damping = dampingEnabled ? dampingValue : 0;
    const gravity = gravityEnabled ? gravityValue : 0;

    this.pendulumSystem.getAllPendulums().forEach((p) => {
      p.damping = damping;
      p.pivotFriction = damping;
      p.gravity = gravity;
      p.enableAirDrag = airDragEnabled;
    });

    this.pendulumSystem.collisionSolver.constructor.setCOR(restitutionValue);

    if (typeof this.pendulumSystem.collisionSolver.enabled !== "undefined") {
      this.pendulumSystem.collisionSolver.enabled =
        this.ui._elements?.lab?.collisions?.checked ?? true;
    }

  }

  _setupPendulumGroups() {
    const material = createBallMaterial();

    const pendulums = this.pendulumSystem.getAllPendulums();
    pendulums.forEach((pendulum) => {
      const ball = new Ball(this.sceneManager.scene, pendulum, material);
      this.groups.push(ball);
    });
  }

  update(deltaTime) {
    document.title = `FPS: ${this.engine.time.getFPS()}`;

    this.pendulumSystem.update(deltaTime);

    this.groups.forEach((ball) => {
      ball.update();
    });

    const pendulums = this.pendulumSystem.getAllPendulums();

    let totalEnergy = 0;
    let totalMomentum = 0;

    for (const pendulum of pendulums) {
      totalEnergy += pendulum.getTotalEnergy();
      totalMomentum += pendulum.getMomentumMagnitude();
    }

    const averageEnergy =
      pendulums.length > 0 ? totalEnergy / pendulums.length : 0;

    this.ui.updateEnergyDisplay(totalEnergy, averageEnergy);

    const currentTime = this.engine.time.elapsedTime;

    if (currentTime - this.lastLogTime >= 1.0) {
      console.log(
        `[Physics]
Energy Total = ${totalEnergy.toFixed(4)} J
Energy Avg   = ${averageEnergy.toFixed(4)} J
Momentum     = ${totalMomentum.toFixed(4)} kg·m/s`,
      );

      this.lastLogTime = currentTime;
    }
    this.debugPanel.update(this.pendulumSystem.getAllPendulums(), {
      initialEnergy: this.initialEnergy,
      showEnergyAnalysis: this.showEnergyAnalysis,
      showMomentumAnalysis: this.showMomentumAnalysis,
      showBallDetails: this.showBallDetails,
    });
    if (this.graphs) {
      const pendulums = this.pendulumSystem.getAllPendulums();
      let totalEnergy = 0;
      let totalMomentum = 0;
      let avgV = 0;
      for (const p of pendulums) {
        totalEnergy += p.getTotalEnergy();
        totalMomentum += p.getMomentumMagnitude();
        avgV += Math.abs(p.getTangentialVelocity());
      }
      avgV = pendulums.length ? avgV / pendulums.length : 0;

      this.graphs.push({
        energy: totalEnergy,
        velocity: avgV,
        momentum: totalMomentum,
        angle: pendulums[0]?.angle || 0,
        angularVelocity: pendulums[0]?.angularVelocity || 0,
      });
      this.graphs.draw();
    }

    this.sceneManager.render();
  }

  setupMouseInteraction() {
    const canvas = this.sceneManager.renderer.domElement;
    let isDragging = false;
    let selectedBall = null;

    const controls = this.sceneManager.controls;

    canvas.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;

      const mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, this.sceneManager.camera);

      const allMeshes = this.groups.map((g) => g.mesh);
      const intersects = raycaster.intersectObjects(allMeshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const index = allMeshes.indexOf(hitMesh);

        if (index >= 0) {
          isDragging = true;
          selectedBall = this.pendulumSystem.getPendulum(index);
          if (selectedBall) selectedBall.angularVelocity = 0;

          if (controls) controls.enabled = false;
          console.log(`✅ تم التقاط الكرة ${index}`);
        }
      }
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging || !selectedBall) return;

      const mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, this.sceneManager.camera);

      const origin = raycaster.ray.origin.clone();
      const dir = raycaster.ray.direction.clone();

      if (Math.abs(dir.z) < 1e-6) return;
      const t = -origin.z / dir.z;
      const point = origin.add(dir.multiplyScalar(t));

      const pivotX = selectedBall.pivotX ?? 0;
      const pivotY = selectedBall.pivotY ?? 0;
      const dx = point.x - pivotX;
      const dy = point.y - pivotY;

      const targetAngle = Math.atan2(dx, -dy);
      selectedBall.angle = Math.max(-1.4, Math.min(1.4, targetAngle));
    });

    window.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        selectedBall = null;
        if (controls) controls.enabled = true;
      }
    });
  }
}