/* =====================================================================
   FLEXCOIN — main.ts (Vite / Vanilla TS)  ✅ 전체 교체용 완성본
   - 경로/캐시 문제(404) 해결
   - NFT 프리뷰 자동 주입
   - Presale 표기 / 링크 / 지갑 표기
   - 토크노믹스 도넛(SVG) 생성
   - 외부 라이브러리 미사용 (빌드 안전)
===================================================================== */

/* ---------------------------------------------------------
   PATHS (single source of truth)
--------------------------------------------------------- */
const __VER = new URLSearchParams(location.search).get("v") || String(Date.now());

// 정적 자원 경로
const HERO_BASE = "/public/hero/";
const NFT_PREVIEW_BASE = "/public/nft-preview/";
const CONFIG_BASE = "/public/config/";

// JSON 경로 (repo 폴더 구조에 맞춤)
const PRESALE_JSON = CONFIG_BASE + "presale.json";
const ADDRESSES_JSON = CONFIG_BASE + "addresses.json";

/* ---------------------------------------------------------
   FLEX MAINNET 기본값 (fetch 실패 시 fallback)
--------------------------------------------------------- */
const DEFAULT_CFG = {
  presale: {
    // 한국시간 기준 2025-12-01 21:00 ~ 2026-01-01 21:00
    startKST: "2025-12-01T21:00:00+09:00",
    endKST: "2026-01-01T21:00:00+09:00",
  },
  addrs: {
    chainId: 56, // BNB Smart Chain mainnet
    token: "0xBa29562241F0489504C493c47aCBA16d7a98998f",
    teamLock: "0x8865331fD7AA6e63fC1C01882F0fE40AbC58bB30",
    marketing: "0xF3A2159474dCE4eF86F6eE56cE1b55C60E2C467e",
    userRecv: "0xCDcA475e1C6D89a14158fB8d05fA8275Bf5A06Ea",
  },
};

/* ---------------------------------------------------------
   RUNTIME CONFIG 로드 (404 방지용 + fallback)
--------------------------------------------------------- */
async function loadRuntimeConfig() {
  try {
    const [presale, addrs] = await Promise.all([
      fetch(PRESALE_JSON).then((r) => (r.ok ? r.json() : DEFAULT_CFG.presale)),
      fetch(ADDRESSES_JSON).then((r) => (r.ok ? r.json() : DEFAULT_CFG.addrs)),
    ]);
    (window as any).__FLEX_CFG__ = { presale, addrs };
  } catch {
    (window as any).__FLEX_CFG__ = { ...DEFAULT_CFG };
  }
}
loadRuntimeConfig();

/* ---------------------------------------------------------
   HERO IMG HOTFIX (1..7.jpg 강제 경로/캐시버스트)
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
    img.onerror = () => {
      img.src = `${HERO_BASE}${n}.jpg?v=${Date.now()}`;
    };
  });
}
document.addEventListener("DOMContentLoaded", fixHeroImagePaths);
window.addEventListener("load", () => setTimeout(fixHeroImagePaths, 0));

/* ---------------------------------------------------------
   NFT PREVIEW (지금 올려둔 파일명 그대로 사용)
   - public/nft-preview/publicnft-preview1.jpg ... 6.jpg
   - HTML 쪽 <img data-nft="1" ...> 형태에 자동 주입
--------------------------------------------------------- */
function injectNftPreview() {
  const ids = [1, 2, 3, 4, 5, 6];
  ids.forEach((n) => {
    const el = document.querySelector<HTMLImageElement>(`img[data-nft="${n}"]`);
    if (!el) return;
    el.src = `${NFT_PREVIEW_BASE}publicnft-preview${n}.jpg?v=${__VER}`;
    el.alt = `NFT Preview ${n}`;
  });
}
document.addEventListener("DOMContentLoaded", injectNftPreview);

