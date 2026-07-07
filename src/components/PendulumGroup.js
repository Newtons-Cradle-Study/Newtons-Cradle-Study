import * as THREE from "three";
import PendulumString from "./PendulumString.js";
import Config from "../core/Config.js";

export class PendulumGroup {
  constructor(scene, pendulum, material) {
    this.scene = scene;
    this.physics = pendulum;

    const radius = pendulum.radius || Config.cradle.radius || 0.32;
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);

    this.string = new PendulumString(scene);
    this.string.init(pendulum.pivotX, pendulum.pivotY, Config.string?.offset);

    const pos = this.physics.getPosition();
    this.mesh.position.set(pos.x, pos.y, 0);
  }

  update() {
    const pos = this.physics.getPosition();
    this.mesh.position.set(pos.x, pos.y, 0);

    this.string.update(pos.x, pos.y, this.physics.radius, this.physics.angle);
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
  }
}

export default PendulumGroup;
