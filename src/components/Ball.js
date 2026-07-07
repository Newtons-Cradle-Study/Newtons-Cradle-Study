import * as THREE from "three";
import PendulumString from "./PendulumString.js";
import Config from "../core/Config.js";

export class Ball {
  constructor(scene, physics, material) {
    this.scene = scene;
    this.physics = physics;

    const radius = physics.radius ?? Config.cradle.radius ?? 0.32;
    const geometry = new THREE.SphereGeometry(radius, 64, 64);
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);

    this.string = new PendulumString(scene);
    this.string.init(physics.pivotX, physics.pivotY, Config.string?.offset);

    this.velocityArrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 0),
      0,
      0x00ff88,
      0.15,
      0.08,
    );
    this.velocityArrow.visible = false;
    this.scene.add(this.velocityArrow);

    const pos = this.physics.getPosition();
    this.mesh.position.set(pos.x, pos.y, 0);
  }

  setVectorVisible(visible) {
    if (this.velocityArrow) this.velocityArrow.visible = !!visible;
  }

  update() {
    const pos = this.physics.getPosition();
    this.mesh.position.set(pos.x, pos.y, 0);

    this.string.update(pos.x, pos.y, this.physics.radius, this.physics.angle);

    if (this.velocityArrow) {
      const v = this.physics.getVelocity();
      const speed = Math.hypot(v.x, v.y);
      if (speed > 1e-5) {
        const dir = new THREE.Vector3(v.x, v.y, 0).normalize();
        this.velocityArrow.position.set(pos.x, pos.y, 0);
        this.velocityArrow.setDirection(dir);
        this.velocityArrow.setLength(
          Math.max(0.1, Math.min(speed * 0.3, 1.5)),
          0.15,
          0.08,
        );
      }
    }
  }

  _rebuildGeometry(radius) {
    if (!this.mesh || !Number.isFinite(radius) || radius <= 0) return;
    if (this.physics) this.physics.radius = radius;
    if (this.mesh.geometry) this.mesh.geometry.dispose();
    this.mesh.geometry = new THREE.SphereGeometry(radius, 64, 64);
  }

  dispose() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      if (this.mesh.geometry) this.mesh.geometry.dispose();
      this.mesh = null;
    }

    if (this.string && typeof this.string.dispose === "function") {
      this.string.dispose();
      this.string = null;
    }

    if (this.velocityArrow) {
      this.scene.remove(this.velocityArrow);
      this.velocityArrow.dispose();
      this.velocityArrow = null;
    }
  }
}

export default Ball;
