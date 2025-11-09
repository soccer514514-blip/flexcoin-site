// /src/utils/runtimeConfig.ts
export type Tokenomics = { lp:number; presale:number; team:number; marketing:number; burn:number };
export type Presale    = {
  softcap_bnb:number; hardcap_bnb:number;
  rate_flex_per_bnb:number; listing_rate_flex_per_bnb:number;
  start_kst:string; end_kst:string;
};
export type Allocations = { tokenomics:Tokenomics; presale:Presale; version?:string };

const DEFAULTS: Allocations = {
  tokenomics: { lp:54, presale:20, team:15, marketing:10, burn:1 },
  presale: {
    softcap_bnb:30, hardcap_bnb:100,
    rate_flex_per_bnb:2000000, listing_rate_flex_per_bnb:1600000,
    start_kst:"2025-12-01T21:00:00+09:00", end_kst:"2026-01-01T21:00:00+09:00"
  },
  version:"v4.9"
};

export async function fetchAllocations(): Promise<Allocations> {
  try {
    const res = await fetch("/config/allocations.json", { cache: "no-cache" });
    const raw = await res.json();
    return {
      tokenomics: { ...DEFAULTS.tokenomics, ...(raw?.tokenomics||{}) },
      presale:    { ...DEFAULTS.presale,    ...(raw?.presale||{}) },
      version:    raw?.version ?? DEFAULTS.version
    };
  } catch {
    return DEFAULTS;
  }
}

export type Addresses = {
  chain: { name:string; chainId:number; explorer:string };
  token:string; team_lock:string; marketing:string; presale:string; burn:string; user?:string;
};

export async function fetchAddresses(): Promise<Addresses> {
  const res = await fetch("/config/addresses.json", { cache: "no-cache" });
  return await res.json();
}

export function applyTokenomics(a: Allocations) {
  (document.querySelector("[data-tok-lp]") as HTMLElement)?.innerText = `${a.tokenomics.lp}%`;
  (document.querySelector("[data-tok-presale]") as HTMLElement)?.innerText = `${a.tokenomics.presale}%`;
  (document.querySelector("[data-tok-team]") as HTMLElement)?.innerText = `${a.tokenomics.team}%`;
  (document.querySelector("[data-tok-mkt]") as HTMLElement)?.innerText = `${a.tokenomics.marketing}%`;
  (document.querySelector("[data-tok-burn]") as HTMLElement)?.innerText = `${a.tokenomics.burn}%`;

  (document.querySelector("[data-presale-rate]") as HTMLElement)?.innerText =
    `1 BNB = ${a.presale.rate_flex_per_bnb.toLocaleString()} FLEX`;
  (document.querySelector("[data-listing-rate]") as HTMLElement)?.innerText =
    `1 BNB = ${a.presale.listing_rate_flex_per_bnb.toLocaleString()} FLEX`;
  (document.querySelector("[data-softcap]") as HTMLElement)?.innerText = `${a.presale.softcap_bnb} BNB`;
  (document.querySelector("[data-hardcap]") as HTMLElement)?.innerText = `${a.presale.hardcap_bnb} BNB`;
}

export function applyAddresses(addr: any) {
  const ex = String(addr?.chain?.explorer||"https://bscscan.com/address/").replace(/\/+$/,"") + "/";
  (document.querySelector("[data-addr-token]") as HTMLAnchorElement)?.setAttribute("href", ex + addr.token);
  (document.querySelector("[data-addr-team]")  as HTMLAnchorElement)?.setAttribute("href", ex + addr.team_lock);
  (document.querySelector("[data-addr-mkt]")   as HTMLAnchorElement)?.setAttribute("href", ex + addr.marketing);
  (document.querySelector("[data-addr-presale]") as HTMLAnchorElement)?.setAttribute("href", ex + addr.presale);
  (document.querySelector("[data-addr-burn]")  as HTMLAnchorElement)?.setAttribute("href", ex + addr.burn);
}
