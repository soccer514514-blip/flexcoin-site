// src/main.ts
type AllocCfg = {
  lp:number; presale:number; team:number; marketing:number; burn:number;
  rates?:{ presale?:string; listing?:string }; softcap?:number; hardcap?:number;
};
type AddrCfg = {
  chainId?: number;
  token?: string; team?: string; marketing?: string; presale?: string; burn?: string; user?: string;
};
type PresaleCfg = {
  pinksale_url?: string; pancakeswap_url?: string;
  start?: string; end?: string;
  rates?: { presale?:string; listing?:string };
  softcap?: number; hardcap?: number;
};

// ---------- helpers ----------
const $ = <T extends HTMLElement>(sel:string)=>document.querySelector<T>(sel)!;

async function json<T=any>(url:string, fallback:T):Promise<T>{
  try{ return await (await fetch(url,{cache:"no-cache"})).json(); }
  catch{ return fallback; }
}
function pct(n:number){ return `${(+n).toFixed(0)}%`; }
function link(el:HTMLElement | null, href?:string){ if(!el) return; if(href){ (el as HTMLAnchorElement).href = href; el.removeAttribute("aria-disabled"); } else { el.setAttribute("aria-disabled","true"); } }

// ---------- hero loader ----------
function resolveHero(): string {
  // prefer /hero/main.jpg -> fallback /hero/1.jpg
  return "/hero/main.jpg";
}

// ---------- donut ----------
function drawDonut(cfg:AllocCfg){
  const total = cfg.lp+cfg.presale+cfg.team+cfg.marketing+cfg.burn || 100;
  const parts = [
    {k:"lp",        v:cfg.lp,        color:"#f7c843"},
    {k:"presale",   v:cfg.presale,   color:"#ff8f3a"},
    {k:"team",      v:cfg.team,      color:"#7ddc7a"},
    {k:"marketing", v:cfg.marketing, color:"#67b7ff"},
    {k:"burn",      v:cfg.burn,      color:"#ec6a6a"},
  ];
  const R=45, C=60, ST=16, Circ=2*Math.PI*R;
  const svg = $("#donut") as unknown as SVGSVGElement;
  svg.innerHTML = `<circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="#2a2418" stroke-width="${ST}"></circle>`;
  let offset=0;
  parts.forEach(p=>{
    const frac = Math.max(0, p.v/total);
    const len = frac * Circ;
    const path = document.createElementNS("http://www.w3.org/2000/svg","circle");
    path.setAttribute("cx", String(C));
    path.setAttribute("cy", String(C));
    path.setAttribute("r", String(R));
    path.setAttribute("fill","none");
    path.setAttribute("stroke", p.color);
    path.setAttribute("stroke-width", String(ST));
    path.setAttribute("stroke-dasharray", `${len} ${Circ-len}`);
    path.setAttribute("stroke-dashoffset", String(-offset));
    path.setAttribute("transform", `rotate(-90 ${C} ${C})`);
    svg.appendChild(path);
    offset += len;
  });

  // legend %
  (document.querySelector('[data-tok-lp]') as HTMLElement).textContent = pct(cfg.lp);
  (document.querySelector('[data-tok-presale]') as HTMLElement).textContent = pct(cfg.presale);
  (document.querySelector('[data-tok-team]') as HTMLElement).textContent = pct(cfg.team);
  (document.querySelector('[data-tok-mkt]') as HTMLElement).textContent = pct(cfg.marketing);
  (document.querySelector('[data-tok-burn]') as HTMLElement).textContent = pct(cfg.burn);
}

// ---------- countdown ----------
function startCountdown(startISO?:string, endISO?:string){
  const el=$("#countdown");
  const win=$("#presale-window");
  if(!startISO || !endISO){ el.textContent="—"; win.textContent="—"; return; }

  const start = new Date(startISO).getTime();
  const end   = new Date(endISO).getTime();
  win.textContent = new Date(startISO).toLocaleString() + " → " + new Date(endISO).toLocaleString();

  function fmt(ms:number){
    const s=Math.max(0,Math.floor(ms/1000));
    const d=Math.floor(s/86400), h=Math.floor((s%86400)/3600), m=Math.floor((s%3600)/60), ss=s%60;
    return `${d}d ${h}h ${m}m ${ss}s`;
  }

  function tick(){
    const now=Date.now();
    if(now<start){ el.textContent="Starts in "+fmt(start-now); }
    else if(now<=end){ el.textContent="Ends in "+fmt(end-now); }
    else{ el.textContent="Finished"; clearInterval(tid); }
  }
  tick();
  const tid=setInterval(tick,1000);
}

