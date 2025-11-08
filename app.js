const heroImgs = Array.from({length:8}, (_,i)=>`public/hero/${i+1}.jpg`);
const actionImgs = Array.from({length:8}, (_,i)=>`public/action/${i+1}.jpg`);
const nftImgs = Array.from({length:8}, (_,i)=>`public/nft-preview/${i+1}.jpg`);

async function getAddresses(){
  const r = await fetch(`config/addresses.json?v=${Date.now()}`);
  return r.json();
}
function preload(urls){ urls.forEach(u=>{ const im=new Image(); im.src=u; }); }

function drawDonut(canvas, items){
  const ctx = canvas.getContext('2d');
  const DPR = window.devicePixelRatio || 1;
  const W = canvas.clientWidth * DPR, H = canvas.clientHeight * DPR;
  canvas.width=W; canvas.height=H;
  const cx=W/2, cy=H/2, R=Math.min(W,H)/2-8*DPR, r=R*0.62;
  const total = items.reduce((a,b)=>a+b.value,0)||1;
  let a0 = -Math.PI/2;
  const base = [50,120,190,260,320];
  items.forEach((it,i)=>{
    const a1 = a0 + 2*Math.PI*(it.value/total);
    const hue = base[i%base.length];
    ctx.beginPath();
    ctx.arc(cx,cy,R,a0,a1);
    ctx.arc(cx,cy,r,a1,a0,true);
    ctx.closePath();
    ctx.fillStyle = `hsl(${hue} 80% 58%)`;
    ctx.fill();
    a0=a1;
  });
  ctx.fillStyle = '#f5e6b3';
  ctx.font = `${16*DPR}px system-ui`;
  ctx.textAlign='center';
  ctx.fillText('Tokenomics', cx, cy+6*DPR);
}

function renderGrid(el, srcs, labelPrefix){
  el.innerHTML = srcs.map((src,i)=>`
    <div class="card">
      <img alt="${labelPrefix} ${i+1}" src="${src}"/>
      <div class="title">${labelPrefix} ${i+1}</div>
    </div>
  `).join('');
}
function zero2(n){ return n.toString().padStart(2,'0'); }

(async function init(){
  const addr = await getAddresses();
  const token = addr.token;
  document.getElementById('buy').href = `https://pancakeswap.finance/swap?outputCurrency=${token}`;
  document.getElementById('scan').href = `https://bscscan.com/token/${token}`;
  document.getElementById('tg').href = 'https://t.me/+p1BMrdypmDFmNTA1';
  document.getElementById('x').href = 'https://x.com/Flexcoinmeme';

  const hero = document.getElementById('hero-img');
  let idx=0;
  setInterval(()=>{
    idx=(idx+1)%heroImgs.length;
    hero.style.opacity=0.0;
    setTimeout(()=>{ hero.src=heroImgs[idx]; hero.style.opacity=1; }, 200);
  }, 3500);

  preload([...heroImgs, ...actionImgs, ...nftImgs]);

  const target = new Date('2025-12-01T12:00:00Z').getTime();
  function tick(){
    const now = Date.now();
    let s = Math.max(0, Math.floor((target-now)/1000));
    const d = Math.floor(s/86400); s-=d*86400;
    const h = Math.floor(s/3600); s-=h*3600;
    const m = Math.floor(s/60); s-=m*60;
    document.getElementById('dd').textContent=d;
    document.getElementById('hh').textContent=zero2(h);
    document.getElementById('mm').textContent=zero2(m);
    document.getElementById('ss').textContent=zero2(s);
  }
  tick(); setInterval(tick,1000);

  renderGrid(document.getElementById('action-grid'), actionImgs, 'Action');
  renderGrid(document.getElementById('nft-grid'), nftImgs, 'NFT');

  const tokenomics = [
    {label:'Liquidity Pool', value:69},
    {label:'Presale', value:10},
    {label:'Marketing', value:10},
    {label:'Team (Lock 6m + 6m linear)', value:10},
    {label:'Burn', value:1},
  ];
  drawDonut(document.getElementById('donut'), tokenomics);
  document.getElementById('legend').innerHTML = tokenomics.map((t,i)=>`
    <div style="display:flex;align-items:center;gap:8px">
      <span style="width:12px;height:12px;border-radius:50%;background:hsl(${[50,120,190,260,320][i%5]} 80% 58%)"></span>
      <span>${t.label}: <b>${t.value}%</b></span>
    </div>
  `).join('');

  const langs = ['en','ko','ja','zh','es','de','pt','it'];
  const grid = document.getElementById('wp-grid');
  grid.innerHTML = langs.map(code=>{
    const label = code.toUpperCase() + ' PDF';
    return `<a class="card" href="public/whitepaper/whitepaper_${code}.pdf" target="_blank"><div class="title">${label}</div></a>`;
  }).join('');

  document.getElementById('footer').textContent =
    `Team/Lock: ${addr.team} • Marketing: ${addr.marketing} • Receiver: ${addr.receiver} • Burn: ${addr.burn}`;
})();