
// Runtime config loader (safe merge + pinksale button control)
export async function fetchAllocations(){
  const DEFAULTS = {
    tokenomics:{lp:54,presale:20,team:15,marketing:10,burn:1},
    presale:{softcap_bnb:30,hardcap_bnb:100,rate_flex_per_bnb:2000000,listing_rate_flex_per_bnb:1600000,
             start_kst:"2025-12-01T21:00:00+09:00",end_kst:"2026-01-01T21:00:00+09:00",pinksale_url:""},
    version:"v5.2"
  };
  try{
    const res = await fetch("/config/allocations.json",{cache:"no-cache"});
    const raw = await res.json();
    return {
      tokenomics:Object.assign({},DEFAULTS.tokenomics,raw?.tokenomics||{}),
      presale:Object.assign({},DEFAULTS.presale,raw?.presale||{}),
      version:raw?.version||DEFAULTS.version
    };
  }catch(e){ return DEFAULTS; }
}
export async function fetchAddresses(){
  const res = await fetch("/config/addresses.json",{cache:"no-cache"});
  return await res.json();
}
function setText(sel,t){ const el=document.querySelector(sel); if(el) el.textContent=t; }
function setHref(sel,h){ const a=document.querySelector(sel); if(a) a.href=h; }
export function applyTokenomics(a){
  setText("[data-tok-lp]",a.tokenomics.lp+"%");
  setText("[data-tok-presale]",a.tokenomics.presale+"%");
  setText("[data-tok-team]",a.tokenomics.team+"%");
  setText("[data-tok-mkt]",a.tokenomics.marketing+"%");
  setText("[data-tok-burn]",a.tokenomics.burn+"%");
  setText("[data-presale-rate]","1 BNB = "+a.presale.rate_flex_per_bnb.toLocaleString()+" FLEX");
  setText("[data-listing-rate]","1 BNB = "+a.presale.listing_rate_flex_per_bnb.toLocaleString()+" FLEX");
  setText("[data-softcap]",a.presale.softcap_bnb+" BNB");
  setText("[data-hardcap]",a.presale.hardcap_bnb+" BNB");
  const btn=document.getElementById("pinksale-btn");
  if(btn){
    if(a.presale.pinksale_url && /^https?:\/\//.test(a.presale.pinksale_url)){
      btn.removeAttribute("disabled");
      btn.textContent="Buy FLEX (Pinksale)";
      btn.onclick=()=>window.open(a.presale.pinksale_url,"_blank");
    }else{
      btn.setAttribute("disabled","true");
      btn.textContent="Pinksale (coming soon)";
      btn.onclick=null;
    }
  }
}
export function applyAddresses(addr){
  const ex=(addr.chain?.explorer||"").replace(/\/+$/,"")+"/";
  setHref("[data-addr-token]",ex+addr.token);
  setHref("[data-addr-team]",ex+addr.team_lock);
  setHref("[data-addr-mkt]",ex+addr.marketing);
  setHref("[data-addr-presale]",ex+addr.presale);
  setHref("[data-addr-burn]",ex+addr.burn);
}
