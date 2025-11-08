
async function loadConfig(){const r=await fetch('config/addresses.json');return await r.json()}
function byId(id){return document.getElementById(id)}
function setLink(id,href){const el=byId(id); if(el) el.href=href}
function heroRotate(){
  const img = byId('hero-img')
  const list = [1,2,3,4,5,6,7].map(n=>`public/hero/${n}.jpg`)
  let i=0
  setInterval(()=>{ img.src=list[i%list.length]; i++ }, 4000)
}
function mountPreview(){
  const root = byId('preview')
  const items = Array.from({length:8}, (_,i)=>i+1)
  root.innerHTML = items.map(n=>`<img alt="preview${n}" loading="lazy" src="public/nft-preview/${n}.jpg">`).join('')
}
function mountOnChain(cfg){
  const rows = [
    ['토큰', cfg.token, cfg.links.bscscan],
    ['팀/락', cfg.teamLock, `https://bscscan.com/address/${cfg.teamLock}`],
    ['마케팅/에어드롭', cfg.marketing, `https://bscscan.com/address/${cfg.marketing}`],
    ['사용자(수신)', cfg.userReceiving, `https://bscscan.com/address/${cfg.userReceiving}`],
    ['불/버닝', cfg.burn, `https://bscscan.com/address/${cfg.burn}`],
    ['데드(블랙홀)', cfg.dead, `https://bscscan.com/address/${cfg.dead}`],
  ]
  const tbody = byId('onchain-tbody')
  tbody.innerHTML = rows.map(([k,v,l])=>`<tr><td>${k}</td><td><a href="${l}" target="_blank" rel="noopener">${v}</a></td></tr>`).join('')
}
function donutChart(){
  const ctx=document.getElementById('chart').getContext('2d')
  new Chart(ctx,{type:'doughnut',data:{labels:['LP 69%','Presale 10%','Marketing 10%','Team 10%','Burn 1%'],datasets:[{data:[69,10,10,10,1]}]},options:{plugins:{legend:{position:'bottom'}}}})
}
function roadmap(list){const ul = byId('roadmap'); ul.innerHTML = list.map(s=>`<li>${s}</li>`).join('')}
function whitepapers(){const langs=[['en','영어'],['ko','한국어'],['ja','일본어'],['zh','중국어'],['es','스페인어'],['de','독일어'],['pt','포르투갈어'],['it','이탈리아어']]; const root=byId('wplist'); root.innerHTML = langs.map(([k,l])=>`<a class="btn" download href="whitepaper/whitepaper-${k}.pdf">PDF — ${l}</a>`).join('')}
async function boot(){const cfg=await loadConfig(); setLink('btn-pancake', cfg.links.pancake); setLink('btn-telegram', cfg.links.telegram); setLink('btn-x', cfg.links.x); setLink('btn-bscscan', cfg.links.bscscan); heroRotate(); mountPreview(); mountOnChain(cfg); donutChart(); roadmap(cfg.roadmap); whitepapers()}
document.addEventListener('DOMContentLoaded', boot)
