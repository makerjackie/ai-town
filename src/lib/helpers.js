import * as THREE from "three";

export function createRng(seed = 92741) {
  let value = seed >>> 0;
  const random = () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
  random.range = (min, max) => min + (max - min) * random();
  random.int = (min, max) => Math.floor(random.range(min, max + 1));
  random.pick = (list) => list[Math.floor(random() * list.length)];
  random.signed = (span) => random.range(-span, span);
  return random;
}

export function setShadow(object, cast = true, receive = true) {
  object.castShadow = cast;
  object.receiveShadow = receive;
  return object;
}

export function addMesh(parent, geometry, material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const mesh = setShadow(new THREE.Mesh(geometry, material));
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  parent.add(mesh);
  return mesh;
}

export function hexToInt(hex) {
  return parseInt(hex.replace("#", ""), 16);
}

export function hexRgb(hex, light = 0) {
  const value = hex.startsWith("#") ? hex.slice(1) : hex;
  const r = Math.max(0, Math.min(255, parseInt(value.slice(0, 2), 16) + light));
  const g = Math.max(0, Math.min(255, parseInt(value.slice(2, 4), 16) + light));
  const b = Math.max(0, Math.min(255, parseInt(value.slice(4, 6), 16) + light));
  return `rgb(${r},${g},${b})`;
}

export function colliderOf(x, z, w, d, pad = 0.15) {
  return {
    minX: x - w / 2 - pad,
    maxX: x + w / 2 + pad,
    minZ: z - d / 2 - pad,
    maxZ: z + d / 2 + pad,
  };
}

export function clickable(object, data) {
  object.userData.clickable = true;
  Object.assign(object.userData, data);
  return object;
}
