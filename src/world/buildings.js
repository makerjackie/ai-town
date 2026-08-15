import * as THREE from "three";
import { addMesh, clickable, colliderOf } from "../lib/helpers.js";
import { GEO, box, cyl, neonStrip, signBoard, windows } from "./kit.js";
import { makeSign } from "../lib/textures.js";

function stamp(group, faction, w, d, x, z) {
  clickable(group, {
    kicker: faction.kicker,
    title: faction.title,
    body: faction.body,
    id: faction.id,
  });
  group.userData.faction = faction.id;
  return {
    group,
    colliders: [colliderOf(x, z, w, d)],
    clickables: [group],
  };
}

export function createLab(parent, materials, faction, x, z, rot) {
  const g = new THREE.Group();
  let footprint = { w: 4.2, d: 3.4 };
  const body = materials.brand(faction.color, 0.16);
  const ink = materials.brand(faction.ink, 0.05);

  if (faction.shape === "ziggurat") {
    box(g, body, 4.45, 1.12, 3.5, 0, 0.56, 0.12);
    box(g, body, 3.4, 1.02, 2.55, 0, 1.63, -0.18);
    box(g, body, 2.35, 0.92, 1.7, 0, 2.6, -0.48);
    box(g, ink, 1.35, 0.32, 1.15, 0, 3.22, -0.55);
    box(g, materials.cream, 4.5, 0.1, 0.32, 0, 1.14, 1.82);
    box(g, materials.cream, 3.45, 0.1, 0.32, 0, 2.16, 1.12);
    box(g, materials.cream, 2.4, 0.1, 0.32, 0, 3.08, 0.4);
    for (let i = 0; i < 4; i++) {
      box(g, materials.cream, 0.85, 0.14, 0.28, 0, 0.2 + i * 0.24, 1.95 - i * 0.18);
    }
    windows(g, materials.windowOrange, 4, 0.5, 0.55, 0.62, 1.7, -1.35, 0.9);
    windows(g, materials.windowOrange, 3, 0.45, 0.45, 1.68, 1.2, -1.0, 0.95);
    neonStrip(g, materials, 4.5, 0.07, 0, 1.16, 1.88, "orange");
    signBoard(g, materials, {
      text: "CLAUDE",
      sub: "CONSTITUTION",
      fg: "#FFE1D0",
      bg: "#4A2818",
      w: 2.4,
      h: 0.7,
      x: 0,
      y: 2.05,
      z: 1.22,
    });
    const claudeRoof = signBoard(g, materials, {
      text: "CLAUDE",
      sub: "宪法",
      fg: "#FFE1D0",
      bg: "#4A2818",
      w: 4.2,
      h: 2.05,
      x: 0,
      y: 3.92,
      z: -0.48,
    });
    claudeRoof.rotation.x = -Math.PI / 2;
    footprint = { w: 4.6, d: 3.8 };
  } else if (faction.shape === "cube") {
    box(g, ink, 3.6, 3.6, 3.6, 0, 1.8, 0);
    addMesh(g, new THREE.TorusGeometry(2.05, 0.08, 8, 32), materials.neonCyan, 0, 1.9, 0, Math.PI / 2);
    windows(g, materials.windowCyan, 3, 0.7, 0.9, 1.6, 1.84, -1.05, 1.05);
    neonStrip(g, materials, 3.7, 0.06, 0, 3.62, 0, "cyan");
    signBoard(g, materials, {
      text: "OPENAI",
      sub: "CLOSED GARDEN",
      fg: "#B8FFE3",
      bg: "#06241C",
      w: 2.6,
      h: 0.65,
      x: 0,
      y: 3.05,
      z: 1.86,
    });
    const closedRoof = signBoard(g, materials, {
      text: "CLOSED",
      sub: "Stargate",
      fg: "#B8FFE3",
      bg: "#06241C",
      w: 4.4,
      h: 2.2,
      x: 0,
      y: 3.72,
      z: 0,
    });
    closedRoof.rotation.x = -Math.PI / 2;
    cyl(g, materials.gold, 0.05, 1.6, -1.5, 0.5, 2.3, Math.PI / 2, 0, 0);
    cyl(g, materials.gold, 0.05, 1.6, 1.5, 0.5, 2.3, Math.PI / 2, 0, 0);
    addMesh(g, GEO.sphere, materials.gold, -1.5, 0.5, 1.5).scale.set(0.12, 0.12, 0.12);
    addMesh(g, GEO.sphere, materials.gold, 1.5, 0.5, 1.5).scale.set(0.12, 0.12, 0.12);
    footprint = { w: 3.8, d: 3.8 };
  } else if (faction.shape === "shards") {
    const cols = ["#4285F4", "#EA4335", "#FBBC05", "#34A853"];
    cols.forEach((c, i) => {
      const shard = box(g, materials.brand(c, 0.45), 1.1, 3.4 + i * 0.25, 1.1, (i - 1.5) * 0.95, 1.7 + i * 0.08, 0.1 * (i % 2 ? 1 : -1));
      shard.rotation.y = 0.4;
      shard.rotation.z = (i - 1.5) * 0.08;
    });
    box(g, materials.dark, 4.4, 0.18, 2.6, 0, 0.09, 0);
    signBoard(g, materials, {
      text: "GEMINI",
      sub: "DEEPMIND",
      fg: "#DCE8FF",
      bg: "#0B1A33",
      w: 2.4,
      h: 0.55,
      x: 0,
      y: 0.55,
      z: 1.4,
    });
    const gemRoof = signBoard(g, materials, {
      text: "GEMINI",
      sub: "DeepMind",
      fg: "#DCE8FF",
      bg: "#0B1A33",
      w: 4.8,
      h: 2.15,
      x: 0,
      y: 4.22,
      z: 0,
    });
    gemRoof.rotation.x = -Math.PI / 2;
    footprint = { w: 4.6, d: 3.0 };
  } else if (faction.shape === "xtower") {
    box(g, ink, 1.8, 6.4, 1.8, 0, 3.2, 0);
    const xMat = new THREE.MeshStandardMaterial({
      color: 0xf4f4f4,
      emissive: 0xe8e8e8,
      emissiveIntensity: 0.62,
      roughness: 0.32,
    });
    box(g, xMat, 3.2, 0.28, 0.28, 0, 5.55, 1.05, 0, 0, Math.PI / 4);
    box(g, xMat, 3.2, 0.28, 0.28, 0, 5.55, 1.05, 0, 0, -Math.PI / 4);
    box(g, xMat, 0.28, 0.28, 3.2, 1.05, 5.55, 0, Math.PI / 4, 0, 0);
    box(g, xMat, 0.28, 0.28, 3.2, 1.05, 5.55, 0, -Math.PI / 4, 0, 0);
    box(g, materials.dark, 2.6, 0.7, 2.6, 0, 0.35, 0);
    windows(g, materials.windowCyan, 1, 0.7, 0.5, 1.4, 0.94, 0, 0);
    windows(g, materials.windowCyan, 1, 0.7, 0.5, 2.4, 0.94, 0, 0);
    windows(g, materials.windowCyan, 1, 0.7, 0.5, 3.4, 0.94, 0, 0);
    neonStrip(g, materials, 1.9, 0.06, 0, 6.42, 0, "cyan");
    signBoard(g, materials, {
      text: "GROK",
      sub: "xAI",
      fg: "#F4F4F4",
      bg: "#111111",
      w: 1.7,
      h: 0.7,
      x: 0,
      y: 3.35,
      z: 0.96,
    });
    const grokRoof = signBoard(g, materials, {
      text: "GROK",
      sub: "xAI",
      fg: "#F4F4F4",
      bg: "#111111",
      w: 3.6,
      h: 1.7,
      x: 0,
      y: 6.58,
      z: 0,
    });
    grokRoof.rotation.x = -Math.PI / 2;
    footprint = { w: 2.8, d: 2.8 };
  } else if (faction.shape === "whale") {
    box(g, body, 4.6, 2.0, 3.0, 0, 1.0, 0);
    const head = addMesh(g, GEO.sphere, body, 2.2, 1.15, 0);
    head.scale.set(1.6, 1.35, 1.7);
    box(g, body, 0.7, 1.1, 0.12, -2.5, 2.0, 0);
    box(g, body, 0.12, 0.7, 0.9, -2.55, 1.5, 0);
    windows(g, materials.windowBlue, 4, 0.55, 0.7, 1.1, 1.54, -1.2, 0.85);
    neonStrip(g, materials, 4.7, 0.08, 0, 2.04, 1.52, "cyan");
    signBoard(g, materials, {
      text: "DEEPSEEK",
      sub: "开源 · 滑动变阻器",
      fg: "#D6E8FF",
      bg: "#071428",
      w: 2.8,
      h: 0.7,
      x: 0,
      y: 2.35,
      z: 1.56,
    });
    const whaleRoof = signBoard(g, materials, {
      text: "DEEPSEEK",
      sub: "开源 · 鲸鱼",
      fg: "#D6E8FF",
      bg: "#071428",
      w: 5.2,
      h: 2.3,
      x: 0,
      y: 2.18,
      z: 0,
    });
    whaleRoof.rotation.x = -Math.PI / 2;
    footprint = { w: 5.4, d: 3.4 };
  } else if (faction.shape === "library") {
    box(g, body, 0.22, 2.3, 11.6, -1.59, 1.15, -4.6);
    box(g, body, 0.22, 2.3, 11.6, 1.59, 1.15, -4.6);
    box(g, body, 3.42, 0.18, 12.0, 0, 2.38, -4.6);
    box(g, materials.dark, 3.0, 0.08, 11.6, 0, 0.04, -4.6);
    box(g, materials.dark, 3.05, 2.15, 0.14, 0, 1.1, -10.42);
    addMesh(g, new THREE.TorusGeometry(0.55, 0.08, 8, 18), materials.white, 0, 1.55, -10.12, 0, 0, 0.35);
    addMesh(g, GEO.sphere, materials.white, 0, 1.55, -10.12).scale.set(0.32, 0.32, 0.32);
    box(g, materials.windowCyan, 0.58, 0.05, 10.8, 0, 0.1, -4.5).castShadow = false;
    for (let i = 0; i < 12; i++) {
      const z = 0.55 - i * 0.92;
      const k = 1 - i * 0.07;
      box(g, materials.windowCyan, 0.08, 0.85, 0.48, 1.48, 1.15, z).castShadow = false;
      box(g, materials.windowCyan, 0.08, 0.85, 0.48, -1.48, 1.15, z).castShadow = false;
      const lamp = box(g, materials.neonCyan, 0.36 * k, 0.09, 0.36 * k, 0, 2.12, z);
      lamp.castShadow = false;
    }
    box(g, materials.dark, 0.18, 1.9, 0.18, -0.86, 0.95, 1.22);
    box(g, materials.dark, 0.18, 1.9, 0.18, 0.86, 0.95, 1.22);
    box(g, materials.dark, 1.9, 0.2, 0.18, 0, 1.9, 1.22);
    neonStrip(g, materials, 3.5, 0.06, 0, 2.32, 1.22, "cyan");
    signBoard(g, materials, {
      text: "KIMI",
      sub: "走廊还没到头",
      fg: "#F2F6FF",
      bg: "#151820",
      w: 2.8,
      h: 0.7,
      x: 0,
      y: 2.18,
      z: 1.34,
    });
    const roof = signBoard(g, materials, {
      text: "KIMI  走廊",
      sub: "还没到头",
      fg: "#F2F6FF",
      bg: "#151820",
      w: 10.6,
      h: 2.15,
      x: 0,
      y: 2.52,
      z: -4.6,
    });
    roof.rotation.x = -Math.PI / 2;
    footprint = { w: 4.0, d: 12.4 };
  } else if (faction.shape === "academy") {
    box(g, body, 4.0, 2.4, 2.8, 0, 1.2, 0);
    [-1.4, -0.5, 0.5, 1.4].forEach((sx) => cyl(g, materials.cream, 0.14, 2.2, sx, 1.1, 1.5));
    box(g, ink, 4.4, 0.18, 1.2, 0, 2.35, 1.5);
    addMesh(g, new THREE.ConeGeometry(1.6, 0.7, 4), materials.cream, 0, 2.85, 0, 0, Math.PI / 4);
    windows(g, materials.windowBlue, 3, 0.6, 0.8, 1.3, 1.44, -1.0, 1.0);
    signBoard(g, materials, {
      text: "智谱 GLM",
      sub: "论文柱廊",
      fg: "#DCE6FF",
      bg: "#0A1633",
      w: 2.7,
      h: 0.7,
      x: 0,
      y: 2.05,
      z: 1.55,
    });
    const roof = signBoard(g, materials, {
      text: "智谱 GLM",
      sub: "论文柱廊",
      fg: "#DCE6FF",
      bg: "#0A1633",
      w: 3.8,
      h: 1.85,
      x: 0,
      y: 3.28,
      z: 0,
    });
    roof.rotation.x = -Math.PI / 2;
    const flag = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: makeSign({
          text: "智谱 GLM",
          sub: "论文柱廊",
          fg: "#DCE6FF",
          bg: "#0A1633",
          width: 512,
          height: 160,
        }),
        depthWrite: false,
        sizeAttenuation: true,
      }),
    );
    flag.position.set(0, 3.85, 0);
    flag.scale.set(2.5, 0.7, 1);
    flag.renderOrder = 2;
    g.add(flag);
    footprint = { w: 4.4, d: 3.2 };
  } else if (faction.shape === "stall") {
    box(g, body, 3.5, 1.15, 2.7, 0, 0.58, 0);
    box(g, ink, 3.9, 0.1, 3.1, 0, 1.88, 0);
    [-1.75, 1.75].forEach((sx) => {
      cyl(g, materials.iron, 0.05, 1.95, sx, 0.98, 1.35);
      cyl(g, materials.iron, 0.05, 1.95, sx, 0.98, -1.35);
    });
    neonStrip(g, materials, 3.7, 0.07, 0, 1.84, 1.58, "orange");
    box(g, materials.iron, 2.55, 0.1, 0.72, 0, 0.92, 1.42);
    neonStrip(g, materials, 2.35, 0.1, 0, 0.99, 1.5, "orange");
    for (let i = 0; i < 5; i++) {
      const x = -0.95 + i * 0.48;
      cyl(g, materials.iron, 0.016, 0.95, x, 1.12, 1.28, 0.72, 0, 0);
      box(g, materials.neonOrange, 0.18, 0.12, 0.16, x, 1.22, 1.52);
      box(g, materials.cream, 0.15, 0.1, 0.14, x, 1.36, 1.58);
    }
    const smokeMat = new THREE.MeshStandardMaterial({
      color: 0xf0e6d8,
      emissive: 0xff7a3a,
      emissiveIntensity: 0.22,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      roughness: 1,
    });
    for (let i = 0; i < 6; i++) {
      const puff = addMesh(g, GEO.sphere, smokeMat, -0.7 + (i % 3) * 0.55, 1.45, 1.48);
      puff.scale.setScalar(0.2);
      puff.castShadow = false;
      puff.userData.bbqSmoke = i;
      puff.userData.baseX = -0.7 + (i % 3) * 0.55;
      puff.userData.baseZ = 1.48;
    }
    signBoard(g, materials, {
      text: "语音烧烤",
      sub: "MINIMAX",
      fg: "#FFE8DC",
      bg: "#2A0C08",
      w: 3.15,
      h: 0.82,
      x: 0,
      y: 2.22,
      z: 1.58,
    });
    const roof = signBoard(g, materials, {
      text: "MINIMAX",
      sub: "海淀夜摊",
      fg: "#FFE8DC",
      bg: "#2A0C08",
      w: 3.5,
      h: 1.7,
      x: 0,
      y: 1.96,
      z: 0,
    });
    roof.rotation.x = -Math.PI / 2;
    footprint = { w: 4.0, d: 3.2 };
  } else {
    box(g, body, 3.2, 1.6, 2.4, 0, 0.8, 0);
    box(g, ink, 3.4, 0.12, 2.6, 0, 1.66, 0);
    neonStrip(g, materials, 3.3, 0.06, 0, 1.62, 1.22, "orange");
    signBoard(g, materials, {
      text: faction.name.toUpperCase(),
      sub: faction.org,
      fg: "#FFE8DC",
      bg: faction.ink,
      w: 2.2,
      h: 0.55,
      x: 0,
      y: 1.25,
      z: 1.24,
    });
    footprint = { w: 3.4, d: 2.6 };
  }

  g.position.set(x, 0, z);
  g.rotation.y = rot;
  parent.add(g);
  const result = stamp(g, faction, ...footprintFor(rot, footprint), x, z);
  result.light = { color: hexToIntSafe(faction.color), x, y: 2.4, z };
  return result;
}

