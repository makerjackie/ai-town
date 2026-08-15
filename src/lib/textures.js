import * as THREE from "three";
import { hexRgb } from "./helpers.js";

const SANS = '"IBM Plex Sans", "Noto Sans SC", "PingFang SC", sans-serif';

export function canvasTexture(width, height, draw, repeatX = 1, repeatY = 1) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  draw(context, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = 8;
  return texture;
}

export function makeWood(rng) {
  return canvasTexture(256, 256, (ctx, size) => {
    ctx.fillStyle = "#6b4a2e";
    ctx.fillRect(0, 0, size, size);
    for (let x = 0; x < size; x += 18) {
      ctx.fillStyle = hexRgb("#8a6240", rng.int(-18, 14));
      ctx.fillRect(x, 0, 16, size);
      ctx.strokeStyle = `rgba(40,22,10,${rng.range(0.12, 0.28)})`;
      ctx.lineWidth = rng.range(1, 2.4);
      ctx.beginPath();
      ctx.moveTo(x + rng.range(2, 12), 0);
      ctx.quadraticCurveTo(x + 8, size * 0.5, x + rng.range(2, 14), size);
      ctx.stroke();
    }
  }, 4, 6);
}

export function makePlazaTiles(rng) {
  return canvasTexture(256, 256, (ctx, size) => {
    ctx.fillStyle = "#4a3828";
    ctx.fillRect(0, 0, size, size);
    const step = 32;
    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        const warm = ((x + y) / step) % 2 === 0;
        ctx.fillStyle = warm ? hexRgb("#e4d2b6", rng.int(-6, 8)) : hexRgb("#c9ae8c", rng.int(-8, 6));
        ctx.fillRect(x + 3, y + 3, step - 6, step - 6);
      }
    }
  }, 5, 6);
}

export function makeAsphalt(rng) {
  return canvasTexture(512, 512, (ctx, size) => {
    const g = ctx.createLinearGradient(0, 0, size, size);
    g.addColorStop(0, "#5a4e42");
    g.addColorStop(0.5, "#4a4036");
    g.addColorStop(1, "#52463c");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(180,150,110,${rng.range(0.02, 0.06)})`;
      ctx.beginPath();
      ctx.ellipse(rng.range(0, size), rng.range(0, size), rng.range(16, 70), rng.range(6, 18), rng.range(0, 1), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(210,170,110,.10)";
    ctx.lineWidth = 2;
    for (let y = 40; y < size; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y + 8);
      ctx.stroke();
    }
  }, 6, 6);
}

export function makeGridMetal(rng, base = "#76B900", ink = "#0B1400") {
  return canvasTexture(256, 256, (ctx, size) => {
    ctx.fillStyle = ink;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = hexRgb(base, -20);
    ctx.lineWidth = 3;
    const step = 32;
    for (let i = 0; i <= size; i += step) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.moveTo(0, i);
      ctx.lineTo(size, i);
      ctx.stroke();
    }
    ctx.fillStyle = hexRgb(base, rng.int(-10, 20));
    ctx.globalAlpha = 0.35;
    for (let y = 4; y < size; y += step) {
      for (let x = 4; x < size; x += step) {
        ctx.fillRect(x, y, 24, 24);
      }
    }
    ctx.globalAlpha = 1;
  }, 2, 2);
}

export function makePanel(rng, base = "#1a2430") {
  return canvasTexture(256, 256, (ctx, size) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(255,255,255,${rng.range(0.015, 0.05)})`;
      ctx.fillRect(rng.range(0, size), rng.range(0, size), rng.range(6, 40), rng.range(2, 8));
    }
    ctx.strokeStyle = "rgba(0,0,0,.35)";
    ctx.strokeRect(8, 8, size - 16, size - 16);
  }, 1.4, 1.4);
}

