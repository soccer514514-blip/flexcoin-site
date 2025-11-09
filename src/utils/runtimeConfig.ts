export async function fetchAllocations(){ return (await fetch("/config/allocations.json")).json(); }
export async function fetchAddresses(){ return (await fetch("/config/addresses.json")).json(); }
export function applyTokenomics(_:any){} // Wire to your donut chart renderer
export function applyAddresses(_:any){}  // Wire to footer/explorer link binder
