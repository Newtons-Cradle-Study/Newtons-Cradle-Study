import * as THREE from "three";

export class Renderer {
  constructor() {
    this.instance = new THREE.WebGLRenderer({
      antialias: true,
      outputColorSpace: THREE.SRGBColorSpace,
      alpha: false,
      stencil: false,
      powerPreference: "high-performance",
    });

    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.instance.setSize(window.innerWidth, window.innerHeight);

    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap;

    this.instance.toneMapping = THREE.ACESFilmicToneMapping;
    this.instance.toneMappingExposure = 1.05;

    if ("useLegacyLights" in this.instance) {
      this.instance.useLegacyLights = false;
    }
    if ("physicallyCorrectLights" in this.instance) {
      this.instance.physicallyCorrectLights = true;
    }

    this.instance.domElement.style.touchAction = "none";
    this.instance.domElement.style.display = "block";
    this.instance.domElement.tabIndex = 0;

    document.body.appendChild(this.instance.domElement);
  }

  get domElement() {
    return this.instance.domElement;
  }

  render(scene, camera) {
    this.instance.render(scene, camera);
  }

  setSize(width, height) {
    this.instance.setSize(width, height);
  }

  dispose() {
    this.instance.dispose();
  }
}

export default Renderer;