export function makeConcrete(rng) {
  return canvasTexture(256, 256, (ctx, size) => {
    ctx.fillStyle = "#2a313c";
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = hexRgb("#2a313c", rng.int(-18, 16));
      ctx.fillRect(rng.range(0, size), rng.range(0, size), rng.range(8, 28), rng.range(4, 12));
    }
  }, 3, 3);
}

export function makeWindowWall(litColor = "#7fe7ff") {
  return canvasTexture(256, 256, (ctx, size) => {
    ctx.fillStyle = "#0a1016";
    ctx.fillRect(0, 0, size, size);
    const cols = 4;
    const rows = 5;
    const bw = size / cols;
    const bh = size / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const on = (r + c) % 3 !== 0;
        ctx.fillStyle = on ? litColor : "#141c24";
        ctx.fillRect(c * bw + 8, r * bh + 8, bw - 16, bh - 16);
        if (on) {
          ctx.fillStyle = "rgba(255,255,255,.18)";
          ctx.fillRect(c * bw + 10, r * bh + 10, 14, 8);
        }
      }
    }
  }, 1, 1);
}

export function makeBalloonPlate(name, sub, ink = "#102018") {
  return canvasTexture(768, 256, (ctx, w, h) => {
    ctx.fillStyle = ink;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#F4FBFF";
    ctx.lineWidth = 12;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.fillStyle = "#F4FBFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 92px ${SANS}`;
    ctx.fillText(name, w / 2, h * 0.36);
    ctx.font = `700 58px ${SANS}`;
    ctx.fillText(sub, w / 2, h * 0.72);
  });
}

export function makeSign({
  text,
  sub = "",
  fg = "#e8fff6",
  bg = "#102018",
  width = 512,
  height = 192,
  vertical = false,
}) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = fg;
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, width - 20, height - 20);
  ctx.fillStyle = fg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (vertical) {
    const chars = [...text];
    const step = (height - 40) / chars.length;
    ctx.font = `700 ${Math.min(width * 0.42, step * 0.8)}px ${SANS}`;
    chars.forEach((ch, i) => ctx.fillText(ch, width / 2, 24 + step * (i + 0.5)));
  } else {
    ctx.font = `700 ${Math.min(64, width / Math.max(text.length, 4))}px ${SANS}`;
    ctx.fillText(text, width / 2, height * (sub ? 0.4 : 0.52));
    if (sub) {
      ctx.font = `600 22px ${SANS}`;
      ctx.globalAlpha = 0.85;
      ctx.fillText(sub, width / 2, height * 0.72);
      ctx.globalAlpha = 1;
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export function makeBarChart(rows, accent = "#7fe7ff") {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const paint = (items, title) => {
    ctx.clearRect(0, 0, 256, 512);
    ctx.fillStyle = "rgba(4,12,18,.55)";
    ctx.fillRect(0, 0, 256, 512);
    ctx.fillStyle = accent;
    ctx.font = `700 22px ${SANS}`;
    ctx.textAlign = "left";
    ctx.fillText(title, 18, 36);
    items.forEach((row, i) => {
      const y = 64 + i * 54;
      ctx.fillStyle = "rgba(255,255,255,.72)";
      ctx.font = `600 16px ${SANS}`;
      ctx.fillText(`${i + 1}  ${row.name}`, 18, y);
      ctx.fillStyle = "rgba(255,255,255,.12)";
      ctx.fillRect(18, y + 8, 220, 10);
      ctx.fillStyle = row.color || accent;
      ctx.fillRect(18, y + 8, 220 * (row.score / 100), 10);
    });
  };
  paint(rows, "RANK");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return { texture, canvas, ctx, paint };
}

export async function waitForFonts() {
  if (!document.fonts?.load) return;
  try {
    await Promise.all([
      document.fonts.load(`700 64px ${SANS}`),
      document.fonts.load(`600 22px ${SANS}`),
    ]);
  } catch {
    // CJK system fonts still render.
  }
}
