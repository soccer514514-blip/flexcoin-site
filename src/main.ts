// src/main.ts
import { resolveHeroMain, startHeroRotate } from "./utils/heroLoader";
import {
  fetchAllocations,
  fetchAddresses,
  applyTokenomics,
  applyAddresses,
} from "./utils/runtimeConfig";

(async () => {
  // ---- Hero 이미지 로더 + 로테이터
  const heroEl = document.getElementById("hero-img") as HTMLImageElement | null;
  if (heroEl) {
    heroEl.src = await resolveHeroMain();
    startHeroRotate(heroEl, 8, 6000);
  }

  // ---- 런타임 JSON (토크노믹스/프리세일/주소) 적용
  try {
    const alloc = await fetchAllocations();
    const addr = await fetchAddresses();
    applyTokenomics(alloc);
    applyAddresses(addr);
  } catch {
    // 네트워크 오류 등은 조용히 무시 (페이지 기본값 유지)
  }

  // ===== Language (EN/KR) very light loader =====
  async function setLang(lang: string) {
    try {
      const resp = await fetch(`/i18n/${lang}.json`, { cache: "no-cache" });
      const dict = await resp.json();
      document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (!key) return;
        const val = (dict as Record<string, string>)[key];
        if (typeof val === "string") el.textContent = val;
      });
      localStorage.setItem("lang", lang);
      const now = document.getElementById("lang-now");
      if (now) now.textContent = lang.toUpperCase();
    } catch {
      // 사일런트 실패
    }
  }

  // 초기 언어 결정: ?lang= → localStorage → en
  const wanted =
    new URL(location.href).searchParams.get("lang") ||
    localStorage.getItem("lang") ||
    "en";
  setLang(wanted);

  // 버튼 바인딩 (data-lang="en|ko")
  document.querySelectorAll<HTMLButtonElement>("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.dataset.lang || "en"));
  });
})();
