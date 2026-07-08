import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import { Renderer } from "./Renderer.js";
import { CameraManager } from "./CameraManager.js";
import { Lights } from "./Lights.js";
import { createFloorMaterial } from "./materials.js";
import skyboxUrl from "../public/monochrome_studio_02_1k.exr?url";

export class SceneManager {
  constructor() {
    this.scene = null;
    this.cameraManager = null;
    this.renderer = null;
    this.lights = null;
    this._bgMesh = null;
  }

  init() {
    this.scene = new THREE.Scene();

    this._setupGradientBackground();

    this.renderer = new Renderer();

    this._setupEnvironment();

    this._loadSkybox();

    this.cameraManager = new CameraManager(this.renderer.domElement);

    this.lights = new Lights(this.scene);

    this._createFloor();

    this._createCarpet();

    window.addEventListener("resize", this.onResize.bind(this));
  }

  _setupGradientBackground() {
    const c = document.createElement("canvas");
    c.width = 16;
    c.height = 256;
    const ctx = c.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0.0, "#1a1538");
    grad.addColorStop(0.45, "#241f47");
    grad.addColorStop(1.0, "#0e0b1f");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 256);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;

    const bgGeo = new THREE.SphereGeometry(50, 32, 16);
    const bgMat = new THREE.MeshBasicMaterial({
      map: tex,
      side: THREE.BackSide,
      fog: false,
    });
    this._bgMesh = new THREE.Mesh(bgGeo, bgMat);
    this.scene.add(this._bgMesh);

    this.scene.background = tex;
  }

  _setupEnvironment() {
    const pmrem = new THREE.PMREMGenerator(this.renderer.instance);
    const envScene = new RoomEnvironment();
    const envMap = pmrem.fromScene(envScene, 0.04).texture;
    this.scene.environment = envMap;

    pmrem.dispose();
    this._pmrem = pmrem;
  }

  _loadSkybox() {
    new EXRLoader().load(
      skyboxUrl,
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        const pmrem = new THREE.PMREMGenerator(this.renderer.instance);
        const envMap = pmrem.fromEquirectangular(texture).texture;
        this.scene.environment = envMap;
        this.scene.background = envMap;
        // Remove the opaque gradient sphere so the skybox shows behind it
        if (this._bgMesh) {
          this.scene.remove(this._bgMesh);
          this._bgMesh.geometry.dispose();
          this._bgMesh.material.map.dispose();
          this._bgMesh.material.dispose();
          this._bgMesh = null;
        }
        texture.dispose();
        pmrem.dispose();
      },
      undefined,
      (err) => console.error("[Skybox] load failed:", err),
    );
  }

  _createFloor() {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      createFloorMaterial(),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.05;
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  _createCarpet() {
    const carpetMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d2150,
      roughness: 0.85,
      metalness: 0.0,
    });

    const carpet = new THREE.Mesh(new THREE.PlaneGeometry(7, 4), carpetMaterial);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, -0.04, 0);
    carpet.receiveShadow = true;
    this.scene.add(carpet);
  }

  onResize() {
    this.cameraManager.onResize();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.cameraManager.update();
    this.renderer.render(this.scene, this.cameraManager.camera);
  }

  get camera() {
    return this.cameraManager.camera;
  }

  get controls() {
    return this.cameraManager.controls;
  }
}