export function createChip(parent, materials, faction, x, z, rot) {
  const g = new THREE.Group();
  let footprint = { w: 4, d: 3.2 };
  const body = materials.brand(faction.color, 0.18);

  if (faction.shape === "gpu-stack") {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        box(g, materials.nvidia, 1.55, 1.15, 1.55, (i - 1) * 1.7, 0.6 + (i + j) * 0.02, (j - 1) * 1.55);
      }
    }
    box(g, materials.nvidia, 5.4, 0.7, 5.0, 0, 1.9, 0);
    box(g, materials.dark, 2.2, 3.2, 2.2, 0, 3.8, 0);
    cyl(g, materials.iron, 0.28, 3.4, -1.6, 4.4, -1.4);
    cyl(g, materials.iron, 0.28, 4.0, 1.6, 4.7, -1.4);
    const beam = new THREE.MeshStandardMaterial({
      color: 0x9dff4a,
      emissive: 0x76b900,
      emissiveIntensity: 2.1,
      transparent: true,
      opacity: 0.58,
      roughness: 0.18,
      depthWrite: false,
    });
    const halo = new THREE.MeshStandardMaterial({
      color: 0xb8ff6a,
      emissive: 0x76b900,
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.16,
      roughness: 0.4,
      depthWrite: false,
    });
    cyl(g, beam, 0.52, 24, 0, 15.2, 0).castShadow = false;
    cyl(g, halo, 1.05, 24, 0, 15.2, 0).castShadow = false;
    const beacon = addMesh(g, GEO.sphere, materials.neonGreen, 0, 27.4, 0);
    beacon.scale.set(1.45, 1.45, 1.45);
    beacon.castShadow = false;
    neonStrip(g, materials, 5.5, 0.1, 0, 2.28, 2.52, "green");
    signBoard(g, materials, {
      text: "NVIDIA",
      sub: "CUDA TAX",
      fg: "#D8FF9A",
      bg: "#0B1400",
      w: 3.2,
      h: 0.75,
      x: 0,
      y: 2.55,
      z: 2.56,
    });
    signBoard(g, materials, {
      text: "NVIDIA",
      sub: "夜市央行",
      fg: "#E8FFB0",
      bg: "#0B1400",
      w: 4.6,
      h: 1.35,
      x: 0,
      y: 7.4,
      z: 1.2,
    });
    footprint = { w: 5.6, d: 5.2 };
  } else if (faction.shape === "red-fab") {
    box(g, materials.amd, 3.6, 2.2, 2.8, 0, 1.1, 0);
    box(g, body, 2.2, 1.4, 1.8, 0, 2.9, 0);
    neonStrip(g, materials, 3.7, 0.06, 0, 2.22, 1.42, "orange");
    signBoard(g, materials, {
      text: "AMD",
      sub: "ROCm 这次真的好用",
      fg: "#FFD0D0",
      bg: "#1A0404",
      w: 3.1,
      h: 0.78,
      x: 0,
      y: 2.05,
      z: 1.44,
    });
    const amdRoof = signBoard(g, materials, {
      text: "AMD",
      sub: "ROCm",
      fg: "#FFD0D0",
      bg: "#1A0404",
      w: 5.2,
      h: 2.35,
      x: 0,
      y: 3.78,
      z: 0,
    });
    amdRoof.rotation.x = -Math.PI / 2;
    footprint = { w: 3.8, d: 3.0 };
  } else if (faction.shape === "cleanroom") {
    box(g, materials.cream, 4.6, 2.0, 2.6, 0, 1.0, 0);
    box(g, materials.gold, 4.8, 0.12, 0.2, 0, 2.05, 1.32);
    box(g, materials.gold, 4.8, 0.12, 0.2, 0, 1.4, 1.32);
    signBoard(g, materials, {
      text: "TSMC",
      sub: "先进制程请排队",
      fg: "#3A2A10",
      bg: "#C4A574",
      w: 3.2,
      h: 0.72,
      x: 0,
      y: 1.85,
      z: 1.34,
    });
    const tsmcRoof = signBoard(g, materials, {
      text: "TSMC",
      sub: "请排队",
      fg: "#3A2A10",
      bg: "#C4A574",
      w: 5.6,
      h: 2.4,
      x: 0,
      y: 2.18,
      z: 0,
    });
    tsmcRoof.rotation.x = -Math.PI / 2;
    footprint = { w: 4.8, d: 2.8 };
  } else if (faction.shape === "red-black") {
    box(g, materials.dark, 3.4, 2.4, 2.4, 0, 1.2, 0);
    box(g, body, 3.5, 0.35, 2.5, 0, 2.5, 0);
    neonStrip(g, materials, 3.5, 0.06, 0, 2.4, 1.22, "orange");
    signBoard(g, materials, {
      text: "昇腾",
      sub: "能用",
      fg: "#FFE0E4",
      bg: "#140004",
      w: 2.5,
      h: 0.75,
      x: 0,
      y: 1.95,
      z: 1.24,
    });
    const ascendRoof = signBoard(g, materials, {
      text: "昇腾",
      sub: "能用",
      fg: "#FFE0E4",
      bg: "#140004",
      w: 4.6,
      h: 2.1,
      x: 0,
      y: 2.76,
      z: 0,
    });
    ascendRoof.rotation.x = -Math.PI / 2;
    footprint = { w: 3.6, d: 2.6 };
  } else if (faction.shape === "smic") {
    box(g, body, 3.4, 1.8, 2.2, 0, 0.9, 0);
    signBoard(g, materials, {
      text: "SMIC",
      sub: "中芯国际",
      fg: "#D6E6FF",
      bg: "#081018",
      w: 2.6,
      h: 0.68,
      x: 0,
      y: 1.7,
      z: 1.14,
    });
    const smicRoof = signBoard(g, materials, {
      text: "SMIC",
      sub: "中芯",
      fg: "#D6E6FF",
      bg: "#081018",
      w: 4.4,
      h: 2.05,
      x: 0,
      y: 1.98,
      z: 0,
    });
    smicRoof.rotation.x = -Math.PI / 2;
    footprint = { w: 3.6, d: 2.4 };
  } else if (faction.shape === "intel-fab") {
    box(g, body, 3.1, 1.55, 2.05, 0, 0.78, 0);
    box(g, materials.dark, 3.3, 0.12, 0.18, 0, 1.62, 1.06);
    neonStrip(g, materials, 3.15, 0.05, 0, 1.58, 1.05, "cyan");
    signBoard(g, materials, {
      text: "INTEL",
      sub: "卖得动吗",
      fg: "#D6ECFF",
      bg: "#031018",
      w: 2.5,
      h: 0.64,
      x: 0,
      y: 1.55,
      z: 1.08,
    });
    const intelRoof = signBoard(g, materials, {
      text: "INTEL",
      sub: "卖得动吗",
      fg: "#D6ECFF",
      bg: "#031018",
      w: 4.0,
      h: 1.85,
      x: 0,
      y: 1.72,
      z: 0,
    });
    intelRoof.rotation.x = -Math.PI / 2;
    footprint = { w: 3.3, d: 2.2 };
  } else {
    box(g, body, 2.4, 1.4, 1.8, 0, 0.7, 0);
    signBoard(g, materials, {
      text: "寒武纪",
      sub: "早期玩家",
      fg: "#EDE4FF",
      bg: "#12081C",
      w: 2.2,
      h: 0.62,
      x: 0,
      y: 1.45,
      z: 0.94,
    });
    const camRoof = signBoard(g, materials, {
      text: "寒武纪",
      sub: "早期玩家",
      fg: "#EDE4FF",
      bg: "#12081C",
      w: 3.8,
      h: 1.75,
      x: 0,
      y: 1.52,
      z: 0,
    });
    camRoof.rotation.x = -Math.PI / 2;
    footprint = { w: 2.6, d: 2.0 };
  }

  g.position.set(x, 0, z);
  g.rotation.y = rot;
  parent.add(g);
  return stamp(g, faction, ...footprintFor(rot, footprint), x, z);
}

function hexToIntSafe(hex) {
  return parseInt(String(hex).replace("#", ""), 16);
}

function footprintFor(rot, footprint) {
  const swap = Math.abs(Math.cos(rot)) < 0.5;
  return swap ? [footprint.d, footprint.w] : [footprint.w, footprint.d];
}
