// src/main.ts — SAFE BOOT
import "./style.css";

import { initCountdown } from './modules/countdown';
import { applyI18n, loadLang } from './modules/i18n';
import { renderTokenomics } from './modules/tokenomics';
import { renderRoadmap } from './modules/roadmap';
import { setupMintUI } from './modules/mint';

// ----- 작은 헬퍼들 -----
function $(id: string) {
  return document.getElementById(id);
}
function showBanner(msg: string) {
  let bar = $("err");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "err";
    Object.assign(bar.style, {
      position: "sticky", top: "0", left: "0", zIndex: "9999",
      background: "rgb(43,30,30)", color: "rgb(255, 222, 222)",
      padding: "8px 12px", borderBottom: "1px solid rgb(85,85,51)", fontSize: "14px"
    } as CSSStyleDeclaration);
    document.body.prepend(bar);
  }
  bar.textContent = msg;
}
function hideBanner() {
  const bar = $("err");
  if (bar) bar.remove();
}

// ----- 레이아웃(그릇) 먼저 만들기 -----
function scaffold() {
  const app = $("app");
  if (!app) return false;

  app.innerHTML = `
    <header>
      <select id="lang">
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

// DOM이 완전히 갱신된 뒤에 다음 단계 실행 보장
function nextFrame() {
  return new Promise<void>(r => requestAnimationFrame(() => r()));
}

async function boot() {
  // 0) 레이아웃부터
  if (!scaffold()) return;

  // 1) i18n
  try {
    const select = $("lang") as HTMLSelectElement | null;
    const saved = localStorage.getItem('lang') || 'ko';
    if (select) {
      select.value = saved;
      select.addEventListener('change', async () => {
        const lang = select.value;
        localStorage.setItem('lang', lang);
        await applyI18n(await loadLang(lang));
      });
    }
    await applyI18n(await loadLang(saved));
  } catch (e) {
    console.warn("i18n init skipped:", e);
  }

  // 2) 레이아웃이 그려졌는지 한 프레임 대기 (민팅/섹션들이 자리 찾도록)
  await nextFrame();

  // 3) 섹션들
  try { renderTokenomics(); } catch (e) { console.warn("tokenomics skipped:", e); }
  try { renderRoadmap(); } catch (e) { console.warn("roadmap skipped:", e); }
  try { initCountdown(); } catch (e) { console.warn("countdown skipped:", e); }

  // 4) 민팅 UI — 실패해도 앱이 죽지 않게 보호
  try {
    await setupMintUI();
    hideBanner();
  } catch (e: any) {
    console.error(e);
    showBanner("민팅 UI 초기화 실패(계속 진행)");
  }
}

boot();
