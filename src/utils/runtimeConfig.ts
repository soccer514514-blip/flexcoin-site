export type Allocations = {
  tokenomics: { lp:number; presale:number; team:number; marketing:number; burn:number };
  presale: { rate_flex_per_bnb:number; listing_rate:number; softcap_bnb:number; hardcap_bnb:number };
  schedule_kst: { start:string; end:string };
};
export type Addresses = {
  chain: { name:string; chainId:number };
  token: string; team_lock:string; marketing:string; presale_wallet:string; burn_wallet:string; user_wallet:string;
};

export async function fetchAllocations(): Promise<Allocations> {
  const r = await fetch('/config/allocations.json', { cache: 'no-store' });
  return r.json();
}
export async function fetchAddresses(): Promise<Addresses> {
  const r = await fetch('/config/addresses.json', { cache: 'no-store' });
  return r.json();
}

export function applyTokenomics(a: Allocations){
  const el = document.querySelector('#tokenomics');
  if(!el) return;
  el.innerHTML = `LP ${a.tokenomics.lp}% • Presale ${a.tokenomics.presale}% • Team ${a.tokenomics.team}% • Marketing ${a.tokenomics.marketing}% • Burn ${a.tokenomics.burn}%
  <br/>Presale: 1 BNB = ${a.presale.rate_flex_per_bnb.toLocaleString()} FLEX • Listing: 1 BNB = ${a.presale.listing_rate.toLocaleString()} FLEX
  <br/>Soft/Hard cap: ${a.presale.softcap_bnb} / ${a.presale.hardcap_bnb} BNB
  <br/>KST: ${a.schedule_kst.start} → ${a.schedule_kst.end}`;
}
export function applyAddresses(addr: Addresses){
  const el = document.querySelector('#addresses');
  if(!el) return;
  el.innerHTML = `Token: ${addr.token}<br/>Team/Lock: ${addr.team_lock}<br/>Marketing: ${addr.marketing}<br/>Presale: ${addr.presale_wallet}<br/>Burn: ${addr.burn_wallet}`;
}
