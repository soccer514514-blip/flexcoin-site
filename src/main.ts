/* -------------------------------------------------------
   Flexcoin Mainnet Final – v3 (2025-11-08)
   - Burn/Dead 행을 DEFAULTS 밖에서 addRow 실행으로 분리 (빌드 오류 해결)
   - /public/config/addresses.json, /presale.json 모두 시도 후 자동 fallback
   - Hero 1~7.jpg 자동 로테이터
   - NFT 미리보기 6장 바인딩
   - 토크노믹스 도넛
   - 프리세일 KST 카운트다운
------------------------------------------------------- */

type Hex = `0x${string}`;

const FALLBACK = {
  chainId: 56,
  chainRpc: "https://bsc-dataseed.binance.org",
  token: "0xBa29562241F0489504C493c47aCBA16d7a98998f",
  team: "0x8865331fD7AA6e63fC1C01882F0fE40AbC58bB30",
  marketing: "0xF3A2159474dCE4eF86F6eE56cE1b55C60E2C467e",
  user: "0xCDcA475e1C6D89A14158fB8D05fA8275Bf5A06Ea",
  presale: "0x66F4cEb1C3dEb2084cdc02Aa3c318CF680E0A672",
  burn: "0x388a9106d392937938721d6dd09cf1f331c2860f",
  dead: "0x000000000000000000000000000000000000dEaD",
  pancakeBuyBase:
    "https://pancakeswap.finance/swap?outputCurrency=0xBa29562241F0489504C493c47aCBA16d7a98998f&chainId=56",
  telegram: "https://t.me/+p1BMrdypmDFmNTA1",
  x: "https://x.com/Flexcoinmeme",
  bscscanToken:
    "https://bscscan.com/token/0xBa29562241F0489504C493c47aCBA16d7a98998f"
};

const $ = (sel: string, root: Document | HTMLElement = document) =>
  root.querySelector(sel) as HTMLElement | null;

const byId = (id: string) => document.getElementById(id) as HTMLElement | null;

function toHex32(addr: string): string {
  const a = addr.trim();
  return a.length === 42 ? a : a.padStart(42, "0");
}

/* -------------------- UI helpers -------------------- */
function setText(id: string, v: string) {
  const el = byId(id);
  if (el) el.textContent = v;
}

function setHref(id: string, href: string) {
  const el = byId(id) as HTMLAnchorElement | null;
  if (el) el.href = href;
}

function addRow(label: string, addr: string, extra?: { right?: string; link?: string }) {
  const tbody = document.querySelector<HTMLTableSectionElement>("#onchain tbody");
  if (!tbody) return;
  const tr = document.createElement("tr");
  const a = document.createElement("a");
  a.textContent = `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  a.href = extra?.link || `https://bscscan.com/address/${addr}`;
  a.target = "_blank";
  const tdL = document.createElement("td");
  tdL.textContent = label;
  const tdA = document.createElement("td");
  tdA.appendChild(a);
  const tdR = document.createElement("td");
  tdR.textContent = extra?.right ?? "";
  tr.appendChild(tdL);
  tr.appendChild(tdA);
  tr.appendChild(tdR);
  tbody.appendChild(tr);
}

/* -------------------- Tokenomics donut -------------------- */
function renderDonut() {
  const el = byId("tokenomics-donut");
  if (!el) return;
  const size = 160, stroke = 20, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const parts = [
    { label: "LP", pct: 69 },
    { label: "Presale", pct: 10 },
    { label: "Marketing", pct: 10 },
    { label: "Team", pct: 10 },
    { label: "Burn", pct: 1 }
  ];
  el.innerHTML = "";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  let offset = 0;
  parts.forEach((p) => {
    const len = (p.pct / 100) * c;
    const circle = document.createElementNS(svg.namespaceURI, "circle");
    circle.setAttribute("cx", String(size / 2));
    circle.setAttribute("cy", String(size / 2));
    circle.setAttribute("r", String(r));
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke-width", String(stroke));
    circle.setAttribute("stroke-dasharray", `${len} ${c - len}`);
    circle.setAttribute("stroke-dashoffset", String(-offset));
    // 색상은 CSS 기본값 사용(디폴트 팔레트)
    svg.appendChild(circle);
    offset += len;
  });
  el.appendChild(svg);
}

