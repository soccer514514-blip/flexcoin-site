// ---------------------------------------------------------
// Flexcoin main.ts — hero path hotfix + countdown
// ---------------------------------------------------------

const HERO_BASE = '/public/hero/';
function cacheBust(v?: string) {
  return v || String(Date.now());
}

function fixHeroImagePaths() {
  const ver = new URLSearchParams(location.search).get('v') || cacheBust();
  const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('img'));
  imgs.forEach(img => {
    const raw = img.getAttribute('src') || '';
    const m = raw.match(/(?:^|\/)([1-7])\.jpg(?:\?.*)?$/i);
    if (!m) return;
    const n = m[1];
    const fixed = `${HERO_BASE}${n}.jpg?v=${ver}`;
    if (img.src !== fixed) img.src = fixed;
    img.onerror = () => (img.src = `${HERO_BASE}${n}.jpg?v=${cacheBust()}`);
  });

  // Ensure one hero image exists inside .hero-wrap
  const wrap = document.querySelector('.hero-wrap');
  if (wrap && !wrap.querySelector('img')) {
    const im = document.createElement('img');
    im.alt = 'Flexcoin Hero';
    im.src = `${HERO_BASE}1.jpg?v=${ver}`;
    wrap.appendChild(im);
  }
}

function rotateHero(intervalMs = 6000) {
  const wrap = document.querySelector('.hero-wrap');
  if (!wrap) return;
  const im = wrap.querySelector('img') as HTMLImageElement | null;
  if (!im) return;
  let n = 1;
  setInterval(() => {
    n = (n % 7) + 1;
    im.src = `${HERO_BASE}${n}.jpg?v=${cacheBust()}`;
  }, intervalMs);
}

async function loadPresale() {
  try {
    const res = await fetch('/config.presale.json', { cache: 'no-store' });
    const conf = await res.json();
    const target = new Date(conf.start).getTime();
    const el = document.getElementById('countdown');
    if (!el) return;

    function tick() {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const s = Math.floor(diff / 1000);
      const d = Math.floor(s / 86400);
      const h = Math.floor((s % 86400) / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      el.textContent = `${d}d ${h}h ${m}m ${sec}s`;
    }
    tick();
    setInterval(tick, 1000);
  } catch (e) {
    console.warn('presale config missing', e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fixHeroImagePaths();
  rotateHero();
  loadPresale();
});
window.addEventListener('load', () => setTimeout(fixHeroImagePaths, 0));
