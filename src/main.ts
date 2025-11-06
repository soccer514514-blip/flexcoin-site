// Links + countdown + hero rotator
const LINKS = {
  presale: "https://example.com/presale",
  twitter: "https://x.com/Flexcoinmeme",
  telegram: "https://t.me/+p1BMrdypmDFmNTA1"
};

const COUNTDOWN_TARGET = "2025-12-01T00:00:00+09:00"; // KST
const HERO_IMAGES = ["/hero/1.jpg","/hero/2.jpg","/hero/3.jpg","/hero/4.jpg"];

function byId(id:string){return document.getElementById(id);}

function bindLinks(){
  byId("btn-presale")?.addEventListener("click",()=>open(LINKS.presale,"_blank"));
  byId("btn-x")?.addEventListener("click",()=>open(LINKS.twitter,"_blank"));
  byId("btn-telegram")?.addEventListener("click",()=>open(LINKS.telegram,"_blank"));
  const lnkX = document.getElementById("lnk-x") as HTMLAnchorElement; if (lnkX) lnkX.href = LINKS.twitter;
  const lnkT = document.getElementById("lnk-telegram") as HTMLAnchorElement; if (lnkT) lnkT.href = LINKS.telegram;
  const lnkW = document.getElementById("lnk-website") as HTMLAnchorElement; if (lnkW) lnkW.href = location.origin;
}

function startCountdown(){
  const box = byId("countdown"); if (!box) return;
  const target = new Date(COUNTDOWN_TARGET).getTime();
  function tick(){
    const now = Date.now();
    let d = Math.max(0, target - now);
    const days = Math.floor(d/86400000); d%=86400000;
    const hrs = Math.floor(d/3600000); d%=3600000;
    const min = Math.floor(d/60000); d%=60000;
    const sec = Math.floor(d/1000);
    box.textContent = `Presale starts in ${days}d ${hrs}h ${min}m ${sec}s`;
  }
  tick();
  setInterval(tick,1000);
}

function startHero(){
  const el = document.getElementById("hero-rotator"); if(!el) return;
  let i = 0;
  const setBg = ()=> { el.style.backgroundImage = `url('${HERO_IMAGES[i%HERO_IMAGES.length]}')`; i++; };
  setBg();
  setInterval(setBg, 5000);
}

bindLinks();
startCountdown();
startHero();
