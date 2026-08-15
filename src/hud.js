import { METRICS, ranked, LABS } from "./data/roster.js";
import { LIVE } from "./data/live.js";

export function createHud(state) {
  const list = document.getElementById("board-list");
  const title = document.getElementById("board-metric");
  const hint = document.getElementById("board-hint");
  const source = document.getElementById("board-source");
  const rheo = document.getElementById("rheo-value");
  const rheoFill = document.getElementById("rheo-fill");

  function render() {
    const metric = METRICS.find((m) => m.id === state.metric) ?? METRICS[0];
    title.textContent = metric.name;
    hint.textContent = metric.hint;
    if (source) {
      const tag = LIVE.source === "live" ? "已拉取" : "内置";
      source.textContent = `Artificial Analysis 公开快照 · ${LIVE.date ?? "—"} · ${tag}`;
    }
    const rows = ranked(state.metric);
    list.innerHTML = rows
      .map((lab, i) => {
        const w = Math.max(8, lab[state.metric]);
        return `<li>
          <span class="rank">${i + 1}</span>
          <span class="who">${lab.name}</span>
          <span class="bar"><i style="width:${w}%;background:${lab.color}"></i></span>
          <span class="n">${lab[state.metric]}</span>
        </li>`;
      })
      .join("");
    const ds = LABS.find((lab) => lab.id === "deepseek");
    const lo = ds?.live?.input ?? 0.28;
    const hi = 2.8;
    const price = (hi - state.rheostat * (hi - lo)).toFixed(2);
    rheo.textContent = `$${price} / 1M tokens`;
    rheoFill.style.width = `${12 + state.rheostat * 88}%`;
  }

  addEventListener("keydown", (event) => {
    if (event.code === "KeyL") cycle();
  });

  document.getElementById("board")?.addEventListener("click", cycle);

  function cycle() {
    const index = METRICS.findIndex((m) => m.id === state.metric);
    const next = METRICS[(index + 1) % METRICS.length];
    state.metric = next.id;
    state.metricName = next.name;
    state.metricDirty = true;
    state.metricClock = 0;
    render();
  }

  render();
  return { render, cycle };
}
