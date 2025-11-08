/* ---------------------------------------------------------
   PATHS (runtime: public/* → site root)
--------------------------------------------------------- */
const __VER = new URLSearchParams(location.search).get("v") || String(Date.now());

const HERO_BASE = "/hero/";
const NFT_PREVIEW_BASE = "/nft-preview/";
const CONFIG_BASE = "/config/";

// JSON 경로
const PRESALE_JSON = CONFIG_BASE + "presale.json";
const ADDRESSES_JSON = CONFIG_BASE + "addresses.json";

/* ---------------------------------------------------------
   HERO IMG HOTFIX (1..7.jpg 경로/캐시버스트 보정)
--------------------------------------------------------- */
function fixHeroImagePaths() {
  const imgs = Array.from(document.querySelectorAll<HTMLImageElement>("img"));
  imgs.forEach((img) => {
    const raw = img.getAttribute("src") || "";
    const m = raw.match(/(?:^|\/)([1-7])\.jpg(?:\?.*)?$/i);
    if (!m) return;
    const n = m[1];
    const fixed = `${HERO_BASE}${n}.jpg?v=${__VER}`;
    if (raw !== fixed) img.src = fixed;
    img.onerror = () => (img.src = `${HERO_BASE}${n}.jpg?v=${Date.now()}`);
  });
}
document.addEventListener("DOMContentLoaded", fixHeroImagePaths);
window.addEventListener("load", () => setTimeout(fixHeroImagePaths, 0));

/* ---------------------------------------------------------
   NFT PREVIEW (publicnft-preview1..6.jpg 자동 주입)
--------------------------------------------------------- */
function injectNftPreview() {
  const ids = [1, 2, 3, 4, 5, 6];
  ids.forEach((n) => {
    const el = document.querySelector<HTMLImageElement>(`img[data-nft="${n}"]`);
    if (!el) return;
    el.src = `${NFT_PREVIEW_BASE}publicnft-preview${n}.jpg?v=${__VER}`;
    el.alt = `NFT Preview ${n}`;
    el.decoding = "async";
    el.loading = "lazy";
  });
}
document.addEventListener("DOMContentLoaded", injectNftPreview);

/* ---------------------------------------------------------
   RUNTIME CONFIG LOAD (presale + addresses)
--------------------------------------------------------- */
type PresaleCfg = {
  startKST?: string;
  endKST?: string;
};
type AddrCfg = {
  token?: string;
  team?: string;
  marketing?: string;
  user?: string;
  telegram?: string;
  twitter?: string;
  pancake?: string;
  bscscan?: string;
};

const DEFAULT_ADDR: Required<AddrCfg> = {
  token: "0xBa29562241F0489504C493c47aCBA16d7a98998f",
  team: "0x8865331fD7AA6e63fC1C01882F0fE40AbC58bB30",
  marketing: "0xF3A2159474dCE4eF86F6eE56cE1b55C60E2C467e",
  user: "0xCDcA475e1C6D89A14158fB8D05fA8275Bf5A06Ea",
  telegram: "https://t.me/+p1BMrdypmDFmNTA1",
  twitter: "https://x.com/Flexcoinmeme",
  pancake:
    "https://pancakeswap.finance/swap?outputCurrency=0xBa29562241F0489504C493c47aCBA16d7a98998f",
  bscscan: "https://bscscan.com/token/0xBa29562241F0489504C493c47aCBA16d7a98998f",
};

