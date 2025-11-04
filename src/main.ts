// src/main.ts — 안전 부팅 버전
import "./style.css";

import { initCountdown }   from "./modules/countdown";
import { applyI18n, loadLang } from "./modules/i18n";
import { renderTokenomics }from "./modules/tokenomics";
import { renderRoadmap }   from "./modules/roadmap";
import { setupMintUI }     from "./modules/mint";

// 상단 오류 배너 유틸
function showErr(msg: string) {
  let bar = document.getElementById("err") as HTMLDivElement | null;
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "err";
    bar.style.cssText =
      "position:sticky;top:0;left:0;z-index:9999;background:#2b1e1e;color:#ffdede;padding:8px 12px;border-bottom:1px solid #553;" +
      "font-size:14px";
    document.body.prepend(bar);
  }
  bar.textContent = msg;
}

// 0) 레이아웃 그릇 먼저 생성
function mountShell() {
  const app = document.getElementById("app");
  if (!app) {
    showErr("App mount point (#app) not found");
    return null;
  }
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
  return app;
}

async function boot() {
  // 레이아웃 먼저
  if (!mountShell()) return;

  // 1) i18n
  try {
    const select = document.getElementById("lang") as HTMLSelectElement | null;
    const saved = localStorage.getItem("lang") || "ko";
    if (select) {
      select.value = saved;
      await applyI18n(await loadLang(saved));
      select.addEventListener("change", async () => {
        const lang = select.value;
        localStorage.setItem("lang", lang);
        await applyI18n(await loadLang(lang));
      });
    }
  } catch (e) {
    console.error(e);
    showErr("언어 모듈 초기화 실패(계속 진행)");
  }

  // 2) 섹션 렌더
  try { renderTokenomics(); } catch (e) {
    console.error(e); showErr("토크노믹스 렌더 실패(계속 진행)");
  }
  try { renderRoadmap(); } catch (e) {
    console.error(e); showErr("로드맵 렌더 실패(계속 진행)");
  }

  // 3) 카운트다운
  try { initCountdown(); } catch (e) {
    console.error(e); showErr("카운트다운 초기화 실패(계속 진행)");
  }

  // 4) 민팅 UI
  try { await setupMintUI(); } catch (e) {
    console.error(e); showErr("민팅 UI 초기화 실패(계속 진행)");
  }
}

boot();
