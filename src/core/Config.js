export const Config = {
  cradle: {
    count: 5,
    radius: 0.32,
    length: 3.6,
    pivotY: 4.8,
    mass: 1,
    density: 7850,
    damping: 0.02,
    airDensity: 1.225,
    dragCoeff: 0.47,
    enableAirDrag: false,
  },

  physics: {
    gravity: 9.81,
    restitution: 0.98,
  },

  camera: {
    fov: 45,
    near: 0.1,
    far: 1000,
    position: { x: 0, y: 3, z: 12 },
  },

  scene: {
    backgroundColor: 0x1a1538,
  },

  string: {
    offset: 0.12,
    color: 0xcfcfd4,
    useCylinders: true,
    cylinderThickness: 0.012,
    showAnchors: true,
    anchorColor: 0xb8b8c0,
  },
};

export default Config;