/* ---------------------------------------------------------
   PRESALE 텍스트 출력
   HTML: <span id="presaleText"></span>
--------------------------------------------------------- */
function setPresaleText() {
  const root: any = (window as any).__FLEX_CFG__;
  const el = document.getElementById("presaleText");
  if (!el || !root?.presale) return;
  const { startKST, endKST } = root.presale;
  el.textContent = `한국시간 기준: ${fmtKST(startKST)} 시작 → ${fmtKST(endKST)} 종료`;
}
function fmtKST(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${mm}-${dd} ${hh}:${mi}`;
}

/* ---------------------------------------------------------
   링크/지갑 주소 반영
   HTML:
     - #btnPancake, #btnTelegram, #btnX, #btnBscScan (a 태그)
     - #teamWallet, #marketingWallet, #userWallet (span)
--------------------------------------------------------- */
function wireLinksAndAddresses() {
  const root: any = (window as any).__FLEX_CFG__;
  if (!root?.addrs) return;

  const { token, teamLock, marketing, userRecv } = root.addrs;

  // 버튼 링크
  const $ = (id: string) => document.getElementById(id) as HTMLAnchorElement | null;

  const buy = $(`btnPancake`);
  if (buy) buy.href = `https://pancakeswap.finance/swap?outputCurrency=${token}`;

  const tg = $(`btnTelegram`);
  if (tg) tg.href = `https://t.me/+p1BMrdypmDFmNTA1`;

  const tw = $(`btnX`);
  if (tw) tw.href = `https://x.com/Flexcoinmeme`;

  const bs = $(`btnBscScan`);
  if (bs) bs.href = `https://bscscan.com/token/${token}`;

  // 하단 지갑 표기
  const setText = (id: string, v: string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  };
  setText("teamWallet", teamLock);
  setText("marketingWallet", marketing);
  setText("userWallet", userRecv);
}

/* ---------------------------------------------------------
   토크노믹스 도넛 (SVG)
   HTML: <div id="tokenomics-donut"></div>
   비율: LP 69 / Presale 10 / Marketing 10 / Team 10 / Burn 1
--------------------------------------------------------- */
function renderTokenomicsDonut() {
  const host = document.getElementById("tokenomics-donut");
  if (!host) return;

  const data = [
    { label: "LP 69%", value: 69 },
    { label: "Presale 10%", value: 10 },
    { label: "Marketing 10%", value: 10 },
    { label: "Team 10%", value: 10 },
    { label: "Burn 1%", value: 1 },
  ];

  const total = data.reduce((a, b) => a + b.value, 0);
  const size = 280;
  const r = 110;
  const stroke = 40;
  let offset = 0;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));

  data.forEach((seg, idx) => {
    const circle = document.createElementNS(svg.namespaceURI, "circle");
    circle.setAttribute("cx", String(size / 2));
    circle.setAttribute("cy", String(size / 2));
    circle.setAttribute("r", String(r));
    circle.setAttribute("fill", "transparent");
    circle.setAttribute("stroke-width", String(stroke));

    // 자동 색상(브라우저 기본 팔레트 사용)
    circle.setAttribute("stroke", "currentColor");
    circle.style.color = ["#d9b878", "#b8924c", "#8c6d2b", "#6a521d", "#f1e2b8"][idx % 5];

    const dash = (seg.value / total) * 2 * Math.PI * r;
    circle.setAttribute("stroke-dasharray", `${dash} ${2 * Math.PI * r - dash}`);
    circle.setAttribute("transform", `rotate(-90 ${size / 2} ${size / 2})`);
    circle.setAttribute("stroke-dashoffset", String(offset));
    offset -= dash;

    svg.appendChild(circle);
  });

  host.innerHTML = "";
  host.appendChild(svg);
}

/* ---------------------------------------------------------
   INIT (설정 로드 완료 후 UI 반영)
--------------------------------------------------------- */
async function initFlex() {
  // 설정 로딩(이미 loadRuntimeConfig 호출했지만, 약간 대기)
  await new Promise((r) => setTimeout(r, 50));
  setPresaleText();
  wireLinksAndAddresses();
  renderTokenomicsDonut();
}
document.addEventListener("DOMContentLoaded", initFlex);
