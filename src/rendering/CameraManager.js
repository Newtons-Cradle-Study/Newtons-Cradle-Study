import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const _offset = new THREE.Vector3();
const _sph = new THREE.Spherical();

export class CameraManager {
  constructor(domElement) {
    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      200,
    );
    this.camera.position.set(0, 6, 16);
    this.camera.lookAt(0, 2, 0);

    this.controls = new OrbitControls(this.camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.target.set(0, 2, 0);

    this.controls.enableRotate = true;
    this.controls.enableZoom =true;
    this.controls.enablePan =true;
    this.controls.update();

    this._defaultPos = this.camera.position.clone();
    this._defaultTarget = this.controls.target.clone();

    this._stepTheta = 0.13;
    this._stepPhi = 0.11;
    this._zoomFactor = 0.88;
  }

  _applySpherical(dTheta = 0, dPhi = 0, radiusMul = 1) {
    _offset.copy(this.camera.position).sub(this.controls.target);
    _sph.setFromVector3(_offset);
    _sph.theta += dTheta;
    _sph.phi = Math.min(Math.max(_sph.phi + dPhi, 0.18), Math.PI - 0.18);
    _sph.radius = Math.min(Math.max(_sph.radius * radiusMul, 5), 45);
    _offset.setFromSpherical(_sph);
    this.camera.position.copy(this.controls.target).add(_offset);
    this.camera.lookAt(this.controls.target);
  }

  rotateLeft() {
    this._applySpherical(-this._stepTheta, 0, 1);
  }
  rotateRight() {
    this._applySpherical(this._stepTheta, 0, 1);
  }
  rotateUp() {
    this._applySpherical(0, -this._stepPhi, 1);
  }
  rotateDown() {
    this._applySpherical(0, this._stepPhi, 1);
  }
  zoomIn() {
    this._applySpherical(0, 0, this._zoomFactor);
  }
  zoomOut() {
    this._applySpherical(0, 0, 1 / this._zoomFactor);
  }
  resetView() {
    this.camera.position.copy(this._defaultPos);
    this.controls.target.copy(this._defaultTarget);
    this.camera.lookAt(this.controls.target);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  update() {
    this.controls.update();
  }
}

export default CameraManager;
