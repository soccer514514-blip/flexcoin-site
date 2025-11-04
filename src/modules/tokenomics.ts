const data = [
  { label: 'LP', value: '69%' },
  { label: 'Presale', value: '10% (90d vest)' },
  { label: 'Marketing', value: '10%' },
  { label: 'Team', value: '10% (6m lock + 6m linear)' },
  { label: 'Burn', value: '1%' }
]

export function renderTokenomics(){
  const root = document.getElementById('tokenomics')!
  root.innerHTML = data.map(x => `
    <div class="card"><b>${x.label}</b><div>${x.value}</div></div>
  `).join('')
}