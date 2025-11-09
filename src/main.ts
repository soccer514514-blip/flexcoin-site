import { resolveHeroMain, startHeroRotate } from "./utils/heroLoader";
import { fetchAllocations, fetchAddresses, applyTokenomics, applyAddresses } from "./utils/runtimeConfig";

(async ()=>{
  const heroEl = document.getElementById("hero-img") as HTMLImageElement|null;
  if(heroEl){
    heroEl.src = await resolveHeroMain();
    startHeroRotate(heroEl, 8, 6000);
  }
  const alloc = await fetchAllocations();
  const addr  = await fetchAddresses();
  applyTokenomics(alloc);
  applyAddresses(addr);

  // Populate galleries
  const put = (id:string, folder:string)=>{
    const el=document.getElementById(id);
    if(!el) return;
    el.innerHTML = Array.from({length:8},(_,i)=>`<img class="resp" src="/${folder}/${i+1}.jpg" loading="lazy" alt="${folder} ${i+1}"/>`).join("");
  };
  put("action-grid","action");
  put("nft-grid","nft-preview");
})();
