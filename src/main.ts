const $ = (sel:string, el:Document|HTMLElement=document)=>el.querySelector(sel)! as HTMLElement;
const app = $('#app');

const HERO_IMAGES = [
  "/public/hero/1.jpg",
  "/public/hero/2.jpg",
  "/public/hero/3.jpg",
  "/public/hero/4.jpg",
  "/public/hero/5.jpg",
  "/public/hero/6.jpg",
  "/public/hero/7.jpg",
];

// 캐시 버스터
const v = Date.now();

function heroSection(){
  const wrap = document.createElement('section');
  wrap.className = 'section';
  wrap.innerHTML = `
    <div class="hero-wrap hero">
      <img id="hero-img" alt="Flexcoin Hero" src="${HERO_IMAGES[0]}?v=${v}">
    </div>
  `;
  // (선택) 자동 슬라이드 – 이미지가 있으면 돌려줌
  let idx = 0;
  setInterval(()=> {
    idx = (idx+1) % HERO_IMAGES.length;
    (document.getElementById('hero-img') as HTMLImageElement).src = `${HERO_IMAGES[idx]}?v=${v}`;
  }, 5000);
  return wrap;
}

function countdownSection(){
  // KST 2025-12-01 00:00
  const target = new Date('2025-12-01T00:00:00+09:00').getTime();
  const box = document.createElement('section');
  box.className = 'section center';
  box.innerHTML = `
    <h2>Presale starts in</h2>
    <div id="cd" class="badge" style="font-size:1.25rem;font-weight:700">--d --h --m --s</div>
  `;
  const cd = $('#cd', box);
  const tick = ()=>{
    const now = Date.now();
    let diff = Math.max(0, target - now);
    const d = Math.floor(diff/86400000); diff%=86400000;
    const h = Math.floor(diff/3600000);  diff%=3600000;
    const m = Math.floor(diff/60000);    diff%=60000;
    const s = Math.floor(diff/1000);
    cd.textContent = `${d}d ${h}h ${m}m ${s}s`;
  };
  tick(); setInterval(tick, 1000);
  return box;
}

function tokenomicsSection(){
  const box = document.createElement('section');
  box.className = 'section';
  box.innerHTML = `
    <h2>토크노믹스</h2>
    <div class="kv">
      <div>Total</div><div>1,000,000,000 $FLEX</div>
      <div>LP</div><div>69%</div>
      <div>Presale</div><div>10% (90d vesting)</div>
      <div>Marketing</div><div>10%</div>
      <div>Team</div><div>10% (6m lock + 6m linear)</div>
      <div>Burn</div><div>1%</div>
    </div>
    <p class="small">* 그래프형 시각화는 다음 단계에서 추가</p>
  `;
  return box;
}

function roadmapSection(){
  const box = document.createElement('section');
  box.className = 'section';
  box.innerHTML = `
    <h2>로드맵</h2>
    <ol class="list">
      <li>Phase 1 — Survive in the memecoin sector</li>
      <li>Phase 2 — Community growth + listings</li>
      <li>Phase 3 — NFT utilities + more</li>
    </ol>
  `;
  return box;
}

function nftSection(){
  const box = document.createElement('section');
  box.className = 'section';
  box.innerHTML = `
    <h2>NFT 뽑내기</h2>
    <div class="grid cols-2">
      <div class="card">
        <div class="small">Demo only. Set contract in <code>src/main.ts</code>.</div>
        <div style="margin:12px 0;display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn" id="btn-connect">지갑 연결</button>
          <input id="mint-qty" type="number" value="1" min="1" max="10" style="width:80px;background:#100e0c;border:1px solid var(--border);color:var(--text);border-radius:8px;padding:8px">
          <button class="btn gold" id="btn-mint">민팅</button>
        </div>
        <div class="small" id="mint-msg">지갑 연결 후 민팅을 진행하세요.</div>
      </div>
      <div class="card">
        <div class="small">NFT 전용 페이지/도메인은 다음 단계에서 분리 연결</div>
        <div style="height:140px;display:flex;align-items:center;justify-content:center;border:1px dashed var(--border);border-radius:10px">NFT Preview</div>
      </div>
    </div>
  `;
  // 데모 클릭 메세지
  $('#btn-connect', box).addEventListener('click', ()=> $('#mint-msg', box).textContent = '지갑 연결(데모). 실제 컨트랙트 연결은 다음 단계에서 설정.');
  $('#btn-mint', box).addEventListener('click', ()=> $('#mint-msg', box).textContent = '민팅 요청(데모).');
  return box;
}

function linksSection(){
  const box = document.createElement('section');
  box.className = 'section';
  box.innerHTML = `
    <h2>Links</h2>
    <div class="grid cols-2">
      <div class="card">
        <div class="grid cols-2">
          <a class="btn" href="/" target="_blank" rel="noopener">Website</a>
          <a class="btn" href="https://x.com/Flexcoinmeme" target="_blank" rel="noopener">X / Twitter</a>
          <a class="btn" href="https://t.me/+p1BMrdypmDFmNTA1" target="_blank" rel="noopener">Telegram</a>
          <a class="btn" href="#" target="_blank" rel="noopener">Explorer (BscScan/Etherscan)</a>
        </div>
      </div>
      <div class="card">
        <div class="small">하단부 팀 공식 지갑/락 정보도 다음 단계에서 표로 추가</div>
      </div>
    </div>
  `;
  return box;
}

function footer(){
  const box = document.createElement('section');
  box.className = 'section center small';
  box.innerHTML = `<span class="badge">Flexcoin Multi-Path Loader (Vite)</span>`;
  return box;
}

/* 렌더 */
(function render(){
  const container = document.createElement('div');
  container.className = 'container';
  container.append(
    heroSection(),
    countdownSection(),
    tokenomicsSection(),
    roadmapSection(),
    nftSection(),
    linksSection(),
    footer(),
  );
  app.replaceWith(container);
})();