// ---------- lightbox ----------
function bindLightbox(selector:string){
  const box=$("#lightbox"), img=box.querySelector("img")!;
  document.querySelectorAll<HTMLImageElement>(selector).forEach(i=>{
    i.addEventListener("click",()=>{ img.src=i.src; (box as HTMLElement).style.display="grid"; });
  });
  box.addEventListener("click",()=> (box as HTMLElement).style.display="none");
}

// ---------- i18n ----------
async function setLang(lang:string){
  const dict = await json<Record<string,string>>(`/i18n/${lang}.json`, {});
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach(el=>{
    const k = el.getAttribute("data-i18n")!;
    if(dict[k]) el.textContent = dict[k];
  });
  localStorage.setItem("lang", lang);
  document.querySelectorAll<HTMLButtonElement>("#lang-pill [data-lang]").forEach(b=>b.classList.toggle("active",(b.dataset.lang||"en")===lang));
}

// ---------- boot ----------
(async () => {
  // hero
  const hero=$("#hero-img"); hero.src = resolveHero();

  // runtime config
  const alloc = await json<AllocCfg>("/config/allocations.json", {lp:54,presale:20,team:15,marketing:10,burn:1});
  const addr  = await json<AddrCfg>("/config/addresses.json",  {});
  const ps    = await json<PresaleCfg>("/config/presale.json", {});

  drawDonut(alloc);

  // rates / caps
  if(alloc.rates?.presale || ps.rates?.presale)  ($('[data-presale-rate]') as HTMLElement).textContent = alloc.rates?.presale || ps.rates?.presale || "";
  if(alloc.rates?.listing || ps.rates?.listing)  ($('[data-listing-rate]') as HTMLElement).textContent = alloc.rates?.listing || ps.rates?.listing || "";
  if(alloc.softcap || ps.softcap) (document.querySelector('[data-softcap]') as HTMLElement).textContent = String(alloc.softcap ?? ps.softcap ?? "—");
  if(alloc.hardcap || ps.hardcap) (document.querySelector('[data-hardcap]') as HTMLElement).textContent = String(alloc.hardcap ?? ps.hardcap ?? "—");

  // buttons / links
  link($('#btn-swap'), ps.pancakeswap_url);
  const pink = $('#btn-pinksale') as HTMLAnchorElement;
  if (ps.pinksale_url && ps.pinksale_url.length>8) { pink.href = ps.pinksale_url; pink.textContent="Pinksale"; }
  else { pink.textContent="Pinksale (coming soon)"; pink.removeAttribute('href'); pink.setAttribute('disabled',''); }

  const base = (a?:string)=> a ? `https://bscscan.com/address/${a}` : '';
  (document.querySelector('[data-addr-token]')   as HTMLAnchorElement).href = base(addr.token);
  (document.querySelector('[data-addr-team]')    as HTMLAnchorElement).href = base(addr.team);
  (document.querySelector('[data-addr-mkt]')     as HTMLAnchorElement).href = base(addr.marketing);
  (document.querySelector('[data-addr-presale]') as HTMLAnchorElement).href = base(addr.presale);
  (document.querySelector('[data-addr-burn]')    as HTMLAnchorElement).href = base(addr.burn);
  (document.querySelector('[data-addr-user]')    as HTMLAnchorElement).href = base(addr.user);

  // countdown
  startCountdown(ps.start, ps.end);

  // lightbox
  bindLightbox("#action-gallery img, #nft-gallery img");

  // i18n init/bind
  const wanted = new URL(location.href).searchParams.get("lang") || localStorage.getItem("lang") || "en";
  await setLang(wanted);
  document.querySelectorAll<HTMLButtonElement>("#lang-pill [data-lang]").forEach(btn=>{
    btn.addEventListener("click",()=> setLang(btn.dataset.lang || "en"));
  });
})();
