import './styles.css';

type Addr = {
  chainId:number; name:string; symbol:string;
  token:string; team_wallet:string; marketing_wallet:string; presale_wallet:string; burn_wallet:string; receiver_wallet:string;
  explorer:string; pancakeswap_buy:string;
};
type Presale = {
  presale_start_kst:string; presale_end_kst:string;
  tokenomics:{label:string,value:number}[];
  socials?:{telegram?:string; twitter?:string};
};

async function loadJSONFlexible<T>(paths:string[], defaults?:Partial<T>):Promise<T>{
  let lastErr:any;
  for (const p of paths){
    try {
      const url = p.startsWith('http') ? p : (p.startsWith('/') ? p : `/${p}`);
      const res = await fetch(url + `?v=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const obj = await res.json();
      return { ...(defaults as any || {}), ...(obj||{}) };
    } catch(e){ lastErr = e; }
  }
  if (defaults) return defaults as T;
  throw lastErr ?? new Error('All paths failed');
}

function fmt(n:number){ return n.toString().padStart(2,'0'); }

function renderCountdown(el:HTMLElement, targetISO:string){
  function tick(){
    const target = new Date(targetISO).getTime();
    const now = Date.now();
    let diff = Math.max(0, target - now);
    const s = Math.floor(diff/1000)%60;
    const m = Math.floor(diff/1000/60)%60;
    const h = Math.floor(diff/1000/3600)%24;
    const d = Math.floor(diff/1000/86400);
    el.innerHTML = `<div class="countdown">
      <div class="box"><b>${d}</b> days</div>
      <div class="box"><b>${fmt(h)}</b> hrs</div>
      <div class="box"><b>${fmt(m)}</b> min</div>
      <div class="box"><b>${fmt(s)}</b> sec</div>
    </div>`;
  }
  tick(); setInterval(tick, 1000);
}

function rotator(images:string[], mount:HTMLElement){
  let idx = 0;
  const imgA = document.createElement('img');
  const imgB = document.createElement('img');
  imgA.style.opacity = '1'; imgB.style.opacity='0';
  imgA.src = images[0]; imgB.src = images[1%images.length];
  mount.appendChild(imgA); mount.appendChild(imgB);
  setInterval(()=>{
    idx = (idx+1)%images.length;
    const showA = (idx%2===0);
    (showA?imgA:imgB).src = images[idx];
    imgA.style.opacity = showA?'1':'0';
    imgB.style.opacity = showA?'0':'1';
  }, 3500);
}

async function main(){
  const app = document.getElementById('app')!;
  try {
    const addrDefaults: Addr = {
      chainId:56, name:'BNB Smart Chain', symbol:'BNB',
      token:'0xBa29562241F0489504C493c47aCBA16d7a98998f',
      team_wallet:'0x8865331fD7AA6e63fC1C01882F0fE40AbC58bB30',
      marketing_wallet:'0xF3A2159474dCE4eF86F6eE56cE1b55C60E2C467e',
      presale_wallet:'0x66F4cEb1C3dEb2084cdc02Aa3c318CF680E0A672',
      burn_wallet:'0x388a9106d392937938721d6dd09cf1f331c2860f',
      receiver_wallet:'0xCDcA475e1C6D89A14158fB8D05fA8275Bf5A06Ea',
      explorer:'https://bscscan.com',
      pancakeswap_buy:'https://pancakeswap.finance/swap?outputCurrency=0xBa29562241F0489504C493c47aCBA16d7a98998f&chain=bsc'
    };
    const addr = await loadJSONFlexible<Addr>(['/config/addresses.json','config/addresses.json','addresses.json'], addrDefaults);

    const preDefaults: Presale = {
      presale_start_kst: '2025-12-01T21:00:00+09:00',
      presale_end_kst: '2026-01-01T21:00:00+09:00',
      tokenomics: [
        {label:'Liquidity Pool', value:69},
        {label:'Presale', value:10},
        {label:'Marketing', value:10},
        {label:'Team (Lock 6m + 6m linear)', value:10},
        {label:'Burn', value:1},
      ],
      socials: { telegram: 'https://t.me/+p1BMrdypmDFmNTA1', twitter: 'https://x.com/Flexcoinmeme' }
    };
    const pre = await loadJSONFlexible<Presale>(['/config/presale.json','config/presale.json','presale.json'], preDefaults);

    // IMPORTANT: Vite copies /public/* to root. So production paths must NOT include /public.
    const heroImgs = Array.from({length:7}, (_,i)=>`/hero/${i+1}.jpg`);
    const actionImgs = Array.from({length:8}, (_,i)=>`/action/${i+1}.jpg`);
    const nftImgs = Array.from({length:8}, (_,i)=>`/nft-preview/${i+1}.jpg`);

    // Preload to reduce flicker
    preload([...heroImgs, ...actionImgs, ...nftImgs]);

    app.innerHTML = `
      <div class="container">
        <h1 class="h1">Flexcoin — The Meme Coin of Luxury</h1>
        <div class="hero" id="hero"><span class="badge">FLEX • BSC (${addr.chainId})</span></div>
        <p class="h2">Presale starts: <b>${new Date(pre.presale_start_kst).toLocaleString()}</b></p>
        <div id="cd"></div>
        <div style="margin:8px 0 20px 0;display:flex;gap:10px;flex-wrap:wrap">
          <a class="btn gold" href="${addr.pancakeswap_buy}" target="_blank">Buy on PancakeSwap</a>
          <a class="btn" href="${addr.explorer}/token/${addr.token}" target="_blank">BscScan: Token</a>
          <a class="btn" href="${pre.socials?.telegram || '#'}" target="_blank">Telegram</a>
          <a class="btn" href="${pre.socials?.twitter || '#'}" target="_blank">X (Twitter)</a>
        </div>

        <h2 class="h2">Action Preview</h2>
        <div class="row cols-4" id="action"></div>

        <h2 class="h2">NFT Preview — Flex Your NFT</h2>
        <div class="row cols-4" id="nft"></div>

        <h2 class="h2">Tokenomics</h2>
        <div id="donut-wrap"><canvas id="donut"></canvas><div id="legend" style="display:flex;flex-direction:column;gap:6px;"></div></div>
        <div class="tokenomics">${(pre.tokenomics||[]).map(t=>`<span class="chip">${t.label}: <b>${t.value}%</b></span>`).join('')}</div>

        <div class="h2" style="margin-top:18px">Whitepaper (8 Languages)</div>
        <div class="row cols-4">
          ${['en','ko','ja','zh','es','de','pt','it'].map(l=>`<a class="card btn" style="text-align:center;padding:18px" href="/whitepaper/whitepaper_${l}.pdf" target="_blank">${l.toUpperCase()} PDF</a>`).join('')}
        </div>

        <div class="footer">
          Team/Lock: ${addr.team_wallet} • Marketing: ${addr.marketing_wallet} • Receiver: ${addr.receiver_wallet} • Burn: ${addr.burn_wallet}
        </div>
      </div>
    `;

    rotator(heroImgs, document.getElementById('hero')!);
    renderCountdown(document.getElementById('cd')!, pre.presale_start_kst);

    const action = document.getElementById('action')!;
    actionImgs.forEach(src=>{
      const card = document.createElement('div');
      card.className='card';
      card.innerHTML = `<img src="${src}" alt="Action Image"/>`;
      action.appendChild(card);
    });
    const nft = document.getElementById('nft')!;
    nftImgs.forEach(src=>{
      const card = document.createElement('div');
      card.className='card';
      card.innerHTML = `<img src="${src}" alt="NFT Preview"/>`;
      nft.appendChild(card);
    });

    const canvas = document.getElementById('donut') as HTMLCanvasElement | null;
    if (canvas) {
      drawDonut(canvas, pre.tokenomics || []);
      const legend = document.getElementById('legend');
      if (legend) legend.innerHTML = (pre.tokenomics||[]).map((t,i)=>`
        <div style="display:flex;align-items:center;gap:8px">
          <span style="width:12px;height:12px;border-radius:50%;background:hsl(${[50,120,190,260,320][i%5]} 80% 58%)"></span>
          <span>${t.label}: <b>${t.value}%</b></span>
        </div>`).join('');
    }
  } catch(e){
    const app = document.getElementById('app')!;
    app.innerHTML = `<div class="container"><div class="card" style="padding:16px">
      <b>Boot error</b><br/>${String(e)}
    </div></div>`;
    console.error(e);
  }
}

main();


/* === 1) 이미지 선로딩으로 플리커 줄이기 === */
function preload(urls:string[]){ urls.forEach(u=>{ const i = new Image(); i.src = u; }); }

/* === 2) 토크노믹스 도넛 그래프(순정 캔버스) === */
function drawDonut(canvas:HTMLCanvasElement, items:{label:string,value:number}[]){
  const ctx = canvas.getContext('2d')!;
  const DPR = (window as any).devicePixelRatio || 1;
  const W = canvas.clientWidth * DPR, H = canvas.clientHeight * DPR;
  canvas.width = W; canvas.height = H;
  const cx = W/2, cy = H/2, R = Math.min(W,H)/2 - 8*DPR, r = R*0.62;
  const total = (items||[]).reduce((a,b)=>a+(b?.value||0),0) || 1;
  let a0 = -Math.PI/2;
  const base = [50,120,190,260,320];
  (items||[]).forEach((it:any,idx:number)=>{
    const val = it?.value || 0;
    const a1 = a0 + 2*Math.PI*(val/total);
    const hue = base[idx%base.length];
    ctx.beginPath(); ctx.arc(cx,cy,R,a0,a1); ctx.arc(cx,cy,r,a1,a0,true); ctx.closePath();
    ctx.fillStyle = `hsl(${hue} 80% 58%)`; ctx.fill(); a0 = a1;
  });
  ctx.fillStyle = '#f5e6b3'; ctx.font = `${16*DPR}px system-ui`; ctx.textAlign = 'center';
  ctx.fillText('Tokenomics', cx, cy + 6*DPR);
}
/* === H4-1) 안내문/헬퍼 노드 전부 제거 (겹침 근본 차단) === */
(function cleanPlaceholders(){
  const sel = '.placeholder,.helper,[data-placeholder],[data-helper]';
  document.querySelectorAll(sel).forEach(n=>n.remove());
})();

/* === H4-2) 히어로/갤러리 이미지 선로딩(플리커 감소) === */
// 이미 이전에 preload([...heroImgs, ...actionImgs, ...nftImgs])를 넣었다면 유지하세요.