/* -------------------- Hero Rotator -------------------- */
function startHeroRotator() {
  const hero = document.querySelector<HTMLImageElement>("#hero img");
  if (!hero) return;
  const files = [1, 2, 3, 4, 5, 6, 7].map((n) => `/public/hero/${n}.jpg`);
  let i = 0;
  const swap = () => {
    hero.src = files[i];
    i = (i + 1) % files.length;
  };
  swap();
  setInterval(swap, 6000);
}

/* -------------------- NFT previews -------------------- */
function bindNftPreviews() {
  document.querySelectorAll<HTMLImageElement>("[data-nft]").forEach((img) => {
    const n = img.getAttribute("data-nft");
    img.alt = `NFT Preview ${n}`;
    img.src = `/public/nft-preview/publicnft-preview${n}.jpg`;
  });
}

/* -------------------- Presale countdown -------------------- */
function renderPresale(startISO: string, endISO: string) {
  const el = byId("presaleText");
  if (!el) return;

  const tick = () => {
    const now = new Date();
    const start = new Date(startISO);
    const end = new Date(endISO);

    if (now < start) {
      const d = Math.ceil((+start - +now) / 1000);
      el.textContent = `Presale starts in ${fmt(d)} (KST)`;
    } else if (now >= start && now <= end) {
      const d = Math.ceil((+end - +now) / 1000);
      el.textContent = `Presale ends in ${fmt(d)} (KST)`;
    } else {
      el.textContent = "Presale is finished.";
    }
  };

  const fmt = (secs: number) => {
    const d = Math.floor(secs / 86400);
    const h = Math.floor((secs % 86400) / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  tick();
  setInterval(tick, 1000);
}

/* -------------------- Buttons & wallets -------------------- */
function wireButtons(cfg: typeof FALLBACK) {
  setHref("btnPancake", cfg.pancakeBuyBase);
  setHref("btnTelegram", cfg.telegram);
  setHref("btnX", cfg.x);
  setHref("btnBscScan", cfg.bscscanToken);

  setText("teamWallet", cfg.team);
  setText("marketingWallet", cfg.marketing);
  setText("userWallet", cfg.user);
}

/* -------------------- Robust config loader -------------------- */
async function loadJson<T>(paths: string[]): Promise<T | null> {
  for (const p of paths) {
    try {
      const r = await fetch(p, { cache: "no-cache" });
      if (r.ok) return (await r.json()) as T;
    } catch {}
  }
  return null;
}

/* -------------------- Boot -------------------- */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    renderDonut();
    startHeroRotator();
    bindNftPreviews();

    type AddrCfg = Partial<typeof FALLBACK>;
    const addr = (await loadJson<AddrCfg>([
      "/public/config/addresses.json",
      "/addresses.json"
    ])) || {};

    const cfg = { ...FALLBACK, ...addr };

    wireButtons(cfg);

    // On-chain table (static links + labels; balances optional)
    const tbody = document.querySelector("#onchain tbody");
    if (tbody) tbody.innerHTML = "";
    addRow("Team / Lock", cfg.team);
    addRow("Marketing / Airdrop", cfg.marketing);
    addRow("Your wallet", cfg.user);
    addRow("Dead (burn)", cfg.dead);
    // 총발행량 표시는 정적 값 표 하단에서 표시
    setText("totalSupply", "1000000000");

    // Presale
    type PS = { startKST: string; endKST: string };
    const presale =
      (await loadJson<PS>(["/public/config/presale.json", "/presale.json"])) || {
        startKST: "2025-12-01T21:00:00+09:00",
        endKST: "2026-01-01T21:00:00+09:00"
      };
    renderPresale(presale.startKST, presale.endKST);
  } catch (e) {
    console.error("BOOT ERROR", e);
  }
});
