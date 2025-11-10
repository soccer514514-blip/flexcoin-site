import { resolveHeroMain, startHeroRotate } from "./utils/heroLoader";
import { fetchAllocations, fetchAddresses, applyTokenomics, applyAddresses } from "./utils/runtimeConfig";

(async () => {
  const heroEl = document.getElementById("hero-img") as HTMLImageElement | null;
  if (heroEl) {
    heroEl.src = await resolveHeroMain();
    startHeroRotate(heroEl, 8, 6000);
  }
  const alloc = await fetchAllocations();
  const addr  = await fetchAddresses();
  applyTokenomics(alloc);
  applyAddresses(addr);
})();
