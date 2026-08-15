import * as THREE from "three";
import { addMesh, clickable, colliderOf, hexToInt } from "../lib/helpers.js";
import { canvasTexture, makeBarChart, makeSign } from "../lib/textures.js";
import { GEO, box, cyl, neonStrip, person, podium } from "./kit.js";
import { ranked } from "../data/roster.js";
import { PLACES } from "../data/roster.js";

export function createGround(scene, materials) {
  const tray = addMesh(scene, new THREE.BoxGeometry(40, 0.78, 52), materials.wood, 0, -0.55, -1.5);
  tray.receiveShadow = true;
  const sand = addMesh(scene, new THREE.BoxGeometry(36.2, 0.16, 48), materials.sand, 0, -0.12, -1.5);
  sand.castShadow = false;
  const street = addMesh(scene, new THREE.BoxGeometry(34.4, 0.1, 46.2), materials.street, 0, -0.04, -1.5);
  street.receiveShadow = true;
  street.castShadow = false;
  const plaza = addMesh(scene, new THREE.BoxGeometry(13.2, 0.06, 16.4), materials.plaza, 0, 0.04, 1.1);
  plaza.castShadow = false;

  const rimH = 0.78;
  const rimY = 0.22;
  const rimW = 1.55;
  addMesh(scene, new THREE.BoxGeometry(40.2, rimH, rimW), materials.cream, 0, rimY, 23.95);
  addMesh(scene, new THREE.BoxGeometry(40.2, rimH, rimW), materials.cream, 0, rimY, -26.95);
  addMesh(scene, new THREE.BoxGeometry(rimW, rimH, 52.2), materials.cream, 19.32, rimY, -1.5);
  addMesh(scene, new THREE.BoxGeometry(rimW, rimH, 52.2), materials.cream, -19.32, rimY, -1.5);

  const bevelH = 0.22;
  const bevelY = 0.02;
  addMesh(scene, new THREE.BoxGeometry(37.1, bevelH, 0.38), materials.wood, 0, bevelY, 23.12);
  addMesh(scene, new THREE.BoxGeometry(37.1, bevelH, 0.38), materials.wood, 0, bevelY, -26.12);
  addMesh(scene, new THREE.BoxGeometry(0.38, bevelH, 49.1), materials.wood, 18.48, bevelY, -1.5);
  addMesh(scene, new THREE.BoxGeometry(0.38, bevelH, 49.1), materials.wood, -18.48, bevelY, -1.5);

  const corner = new THREE.BoxGeometry(1.7, 0.92, 1.7);
  for (const [x, z] of [
    [19.32, 23.95],
    [-19.32, 23.95],
    [19.32, -26.95],
    [-19.32, -26.95],
  ]) {
    addMesh(scene, corner, materials.wood, x, 0.28, z);
  }

  const leg = new THREE.CylinderGeometry(0.55, 0.68, 1.85, 10);
  for (const [x, z] of [
    [17.2, 21.2],
    [-17.2, 21.2],
    [17.2, -24.2],
    [-17.2, -24.2],
  ]) {
    addMesh(scene, leg, materials.wood, x, -1.42, z);
  }

  [-8.2, 8.2].forEach((x) => {
    addMesh(scene, new THREE.BoxGeometry(0.32, 0.16, 34), materials.curb, x, 0.08, -1);
  });
  addMesh(scene, new THREE.BoxGeometry(16.8, 0.16, 0.32), materials.curb, 0, 0.08, 16.6);
  addMesh(scene, new THREE.BoxGeometry(16.8, 0.16, 0.32), materials.curb, 0, 0.08, -10.4);
}

export function createGate(parent, materials) {
  const g = new THREE.Group();
  box(g, materials.nvidia, 1.25, 8.6, 1.25, -4.2, 4.3, 0);
  box(g, materials.nvidia, 1.25, 8.6, 1.25, 4.2, 4.3, 0);
  box(g, materials.dark, 9.6, 0.62, 0.42, 0, 8.72, 0);
  neonStrip(g, materials, 9.6, 0.08, 0, 8.38, 0.28, "green");
  neonStrip(g, materials, 9.6, 0.08, 0, 9.06, 0.28, "cyan");
  const map = makeSign({ text: "模型镇  MODEL TOWN", sub: "精致沙盘", fg: "#D8FF9A", bg: "#07140A", width: 1024, height: 256 });
  const mat = new THREE.MeshStandardMaterial({
    map,
    emissive: 0x76b900,
    emissiveIntensity: 0.5,
    emissiveMap: map,
    roughness: 0.3,
  });
  box(g, mat, 7.4, 0.95, 0.1, 0, 8.72, 0.28);
  box(g, mat, 7.8, 1.22, 0.12, 0, 4.08, 0.42);
  g.position.set(0, 0, 21.5);
  parent.add(g);
  clickable(g, PLACES.find((p) => p.id === "gate"));
  return { group: g, colliders: [colliderOf(-4.2, 21.5, 1.6, 1.6), colliderOf(4.2, 21.5, 1.6, 1.6)], clickables: [g] };
}

