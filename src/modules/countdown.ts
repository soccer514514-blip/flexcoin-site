
function pad(n:number){return n<10?'0'+n:''+n}
function remain(ms:number){
  const d=Math.floor(ms/86400000)
  const h=Math.floor((ms/3600000)%24)
  const m=Math.floor((ms/60000)%60)
  const s=Math.floor((ms/1000)%60)
  return {d,h,m,s}
}
export async function initCountdown(){
  let iso = '2025-12-01T00:00:00+09:00'
  try {
    const res = await fetch('./config/config.presale.json', { cache:'no-store' })
    if (res.ok){
      const cfg = await res.json()
      if (cfg?.PRESALE_START_ISO) iso = cfg.PRESALE_START_ISO
    }
  } catch {}
  const target = new Date(iso).getTime()
  const el = (id:string)=>document.getElementById(id)!
  const D=el('cd-days'), H=el('cd-hours'), M=el('cd-mins'), S=el('cd-secs')
  const tick = ()=>{
    const diff = Math.max(0, target - Date.now())
    const r = remain(diff)
    D.textContent = pad(r.d); H.textContent = pad(r.h); M.textContent = pad(r.m); S.textContent = pad(r.s)
  }
  tick(); setInterval(tick, 1000)
}
