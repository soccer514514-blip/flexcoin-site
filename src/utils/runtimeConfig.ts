// src/utils/runtimeConfig.ts
export async function fetchAllocations(){ return (await fetch("/config/allocations.json")).json(); }
export async function fetchAddresses(){ return (await fetch("/config/addresses.json")).json(); }
// Wire these in your UI
export function applyTokenomics(_:any){} 
export function applyAddresses(_:any){} 