export function createObelisk(parent, materials) {
  const g = new THREE.Group();
  box(g, materials.dark, 1.8, 8.4, 1.8, 0, 4.2, 0);
  box(g, materials.iron, 2.4, 0.4, 2.4, 0, 0.2, 0);
  addMesh(g, new THREE.ConeGeometry(0.9, 1.1, 4), materials.neonCyan, 0, 8.95, 0, 0, Math.PI / 4);
  addMesh(g, new THREE.TorusGeometry(1.6, 0.06, 8, 28), materials.neonMagenta, 0, 6.2, 0, Math.PI / 2);
  neonStrip(g, materials, 1.9, 0.08, 0, 8.4, 0.92, "cyan");

  const chart = makeBarChart(ranked("intel").slice(0, 8).map((lab) => ({ name: lab.name, score: lab.intel, color: lab.color })));
  const holo = new THREE.MeshStandardMaterial({
    map: chart.texture,
    transparent: true,
    opacity: 0.92,
    emissive: 0x7fe7ff,
    emissiveIntensity: 0.72,
    emissiveMap: chart.texture,
    roughness: 0.35,
    depthWrite: false,
  });
  const plane = addMesh(g, new THREE.PlaneGeometry(2.7, 5.2), holo, 0, 4.55, 1.12);
  plane.castShadow = false;
  const plane2 = plane.clone();
  plane2.position.z = -1.02;
  plane2.rotation.y = Math.PI;
  g.add(plane2);

  const bars = [];
  ranked("intel").slice(0, 8).forEach((lab, i) => {
    const ang = (i / 8) * Math.PI * 2;
    const r = 3.15;
    const b = cyl(g, materials.brand(lab.color, 0.55), 0.16, 0.4, Math.cos(ang) * r, 0.35, Math.sin(ang) * r);
    b.userData.lab = lab.id;
    bars.push(b);
  });

  g.position.set(0, 0, 1.2);
  parent.add(g);
  clickable(g, PLACES.find((p) => p.id === "obelisk"));
  return {
    group: g,
    colliders: [colliderOf(0, 1.2, 2.2, 2.2)],
    clickables: [g],
    chart,
    bars,
  };
}

export function createRheostat(parent, materials) {
  const g = new THREE.Group();
  box(g, materials.dark, 4.6, 0.28, 1.6, 0, 0.2, 0);
  addMesh(g, new THREE.TorusGeometry(1.15, 0.22, 10, 28), materials.copper, 0, 1.15, 0, Math.PI / 2, 0, Math.PI / 2);
  cyl(g, materials.iron, 0.08, 3.4, 0, 1.15, 0, 0, 0, Math.PI / 2);
  const slider = box(g, materials.neonCyan, 0.42, 0.55, 0.42, 0.8, 1.15, 0);
  slider.castShadow = false;
  const spark = addMesh(g, GEO.sphere, materials.token, 0.8, 1.55, 0);
  spark.scale.set(0.18, 0.18, 0.18);
  spark.castShadow = false;
  const streetMap = makeSign({
    text: "DEEPSEEK",
    sub: "滑动变阻器",
    fg: "#D6E8FF",
    bg: "#071428",
    width: 1024,
    height: 288,
  });
  const streetMat = new THREE.MeshStandardMaterial({
    map: streetMap,
    emissive: 0x4f8cff,
    emissiveIntensity: 0.42,
    emissiveMap: streetMap,
    roughness: 0.38,
  });
  const eastBoard = box(g, streetMat, 0.1, 1.22, 4.4, 2.42, 2.38, 0.35);
  eastBoard.castShadow = false;
  cyl(g, materials.iron, 0.08, 4.55, 3.92, 2.28, -1.88);
  const streetBoard = box(g, streetMat, 4.22, 1.42, 0.1, 3.82, 4.78, -1.86);
  streetBoard.rotation.y = -0.24;
  streetBoard.castShadow = false;
  const roofMap = makeSign({
    text: "DEEPSEEK",
    sub: "$ / 1M tokens",
    fg: "#D6E8FF",
    bg: "#071428",
    width: 640,
    height: 160,
  });
  const roofMat = new THREE.MeshStandardMaterial({
    map: roofMap,
    emissive: 0x4f8cff,
    emissiveIntensity: 0.28,
    emissiveMap: roofMap,
  });
  const roofBoard = box(g, roofMat, 4.4, 1.85, 0.08, 0, 2.05, 0);
  roofBoard.rotation.x = -Math.PI / 2;
  roofBoard.castShadow = false;
  g.position.set(-6.4, 0, 15.4);
  parent.add(g);
  clickable(g, PLACES.find((p) => p.id === "rheostat"));
  return {
    group: g,
    colliders: [colliderOf(-6.4, 15.4, 4.8, 1.8)],
    clickables: [g],
    slider,
    spark,
    coil: g.children[1],
  };
}

