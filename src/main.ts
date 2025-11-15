// src/main.ts
// ===============================================================
// Flexcoin 메인 엔트리
// - hero 로테이터
// - runtime JSON(config) 자동 로드
// - 토크노믹스 / 주소 / 링크 자동 주입
// - Presale 버튼 2개(GemPad + PinkSale) 자동 생성
// - NFT Mint UI setup
// ===============================================================

import setupMintUI from "./modules/mint";

// JSON 로더
async function fetchJson(path: string) {
  try {
    const r = await fetch(path + "?v=" + Date.now());
    if (r.ok) return await r.json();
  } catch (_) {}
  return {};
}

// Hero 자동 로테이터
function setupHero() {
  const hero = document.getElementById("hero-img") as HTMLImageElement;
  if (!hero) return;

  const imgs = [
    "/hero/main.jpg",
    "/hero/1.jpg",
    "/hero/2.jpg",
    "/hero/3.jpg",
    "/hero/4.jpg",
    "/hero/5.jpg",
    "/hero/6.jpg",
    "/hero/7.jpg",
    "/hero/8.jpg"
  ];

  let idx = 0;
  hero.src = imgs[0];

  setInterval(() => {
    idx = (idx + 1) % imgs.length;
    hero.style.opacity = "0";
    setTimeout(() => {
      hero.src = imgs[idx];
      hero.style.opacity = "1";
    }, 300);
  }, 4500);
}

// 토크노믹스(Donut 차트) 자동 생성
function setupTokenomics(allocation: any) {
  if (!allocation?.tokenomics) return;

  const LP = allocation.tokenomics.lp || 0;
  const PRE = allocation.tokenomics.presale || 0;
  const TEAM = allocation.tokenomics.team || 0;
  const MKT = allocation.tokenomics.marketing || 0;

  const data = [LP, PRE, TEAM, MKT];
  const labels = ["Liquidity", "Presale", "Team", "Marketing"];
  const colors = ["#ffd700", "#e6c15a", "#c7aa40", "#8d7a2f"];

  const canvas = document.getElementById("donut") as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext("2d")!;
  const total = data.reduce((a, b) => a + b, 0);
  let start = -Math.PI / 2;

  data.forEach((v, i) => {
    const angle = (v / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(130, 130);
    ctx.fillStyle = colors[i];
    ctx.arc(130, 130, 130, start, start + angle);
    ctx.fill();
    start += angle;
  });
}

// Presale 버튼 2개 (GemPad + PinkSale)
function setupPresaleButtons(links: any) {
  const wrap = document.getElementById("presale-buttons");
  if (!wrap) return;

  // GemPad link
  const gempad = document.createElement("a");
  gempad.className = "btn presale-btn gempad";
  gempad.textContent = "GemPad Presale";
  gempad.href = links.gempad_url || "#";
  gempad.target = "_blank";
  if (!links.gempad_url) gempad.classList.add("is-disabled");

  // PinkSale link
  const pink = document.createElement("a");
  pink.className = "btn presale-btn pinksale";
  pink.textContent = "PinkSale Presale";
  pink.href = links.pinksale_url || "#";
  pink.target = "_blank";
  if (!links.pinksale_url) pink.classList.add("is-disabled");

  wrap.appendChild(gempad);
  wrap.appendChild(pink);
}

// 주소 테이블 자동 주입
function setupAddressTable(addressJson: any) {
  const keys = [
    "token",
    "team",
    "marketing",
    "presale",
    "burn",
    "user"
  ];

  keys.forEach((k) => {
    const el = document.getElementById("addr-" + k);
    if (el && addressJson[k]) el.textContent = addressJson[k];
  });
}

// 상단 메뉴 링크 설정 (X, TG, Swap)
function setupHeaderLinks(links: any) {
  const x = document.getElementById("link-x");
  const tg = document.getElementById("link-tg");
  const swap = document.getElementById("link-swap");

  if (x && links.x_url) x.setAttribute("href", links.x_url);
  if (tg && links.tg_url) tg.setAttribute("href", links.tg_url);
  if (swap && links.pancakeswap_url) swap.setAttribute("href", links.pancakeswap_url);
}

// Alerts 폼
function setupForm(links: any) {
  const form = document.getElementById("alert-form") as HTMLFormElement;
  if (form && links.form_endpoint) {
    form.action = links.form_endpoint;
  }
}

// 메인 실행
(async function () {
  // JSON 로드
  const allocation = await fetchJson("/config/allocations.json");
  const addresses = await fetchJson("/config/addresses.json");
  const links = await fetchJson("/config/links.json");

  // Hero
  setupHero();

  // Tokenomics
  setupTokenomics(allocation);

  // Header links
  setupHeaderLinks(links);

  // Presale buttons 2개 생성
  setupPresaleButtons(links);

  // Address table
  setupAddressTable(addresses);

  // Formspree
  setupForm(links);

  // Mint module
  setupMintUI();

})();
