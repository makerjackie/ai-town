import { LABS } from "./roster.js";

const CACHE_KEY = "ai-town-aa-v1";
const TTL_MS = 6 * 60 * 60 * 1000;
const AA_JSDELIVR = "https://cdn.jsdelivr.net/gh/oolong-tea-2026/artificial-analysis-leaderboards@main/data";
const AA_GITHUB = "https://raw.githubusercontent.com/oolong-tea-2026/artificial-analysis-leaderboards/main/data";

const CREATOR_TO_LAB = {
  anthropic: "claude",
  openai: "openai",
  google: "gemini",
  xai: "grok",
  deepseek: "deepseek",
  kimi: "kimi",
  zai: "zhipu",
  minimax: "minimax",
};

/** Baked AA snapshot (2026-07-10). Used before fetch, and if the network fails. */
const FALLBACK = {
  date: "2026-07-10",
  source: "snapshot",
  labs: {
    claude: { model: "Claude Fable 5", intel: 59.86, input: 10, output: 50, open: false, ctx: 1_000_000 },
    openai: { model: "GPT-5.6 Sol (max)", intel: 58.89, input: 5, output: 30, open: false, ctx: 1_000_000 },
    grok: { model: "Grok 4.5 (high)", intel: 53.83, input: 2, output: 6, open: false, ctx: 500_000 },
    zhipu: { model: "GLM-5.2 (max)", intel: 51.09, input: 1.4, output: 4.4, open: true, ctx: 1_000_000 },
    gemini: { model: "Gemini 3.5 Flash (high)", intel: 50.2, input: 1.5, output: 9, open: false, ctx: 1_000_000 },
    minimax: { model: "MiniMax-M3", intel: 44.44, input: 0.3, output: 1.2, open: true, ctx: 1_000_000 },
    deepseek: { model: "DeepSeek V4 Pro", intel: 44.27, input: 0.435, output: 0.87, open: true, ctx: 1_000_000 },
    kimi: { model: "Kimi K2.6", intel: 44.22, input: 0.95, output: 4, open: true, ctx: 256_000 },
  },
};

export const LIVE = {
  ok: false,
  date: FALLBACK.date,
  source: "snapshot",
  models: {},
};

export function hydrateLive() {
  apply(readCache({ allowStale: true }) ?? FALLBACK);
  return LIVE;
}

export async function refreshLive() {
  if (readCache()) return LIVE;
  try {
    const payload = await fetchAa();
    writeCache(payload);
    apply(payload);
  } catch (error) {
    console.warn("[ai-town] Artificial Analysis fetch failed", error);
  }
  return LIVE;
}

function apply(payload) {
  const intelRaw = {};
  const cheapRaw = {};
  const ctxRaw = {};
  for (const lab of LABS) {
    const row = payload.labs[lab.id];
    if (!row) continue;
    intelRaw[lab.id] = row.intel;
    const cost = (row.input ?? 8) + (row.output ?? 24) / 3;
    cheapRaw[lab.id] = 1 / Math.max(cost, 0.05);
    ctxRaw[lab.id] = Math.log2(Math.max(row.ctx ?? 32_000, 32_000));
    lab.live = row;
    lab.liveModel = row.model;
  }
  const intel = rankScale(intelRaw);
  const cheap = rankScale(cheapRaw);
  const ctx = rankScale(ctxRaw);
  for (const lab of LABS) {
    const row = payload.labs[lab.id];
    if (!row) continue;
    lab.intel = intel[lab.id] ?? lab.intel;
    lab.cheap = cheap[lab.id] ?? lab.cheap;
    lab.ctx = ctx[lab.id] ?? lab.ctx;
    lab.open = row.open ? 100 : 14;
  }
  LIVE.ok = payload.source === "live";
  LIVE.date = payload.date;
  LIVE.source = payload.source;
  LIVE.models = Object.fromEntries(LABS.filter((lab) => lab.liveModel).map((lab) => [lab.id, lab.liveModel]));
}

function rankScale(raw, floor = 36, ceil = 100) {
  const ids = Object.keys(raw);
  const vals = ids.map((id) => raw[id]);
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const out = {};
  for (const id of ids) {
    const v = raw[id];
    const rel = (v - min) / (max - min || 1);
    const abs = v / (max || 1);
    out[id] = Math.round(floor + (ceil - floor) * (0.45 * rel + 0.55 * abs));
  }
  return out;
}

async function fetchAa() {
  const latest = await getJson("latest.json");
  const date = latest?.date;
  if (!date) throw new Error("AA latest.json missing date");
  const pack = await getJson(`${date}/llms.json`);
  const models = pack?.models;
  if (!Array.isArray(models)) throw new Error("AA llms.json missing models");
  const best = {};
  for (const model of models) {
    if (model?.deprecated) continue;
    const slug = model.creator?.slug;
    const labId = CREATOR_TO_LAB[slug];
    if (!labId) continue;
    const intel = model.evaluations?.artificial_analysis_intelligence_index;
    if (intel == null) continue;
    const prev = best[labId];
    if (prev && prev.intel >= intel) continue;
    best[labId] = {
      model: model.name,
      intel,
      input: model.pricing?.price_1m_input_tokens,
      output: model.pricing?.price_1m_output_tokens,
      open: Boolean(model.open_weights?.is_open_weights),
      ctx: model.capabilities?.context_window_tokens,
    };
  }
  if (Object.keys(best).length < 6) throw new Error("AA payload mapped too few labs");
  return { date, source: "live", labs: best };
}

async function getJson(rel) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    for (const base of [AA_JSDELIVR, AA_GITHUB]) {
      try {
        const res = await fetch(`${base}/${rel}`, { signal: ctrl.signal });
        if (!res.ok) continue;
        return await res.json();
      } catch {
        // try the other host
      }
    }
    throw new Error(`failed ${rel}`);
  } finally {
    clearTimeout(timer);
  }
}

function readCache({ allowStale = false } = {}) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.payload?.labs) return null;
    if (!allowStale && Date.now() - parsed.at > TTL_MS) return null;
    return parsed.payload;
  } catch {
    return null;
  }
}

function writeCache(payload) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), payload }));
  } catch {
    // quota — ignore
  }
}
