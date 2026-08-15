import * as THREE from "three";
import { addMesh, hexToInt } from "../lib/helpers.js";
import { makeSign } from "../lib/textures.js";

export const GEO = {
  box: new THREE.BoxGeometry(1, 1, 1),
  sphere: new THREE.SphereGeometry(0.5, 16, 12),
  cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 12),
  cone: new THREE.ConeGeometry(0.5, 1, 8),
  torus: new THREE.TorusGeometry(0.5, 0.12, 10, 24),
  capsule: new THREE.CapsuleGeometry(0.22, 0.55, 6, 10),
  plane: new THREE.PlaneGeometry(1, 1),
};

export function box(parent, mat, w, h, d, x, y, z, rx = 0, ry = 0, rz = 0) {
  const mesh = addMesh(parent, GEO.box, mat, x, y, z, rx, ry, rz);
  mesh.scale.set(w, h, d);
  return mesh;
}

export function cyl(parent, mat, r, h, x, y, z, rx = 0, ry = 0, rz = 0, rBottom = r) {
  const mesh = addMesh(parent, new THREE.CylinderGeometry(r, rBottom, h, 12), mat, x, y, z, rx, ry, rz);
  return mesh;
}

export function neonStrip(parent, materials, w, d, x, y, z, color = "cyan") {
  const mat = color === "green" ? materials.neonGreen : color === "orange" ? materials.neonOrange : color === "magenta" ? materials.neonMagenta : materials.neonCyan;
  const mesh = box(parent, mat, w, 0.05, d, x, y, z);
  mesh.castShadow = false;
  return mesh;
}

export function signBoard(parent, materials, { text, sub, fg, bg, w, h, x, y, z, ry = 0, vertical = false }) {
  const map = makeSign({
    text,
    sub,
    fg,
    bg,
    width: vertical ? 192 : 512,
    height: vertical ? 640 : 192,
    vertical,
  });
  const mat = new THREE.MeshStandardMaterial({
    map,
    color: 0xffffff,
    roughness: 0.35,
    metalness: 0.08,
    emissive: hexToInt(fg || "#7fe7ff"),
    emissiveIntensity: 0.26,
    emissiveMap: map,
  });
  const board = box(parent, mat, w, h, 0.08, x, y, z, 0, ry, 0);
  board.castShadow = false;
  return board;
}

export function windows(parent, mat, count, width, height, y, z, startX, gap) {
  for (let i = 0; i < count; i++) {
    const pane = box(parent, mat, width, height, 0.06, startX + i * gap, y, z);
    pane.castShadow = false;
  }
}

export function person(parent, materials, color, x, y, z, scale = 1) {
  const g = new THREE.Group();
  const body = addMesh(g, GEO.capsule, materials.brand(color, 0.18), 0, 0.55, 0);
  const head = addMesh(g, GEO.sphere, materials.white, 0, 1.12, 0);
  head.scale.set(0.42, 0.42, 0.42);
  g.position.set(x, y, z);
  g.scale.setScalar(scale);
  parent.add(g);
  return g;
}

export function mascot(parent, materials, kind, color, x, z) {
  const g = new THREE.Group();
  if (kind === "whale") {
    box(g, materials.brand(color, 0.3), 1.1, 0.45, 0.55, 0, 0.55, 0);
    const head = addMesh(g, GEO.sphere, materials.brand(color, 0.35), 0.55, 0.58, 0);
    head.scale.set(0.55, 0.45, 0.45);
    box(g, materials.brand(color, 0.25), 0.35, 0.28, 0.08, -0.7, 0.7, 0);
  } else if (kind === "moon") {
    addMesh(g, new THREE.TorusGeometry(0.38, 0.1, 8, 18), materials.brand(color, 0.4), 0, 0.9, 0, Math.PI / 2);
    addMesh(g, GEO.sphere, materials.white, 0, 0.5, 0).scale.set(0.35, 0.35, 0.35);
  } else if (kind === "x") {
    box(g, materials.brand(color, 0.4), 0.9, 0.14, 0.14, 0, 0.9, 0, 0, 0, Math.PI / 4);
    box(g, materials.brand(color, 0.4), 0.9, 0.14, 0.14, 0, 0.9, 0, 0, 0, -Math.PI / 4);
    addMesh(g, GEO.capsule, materials.dark, 0, 0.45, 0);
  } else if (kind === "shards") {
    const cols = ["#4285F4", "#EA4335", "#FBBC05", "#34A853"];
    cols.forEach((c, i) => {
      const s = box(g, materials.brand(c, 0.45), 0.28, 0.7, 0.28, (i - 1.5) * 0.22, 0.7, 0, 0, 0, Math.PI / 5);
      s.rotation.z = (i - 1.5) * 0.2;
    });
  } else if (kind === "gpu") {
    box(g, materials.neonGreen, 0.7, 0.18, 0.5, 0, 0.55, 0);
    box(g, materials.dark, 0.55, 0.4, 0.35, 0, 0.9, 0);
  } else {
    addMesh(g, GEO.capsule, materials.brand(color, 0.25), 0, 0.55, 0);
    addMesh(g, GEO.sphere, materials.brand(color, 0.4), 0, 1.12, 0).scale.set(0.4, 0.4, 0.4);
  }
  g.position.set(x, 0, z);
  parent.add(g);
  g.userData.walk = true;
  return g;
}

export function podium(parent, materials, x, z, color) {
  const g = new THREE.Group();
  box(g, materials.dark, 1.1, 1.05, 0.7, 0, 0.52, 0);
  neonStrip(g, materials, 1.12, 0.08, 0, 1.08, 0.28, color === "#E8E8E8" ? "cyan" : "orange");
  g.position.set(x, 0, z);
  parent.add(g);
  return g;
}
