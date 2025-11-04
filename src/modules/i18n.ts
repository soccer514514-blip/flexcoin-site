
export async function loadLang(code:string){
  try{
    const res = await fetch(`/i18n/${code}.json`, { cache: 'no-store' })
    if(res.ok) return await res.json()
  }catch{}
  return {
    "t-hero-title": "Flexcoin",
    "t-hero-sub": "Memecoin 섹터에서 살아남기",
    "t-tokenomics-title": "토큰노믹스",
    "t-roadmap-title": "로드맵",
    "t-nft-title": "NFT 민팅"
  }
}
export function applyI18n(d:any){
  Object.keys(d).forEach(id=>{
    const el = document.getElementById(id)
    if (el) el.textContent = d[id]
  })
}
