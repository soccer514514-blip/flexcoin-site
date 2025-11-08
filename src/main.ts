import './styles.css';

type Addr = {
  chainId:number; name:string; symbol:string;
  token:string; team_wallet:string; marketing_wallet:string; presale_wallet:string; burn_wallet:string; receiver_wallet:string;
  explorer:string; pancakeswap_buy:string;
};
type Presale = {
  presale_start_kst:string; presale_end_kst:string;
  tokenomics:{label:string,value:number}[];
  socials:{telegram:string; twitter:string};
};

async function loadJSON<T>(path:string):Promise<T>{
  const res = await fetch(path); return await res.json();
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
  const addr = await loadJSON<Addr>('/config/addresses.json');
  const pre = await loadJSON<Presale>('/config/presale.json');

  const heroImgs = Array.from({length:7}, (_,i)=>`/public/hero/${i+1}.jpg`);
  const actionImgs = Array.from({length:8}, (_,i)=>`/public/action/${i+1}.jpg`);
  const nftImgs = Array.from({length:8}, (_,i)=>`/public/nft-preview/${i+1}.jpg`);

  app.innerHTML = `
    <div class="container">
      <h1 class="h1">Flexcoin — The Meme Coin of Luxury</h1>
      <div class="hero" id="hero"><span class="badge">FLEX • BSC (${addr.chainId})</span></div>
      <p class="h2">Presale starts: <b>${new Date(pre.presale_start_kst).toLocaleString()}</b></p>
      <div id="cd"></div>
      <div style="margin:8px 0 20px 0;display:flex;gap:10px;flex-wrap:wrap">
        <a class="btn gold" href="${addr.pancakeswap_buy}" target="_blank">Buy on PancakeSwap</a>
        <a class="btn" href="${addr.explorer}/token/${addr.token}" target="_blank">BscScan: Token</a>
        <a class="btn" href="${pre.socials.telegram}" target="_blank">Telegram</a>
        <a class="btn" href="${pre.socials.twitter}" target="_blank">X (Twitter)</a>
      </div>

      <h2 class="h2">Action Preview</h2>
      <div class="row cols-4" id="action"></div>

      <h2 class="h2">NFT Preview — Flex Your NFT</h2>
      <div class="row cols-4" id="nft"></div>

      <h2 class="h2">Tokenomics</h2>
      <div class="tokenomics">${pre.tokenomics.map(t=>`<span class="chip">${t.label}: <b>${t.value}%</b></span>`).join('')}</div>

      <div class="h2" style="margin-top:18px">Whitepaper (8 Languages)</div>
      <div class="row cols-4">
        ${['en','ko','ja','zh','es','de','pt','it'].map(l=>`<a class="card btn" style="text-align:center;padding:18px" href="/public/whitepaper/whitepaper_${l}.pdf" target="_blank">${l.toUpperCase()} PDF</a>`).join('')}
      </div>

      <div class="footer">
        Team/Lock: ${addr.team_wallet} • Marketing: ${addr.marketing_wallet} • Receiver: ${addr.receiver_wallet} • Burn: ${addr.burn_wallet}
      </div>
    </div>
  `;

  // mount hero rotator
  rotator(heroImgs, document.getElementById('hero')!);
  renderCountdown(document.getElementById('cd')!, pre.presale_start_kst);

  // render galleries
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
}

main();
