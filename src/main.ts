/* ---------------------------------------------------------
   PATHS (single source of truth)  ← Vite 배포 후 실제 런타임 경로
--------------------------------------------------------- */
const __VER = new URLSearchParams(location.search).get("v") || String(Date.now());

// ✅ 런타임은 /public/ 이 없음 (public/* 는 사이트 루트로 복사됨)
const HERO_BASE = "/hero/";
const NFT_PREVIEW_BASE = "/nft-preview/";
const CONFIG_BASE = "/config/";

// JSON 경로
const PRESALE_JSON = CONFIG_BASE + "presale.json";
const ADDRESSES_JSON = CONFIG_BASE + "addresses.json";

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
   NFT PREVIEW (publicnft-preview1..6.jpg 자동 주입)
   HTML에 <img data-nft="1" ...> ~ <img data-nft="6" ...> 존재해야 함
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
    el.onerror = () => {
      // 파일명이 다르거나 누락되면 콘솔에 표시
      console.warn(`[NFT] missing: publicnft-preview${n}.jpg`);
    };
  });
}
document.addEventListener("DOMContentLoaded", injectNftPreview);

/* ---------------------------------------------------------
   CONFIG LOAD (presale + addresses)
--------------------------------------------------------- */
async function loadRuntimeConfig() {
  try {
    const [presale, addrs] = await Promise.all([
      fetch(PRESALE_JSON).then((r) => r.json()),
      fetch(ADDRESSES_JSON).then((r) => r.json()),
    ]);
    (window as any).__FLEX_CFG__ = { presale, addrs };
    // 필요하면 여기서 UI 갱신
  } catch (e) {
    console.warn("Config load failed:", e);
  }
}
loadRuntimeConfig();
