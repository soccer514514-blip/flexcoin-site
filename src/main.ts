// src/main.ts
import { initCountdown } from './modules/countdown'
import { applyI18n, loadLang } from './modules/i18n'
import { renderTokenomics } from './modules/tokenomics'
import { renderRoadmap } from './modules/roadmap'
import { setupMintUI } from './modules/mint'

function scaffold() {
  const app = document.getElementById('app') as HTMLDivElement | null
  if (!app) {
    console.error('App mount point (#app) not found')
    return false
  }

  // 필요한 DOM을 한 번에 주입
  app.innerHTML = `
    <header style="display:flex;justify-content:flex-end;gap:.5rem;padding:12px">
      <select id="lang" aria-label="language">
        <option value="ko">한국어</option>
        <option value="en">English</option>
      </select>
    </header>

    <main style="max-width:1200px;margin:0 auto;padding:16px;">
      <section id="hero" style="text-align:center;margin:40px 0 24px;">
        <h1>Flexcoin</h1>
        <p>Memecoin 섹터에서 살아남기</p>
        <div id="countdown" style="display:flex;gap:12px;justify-content:center;margin-top:16px;"></div>
      </section>

      <section id="tokenomics" style="margin:48px 0;">
        <!-- renderTokenomics() 가 채웁니다 -->
      </section>

      <section id="roadmap" style="margin:48px 0;">
        <!-- renderRoadmap() 가 채웁니다 -->
      </section>

      <section id="mint" style="margin:48px 0;">
        <!-- setupMintUI() 가 채웁니다 -->
      </section>
    </main>
  `
  return true
}

async function boot() {
  console.log('BOOT OK')

  // 필요한 DOM이 없으면 먼저 주입
  if (!scaffold()) return

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

// DOM이 준비된 뒤 실행(안전)
window.addEventListener('DOMContentLoaded', boot)
