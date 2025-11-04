export async function loadLang(code:string){
  const res = await fetch(`/i18n/${code}.json`, { cache: 'no-store' })
  return await res.json()
}
export function applyI18n(d:any){
  const dict:Record<string,string> = d
  const ids = Object.keys(dict)
  ids.forEach(id=>{
    const el = document.getElementById(id)
    if (el) el.textContent = dict[id]
  })
}
export function setLang(code:string){
  localStorage.setItem('lang', code)
}