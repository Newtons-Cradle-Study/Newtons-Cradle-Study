import * as THREE from "three";
import {
  createWoodenBaseMaterial,
  createFrameMaterial,
} from "./materials.js";

export class Frame {
  constructor() {
    this.group = new THREE.Group();
    this._buildFrame();
  }

  _buildFrame() {
    const material = createFrameMaterial();

    const topBarRadius = 0.12;
    const topBarLength = 5.2;

    const barSpacing = 1.5;

    const frontBar = new THREE.Mesh(
      new THREE.CylinderGeometry(topBarRadius, topBarRadius, topBarLength, 24),
      material,
    );

    frontBar.rotation.z = Math.PI / 2;
    frontBar.position.set(0, 4.8, 1.5);

    frontBar.castShadow = true;
    frontBar.receiveShadow = true;

    this.group.add(frontBar);

    const backBar = new THREE.Mesh(
      new THREE.CylinderGeometry(topBarRadius, topBarRadius, topBarLength, 24),
      material,
    );

    backBar.rotation.z = Math.PI / 2;
    backBar.position.set(0, 4.8, -1.5);

    backBar.castShadow = true;
    backBar.receiveShadow = true;

    this.group.add(backBar);

    const supportRadius = 0.08;
    const supportHeight = 4.6;

    const supports = [
      [-2.4, barSpacing],
      [2.4, barSpacing],
      [-2.4, -barSpacing],
      [2.4, -barSpacing],
    ];

    supports.forEach(([x, z]) => {
      const support = new THREE.Mesh(
        new THREE.CylinderGeometry(
          supportRadius,
          supportRadius,
          supportHeight,
          24,
        ),
        material,
      );

      support.position.set(x, supportHeight / 2 + 0.1, z);

      support.castShadow = true;
      support.receiveShadow = true;

      this.group.add(support);
    });

    const baseRadius = 0.12;
    const baseLength = 5.2;

    const baseFront = new THREE.Mesh(
      new THREE.CylinderGeometry(baseRadius, baseRadius, baseLength, 24),
      material,
    );

    baseFront.rotation.z = Math.PI / 2;
    baseFront.position.set(0, 0.12, barSpacing);

    baseFront.castShadow = true;
    baseFront.receiveShadow = true;

    this.group.add(baseFront);

    const baseBack = new THREE.Mesh(
      new THREE.CylinderGeometry(baseRadius, baseRadius, baseLength, 24),
      material,
    );

    baseBack.rotation.z = Math.PI / 2;
    baseBack.position.set(0, 0.12, -barSpacing);

    baseBack.castShadow = true;
    baseBack.receiveShadow = true;

    this.group.add(baseBack);

    const woodenMaterial = createWoodenBaseMaterial();

    const woodenBasePlate = new THREE.Mesh(
      new THREE.BoxGeometry(6.0, 0.2, 3.8),
      woodenMaterial,
    );
    woodenBasePlate.position.set(0, 0, 0);
    woodenBasePlate.castShadow = true;
    woodenBasePlate.receiveShadow = true;
    this.group.add(woodenBasePlate);
  }

  getObject3D() {
    return this.group;
  }
}