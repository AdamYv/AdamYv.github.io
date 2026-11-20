// Démo du pricer d'options : portage en JavaScript des moteurs du projet C#
// (Black-Scholes pour l'européenne, arbre binomial de Cox-Ross-Rubinstein pour
// l'américaine) avec Grecs et graphiques SVG. Aucune dépendance.

// ---------------------------------------------------------------------------
// Moteurs de pricing
// ---------------------------------------------------------------------------

/** Fonction de répartition de la loi normale (approximation d'Abramowitz-Stegun 26.2.17, erreur < 7.5e-8). */
function normCdf(x) {
  const a1 = 0.319381530, a2 = -0.356563782, a3 = 1.781477937, a4 = -1.821255978, a5 = 1.330274429;
  const k = 1 / (1 + 0.2316419 * Math.abs(x));
  const poly = k * (a1 + k * (a2 + k * (a3 + k * (a4 + k * a5))));
  const tail = normPdf(x) * poly;
  return x >= 0 ? 1 - tail : tail;
}

function normPdf(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/** Black-Scholes-Merton (dividende continu q) : prix et Grecs en formules fermées. */
export function europeanBS(p) {
  const { S, K, r, q, sigma, T, isCall } = p;
  const sqT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * sqT);
  const d2 = d1 - sigma * sqT;
  const dfR = Math.exp(-r * T), dfQ = Math.exp(-q * T);
  const pdf = normPdf(d1);
  const gamma = dfQ * pdf / (S * sigma * sqT);
  const vega = S * dfQ * pdf * sqT;
  if (isCall) {
    return {
      price: S * dfQ * normCdf(d1) - K * dfR * normCdf(d2),
      delta: dfQ * normCdf(d1),
      gamma, vega,
      theta: -S * dfQ * pdf * sigma / (2 * sqT) - r * K * dfR * normCdf(d2) + q * S * dfQ * normCdf(d1),
      rho: K * T * dfR * normCdf(d2),
    };
  }
  return {
    price: K * dfR * normCdf(-d2) - S * dfQ * normCdf(-d1),
    delta: -dfQ * normCdf(-d1),
    gamma, vega,
    theta: -S * dfQ * pdf * sigma / (2 * sqT) + r * K * dfR * normCdf(-d2) - q * S * dfQ * normCdf(-d1),
    rho: -K * T * dfR * normCdf(-d2),
  };
}

/**
 * Arbre binomial CRR avec exercice anticipé (même algorithme que BAmericanOption.cs).
 * Renvoie aussi Delta, Gamma et Theta lus sur les premiers noeuds de l'arbre (Hull).
 */
export function americanTree(p) {
  const { S, K, r, q, sigma, T, isCall, steps } = p;
  const n = steps;
  const dt = T / n;
  const up = Math.exp(sigma * Math.sqrt(dt));
  const p0 = (up * Math.exp(-q * dt) - Math.exp(-r * dt)) / (up * up - 1); // proba. actualisée de hausse
  const p1 = Math.exp(-r * dt) - p0;
  const values = new Float64Array(n + 1);
  for (let i = 0; i <= n; i++) {
    const st = S * Math.pow(up, 2 * i - n);
    values[i] = Math.max(isCall ? st - K : K - st, 0);
  }
  let level1 = null, level2 = null;
  for (let j = n - 1; j >= 0; j--) {
    for (let i = 0; i <= j; i++) {
      const cont = p0 * values[i + 1] + p1 * values[i];
      const st = S * Math.pow(up, 2 * i - j);
      values[i] = Math.max(cont, isCall ? st - K : K - st);
    }
    if (j === 2) level2 = [values[0], values[1], values[2]];
    if (j === 1) level1 = [values[0], values[1]];
  }
  const out = { price: values[0] };
  if (level2) {
    const d = 1 / up;
    const [fdd, fud, fuu] = level2;
    const [fd, fu] = level1;
    out.delta = (fu - fd) / (S * up - S * d);
    out.gamma = ((fuu - fud) / (S * up * up - S) - (fud - fdd) / (S - S * d * d)) / (0.5 * (S * up * up - S * d * d));
    out.theta = (fud - values[0]) / (2 * dt);
  }
  return out;
}

