// src/main.ts  — Flexcoin v5.9-ready (keeps v5.88 behavior, adds i18n + safer loaders)

type AnyObj = Record<string, any>;

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  root.querySelector<T>(sel)!;
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

async function fetchJSON<T = AnyObj>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, { cache: "no-cache" });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

/* -----------------------------------------------------------------------------
  1) Hero image loader (main.jpg → fallback 1.jpg) + (optional) rotator 1..8.jpg
----------------------------------------------------------------------------- */
async function loadHero() {
  const el = $("#hero-img") as HTMLImageElement | null;
  if (!el) return;

  const trySrc = (src: string) =>
    new Promise<boolean>((resolve) => {
      const img = new Image();
      img.onload = () => {
        el.src = src;
        resolve(true);
      };
      img.onerror = () => resolve(false);
      img.src = src;
    });

  // 1) main.jpg with cache-bust
  const okMain = await trySrc(`/hero/main.jpg?ts=${Date.now()}`);
  if (okMain) return;

  // 2) fallback to /hero/1.jpg
  const okFallback = await trySrc(`/hero/1.jpg?ts=${Date.now()}`);
  if (!okFallback) return;

  // (optional) light rotator among 1..8.jpg if they exist
  let idx = 1;
  setInterval(async () => {
    idx = (idx % 8) + 1;
    const next = `/hero/${idx}.jpg`;
    // don't block if missing — just skip setting
    const ok = await trySrc(`${next}?ts=${Date.now()}`);
    if (!ok) idx = 1;
  }, 8000);
}

/* -----------------------------------------------------------------------------
  2) Runtime config → donut chart + text counters
     Reads: /config/allocations.json, /config/presale.json, /config/addresses.json
----------------------------------------------------------------------------- */
type Allocations = {
  lp?: number; presale?: number; team?: number; marketing?: number; burn?: number;
  presale_rate?: string | number;
  listing_rate?: string | number;
  softcap?: string | number;
  hardcap?: string | number;
};
type PresaleCfg = {
  presale_rate?: string | number;
  listing_rate?: string | number;
  softcap?: string | number;
  hardcap?: string | number;
  pinksale_url?: string;
};
type Addresses = {
  token?: string; team?: string; marketing?: string; presale?: string; burn?: string; user?: string;
  chainId?: number; chain?: string; explorer?: string;  // optional hints
};

function setText(selector: string, text: string) {
  const el = document.querySelector<HTMLElement>(selector);
  if (el) el.textContent = text;
}

function pct(n?: number) { return (typeof n === "number" ? n : 0).toFixed(0) + "%"; }

