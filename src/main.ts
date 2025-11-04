// src/main.ts — HARDENED BOOT
import "./style.css";

import { initCountdown } from "./modules/countdown";
import { applyI18n, loadLang } from "./modules/i18n";
import { renderTokenomics } from "./modules/tokenomics";
import { renderRoadmap } from "./modules/roadmap";
import { setupMintUI } from "./modules/mint";

// ----------------- 공용 도우미 -----------------
function banner(msg: string) {
  let bar = document.getElementById("err");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "err";
    bar.style.cssText =
      "position:sticky;top:0;left:0;right:0;z-index:9999;background:#2a1c1c;color:#ffb4b4;padding:8px 12px;border-bottom:1px solid #553;";
    document.body.prepend(bar);
  }
  bar.textContent = `⚠ ${msg}`;
  console.error("[BOOT]", msg);
}

// ----------------- 레이아웃 선삽입 -----------------
function scaffold() {
  const app = document.getElementById("app");
  if (!app) {
    banner("앱 마운트 포인트(#app)를 찾지 못했습니다.");
    return false;
  }
  app.innerHTML = `
    <header>
      <select id="lang" aria-label="language">
        <option value="ko">한국어</option>
        <option value="en">English</option>
      </select>
    </header>

    <main>
      <section id="hero">
        <h1 data-i18n="t-hero-title">Flexcoin</h1>
        <p class="muted" data-i18n="t-hero-sub">Memecoin 섹터에서 살아남기</p>
        <div id="countdown" class="row">
          <div class="cd"><b id="cd-d">00</b><span>days</span></div>
          <div class="cd"><b id="cd-h">00</b><span>hours</span></div>
          <div class="cd"><b id="cd-m">00</b><span>mins</span></div>
          <div class="cd"><b id="cd-s">00</b><span>secs</span></div>
        </div>
      </section>

      <section id="tokenomics">
        <h2 data-i18n="t-tokenomics-title">토크노믹스</h2>
        <div id="tokenomics-root" class="grid"></div>
      </section>

      <section id="roadmap">
        <h2 data-i18n="t-roadmap-title">로드맵</h2>
        <div id="roadmap-root" class="grid"></div>
      </section>

      <section id="mint">
        <h2 data-i18n="t-nft-title">NFT 민팅</h2>
        <div id="mint-root"></div>
      </section>
    </main>
  `;
  return true;
}

// ----------------- 안전 부팅 -----------------
async function boot() {
  try {
    if (!scaffold()) return;

    // i18n
    try {
      const select = document.getElementById("lang") as HTMLSelectElement | null;
      const saved = localStorage.getItem("lang") || "ko";
      if (select) select.value = saved;
      applyI18n(await loadLang(saved));
      select?.addEventListener("change", async () => {
        const lang = select.value;
        localStorage.setItem("lang", lang);
        applyI18n(await loadLang(lang));
      });
    } catch (e) {
      banner("i18n 초기화 중 오류 (계속 진행)");
      console.error(e);
    }

    // 섹션 렌더
    try { renderTokenomics(); } catch (e) { banner("Tokenomics 렌더 오류 (계속 진행)"); console.error(e); }
    try { renderRoadmap(); }   catch (e) { banner("Roadmap 렌더 오류 (계속 진행)");   console.error(e); }
    try { initCountdown(); }   catch (e) { banner("카운트다운 초기화 실패 (계속 진행)"); console.error(e); }

    // 민팅 UI (문제 있어도 나머지 표시되게)
    try { await setupMintUI(); }
    catch (e) { banner("민팅 UI 초기화 실패 (계속 진행)"); console.error(e); }
  } catch (e) {
    banner("부팅 중 치명적 오류");
    console.error(e);
  }
}

window.addEventListener("DOMContentLoaded", boot);