async function loadRuntimeConfig() {
  let presale: PresaleCfg = {};
  let addrs: AddrCfg = {};
  try {
    const [p, a] = await Promise.all([
      fetch(PRESALE_JSON).then((r) => (r.ok ? r.json() : {})),
      fetch(ADDRESSES_JSON).then((r) => (r.ok ? r.json() : {})),
    ]);
    presale = p || {};
    addrs = a || {};
  } catch (_) {}

  const A: Required<AddrCfg> = {
    token: addrs.token || DEFAULT_ADDR.token,
    team: addrs.team || DEFAULT_ADDR.team,
    marketing: addrs.marketing || DEFAULT_ADDR.marketing,
    user: addrs.user || DEFAULT_ADDR.user,
    telegram: addrs.telegram || DEFAULT_ADDR.telegram,
    twitter: addrs.twitter || DEFAULT_ADDR.twitter,
    pancake: addrs.pancake || DEFAULT_ADDR.pancake,
    bscscan: addrs.bscscan || DEFAULT_ADDR.bscscan,
  };

  (window as any).__FLEX_CFG__ = { presale, addrs: A };

  // 링크/지갑 표기
  setLink("btnTelegram", A.telegram);
  setLink("btnX", A.twitter);
  setLink("btnPancake", A.pancake);
  setLink("btnBscScan", A.bscscan);

  putText("teamWallet", A.team);
  putText("marketingWallet", A.marketing);
  putText("userWallet", A.user);

  // 프리세일 텍스트 (KST 표기)
  const ps = document.getElementById("presaleText");
  if (ps) {
    const s = presale.startKST || "2025-12-01 21:00:00";
    const e = presale.endKST || "2026-01-01 21:00:00";
    ps.textContent = `KST ${s} → ${e}`;
  }
}
function setLink(id: string, href: string) {
  const a = document.getElementById(id) as HTMLAnchorElement | null;
  if (a) a.href = href;
}
function putText(id: string, t: string) {
  const el = document.getElementById(id);
  if (el) el.textContent = t;
}
loadRuntimeConfig();

/* ---------------------------------------------------------
   Tokenomics Donut (간단 SVG)
--------------------------------------------------------- */
function mountDonut() {
  const host = document.getElementById("tokenomics-donut");
  if (!host) return;
  const parts = [
    { label: "LP", v: 69 },
    { label: "Presale", v: 10 },
    { label: "Marketing", v: 10 },
    { label: "Team", v: 10 },
    { label: "Burn", v: 1 },
  ];
  const total = parts.reduce((a, b) => a + b.v, 0);
  const R = 80,
    C = 2 * Math.PI * R;
  let off = 0;
  const svg: string[] = [];
  parts.forEach((p) => {
    const len = (p.v / total) * C;
    svg.push(
      `<circle r="${R}" cx="100" cy="100" stroke="currentColor" stroke-width="22" fill="none" stroke-dasharray="${len} ${
        C - len
      }" stroke-dashoffset="${-off}" ></circle>`
    );
    off += len;
  });
  host.innerHTML = `<div style="color:#e7c97a"><svg width="200" height="200" viewBox="0 0 200 200" style="transform:rotate(-90deg)">${svg.join(
    ""
  )}</svg><div style="margin-top:8px;font-weight:700">$FLEX</div></div>`;
}
document.addEventListener("DOMContentLoaded", mountDonut);

/* ---------------------------------------------------------
   On-chain Status (BSC RPC, no deps)
--------------------------------------------------------- */
const DEFAULTS = {
  chainRpc: "https://bsc-dataseed.binance.org",
  token: "0xBa29562241F0489504C493c47aCBA16d7a98998f",
  team: "0x8865331fD7AA6e63fC1C01882F0fE40AbC58bB30",
  marketing: "0xF3A2159474dCE4eF86F6eE56cE1b55C60E2C467e",
  user: "0xCDcA475e1C6D89A14158fB8D05fA8275Bf5A06Ea",
const burnAddr = "0x388a9106d392937938721d6dd09cf1f331c2860f";
await addRow("Dead (Burn)", burnAddr);
 dead: "0x000000000000000000000000000000000000dEaD",
};

type Hex = `0x${string}`;
const toHex32 = (addr: string) =>
  ("0".repeat(64) + addr.toLowerCase().replace(/^0x/, "")).slice(-64);

