import * as THREE from "three";
import { LABS, CHIPS, LAYOUT, byId } from "../data/roster.js";
import { addMesh } from "../lib/helpers.js";
import { GEO, mascot, person } from "./kit.js";
import { makeBalloonPlate, makeSign } from "../lib/textures.js";
import { createLab, createChip } from "./buildings.js";
import {
  createCourt,
  createFountain,
  createGate,
  createGround,
  createObelisk,
  createRheostat,
  createTaxBooth,
} from "./setpieces.js";
import {
  createArches,
  createClosedRope,
  createFloorRings,
  createLamps,
  createOpenFence,
  createPlazaStalls,
  createApproach,
} from "./props.js";
import { PALETTE } from "./materials.js";

export function setupLights(scene) {
  scene.background = new THREE.Color(PALETTE.sky);
  scene.fog = new THREE.Fog(PALETTE.fog, 52, 96);

  const hemi = new THREE.HemisphereLight(0xffe0c4, 0x4a3020, 1.05);
  scene.add(hemi);

  const moon = new THREE.DirectionalLight(0xffe4c8, 0.48);
  moon.position.set(-10, 22, 10);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  moon.shadow.camera.near = 2;
  moon.shadow.camera.far = 48;
  moon.shadow.camera.left = -22;
  moon.shadow.camera.right = 22;
  moon.shadow.camera.top = 22;
  moon.shadow.camera.bottom = -22;
  moon.shadow.bias = -0.0008;
  scene.add(moon);

  const fill = new THREE.DirectionalLight(0xffc090, 0.52);
  fill.position.set(12, 9, -8);
  scene.add(fill);

  addPoint(scene, 0xffc07a, 0, 7.2, 21.5, 0.85, 16);
  addPoint(scene, 0xffd0a0, 0, 6.4, 1.2, 0.7, 14);
  addPoint(scene, 0x76b900, 0, 12, -14, 1.6, 22);
  addPoint(scene, 0xffb089, 5.8, 3.2, 16.2, 0.7, 10);
}

function addPoint(scene, color, x, y, z, intensity, distance) {
  const light = new THREE.PointLight(color, intensity, distance, 2);
  light.position.set(x, y, z);
  scene.add(light);
  return light;
}

export function buildTown(scene, materials, rng) {
  const root = new THREE.Group();
  scene.add(root);
  createGround(scene, materials);

  const colliders = [];
  const clickables = [];
  const actors = {
    mascots: [],
    crowd: [],
    queue: [],
    tokens: [],
    lanterns: [],
    steam: [],
    balloons: [],
    pilgrims: [],
    leak: [],
  };

  createLamps(root, materials);
  createArches(root, materials);
  createFloorRings(root, materials);
  createApproach(root, materials);
  colliders.push(...createPlazaStalls(root, materials));
  const fence = createOpenFence(root, materials);
  actors.leak = fence.leak;
  createClosedRope(root, materials);

  const gate = createGate(root, materials);
  push(gate, colliders, clickables);
  const obelisk = createObelisk(root, materials);
  push(obelisk, colliders, clickables);
  const rheostat = createRheostat(root, materials);
  push(rheostat, colliders, clickables);
  const court = createCourt(root, materials);
  push(court, colliders, clickables);
  const tax = createTaxBooth(root, materials);
  push(tax, colliders, clickables);
  const fountainWest = createFountain(root, materials, -4.72, 6.35);
  const fountainEast = createFountain(root, materials, 4.72, 6.35);
  colliders.push(...fountainWest.colliders, ...fountainEast.colliders);
  const fountain = { cores: [fountainWest.core, fountainEast.core], core: fountainWest.core };

  for (const slot of LAYOUT.west) {
    const faction = byId(slot.id);
    const built = createLab(root, materials, faction, slot.x, slot.z, slot.rot);
    push(built, colliders, clickables);
    const m = mascot(root, materials, mascotKind(faction), faction.color, slot.x + 2.2, slot.z + 0.2);
    m.userData.path = orbitPath(slot.x + 2.6, slot.z, 1.4, rng);
    actors.mascots.push(m);
    actors.balloons.push(addBalloon(
      root,
      materials,
      faction,
      slot.x + (faction.id === "grok" ? 2.08 : 3.28),
      faction.id === "grok" ? slot.z - 1.72 : slot.z,
    ));
  }
  for (const slot of LAYOUT.east) {
    const faction = byId(slot.id);
    const built = createLab(root, materials, faction, slot.x, slot.z, slot.rot);
    push(built, colliders, clickables);
    const m = mascot(root, materials, mascotKind(faction), faction.color, slot.x - 2.2, slot.z - 0.2);
    m.userData.path = orbitPath(slot.x - 2.6, slot.z, 1.35, rng);
    actors.mascots.push(m);
    actors.balloons.push(addBalloon(root, materials, faction, slot.x - 3.28, slot.z));
    if (faction.id === "minimax") {
      built.group.traverse((o) => {
        if (typeof o.userData.bbqSmoke === "number") actors.steam.push(o);
      });
    }
  }
  for (const slot of LAYOUT.north) {
    const faction = byId(slot.id);
    const built = createChip(root, materials, faction, slot.x, slot.z, slot.rot);
    push(built, colliders, clickables);
    addChipFlag(root, faction, slot.x, slot.z);
  }
  addChipStreetBanner(root, materials);

  const nvidiaM = mascot(root, materials, "gpu", "#76B900", 2.4, -11.4);
  nvidiaM.userData.path = orbitPath(2.2, -11.6, 1.8, rng);
  actors.mascots.push(nvidiaM);

  for (let i = 0; i < 18; i++) {
    const lab = rng.pick(LABS);
    const p = person(root, materials, lab.color, rng.signed(3.2), 0, rng.range(-8, 18), rng.range(0.85, 1.05));
    p.userData.path = crowdPath(rng);
    p.userData.speed = rng.range(0.35, 0.7);
    actors.crowd.push(p);
  }

  for (let i = 0; i < 20; i++) {
    const p = person(root, materials, "#4F8CFF", 2.2, 0, 8.4 + (i % 5) * 0.45, 0.92);
    p.userData.pilgrim = true;
    p.userData.slot = i;
    actors.pilgrims.push(p);
  }

  for (let i = 0; i < 8; i++) {
    const lab = CHIPS[i % 4] ? LABS[i % LABS.length] : LABS[0];
    const q = person(root, materials, lab.color, rng.signed(0.8), 0, -8.2 + i * 0.55, 0.9);
    q.userData.queueIndex = i;
    actors.queue.push(q);
  }

  return {
    root,
    colliders,
    clickables,
    actors,
    obelisk,
    rheostat,
    court,
    fountain,
  };
}

