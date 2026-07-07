import * as THREE from "three";

export class Lights {
  constructor(scene) {
    this.scene = scene;
    this.lights = [];
    this._createLights();
  }

  _createLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(7, 14, 9);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 40;
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    keyLight.shadow.radius = 4;
    keyLight.shadow.bias = -0.0005;

    const fillLight = new THREE.DirectionalLight(0xffe8c4, 0.6);
    fillLight.position.set(-6, 8, -7);

    const rimLight = new THREE.DirectionalLight(0xa78bfa, 0.5);
    rimLight.position.set(0, 6, -10);

    this.lights = [ambientLight, keyLight, fillLight, rimLight];
    this.lights.forEach((light) => this.scene.add(light));
  }

  dispose() {
    this.lights.forEach((light) => this.scene.remove(light));
    this.lights = [];
  }
}

export default Lights;