async function rpcCall(method: string, params: any[], rpc = DEFAULTS.chainRpc) {
  const r = await fetch(rpc, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  return j.result as string;
}
async function ethCall(to: string, data: string, rpc?: string) {
  return rpcCall("eth_call", [{ to, data }, "latest"], rpc);
}

const SEL = {
  totalSupply: "0x18160ddd",
  decimals: "0x313ce567",
  balanceOf: "0x70a08231",
};

function hexToBigInt(hex: string) {
  return BigInt(hex || "0x0");
}
function formatUnits(n: bigint, decimals: number) {
  const s = n.toString();
  if (decimals === 0) return s;
  const i = s.length > decimals ? s.length - decimals : 0;
  const int = i ? s.slice(0, i) : "0";
  const frac = s.slice(i).padStart(decimals, "0").replace(/0+$/, "");
  return frac ? `${int}.${frac}` : int;
}

async function getMeta(token: string) {
  const decHex = await ethCall(token, SEL.decimals);
  return { decimals: Number(hexToBigInt(decHex)) };
}
async function getTotalSupply(token: string) {
  const hex = await ethCall(token, SEL.totalSupply);
  return hexToBigInt(hex);
}
async function getBalance(token: string, owner: string) {
  const data = SEL.balanceOf + toHex32(owner);
  const hex = await ethCall(token, data);
  return hexToBigInt(hex);
}
function short(addr: string) {
  return addr.replace(/^(.{6}).*(.{4})$/, "$1…$2");
}
function linkToken(token: string) {
  return `https://bscscan.com/token/${token}`;
}
function linkAddr(addr: string, token?: string) {
  return token
    ? `https://bscscan.com/token/${token}?a=${addr}`
    : `https://bscscan.com/address/${addr}`;
}
function linkHolders(token: string) {
  return `https://bscscan.com/token/${token}#balances`;
}
function linkPairs(token: string) {
  return `https://bscscan.com/token/${token}#tokenTrade`;
}
function linkUserOut(token: string, user: string) {
  return `https://bscscan.com/token/${token}?a=${user}#tokenTrade`;
}

async function mountOnchainStatus() {
  try {
    const A = ((window as any).__FLEX_CFG__?.addrs as Required<AddrCfg>) || DEFAULT_ADDR;
    const token = A.token;
    const team = A.team;
    const mkt = A.marketing;
    const user = A.user;
    const dead = DEFAULTS.dead;

    const { decimals } = await getMeta(token);
    const [ts, bTeam, bMkt, bUser, bDead] = await Promise.all([
      getTotalSupply(token),
      getBalance(token, team),
      getBalance(token, mkt),
      getBalance(token, user),
      getBalance(token, dead),
    ]);
    const fmt = (n: bigint) => formatUnits(n, decimals);

    const rowsEl = document.getElementById("onchain-rows")!;
    rowsEl.innerHTML = "";

    const rows: Array<[string, string, bigint]> = [
      ["Team / Lock", team, bTeam],
      ["Marketing / Airdrop", mkt, bMkt],
      ["Your wallet", user, bUser],
      ["Dead (burn)", dead, bDead],
    ];
    rows.forEach(([label, addr, bal]) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${label}</td>
        <td style="font-family:ui-monospace,monospace">${short(addr)}</td>
        <td class="num">${fmt(bal)}</td>
        <td><a class="btn" href="${linkAddr(addr, token)}" target="_blank">View</a></td>
      `;
      rowsEl.appendChild(tr);
    });

    const totalEl = document.getElementById("onchain-total")!;
    totalEl.textContent = fmt(ts);

    (document.getElementById("ql-holders") as HTMLAnchorElement).href = linkHolders(token);
    (document.getElementById("ql-dead") as HTMLAnchorElement).href = linkAddr(dead, token);
    (document.getElementById("ql-pairs") as HTMLAnchorElement).href = linkPairs(token);
    (document.getElementById("ql-user-out") as HTMLAnchorElement).href = linkUserOut(token, user);
  } catch (e) {
    const rowsEl = document.getElementById("onchain-rows");
    if (rowsEl)
      rowsEl.innerHTML = `<tr><td colspan="4" style="padding:16px;opacity:.8">RPC 호출 실패 — 잠시 후 새로고침</td></tr>`;
    console.warn("[On-chain] load failed:", e);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  mountOnchainStatus();
});
