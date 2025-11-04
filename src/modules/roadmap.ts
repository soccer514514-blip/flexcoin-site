const phases = [
  { name:'Phase 1', items:['Website & Branding','Whitepaper (8 lang)','Community launch']},
  { name:'Phase 2', items:['Presale & LP','NFT Mint','CEX/DEX Listings']},
  { name:'Phase 3', items:['Ecosystem Growth','Partnerships','Treasury & Buybacks']}
]

export function renderRoadmap(){
  const root = document.getElementById('roadmap')!
  root.innerHTML = phases.map(p => `
    <div class="card">
      <b>${p.name}</b>
      <ul>${p.items.map(i=>`<li>${i}</li>`).join('')}</ul>
    </div>
  `).join('')
}