function drawDonut(svgId: string, parts: Array<{ v: number; label: string }>) {
  const svg = document.getElementById(svgId) as SVGSVGElement | null;
  if (!svg) return;

  const total = parts.reduce((s, p) => s + Math.max(0, p.v), 0) || 1;
  const cx = 60, cy = 60, r = 50, t = 20; // radius/thickness
  svg.innerHTML = ""; svg.setAttribute("viewBox", "0 0 120 120");

  let a0 = -90; // start angle
  parts.forEach((p) => {
    const frac = Math.max(0, p.v) / total;
    const a1 = a0 + 360 * frac;
    const large = a1 - a0 > 180 ? 1 : 0;

    const x0 = cx + r * Math.cos((Math.PI / 180) * a0);
    const y0 = cy + r * Math.sin((Math.PI / 180) * a0);
    const x1 = cx + r * Math.cos((Math.PI / 180) * a1);
    const y1 = cy + r * Math.sin((Math.PI / 180) * a1);

    // random-ish but stable hue by label
    const hue = Math.abs(
      p.label.split("").reduce((s, c) => s + c.charCodeAt(0), 0)
    ) % 360;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`
    );
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", `hsl(${hue} 70% 55%)`);
    path.setAttribute("stroke-width", String(t));
    path.setAttribute("stroke-linecap", "butt");
    svg.appendChild(path);

    a0 = a1;
  });

  // inner hole
  const hole = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  hole.setAttribute("cx", String(cx));
  hole.setAttribute("cy", String(cy));
  hole.setAttribute("r", String(r - t));
  hole.setAttribute("fill", "#13100b");
  svg.appendChild(hole);
}

function applyTokenomics(a: Allocations) {
  // Text counters
  setText("[data-tok-lp]", pct(a.lp));
  setText("[data-tok-presale]", pct(a.presale));
  setText("[data-tok-team]", pct(a.team));
  setText("[data-tok-mkt]", pct(a.marketing));
  setText("[data-tok-burn]", pct(a.burn));

  // Donut
  drawDonut("donut", [
    { v: a.lp ?? 0, label: "LP" },
    { v: a.presale ?? 0, label: "Presale" },
    { v: a.team ?? 0, label: "Team" },
    { v: a.marketing ?? 0, label: "Marketing" },
    { v: a.burn ?? 0, label: "Burn" },
  ]);
}

function applyPresale(p: PresaleCfg | Allocations | null) {
  if (!p) return;
  if (p.presale_rate != null) setText("[data-presale-rate]", `Presale: 1 BNB = ${p.presale_rate} FLEX`);
  if (p.listing_rate != null) setText("[data-listing-rate]", `Listing: 1 BNB = ${p.listing_rate} FLEX`);
  if (p.softcap != null) setText("[data-softcap]", String(p.softcap));
  if (p.hardcap != null) setText("[data-hardcap]", String(p.hardcap));

  const btn = document.getElementById("btn-pinksale") as HTMLAnchorElement | null;
  if (btn) {
    const url = (p as PresaleCfg).pinksale_url;
    if (url && /^https?:\/\//i.test(url)) {
      btn.href = url;
      btn.classList.remove("disabled");
      btn.textContent = "Pinksale (Open)";
      btn.target = "_blank";
      btn.rel = "noopener";
    } else {
      btn.classList.add("disabled");
      btn.removeAttribute("href");
    }
  }
}

function chainExplorerBase(addr: string, hint?: string) {
  if (hint && /^https?:\/\//.test(hint)) return `${hint.replace(/\/+$/,"")}/address/${addr}`;
  // default BSC mainnet
  return `https://bscscan.com/address/${addr}`;
}

function applyAddresses(ad: Addresses | null) {
  if (!ad) return;
  const map: Array<[string, string | undefined]> = [
    ["[data-addr-token]", ad.token],
    ["[data-addr-team]", ad.team],
    ["[data-addr-mkt]", ad.marketing],
    ["[data-addr-presale]", ad.presale],
    ["[data-addr-burn]", ad.burn],
    ["[data-addr-user]", ad.user],
  ];
  map.forEach(([sel, addr]) => {
    const a = document.querySelector<HTMLAnchorElement>(sel);
    if (!a) return;
    if (addr) {
      a.href = chainExplorerBase(addr, ad.explorer);
      a.textContent = addr;
      a.target = "_blank";
      a.rel = "noopener";
    } else {
      a.removeAttribute("href");
      a.textContent = "—";
    }
  });
}

/* -----------------------------------------------------------------------------
  3) Very-light i18n (EN/KR) — works with /i18n/{lang}.json (from public/)
----------------------------------------------------------------------------- */
async function setLang(lang: string) {
  try {
    const dict = await fetchJSON<Record<string, string>>(`/i18n/${lang}.json`);
    if (!dict) return;
    $$<HTMLElement>("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n")!;
      if (key in dict) el.textContent = dict[key];
    });
    localStorage.setItem("lang", lang);
    const now = document.getElementById("lang-now");
    if (now) now.textContent = lang.toUpperCase();
  } catch {
    /* no-op */
  }
}
function bindLangSwitch() {
  const wanted =
    new URL(location.href).searchParams.get("lang") ||
    localStorage.getItem("lang") ||
    "en";
  setLang(wanted);
  $$<HTMLButtonElement>("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.dataset.lang || "en"));
  });
}

/* -----------------------------------------------------------------------------
  4) Boot
----------------------------------------------------------------------------- */
(async () => {
  // Hero
  loadHero();

  // Runtime JSON
  const [alloc, presale, addrs] = await Promise.all([
    fetchJSON<Allocations>("/config/allocations.json"),
    fetchJSON<PresaleCfg>("/config/presale.json"),
    fetchJSON<Addresses>("/config/addresses.json"),
  ]);

  if (alloc) applyTokenomics(alloc);
  applyPresale(presale ?? alloc ?? null);
  applyAddresses(addrs);

  // i18n
  bindLangSwitch();

  // Community buttons are static; nothing required here.
})();