function push(built, colliders, clickables) {
  if (built.colliders) colliders.push(...built.colliders);
  if (built.clickables) clickables.push(...built.clickables);
}

function addBalloon(parent, materials, faction, x, z) {
  const g = new THREE.Group();
  const orb = addMesh(g, GEO.sphere, materials.brand(faction.color, 0.4), 0, 0, 0);
  orb.scale.set(0.78, 0.78, 0.78);
  orb.castShadow = false;
  const stem = addMesh(g, new THREE.CylinderGeometry(0.016, 0.016, 1.55, 6), materials.iron, 0, -1.0, 0);
  stem.castShadow = false;
  const map = makeBalloonPlate(faction.name, `估值 ${faction.value}`, faction.ink);
  const plate = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map,
      color: 0xffffff,
      depthWrite: false,
      sizeAttenuation: true,
    }),
  );
  plate.position.set(0, 1.12, 0);
  plate.scale.set(2.45, 0.78, 1);
  plate.castShadow = false;
  plate.renderOrder = 2;
  g.add(plate);
  g.position.set(x, 5.15, z);
  g.userData.lab = faction.id;
  g.userData.ink = faction.ink;
  g.userData.name = faction.name;
  g.userData.plate = plate;
  parent.add(g);
  return g;
}

function addChipFlag(parent, faction, x, z) {
  const map = makeSign({
    text: faction.name,
    sub: faction.org,
    fg: "#F4FBFF",
    bg: faction.ink,
    width: 512,
    height: 160,
  });
  const plate = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map,
      color: 0xffffff,
      depthWrite: false,
      sizeAttenuation: true,
    }),
  );
  const nvidia = faction.id === "nvidia";
  plate.position.set(x, nvidia ? 4.55 : 3.5, z + (nvidia ? 2.75 : 1.9));
  plate.scale.set(nvidia ? 2.85 : 2.2, nvidia ? 0.8 : 0.6, 1);
  plate.renderOrder = 2;
  parent.add(plate);
}

function addChipStreetBanner(parent, materials) {
  const map = makeSign({
    text: "芯片街  CHIP ROW",
    sub: "先交 CUDA 税",
    fg: "#D8FF9A",
    bg: "#07140A",
    width: 1024,
    height: 256,
  });
  const mat = new THREE.MeshStandardMaterial({
    map,
    emissive: 0x76b900,
    emissiveIntensity: 0.62,
    emissiveMap: map,
    roughness: 0.32,
    side: THREE.DoubleSide,
  });
  const center = addMesh(parent, new THREE.PlaneGeometry(5.6, 1.22), mat, 0, 6.42, 11.55);
  center.castShadow = false;
  [-3.85, 3.85].forEach((x) => {
    const banner = addMesh(parent, new THREE.PlaneGeometry(2.95, 0.78), mat, x, 6.22, 11.15);
    banner.castShadow = false;
  });
}

function mascotKind(faction) {
  if (faction.id === "deepseek") return "whale";
  if (faction.id === "kimi") return "moon";
  if (faction.id === "grok") return "x";
  if (faction.id === "gemini") return "shards";
  if (faction.id === "nvidia") return "gpu";
  return "default";
}

function orbitPath(cx, cz, radius, rng) {
  const phase = rng.range(0, Math.PI * 2);
  return (t) => ({
    x: cx + Math.cos(t * 0.35 + phase) * radius,
    z: cz + Math.sin(t * 0.35 + phase) * radius,
    yaw: t * 0.35 + phase + Math.PI / 2,
  });
}

function crowdPath(rng) {
  const lane = rng.pick([
    { x: 0, z0: 20, z1: -9 },
    { x: -2.2, z0: 18, z1: -8 },
    { x: 2.2, z0: 19, z1: -8 },
    { x: rng.range(-6, 6), z0: 12, z1: 4 },
  ]);
  const phase = rng.range(0, 1);
  return (t) => {
    const u = (t * 0.04 + phase) % 2;
    const going = u < 1;
    const k = going ? u : 2 - u;
    return {
      x: lane.x + Math.sin(t * 0.7) * 0.25,
      z: lane.z0 + (lane.z1 - lane.z0) * k,
      yaw: going ? Math.PI : 0,
    };
  };
}