export function createCourt(parent, materials) {
  const g = new THREE.Group();
  box(g, materials.cream, 5.6, 2.6, 3.2, 0, 1.3, 0);
  [-1.9, -0.65, 0.65, 1.9].forEach((sx) => cyl(g, materials.white, 0.14, 2.4, sx, 1.2, 1.7));
  addMesh(g, new THREE.ConeGeometry(2.3, 0.95, 4), materials.white, 0, 3.1, 0, 0, Math.PI / 4);
  box(g, materials.nvidia, 2.4, 1.05, 0.85, 0, 0.55, 2.15);
  const judge = person(g, materials, "#76B900", 0, 0.95, 2.05, 0.85);
  judge.userData.role = "judge";
  cyl(g, materials.gold, 0.04, 0.35, 0.35, 1.55, 2.35, 0, 0, 0.6);
  podium(g, materials, -1.85, 2.7, "#10A37F");
  podium(g, materials, 1.85, 2.7, "#E8E8E8");
  const sam = person(g, materials, "#10A37F", -1.85, 0, 2.28, 1.05);
  const elon = person(g, materials, "#E8E8E8", 1.85, 0, 2.28, 1.05);
  sam.userData.role = "sam";
  elon.userData.role = "elon";
  const samPlate = makeSign({ text: "SAM", sub: "奥特曼", fg: "#B8FFE3", bg: "#06241C", width: 256, height: 128 });
  const elonPlate = makeSign({ text: "ELON", sub: "马斯克", fg: "#F4F4F4", bg: "#111111", width: 256, height: 128 });
  const samMat = new THREE.MeshStandardMaterial({ map: samPlate, emissive: 0x10a37f, emissiveIntensity: 0.35, emissiveMap: samPlate });
  const elonMat = new THREE.MeshStandardMaterial({ map: elonPlate, emissive: 0x888888, emissiveIntensity: 0.28, emissiveMap: elonPlate });
  box(g, samMat, 0.95, 0.32, 0.04, -1.85, 1.22, 3.08);
  box(g, elonMat, 0.95, 0.32, 0.04, 1.85, 1.22, 3.08);
  const stamps = ["传票", "答辩", "xAI", "OPENAI", "禁令"];
  const papers = [];
  const paperGeo = new THREE.PlaneGeometry(2.55, 1.58);
  for (let i = 0; i < 8; i++) {
    const ink = i % 2 ? "#2A1A08" : "#8A1010";
    const stamp = canvasTexture(768, 420, (ctx, w, h) => {
      ctx.fillStyle = "#F7F1E4";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 22;
      ctx.strokeRect(22, 22, w - 44, h - 44);
      ctx.fillStyle = ink;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `700 196px "IBM Plex Sans", "Noto Sans SC", "PingFang SC", sans-serif`;
      ctx.fillText(stamps[i % stamps.length], w / 2, h * 0.52);
    });
    const paperMat = new THREE.MeshStandardMaterial({
      map: stamp,
      emissive: 0xf7f1e4,
      emissiveIntensity: 0.16,
      emissiveMap: stamp,
      roughness: 0.55,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const p = addMesh(g, paperGeo, paperMat, -1.2, 1.7, 0.2);
    p.castShadow = false;
    p.receiveShadow = false;
    p.userData.paper = i;
    papers.push(p);
  }
  neonStrip(g, materials, 5.7, 0.06, 0, 2.64, 1.64, "orange");
  const map = makeSign({ text: "ALTMAN v MUSK", sub: "GPU 法庭 · 传票往街上飞", fg: "#F4E8D0", bg: "#2A1A0C", width: 1024, height: 288 });
  const mat = new THREE.MeshStandardMaterial({ map, roughness: 0.38, emissive: 0x2a1a0c, emissiveIntensity: 0.38, emissiveMap: map });
  cyl(g, materials.iron, 0.08, 4.55, -2.18, 2.28, -2.42);
  const streetBoard = box(g, mat, 4.22, 1.42, 0.1, -3.08, 4.78, -2.38);
  streetBoard.rotation.y = 0.24;
  streetBoard.castShadow = false;
  const westMap = makeSign({ text: "ALTMAN v MUSK", sub: "GPU 法庭 · 传票往街上飞", fg: "#F4E8D0", bg: "#2A1A0C", width: 896, height: 256 });
  const westMat = new THREE.MeshStandardMaterial({
    map: westMap,
    roughness: 0.38,
    emissive: 0x2a1a0c,
    emissiveIntensity: 0.32,
    emissiveMap: westMap,
  });
  const westBoard = box(g, westMat, 0.1, 1.28, 4.8, -2.92, 2.58, 0.55);
  westBoard.castShadow = false;
  const roofMap = makeSign({
    text: "ALTMAN v MUSK",
    sub: "GPU 法官",
    fg: "#3A2A10",
    bg: "#E8E0D0",
    width: 768,
    height: 192,
  });
  const roofMat = new THREE.MeshStandardMaterial({
    map: roofMap,
    roughness: 0.4,
    emissive: 0xe8e0d0,
    emissiveIntensity: 0.22,
    emissiveMap: roofMap,
  });
  const roofBoard = box(g, roofMat, 5.2, 2.15, 0.08, 0, 3.68, 0);
  roofBoard.rotation.x = -Math.PI / 2;
  roofBoard.castShadow = false;
  g.position.set(5.8, 0, 16.2);
  parent.add(g);
  clickable(g, PLACES.find((p) => p.id === "court"));
  return {
    group: g,
    colliders: [colliderOf(5.8, 16.2, 5.8, 3.8)],
    clickables: [g],
    sam,
    elon,
    papers,
  };
}

export function createTaxBooth(parent, materials) {
  const g = new THREE.Group();
  box(g, materials.nvidia, 2.1, 1.7, 1.5, 0, 0.85, 0);
  box(g, materials.dark, 2.3, 0.12, 1.7, 0, 1.76, 0);
  neonStrip(g, materials, 2.2, 0.06, 0, 1.72, 0.78, "green");
  const map = makeSign({ text: "CUDA 税", sub: "H100 ONLY", fg: "#D8FF9A", bg: "#0B1400", width: 1024, height: 288 });
  const mat = new THREE.MeshStandardMaterial({
    map,
    emissive: 0x76b900,
    emissiveIntensity: 0.68,
    emissiveMap: map,
    roughness: 0.32,
  });
  box(g, mat, 2.0, 0.62, 0.07, 0, 1.22, 0.8);
  const streetBoard = box(g, mat, 4.05, 1.18, 0.1, 0, 8.12, 21.52);
  streetBoard.castShadow = false;
  const roofMap = makeSign({ text: "CUDA 税", sub: "H100 ONLY", fg: "#D8FF9A", bg: "#0B1400", width: 512, height: 192 });
  const roofMat = new THREE.MeshStandardMaterial({
    map: roofMap,
    emissive: 0x76b900,
    emissiveIntensity: 0.35,
    emissiveMap: roofMap,
  });
  const roofBoard = box(g, roofMat, 3.6, 1.7, 0.08, 0, 1.92, 0);
  roofBoard.rotation.x = -Math.PI / 2;
  roofBoard.castShadow = false;
  g.position.set(0, 0, -10.6);
  parent.add(g);
  clickable(g, PLACES.find((p) => p.id === "tax"));
  return { group: g, colliders: [colliderOf(0, -10.6, 2.4, 1.8)], clickables: [g] };
}

export function createFountain(parent, materials, x = -4.72, z = 6.35) {
  const g = new THREE.Group();
  cyl(g, materials.iron, 0.85, 0.18, 0, 0.1, 0);
  cyl(g, materials.dark, 0.52, 0.42, 0, 0.32, 0);
  const core = addMesh(g, GEO.sphere, materials.token, 0, 0.72, 0);
  core.scale.set(0.22, 0.22, 0.22);
  core.castShadow = false;
  g.position.set(x, 0, z);
  parent.add(g);
  return { group: g, colliders: [colliderOf(x, z, 1.8, 1.8)], core };
}

function signBoardLocal(parent, text, sub, materials) {
  const map = makeSign({ text, sub, fg: "#D6E8FF", bg: "#071428", width: 512, height: 160 });
  const mat = new THREE.MeshStandardMaterial({ map, emissive: 0x4f8cff, emissiveIntensity: 0.45, emissiveMap: map });
  box(parent, mat, 2.4, 0.5, 0.06, 0, 2.15, 0.7);
}
