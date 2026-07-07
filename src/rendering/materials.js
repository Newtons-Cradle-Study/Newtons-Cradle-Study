import * as THREE from "three";

export function createBallMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xeaeaea,
    metalness: 1.0,
    roughness: 0.08,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.4,
  });
}

export function createFrameMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0xd8d8e0,
    roughness: 0.15,
    metalness: 1.0,
    envMapIntensity: 1.2,
  });
}

export function createFloorMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0x14121f,
    roughness: 0.35,
    metalness: 0.4,
    clearcoat: 0.4,
    clearcoatRoughness: 0.5,
    envMapIntensity: 0.8,
  });
}

export function createWoodenBaseMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0x6b3e1e,
    roughness: 0.5,
    metalness: 0.05,
    envMapIntensity: 0.6,
  });
}

export function createStringMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0xcfcfd4,
    roughness: 0.3,
    metalness: 0.85,
    envMapIntensity: 1.0,
  });
}