export function americanCRR(p) {
  return americanTree(p).price;
}

/** Américaine : Delta, Gamma, Theta sur l'arbre ; Vega et Rho par chocs centrés. */
function americanGreeks(p) {
  const tree = americanTree(p);
  const hV = 0.01, hR = 0.0001;
  return {
    ...tree,
    vega: (americanCRR({ ...p, sigma: p.sigma + hV }) - americanCRR({ ...p, sigma: p.sigma - hV })) / (2 * hV),
    rho: (americanCRR({ ...p, r: p.r + hR }) - americanCRR({ ...p, r: p.r - hR })) / (2 * hR),
  };
}

export function price(p) {
  return p.style === "american" ? americanGreeks(p) : europeanBS(p);
}

// ---------------------------------------------------------------------------
// Graphiques SVG (ligne, crosshair et infobulle au survol)
// ---------------------------------------------------------------------------

const SVG_NS = "http://www.w3.org/2000/svg";

function el(name, attrs, parent) {
  const node = document.createElementNS(SVG_NS, name);
  for (const k in attrs) node.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(node);
  return node;
}

function niceTicks(min, max, count) {
  const span = max - min || Math.abs(max) || 1;
  const raw = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw);
  const ticks = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) ticks.push(+v.toFixed(10));
  return ticks;
}

/**
 * Trace un graphique en ligne.
 * cfg = { card, xs, series: [{ name, values, ref? }], spot, fmt, xFmt, height }
 */
