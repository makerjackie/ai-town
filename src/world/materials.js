import * as THREE from "three";
import { hexToInt } from "../lib/helpers.js";
import {
  makeAsphalt,
  makeGridMetal,
  makePanel,
  makePlazaTiles,
  makeWindowWall,
  makeWood,
} from "../lib/textures.js";

export const PALETTE = {
  sky: 0x1c1412,
  fog: 0x2a2018,
  cyan: 0x7fe7ff,
  magenta: 0xff5ad5,
  nvidia: 0x76b900,
};

export function createMaterials(rng) {
  const asphalt = makeAsphalt(rng);
  const plazaTiles = makePlazaTiles(rng);
  const wood = makeWood(rng);
  const panel = makePanel(rng);
  const nvidiaGrid = makeGridMetal(rng);
  const amdGrid = makeGridMetal(rng, "#ED1C24", "#1A0404");
  const windowCyan = makeWindowWall("#7fe7ff");
  const windowOrange = makeWindowWall("#ffb089");
  const windowGreen = makeWindowWall("#9dff6a");
  const windowBlue = makeWindowWall("#7aa7ff");

  const std = (params) => new THREE.MeshStandardMaterial(params);

  const brandCache = new Map();

  return {
    street: std({
      color: 0xffffff,
      map: asphalt,
      roughness: 0.78,
      metalness: 0.03,
    }),
    plaza: std({ color: 0xffffff, map: plazaTiles, roughness: 0.72, metalness: 0.04 }),
    wood: std({ color: 0xffffff, map: wood, roughness: 0.78, metalness: 0.04 }),
    sand: std({ color: 0xc4a882, roughness: 0.92, metalness: 0.02 }),
    curb: std({ color: 0xd8c8b0, roughness: 0.7, metalness: 0.06 }),
    warmLamp: std({ color: 0xffd9a0, emissive: 0xffb060, emissiveIntensity: 1.15, roughness: 0.35 }),
    panel: std({ color: 0xffffff, map: panel, roughness: 0.42, metalness: 0.28 }),
    dark: std({ color: 0x10151c, roughness: 0.4, metalness: 0.45 }),
    iron: std({ color: 0x171b22, roughness: 0.38, metalness: 0.7 }),
    gold: std({ color: 0xe8c547, roughness: 0.3, metalness: 0.72, emissive: 0x3a2a08, emissiveIntensity: 0.2 }),
    copper: std({ color: 0xb87333, roughness: 0.32, metalness: 0.78, emissive: 0x3a1808, emissiveIntensity: 0.25 }),
    cream: std({ color: 0xddd3c4, roughness: 0.55, metalness: 0.08 }),
    white: std({ color: 0xe8eef4, roughness: 0.4, metalness: 0.12 }),
    nvidia: std({
      color: 0xffffff,
      map: nvidiaGrid,
      roughness: 0.28,
      metalness: 0.55,
      emissive: 0x76b900,
      emissiveIntensity: 0.2,
    }),
    amd: std({
      color: 0xffffff,
      map: amdGrid,
      roughness: 0.3,
      metalness: 0.5,
      emissive: 0xed1c24,
      emissiveIntensity: 0.22,
    }),
    windowCyan: std({
      color: 0xa8f4ff,
      map: windowCyan,
      emissive: 0x4ad8ff,
      emissiveIntensity: 0.62,
      roughness: 0.28,
    }),
    windowOrange: std({
      color: 0xffd0b0,
      map: windowOrange,
      emissive: 0xff8a4a,
      emissiveIntensity: 0.7,
      roughness: 0.28,
    }),
    windowGreen: std({
      color: 0xc8ff9a,
      map: windowGreen,
      emissive: 0x76b900,
      emissiveIntensity: 0.72,
      roughness: 0.28,
    }),
    windowBlue: std({
      color: 0xb8ccff,
      map: windowBlue,
      emissive: 0x4f8cff,
      emissiveIntensity: 0.62,
      roughness: 0.28,
    }),
    neonCyan: std({ color: 0x7fe7ff, emissive: 0x7fe7ff, emissiveIntensity: 1.15, roughness: 0.28, metalness: 0.1 }),
    neonMagenta: std({ color: 0xff5ad5, emissive: 0xff5ad5, emissiveIntensity: 0.95, roughness: 0.28 }),
    neonGreen: std({ color: 0x9dff4a, emissive: 0x76b900, emissiveIntensity: 1.25, roughness: 0.26 }),
    neonOrange: std({ color: 0xff8a4a, emissive: 0xff6a30, emissiveIntensity: 1.05, roughness: 0.28 }),
    token: std({ color: 0xfff3a8, emissive: 0xffe066, emissiveIntensity: 1.4, roughness: 0.28 }),
    paper: std({ color: 0xf4f0e4, roughness: 0.7, metalness: 0.02 }),
    glass: std({ color: 0x7fe7ff, transparent: true, opacity: 0.18, roughness: 0.08, metalness: 0.2, emissive: 0x123848, emissiveIntensity: 0.4 }),
    brand(hex, emissive = 0.22) {
      const key = `${hex}:${emissive}`;
      if (brandCache.has(key)) return brandCache.get(key);
      const mat = std({
        color: hexToInt(hex),
        roughness: 0.38,
        metalness: 0.22,
        emissive: hexToInt(hex),
        emissiveIntensity: emissive,
      });
      brandCache.set(key, mat);
      return mat;
    },
  };
}
