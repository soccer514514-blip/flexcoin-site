/* ---------------------------------------------------------
   FLEX ⤳ PATH HOTFIX (hero & nft-preview) — 2025-11-07
   - 모든 "1.jpg~7.jpg" 같은 상대경로를 /public/hero/*.jpg 로 강제 보정
   - NFT 프리뷰는 /public/nft-preview/publicnft-preview*.jpg 사용
   - 프리세일 설정은 /public/config/presale.json 로드
--------------------------------------------------------- */

const VER = new URLSearchParams(location.search).get("v") || String(Date.now());
const HERO_BASE = "/public/hero/";
const PREVIEW_BASE = "/public/nft-preview/";
const PRESALE_CONFIG = "/public/config/presale.json";

// 1) 문서 내 <img> 경로 보정 (hero 1~7.jpg)
function fixHeroImagePaths(scope: Document | HTMLElement = document) {
  const imgs = Array.from(scope.querySelectorAll<HTMLImageElement>("img"));
  imgs.forEach((img) => {
    const raw = img.getAttribute("src") || "";
    const m = raw.match(/(?:^|\/)([1-7])\.jpg(?:\?.*)?$/i);
    if (!m) return;
    const n = m[1];
    const fixed = `${HERO_BASE}${n}.jpg?v=${VER}`;
    if (img.src !== fixed) img.src = fixed;
    img.onerror = () => (img.src = `${HERO_BASE}${n}.jpg?v=${Date.now()}`);
  });
}
document.addEventListener("DOMContentLoaded", () => fixHeroImagePaths());
window.addEventListener("load", () => setTimeout(() => fixHeroImagePaths(), 0));

// 2) NFT 프리뷰 영역 채우기(있을 때만)
(function mountNftPreview() {
  const box = document.querySelector<HTMLElement>("[data-nft-preview], .nft-preview, #nft-preview");
  if (!box) return;
  const list = [1,2,3,4,5,6].map(n => `${PREVIEW_BASE}publicnft-preview${n}.jpg?v=${VER}`);
  const img = new Image();
  img.alt = "NFT Preview";
  img.style.maxWidth = "100%";
  img.style.height = "auto";
  img.loading = "lazy";
  let i = 0;
  function cycle() {
    img.src = list[i % list.length];
    i++;
  }
  img.onerror = () => setTimeout(cycle, 100);
  box.innerHTML = "";
  box.appendChild(img);
  cycle();
  setInterval(cycle, 4000);
})();

// 3) 프리세일 타이머 설정 로드(파일이 있을 때만)
(async function loadPresaleConfig() {
  try {
    const r = await fetch(`${PRESALE_CONFIG}?v=${VER}`);
    if (!r.ok) return;
    const cfg = await r.json();
    (window as any).__FLEX_PRESALE__ = cfg;
    // 기존 타이머 모듈이 있으면 여기서 cfg를 읽어 재초기화하도록 훅을 노출해둠
    document.dispatchEvent(new CustomEvent("flex:presale:config", { detail: cfg }));
  } catch {}
})();

// ---------------------------------------------------------
// Flexcoin main.ts — hero path hotfix + countdown
// ---------------------------------------------------------

const HERO_BASE = '/public/hero/';
function cacheBust(v?: string) {
  return v || String(Date.now());
}

function fixHeroImagePaths() {
  const ver = new URLSearchParams(location.search).get('v') || cacheBust();
  const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('img'));
  imgs.forEach(img => {
    const raw = img.getAttribute('src') || '';
    const m = raw.match(/(?:^|\/)([1-7])\.jpg(?:\?.*)?$/i);
    if (!m) return;
    const n = m[1];
    const fixed = `${HERO_BASE}${n}.jpg?v=${ver}`;
    if (img.src !== fixed) img.src = fixed;
    img.onerror = () => (img.src = `${HERO_BASE}${n}.jpg?v=${cacheBust()}`);
  });

  // Ensure one hero image exists inside .hero-wrap
  const wrap = document.querySelector('.hero-wrap');
  if (wrap && !wrap.querySelector('img')) {
    const im = document.createElement('img');
    im.alt = 'Flexcoin Hero';
    im.src = `${HERO_BASE}1.jpg?v=${ver}`;
    wrap.appendChild(im);
  }
}

function rotateHero(intervalMs = 6000) {
  const wrap = document.querySelector('.hero-wrap');
  if (!wrap) return;
  const im = wrap.querySelector('img') as HTMLImageElement | null;
  if (!im) return;
  let n = 1;
  setInterval(() => {
    n = (n % 7) + 1;
    im.src = `${HERO_BASE}${n}.jpg?v=${cacheBust()}`;
  }, intervalMs);
}

async function loadPresale() {
  try {
    const res = await fetch('/config.presale.json', { cache: 'no-store' });
    const conf = await res.json();
    const target = new Date(conf.start).getTime();
    const el = document.getElementById('countdown');
    if (!el) return;

    function tick() {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const s = Math.floor(diff / 1000);
      const d = Math.floor(s / 86400);
      const h = Math.floor((s % 86400) / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      el.textContent = `${d}d ${h}h ${m}m ${sec}s`;
    }
    tick();
    setInterval(tick, 1000);
  } catch (e) {
    console.warn('presale config missing', e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fixHeroImagePaths();
  rotateHero();
  loadPresale();
});
window.addEventListener('load', () => setTimeout(fixHeroImagePaths, 0));
