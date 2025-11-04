import { initCountdown } from './modules/countdown'
import { applyI18n, loadLang, setLang } from './modules/i18n'
import { renderTokenomics } from './modules/tokenomics'
import { renderRoadmap } from './modules/roadmap'
import { setupMintUI } from './modules/mint'

async function boot(){
  // i18n
  const select = document.getElementById('lang') as HTMLSelectElement
  const saved = localStorage.getItem('lang') || 'ko'
  select.value = saved
  applyI18n(await loadLang(saved))
  select.addEventListener('change', async () => {
    const lang = select.value
    localStorage.setItem('lang', lang)
    applyI18n(await loadLang(lang))
  })

  // sections
  renderTokenomics()
  renderRoadmap()

  // countdown
  initCountdown()

  // mint
  setupMintUI()
}
boot()