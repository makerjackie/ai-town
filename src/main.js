import * as THREE from "three";
import { createRng } from "./lib/helpers.js";
import { waitForFonts } from "./lib/textures.js";
import { createMaterials } from "./world/materials.js";
import { buildTown, setupLights } from "./world/town.js";
import { createComposer, createSmoke, createTokenField, updateActors, updateSmoke, updateTokens } from "./world/fx.js";
import { createPlay } from "./play/camera.js";
import { createHud } from "./hud.js";
import { createSky } from "./world/props.js";
import { hydrateLive, refreshLive, LIVE } from "./data/live.js";

async function start() {
  await waitForFonts();
  hydrateLive();

  const app = document.getElementById("app");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 140);
  camera.position.set(12, 26.2, 21.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  app.appendChild(renderer.domElement);

  const rng = createRng(92741);
  const materials = createMaterials(rng);
  createSky(scene);
  setupLights(scene);
  const town = buildTown(scene, materials, rng);
  const { composer } = createComposer(renderer, scene, camera);
  const tokens = createTokenField(scene);
  const smoke = createSmoke(scene);

  const worldState = {
    metric: "intel",
    metricName: "智力",
    metricDirty: true,
    rheostat: 0.82,
    metricClock: 0,
  };

  const hud = createHud(worldState);
  refreshLive().then(() => {
    hud.render();
    worldState.metricDirty = true;
  });
  const play = createPlay(camera, renderer, town.colliders, town.clickables, () => {
    worldState.rheostat = (worldState.rheostat + 0.16) % 1;
    hud.render();
  });

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.__aiTown = { camera, play, town, worldState, scene, live: LIVE };
  document.getElementById("loader").classList.add("done");

  let last = performance.now();
  let elapsed = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    elapsed += dt;
    const motion = reduced ? 0.2 : 1;
    play.update(dt);
    worldState.metricClock += dt;
    if (worldState.metricClock > 11) {
      hud.cycle();
    }
    updateActors(town, worldState, elapsed, dt * motion, camera);
    updateTokens(tokens, dt * motion);
    updateSmoke(smoke, dt * motion);
    composer.render();
  }
  requestAnimationFrame(frame);

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.fov = innerWidth / innerHeight < 0.72 ? 58 : 50;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
  });
}

start().catch((error) => {
  console.error(error);
  const loader = document.getElementById("loader");
  loader.querySelector("p").textContent = "夜市没开成，看控制台。";
});