function lineChart(cfg) {
  const { card, xs, series, spot, fmt, xFmt } = cfg;
  const holder = card.querySelector(".chart-holder");
  const width = Math.max(260, Math.round(holder.clientWidth));
  const height = cfg.height || 200;
  const m = { top: 10, right: 12, bottom: 26, left: 52 };
  const w = width - m.left - m.right, h = height - m.top - m.bottom;

  let yMin = Infinity, yMax = -Infinity;
  for (const s of series) for (const v of s.values) { if (v < yMin) yMin = v; if (v > yMax) yMax = v; }
  if (yMin > 0 && cfg.zeroBased !== false) yMin = 0;
  if (yMax === yMin) { yMax += 1; yMin -= 1; }
  const pad = (yMax - yMin) * 0.06;
  yMax += pad; if (yMin < 0) yMin -= pad;

  const x = (v) => m.left + (v - xs[0]) / (xs[xs.length - 1] - xs[0]) * w;
  const y = (v) => m.top + (1 - (v - yMin) / (yMax - yMin)) * h;

  holder.textContent = "";
  const svg = el("svg", { class: "chart", width, height, viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": cfg.label }, holder);

  const grid = el("g", { class: "grid" }, svg);
  const axis = el("g", { class: "axis" }, svg);
  // Même nombre de décimales pour toutes les graduations d'un axe
  const yTicks = niceTicks(yMin, yMax, 4).filter((t) => t >= yMin && t <= yMax);
  const yStep = yTicks.length > 1 ? yTicks[1] - yTicks[0] : 1;
  const yDec = Math.max(0, Math.min(4, -Math.floor(Math.log10(yStep) + 1e-9)));
  for (const t of yTicks) {
    el("line", { x1: m.left, x2: m.left + w, y1: y(t), y2: y(t) }, grid);
    const txt = el("text", { x: m.left - 8, y: y(t) + 4, "text-anchor": "end" }, axis);
    txt.textContent = t === 0 ? "0" : t.toFixed(yDec);
  }
  for (const t of niceTicks(xs[0], xs[xs.length - 1], width < 420 ? 4 : 6)) {
    const txt = el("text", { x: x(t), y: height - 6, "text-anchor": "middle" }, axis);
    txt.textContent = xFmt(t);
  }
  el("line", { class: "base", x1: m.left, x2: m.left + w, y1: m.top + h, y2: m.top + h }, axis);
  if (yMin < 0 && yMax > 0) el("line", { class: "base", x1: m.left, x2: m.left + w, y1: y(0), y2: y(0) }, axis);

  el("line", { class: "spot-line", x1: x(spot), x2: x(spot), y1: m.top, y2: m.top + h }, svg);

  for (const s of series) {
    const d = s.values.map((v, i) => `${i ? "L" : "M"}${x(xs[i]).toFixed(1)},${y(v).toFixed(1)}`).join("");
    el("path", { class: s.ref ? "series-ref" : "series", d }, svg);
  }

  // Couche de survol
  const cross = el("line", { class: "crosshair", y1: m.top, y2: m.top + h, visibility: "hidden" }, svg);
  const dots = series.map((s) => el("circle", { class: s.ref ? "dot-ref" : "dot", r: 4.5, visibility: "hidden" }, svg));
  const hit = el("rect", { x: m.left, y: 0, width: w, height, fill: "transparent" }, svg);
  let tip = card.querySelector(".tooltip");
  if (!tip) { tip = document.createElement("div"); tip.className = "tooltip"; tip.hidden = true; card.appendChild(tip); }

  function show(evt) {
    const rect = svg.getBoundingClientRect();
    const px = (evt.clientX - rect.left) * (width / rect.width);
    const ratio = Math.min(1, Math.max(0, (px - m.left) / w));
    const i = Math.round(ratio * (xs.length - 1));
    const cx = x(xs[i]);
    cross.setAttribute("x1", cx); cross.setAttribute("x2", cx); cross.setAttribute("visibility", "visible");
    series.forEach((s, k) => {
      dots[k].setAttribute("cx", cx); dots[k].setAttribute("cy", y(s.values[i])); dots[k].setAttribute("visibility", "visible");
    });
    tip.innerHTML = `<div class="t-head">Spot ${xs[i].toFixed(2)}</div>` +
      series.map((s) => `<div class="t-row"><span>${s.name}</span><span>${fmt(s.values[i], true)}</span></div>`).join("");
    tip.hidden = false;
    const cardRect = card.getBoundingClientRect();
    const left = rect.left - cardRect.left + cx * (rect.width / width);
    const tipW = tip.offsetWidth;
    tip.style.left = Math.min(Math.max(4, left + 12), card.clientWidth - tipW - 4) + "px";
    tip.style.top = (rect.top - cardRect.top + 8) + "px";
  }
  function hide() {
    cross.setAttribute("visibility", "hidden");
    dots.forEach((dEl) => dEl.setAttribute("visibility", "hidden"));
    tip.hidden = true;
  }
  hit.addEventListener("pointermove", show);
  hit.addEventListener("pointerdown", show);
  hit.addEventListener("pointerleave", hide);
}

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

const fmtAuto = (v, precise) => {
  const a = Math.abs(v);
  if (precise) return a >= 100 ? v.toFixed(2) : a >= 1 ? v.toFixed(3) : v.toFixed(4);
  return a >= 10 ? v.toFixed(0) : a >= 1 ? v.toFixed(1) : a === 0 ? "0" : v.toFixed(a >= 0.1 ? 2 : 3);
};

export function initPricer(root) {
  const form = root.querySelector("form");
  const out = (name) => root.querySelector(`[data-out="${name}"]`);
  const ranges = form.querySelectorAll('input[type="range"]');

  function params() {
    const f = new FormData(form);
    return {
      style: f.get("style"),
      isCall: f.get("type") === "call",
      S: +f.get("S"), K: +f.get("K"),
      r: +f.get("r") / 100, q: +f.get("q") / 100,
      sigma: +f.get("sigma") / 100, T: +f.get("T"),
      steps: 200,
    };
  }

  function syncOutputs() {
    ranges.forEach((input) => {
      const o = form.querySelector(`output[for="${input.id}"]`);
      if (o) o.value = (+input.value).toFixed(input.dataset.decimals ? +input.dataset.decimals : 0) + (input.dataset.unit || "");
    });
  }

  let scheduled = false;
  function render() {
    scheduled = false;
    syncOutputs();
    const p = params();
    const g = price(p);
    out("price").textContent = g.price.toFixed(4);
    out("delta").textContent = g.delta.toFixed(4);
    out("gamma").textContent = g.gamma.toFixed(4);
    out("theta").textContent = (g.theta / 365).toFixed(4);
    out("vega").textContent = (g.vega / 100).toFixed(4);
    out("rho").textContent = (g.rho / 100).toFixed(4);
    out("model").textContent = p.style === "american"
      ? "Arbre binomial CRR, 200 pas ; Grecs par différences finies"
      : "Black-Scholes-Merton ; Grecs en formules fermées";

    // Courbes en fonction du spot, de 50 % à 150 % du strike
    const N = p.style === "american" ? 51 : 121;
    const xs = [], prices = [], intrinsic = [], deltas = [], gammas = [], vegas = [], thetas = [];
    for (let i = 0; i < N; i++) {
      const s = p.K * (0.5 + i / (N - 1));
      const gi = price({ ...p, S: s, steps: 100 }); // arbre plus court pour les courbes
      xs.push(s); prices.push(gi.price);
      intrinsic.push(Math.max(p.isCall ? s - p.K : p.K - s, 0));
      deltas.push(gi.delta); gammas.push(gi.gamma); vegas.push(gi.vega / 100); thetas.push(gi.theta / 365);
    }
    const typeLabel = (p.style === "american" ? "Américaine" : "Européenne") + (p.isCall ? " call" : " put");
    lineChart({
      card: root.querySelector('[data-chart="price"]'), xs, spot: p.S, fmt: fmtAuto, xFmt: (v) => v.toFixed(0),
      label: `Prix de l'option ${typeLabel} en fonction du spot`,
      series: [{ name: "Prix", values: prices }, { name: "Valeur intrinsèque", values: intrinsic, ref: true }],
      height: 240,
    });
    const small = [
      ["delta", "Delta", deltas], ["gamma", "Gamma", gammas],
      ["vega", "Vega (pour 1 % de vol.)", vegas], ["theta", "Theta (par jour)", thetas],
    ];
    for (const [key, name, values] of small) {
      lineChart({
        card: root.querySelector(`[data-chart="${key}"]`), xs, spot: p.S, fmt: fmtAuto, xFmt: (v) => v.toFixed(0),
        label: `${name} en fonction du spot`, series: [{ name, values }], zeroBased: key === "gamma" || key === "vega",
      });
    }

    // Tableau des valeurs (accessibilité)
    const rows = [];
    for (let i = 0; i < N; i += Math.round((N - 1) / 10)) {
      rows.push(`<tr><td>${xs[i].toFixed(2)}</td><td>${prices[i].toFixed(4)}</td><td>${deltas[i].toFixed(4)}</td><td>${gammas[i].toFixed(4)}</td><td>${vegas[i].toFixed(4)}</td><td>${thetas[i].toFixed(4)}</td></tr>`);
    }
    root.querySelector("[data-table] tbody").innerHTML = rows.join("");
  }

  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(render); }
  }

  form.addEventListener("input", schedule);
  form.addEventListener("change", schedule);
  form.addEventListener("submit", (e) => e.preventDefault());
  if ("ResizeObserver" in window) new ResizeObserver(schedule).observe(root.querySelector(".charts"));
  else window.addEventListener("resize", schedule);
  render();
}
