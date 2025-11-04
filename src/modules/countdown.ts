function pad(n:number){return n<10?'0'+n:''+n}
function remain(ms:number){
  const d=Math.floor(ms/86400000)
  const h=Math.floor((ms/3600000)%24)
  const m=Math.floor((ms/60000)%60)
  const s=Math.floor((ms/1000)%60)
  return {d,h,m,s}
}

export async function initCountdown(){
  const res = await fetch('/config/config.presale.json', { cache: 'no-store' })
  const cfg = await res.json()
  const target = new Date(cfg.PRESALE_START_ISO).getTime()

  const elD = document.getElementById('cd-days')!
  const elH = document.getElementById('cd-hours')!
  const elM = document.getElementById('cd-mins')!
  const elS = document.getElementById('cd-secs')!

  function tick(){
    const now = Date.now()
    const diff = Math.max(0, target - now)
    const r = remain(diff)
    elD.textContent = pad(r.d)
    elH.textContent = pad(r.h)
    elM.textContent = pad(r.m)
    elS.textContent = pad(r.s)
  }
  tick()
  setInterval(tick, 1000)
}