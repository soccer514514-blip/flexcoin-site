
export async function resolveHeroMain(){
  const test=(u)=>new Promise(res=>{ const i=new Image(); i.onload=()=>res(true); i.onerror=()=>res(false); i.src=u; });
  const m="/hero/main.jpg"; return (await test(m))?m:"/hero/1.jpg";
}
