import * as THREE from "three";
import Config from "../core/Config.js";
import { createStringMaterial } from "../rendering/materials.js";

class PendulumString {
  constructor(scene, options = {}) {
    this.scene = scene;

    this.leftLine = null;
    this.rightLine = null;

    this.material = new THREE.LineBasicMaterial({
      color: options.color ?? Config.string?.color ?? 0xcfcfd4,
      linewidth: options.linewidth ?? 2,
    });

    this.pivotX = 0;
    this.pivotY = 0;
    this.offset = 0;

    this.showAnchors =
      options.showAnchors ?? Config.string?.showAnchors ?? false;
    this.leftAnchor = null;
    this.rightAnchor = null;
    this.anchorMaterial = new THREE.MeshStandardMaterial({
      color: options.anchorColor ?? Config.string?.anchorColor ?? 0x888888,
      metalness: 0.6,
      roughness: 0.4,
    });
    this.anchorRadius = options.anchorRadius ?? 0.03;

    this.useCylinders =
      options.useCylinders ?? Config.string?.useCylinders ?? false;
    this.cylinderThickness = options.cylinderThickness ?? 0.01;
  }

  init(pivotX, pivotY, offset = undefined) {
    this.pivotX = pivotX;
    this.pivotY = pivotY;
    if (typeof offset === "number") this.offset = offset;

    if (this.useCylinders) {
      const cylGeo = new THREE.CylinderGeometry(
        this.cylinderThickness,
        this.cylinderThickness,
        1,
        8,
      );
      const cylMat = createStringMaterial();
      this.leftLine = new THREE.Mesh(cylGeo, cylMat);
      this.leftLine.castShadow = false;
      this.leftLine.receiveShadow = false;
      this.scene.add(this.leftLine);

      this.rightLine = new THREE.Mesh(cylGeo.clone(), cylMat);
      this.rightLine.castShadow = false;
      this.rightLine.receiveShadow = false;
      this.scene.add(this.rightLine);
    } else {
      const leftGeometry = new THREE.BufferGeometry();
      const leftPositions = new Float32Array(6);
      leftGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(leftPositions, 3),
      );
      this.leftLine = new THREE.Line(leftGeometry, this.material);
      this.leftLine.castShadow = false;
      this.leftLine.receiveShadow = false;
      this.scene.add(this.leftLine);

      const rightGeometry = new THREE.BufferGeometry();
      const rightPositions = new Float32Array(6);
      rightGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(rightPositions, 3),
      );
      this.rightLine = new THREE.Line(rightGeometry, this.material);
      this.rightLine.castShadow = false;
      this.rightLine.receiveShadow = false;
      this.scene.add(this.rightLine);
    }

    if (this.showAnchors) {
      const cylGeo = new THREE.CylinderGeometry(
        this.anchorRadius,
        this.anchorRadius,
        this.anchorRadius * 2,
        12,
      );
      this.leftAnchor = new THREE.Mesh(cylGeo, this.anchorMaterial);
      this.leftAnchor.castShadow = true;
      this.leftAnchor.receiveShadow = true;
      this.scene.add(this.leftAnchor);

      this.rightAnchor = new THREE.Mesh(cylGeo, this.anchorMaterial);
      this.rightAnchor.castShadow = true;
      this.rightAnchor.receiveShadow = true;
      this.scene.add(this.rightAnchor);
    }
  }

  update(ballX, ballY, radius = 0.32, angle = 0) {
    if (!this.leftLine || !this.rightLine) return;

    const attachX = ballX - Math.sin(angle) * radius;
    const attachY = ballY + Math.cos(angle) * radius;
    const attachZ = 0;

    const leftPivotX = this.pivotX;
    const rightPivotX = this.pivotX;
    const pivotY = this.pivotY;
    const leftPivotZ = 1.5;
    const rightPivotZ = -1.5;

    if (this.useCylinders) {
      const leftPivot = new THREE.Vector3(leftPivotX, pivotY, leftPivotZ);

      const rightPivot = new THREE.Vector3(rightPivotX, pivotY, rightPivotZ);
      const attach = new THREE.Vector3(attachX, attachY, attachZ);

      this._placeCylinder(this.leftLine, leftPivot, attach);
      this._placeCylinder(this.rightLine, rightPivot, attach);
    } else {
      const leftPos = this.leftLine.geometry.attributes.position.array;
      leftPos[0] = leftPivotX;
      leftPos[1] = pivotY;
      leftPos[2] = leftPivotZ;
      leftPos[3] = attachX;
      leftPos[4] = attachY;
      leftPos[5] = attachZ;
      this.leftLine.geometry.attributes.position.needsUpdate = true;

      const rightPos = this.rightLine.geometry.attributes.position.array;
      rightPos[0] = rightPivotX;
      rightPos[1] = pivotY;
      rightPos[2] = rightPivotZ;
      rightPos[3] = attachX;
      rightPos[4] = attachY;
      rightPos[5] = attachZ;
      this.rightLine.geometry.attributes.position.needsUpdate = true;
    }

    if (this.showAnchors && this.leftAnchor && this.rightAnchor) {
      this.leftAnchor.position.set(
        leftPivotX,
        pivotY - this.anchorRadius,
        leftPivotZ,
      );
      this.leftAnchor.rotation.x = Math.PI / 2;
      this.rightAnchor.position.set(
        rightPivotX,
        pivotY - this.anchorRadius,
        rightPivotZ,
      );
      this.rightAnchor.rotation.x = Math.PI / 2;
    }
  }

  _placeCylinder(cyl, p1, p2) {
    const diff = new THREE.Vector3().subVectors(p2, p1);
    const len = diff.length();
    cyl.scale.set(1, Math.max(len, 1e-6), 1);
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    cyl.position.copy(mid);
    const up = new THREE.Vector3(0, 1, 0);
    const dir = diff.clone().normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(up, dir);
    cyl.quaternion.copy(q);
  }

  dispose() {
    if (this.leftLine) {
      this.scene.remove(this.leftLine);
      if (this.leftLine.geometry) this.leftLine.geometry.dispose();
      this.leftLine = null;
    }
    if (this.rightLine) {
      this.scene.remove(this.rightLine);
      if (this.rightLine.geometry) this.rightLine.geometry.dispose();
      this.rightLine = null;
    }
    if (this.leftAnchor) {
      this.scene.remove(this.leftAnchor);
      if (this.leftAnchor.geometry) this.leftAnchor.geometry.dispose();
      this.leftAnchor = null;
    }
    if (this.rightAnchor) {
      this.scene.remove(this.rightAnchor);
      if (this.rightAnchor.geometry) this.rightAnchor.geometry.dispose();
      this.rightAnchor = null;
    }
  }
}

export default PendulumString;