import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { makeBalloonPlate } from "../lib/textures.js";
import { ranked } from "../data/roster.js";

export function createComposer(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.14, 0.26, 0.94);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  return { composer, bloom };
}


export function createTokenField(scene) {
  const count = 90;
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 36;
    positions[i * 3 + 1] = Math.random() * 14;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 48;
    speeds[i] = 0.6 + Math.random() * 1.4;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xffd9a0,
    size: 0.06,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);
  return { points, speeds };
}

export function createSmoke(scene) {
  const origins = [
    new THREE.Vector3(-1.6, 6.2, -15.8),
    new THREE.Vector3(1.6, 6.8, -15.8),
  ];
  const count = origins.length * 40;
  const positions = new Float32Array(count * 3);
  const ages = new Float32Array(count);
  let i = 0;
  for (const origin of origins) {
    for (let n = 0; n < 40; n++, i++) {
      positions[i * 3] = origin.x + (Math.random() - 0.5) * 0.4;
      positions[i * 3 + 1] = origin.y + Math.random() * 1.4;
      positions[i * 3 + 2] = origin.z + (Math.random() - 0.5) * 0.4;
      ages[i] = Math.random();
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xb8ff7a,
    size: 0.28,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);
  return { points, ages, origins };
}

export function updateTokens(field, dt) {
  const pos = field.points.geometry.attributes.position.array;
  for (let i = 0; i < field.speeds.length; i++) {
    pos[i * 3 + 1] += field.speeds[i] * dt;
    pos[i * 3] += Math.sin(pos[i * 3 + 1] + i) * dt * 0.15;
    if (pos[i * 3 + 1] > 14) {
      pos[i * 3 + 1] = 0;
      pos[i * 3] = (Math.random() - 0.5) * 36;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 48;
    }
  }
  field.points.geometry.attributes.position.needsUpdate = true;
}

export function updateSmoke(smoke, dt) {
  const pos = smoke.points.geometry.attributes.position.array;
  for (let i = 0; i < smoke.ages.length; i++) {
    smoke.ages[i] += dt * 0.22;
    if (smoke.ages[i] > 1) smoke.ages[i] = 0;
    const origin = smoke.origins[Math.floor(i / 40)];
    const a = smoke.ages[i];
    pos[i * 3] = origin.x + Math.sin(i + a * 8) * 0.25;
    pos[i * 3 + 1] = origin.y + a * 2.4;
    pos[i * 3 + 2] = origin.z + Math.cos(i + a * 6) * 0.25;
  }
  smoke.points.geometry.attributes.position.needsUpdate = true;
}

export function updateActors(town, state, t, dt, camera) {
  for (const m of town.actors.mascots) {
    if (!m.userData.path) continue;
    const p = m.userData.path(t);
    m.position.x = p.x;
    m.position.z = p.z;
    m.rotation.y = p.yaw;
    m.position.y = Math.sin(t * 3 + p.x) * 0.04;
  }
  for (const c of town.actors.crowd) {
    const hurry = 0.65 + state.rheostat * 1.85;
    const p = c.userData.path(t * c.userData.speed * hurry);
    const pull = (state.rheostat - 0.5) * 9.2;
    c.position.x = THREE.MathUtils.clamp(p.x + pull, -4.6, 4.8);
    c.position.z = p.z;
    c.rotation.y = p.yaw;
  }
  (town.actors.pilgrims ?? []).forEach((p, i) => {
    const cheap = state.rheostat;
    const row = i % 5;
    const col = Math.floor(i / 5);
    p.position.z = 8.2 + row * 0.42;
    p.position.x = THREE.MathUtils.lerp(-3.2 + col * 0.28, 5.05 - col * 0.06, cheap);
    p.position.y = Math.abs(Math.sin(t * 8 + i)) * (0.05 + 0.38 * cheap);
    p.rotation.y = -Math.PI / 2;
    p.scale.setScalar(0.86 + cheap * 0.42);
    p.visible = true;
  });
  (town.actors.leak ?? []).forEach((cube, i) => {
    const cheap = state.rheostat;
    cube.position.y = 0.22 + Math.abs(Math.sin(t * 3.6 + i)) * (0.12 + cheap * 1.15);
    cube.position.z = (cube.userData.baseZ ?? -0.55) - cheap * 1.25;
    cube.rotation.y = t * 2.2 + i;
    cube.scale.setScalar(0.8 + cheap * 2.15);
  });
  town.actors.queue.forEach((q, i) => {
    const extra = state.rheostat * 0.35;
    q.position.x = Math.sin(t * 1.4 + i) * 0.12;
    q.position.z = -8.4 + i * (0.48 + extra * 0.05);
    q.rotation.y = Math.PI;
  });

  if (town.court) {
    town.court.sam.rotation.y = Math.sin(t * 2.2) * 0.35 - 0.2;
    town.court.elon.rotation.y = Math.cos(t * 2.0) * 0.4 + 0.2;
    town.court.sam.position.y = Math.abs(Math.sin(t * 3)) * 0.05;
    town.court.elon.position.y = Math.abs(Math.cos(t * 3.1)) * 0.05;
    town.court.papers.forEach((p, i) => {
      const u = (t * 0.16 + i * 0.11) % 1;
      p.position.set(0.15 - u * 6.5, 1.72 + Math.sin(u * Math.PI) * 1.55, -0.35 + Math.sin(i * 1.05) * 0.7);
      p.rotation.set(0.06, Math.PI / 2 + Math.sin(t * 0.5 + i) * 0.04, Math.sin(t * 0.7 + i) * 0.05);
    });
  }

  if (town.rheostat) {
    const x = THREE.MathUtils.lerp(-1.35, 1.35, state.rheostat);
    town.rheostat.slider.position.x = x;
    town.rheostat.spark.position.x = x;
    town.rheostat.spark.position.y = 1.55 + Math.sin(t * 12) * 0.08;
    town.rheostat.spark.scale.setScalar(0.14 + state.rheostat * 0.12 + Math.sin(t * 10) * 0.03);
  }

  (town.fountain?.cores ?? (town.fountain?.core ? [town.fountain.core] : [])).forEach((core, i) => {
    core.rotation.y = t * 0.8 + i;
    core.position.y = 0.72 + Math.sin(t * 2 + i) * 0.05;
  });

  if (town.obelisk) {
    town.obelisk.group.rotation.y = Math.sin(t * 0.15) * 0.04;
    const list = ranked(state.metric);
    town.obelisk.bars.forEach((bar) => {
      const lab = list.find((item) => item.id === bar.userData.lab);
      const h = 0.35 + ((lab?.[state.metric] ?? 20) / 100) * 2.4;
      bar.scale.y = THREE.MathUtils.lerp(bar.scale.y, h / 0.4, 1 - Math.pow(0.001, dt));
      bar.position.y = (bar.scale.y * 0.4) / 2 + 0.15;
    });
    if (state.metricDirty) {
      const rows = list.slice(0, 8).map((lab) => ({ name: lab.name, score: lab[state.metric], color: lab.color }));
      town.obelisk.chart.paint(rows, state.metricName);
      town.obelisk.chart.texture.needsUpdate = true;
      for (const balloon of town.actors.balloons ?? []) {
        const lab = list.find((item) => item.id === balloon.userData.lab);
        const score = lab?.value ?? 0;
        const map = makeBalloonPlate(lab?.name ?? balloon.userData.lab, `估值 ${score}`, balloon.userData.ink ?? "#102018");
        const plate = balloon.userData.plate;
        if (plate) {
          const old = plate.material.map;
          plate.material.map = map;
          plate.material.needsUpdate = true;
          old?.dispose();
        }
      }
      state.metricDirty = false;
    }
  }

  for (const balloon of town.actors.balloons ?? []) {
    const lab = ranked("value").find((item) => item.id === balloon.userData.lab);
    const score = lab?.value ?? 30;
    const s = 0.52 + score / 44;
    balloon.scale.setScalar(THREE.MathUtils.lerp(balloon.scale.x, s, 1 - Math.pow(0.002, dt)));
    balloon.position.y = 5.35 + s * 0.62 + Math.sin(t * 1.4 + balloon.position.x) * 0.1;
    const plate = balloon.userData.plate;
    if (plate) {
      const keep = 1 / Math.max(balloon.scale.x, 0.42);
      const plateW = 2.38 + score / 72;
      plate.scale.set(plateW * keep, plateW * 0.32 * keep, 1);
      plate.position.y = 1.12;
    }
  }

  (town.actors.steam ?? []).forEach((puff, i) => {
    const u = (t * 0.42 + i * 0.16) % 1;
    puff.position.y = 1.42 + u * 1.35;
    puff.position.x = (puff.userData.baseX ?? 0) + Math.sin(t * 1.6 + i) * 0.08;
    puff.position.z = puff.userData.baseZ ?? 1.48;
    puff.scale.setScalar(0.16 + u * 0.38);
    if (puff.material?.opacity != null) puff.material.opacity = 0.42 * (1 - u);
  });
}
