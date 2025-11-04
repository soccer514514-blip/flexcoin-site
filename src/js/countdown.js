
function pad(n){return n<10?'0'+n:''+n}
function remain(target){
  const diff=Math.max(0, target-(new Date()));
  return {total:diff,
    d:Math.floor(diff/86400000),
    h:Math.floor((diff/3600000)%24),
    m:Math.floor((diff/60000)%60),
    s:Math.floor((diff/1000)%60)};
}
async function init(){
  try{
    const res=await fetch('./config/config.presale.json',{cache:'no-store'});
    const cfg=await res.json();
    const target=new Date(cfg.PRESALE_START_ISO);
    const D=document.getElementById('cd-days');
    const H=document.getElementById('cd-hours');
    const M=document.getElementById('cd-mins');
    const S=document.getElementById('cd-secs');
    function tick(){const r=remain(target);D.textContent=pad(r.d);H.textContent=pad(r.h);M.textContent=pad(r.m);S.textContent=pad(r.s);if(r.total<=0)clearInterval(t);}
    tick(); const t=setInterval(tick,1000);
  }catch(e){console.error(e)}
}
if(typeof window!=='undefined') init();
