import { resolveHeroMain } from './utils/heroLoader'
import { fetchAllocations, fetchAddresses, applyTokenomics, applyAddresses } from './utils/runtimeConfig'

(async ()=>{
  const heroMain = await resolveHeroMain();
  const heroEl = document.querySelector('#hero-img') as HTMLImageElement | null;
  if(heroEl){ heroEl.src = heroMain; }

  const alloc = await fetchAllocations();
  const addr  = await fetchAddresses();
  applyTokenomics(alloc);
  applyAddresses(addr);
})();
