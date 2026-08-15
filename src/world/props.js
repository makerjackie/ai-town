import * as THREE from "three";
import { addMesh } from "../lib/helpers.js";
import { GEO, box, cyl, neonStrip, person, signBoard } from "./kit.js";
import { makeSign } from "../lib/textures.js";

export function createSky(scene) {
  const geo = new THREE.SphereGeometry(90, 24, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {},
    vertexShader: `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vPos;
      void main() {
        float h = normalize(vPos).y;
        vec3 bottom = vec3(0.46, 0.24, 0.16);
        vec3 top = vec3(0.10, 0.08, 0.12);
        vec3 col = mix(bottom, top, smoothstep(-0.18, 0.78, h));
        col += vec3(0.42, 0.18, 0.08) * pow(max(0.0, 1.0 - abs(h - 0.04)), 7.0);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const sky = new THREE.Mesh(geo, mat);
  sky.frustumCulled = false;
  scene.add(sky);

  const count = 180;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * 0.55;
    const r = 70;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = 12 + r * Math.cos(phi) * 0.55;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const stars = new THREE.BufferGeometry();
  stars.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(
    stars,
    new THREE.PointsMaterial({ color: 0xffe0b8, size: 0.14, transparent: true, opacity: 0.45, depthWrite: false }),
  );
  scene.add(points);
}

export function createLamps(parent, materials) {
  const spots = [
    [-4.6, 19.5],
    [4.6, 19.5],
    [-4.6, 12],
    [4.6, 12],
    [-4.6, 4],
    [4.6, 4],
    [-4.6, -7],
    [4.6, -7],
  ];
  for (const [x, z] of spots) {
    const g = new THREE.Group();
    cyl(g, materials.iron, 0.07, 3.4, 0, 1.7, 0);
    box(g, materials.iron, 0.55, 0.08, 0.18, 0.2, 3.35, 0);
    const bulb = addMesh(g, GEO.sphere, materials.warmLamp, 0.35, 3.2, 0);
    bulb.scale.set(0.16, 0.16, 0.16);
    bulb.castShadow = false;
    g.position.set(x, 0, z);
    parent.add(g);
  }
}

export function createArches(parent, materials) {
  const zs = [12.5, 5.5];
  zs.forEach((z, i) => {
    const g = new THREE.Group();
    cyl(g, materials.iron, 0.07, 3.8, -3.8, 1.9, 0);
    cyl(g, materials.iron, 0.07, 3.8, 3.8, 1.9, 0);
    const mat = i % 2 ? materials.neonMagenta : materials.neonCyan;
    for (let n = 0; n <= 6; n++) {
      const t = n / 6;
      const x = -3.8 + t * 7.6;
      const y = 3.7 - Math.sin(t * Math.PI) * 0.7;
      const bulb = addMesh(g, GEO.sphere, mat, x, y, 0);
      bulb.scale.set(0.09, 0.09, 0.09);
      bulb.castShadow = false;
    }
    g.position.set(0, 0, z);
    parent.add(g);
  });
}

export function createFloorRings(parent, materials) {
  const ring = addMesh(parent, new THREE.TorusGeometry(4.6, 0.04, 8, 40), materials.neonCyan, 0, 0.06, 1.2, Math.PI / 2);
  ring.castShadow = false;
  ring.receiveShadow = false;
}

export function createPlazaStalls(parent, materials) {
  const stalls = [
    { x: -4.85, z: 9.4, color: "#4F8CFF", name: "便宜 token", sub: "DeepSeek 夜摊" },
    { x: 4.85, z: 9.4, color: "#10A37F", name: "封闭花园", sub: "绳子后面" },
    { x: -4.55, z: 1.15, color: "#C9D4E8", name: "长上下文", sub: "Kimi 借书" },
    { x: 4.55, z: 1.15, color: "#3B6BFF", name: "开源课", sub: "智谱夜校" },
    { x: -3.2, z: -4.8, color: "#76B900", name: "H100 串", sub: "先交税" },
    { x: 3.2, z: -4.8, color: "#D97757", name: "长信", sub: "Claude 手作" },
  ];
  const colliders = [];
  for (const stall of stalls) {
    const g = new THREE.Group();
    box(g, materials.dark, 1.8, 0.7, 1.2, 0, 0.35, 0);
    box(g, materials.brand(stall.color, 0.35), 2.0, 0.08, 1.4, 0, 1.35, 0);
    cyl(g, materials.iron, 0.04, 1.4, -0.85, 0.7, -0.5);
    cyl(g, materials.iron, 0.04, 1.4, 0.85, 0.7, -0.5);
    cyl(g, materials.iron, 0.04, 1.4, -0.85, 0.7, 0.5);
    cyl(g, materials.iron, 0.04, 1.4, 0.85, 0.7, 0.5);
    neonStrip(g, materials, 2.0, 0.05, 0, 1.4, 0.7, "cyan");
    signBoard(g, materials, {
      text: stall.name,
      sub: stall.sub,
      fg: stall.color,
      bg: "#14110E",
      w: 1.72,
      h: 0.52,
      x: 0,
      y: 1.78,
      z: 0.78,
    });
    g.position.set(stall.x, 0, stall.z);
    parent.add(g);
    colliders.push({
      minX: stall.x - 1.1,
      maxX: stall.x + 1.1,
      minZ: stall.z - 0.8,
      maxZ: stall.z + 0.8,
    });
  }
  return colliders;
}

export function createOpenFence(parent, materials) {
  const g = new THREE.Group();
  const posts = [-2.4, -1.2, 0, 1.2, 2.4];
  posts.forEach((x) => cyl(g, materials.iron, 0.05, 1.5, x, 0.75, 0));
  box(g, materials.iron, 5.0, 0.06, 0.06, 0, 1.48, 0);
  box(g, materials.iron, 5.0, 0.06, 0.06, 0, 0.18, 0);
  [-1.8, 1.8].forEach((x) => box(g, materials.iron, 0.9, 1.15, 0.05, x, 0.8, 0));
  const leak = [];
  for (let i = 0; i < 9; i++) {
    const cube = box(g, materials.neonCyan, 0.28, 0.28, 0.28, (i - 4) * 0.38, 0.18 + (i % 3) * 0.1, -0.55 - (i % 2) * 0.22);
    cube.castShadow = false;
    cube.userData.leak = i;
    cube.userData.baseZ = -0.55 - (i % 2) * 0.22;
    leak.push(cube);
  }
  const map = makeSign({ text: "权重漏出", sub: "OPEN WEIGHTS", fg: "#D6E8FF", bg: "#071428", width: 512, height: 160 });
  const mat = new THREE.MeshStandardMaterial({ map, emissive: 0x4f8cff, emissiveIntensity: 0.26, emissiveMap: map });
  box(g, mat, 1.8, 0.42, 0.05, 0, 1.85, 0.08);
  const groundMap = makeSign({
    text: "开源围栏",
    sub: "OPEN WEIGHTS",
    fg: "#D6E8FF",
    bg: "#071428",
    width: 512,
    height: 160,
  });
  const groundMat = new THREE.MeshStandardMaterial({
    map: groundMap,
    emissive: 0x4f8cff,
    emissiveIntensity: 0.2,
    emissiveMap: groundMap,
  });
  const ground = box(g, groundMat, 3.6, 1.55, 0.06, 0, 0.05, -1.15);
  ground.rotation.x = -Math.PI / 2;
  ground.castShadow = false;
  g.position.set(6.85, 0, 10.2);
  g.rotation.y = -Math.PI / 2;
  parent.add(g);
  return { group: g, leak };
}

export function createClosedRope(parent, materials) {
  const g = new THREE.Group();
  cyl(g, materials.gold, 0.06, 1.45, -1.25, 0.72, 0);
  cyl(g, materials.gold, 0.06, 1.45, 1.25, 0.72, 0);
  cyl(g, materials.gold, 0.045, 2.6, 0, 0.95, 0, 0, 0, Math.PI / 2);
  const map = makeSign({ text: "CLOSED", sub: "天鹅绒绳子", fg: "#B8FFE3", bg: "#06241C", width: 512, height: 192 });
  const mat = new THREE.MeshStandardMaterial({ map, emissive: 0x10a37f, emissiveIntensity: 0.26, emissiveMap: map });
  box(g, mat, 2.35, 0.62, 0.06, 0, 1.58, 0.12);
  box(g, mat, 0.06, 0.62, 2.2, 0.12, 1.58, 0);
  const ground = box(g, mat, 3.2, 1.45, 0.06, 0, 0.05, -1.15);
  ground.rotation.x = -Math.PI / 2;
  ground.castShadow = false;
  g.position.set(-6.85, 0, -1.6);
  g.rotation.y = Math.PI / 2;
  parent.add(g);
  return g;
}

export function createApproach(parent, materials) {
  const runner = box(parent, materials.plaza, 7.6, 0.04, 14.2, 0, 0.05, 14.6);
  runner.castShadow = false;
  runner.receiveShadow = true;
  for (let i = 0; i < 9; i++) {
    const z = 20.4 - i * 1.05;
    const dash = box(parent, materials.neonGreen, 0.42, 0.025, 0.18, 0, 0.09, z);
    dash.castShadow = false;
  }
  const west = makeSign({ text: "WEST  美西", sub: "Claude · GPT · Gemini · Grok", fg: "#FFE1D0", bg: "#2A1610", width: 896, height: 256 });
  const east = makeSign({ text: "EAST  东岸", sub: "DeepSeek · Kimi · 智谱 · MiniMax", fg: "#D6E8FF", bg: "#071428", width: 896, height: 256 });
  const westMat = new THREE.MeshStandardMaterial({ map: west, emissive: 0xd97757, emissiveIntensity: 0.4, emissiveMap: west, roughness: 0.38 });
  const eastMat = new THREE.MeshStandardMaterial({ map: east, emissive: 0x4f8cff, emissiveIntensity: 0.4, emissiveMap: east, roughness: 0.38 });
  cyl(parent, materials.iron, 0.07, 2.35, -3.58, 1.18, 18.8);
  cyl(parent, materials.iron, 0.07, 2.35, 3.58, 1.18, 18.8);
  const westBoard = box(parent, westMat, 2.15, 1.08, 0.08, -3.58, 2.55, 18.8);
  westBoard.rotation.y = 0.32;
  westBoard.castShadow = false;
  const eastBoard = box(parent, eastMat, 2.15, 1.08, 0.08, 3.58, 2.55, 18.8);
  eastBoard.rotation.y = -0.32;
  eastBoard.castShadow = false;
  person(parent, materials, "#76B900", -4.22, 0, 19.05, 1.05);
  person(parent, materials, "#76B900", 4.22, 0, 19.05, 1.05);
}
