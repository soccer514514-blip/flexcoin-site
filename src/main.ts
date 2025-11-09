import { resolveHeroMain } from "/src/utils/heroLoader";
import { fetchAllocations, fetchAddresses, applyTokenomics, applyAddresses } from "/src/utils/runtimeConfig";

(async ()=>{
  const heroMain = await resolveHeroMain();
  document.querySelector("#hero-img")?.setAttribute("src", heroMain);

  const alloc = await fetchAllocations();
  const addr  = await fetchAddresses();
  applyTokenomics(alloc);
  applyAddresses(addr);
})();
