import './style.css';

/** 배포 후 강새로고침 쿼리 (?v=...) 가 있으면 그대로, 없으면 현시각으로 생성 */
const VERSION =
  new URLSearchParams(location.search).get('v') ||
  String(Date.now());

/** 히어로 후보들(1번이 메인). 확장자는 jpg 고정(실제 파일을 jpg로 운영 권장) */
const HERO_FILES = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg'];

/** 절대 경로 + 캐시버스터 */
const HERO_IMAGES: string[] = HERO_FILES.map(
  (f) => `/public/hero/${f}?v=${VERSION}`
);

/** 히어로를 장착할 대상 셀렉터(있으면 사용, 없으면 자동 생성) */
const HERO_HOST_SELECTORS = ['[data-hero]', '.hero', '.Hero', '#hero', '.hero-wrap'];

/** 히어로 컨테이너에 강제 스타일(안보임/잘림 방지 핫픽스) */
function ensureHeroStyles(el: HTMLElement) {
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.overflow = 'hidden';
  el.style.width = '100%';
  // 1792 x 1024 비율 고정 + 모바일 과확대 방지
  (el.style as any).aspectRatio = '1792 / 1024';
  el.style.maxHeight = '560px';
  el.style.background =
    'radial-gradient(ellipse at 50% 10%, rgba(255,215,128,.08), transparent 60%), #0b0b0b';
}

/** <img> 공통 스타일 */
function styleHeroImg(img: HTMLImageElement) {
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'contain'; // 잘림 방지
  img.decoding = 'async';
  // 크롬/사파리 최신: 첫 프레임 속도 ↑
  (img as any).fetchPriority = 'high';
  (img as any).loading = 'eager';
}

/** 히어로 컨테이너 찾기/만들기 */
function getOrCreateHeroHost(): HTMLElement {
  for (const sel of HERO_HOST_SELECTORS) {
    const found = document.querySelector<HTMLElement>(sel);
    if (found) return found;
  }
  // 없으면 body 맨 위에 자동 생성
  const host = document.createElement('section');
  host.setAttribute('data-hero', '');
  document.body.prepend(host);
  return host;
}

/** 이미지 로드 가능한 첫 URL 반환 */
function pickFirstLoadable(urls: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    let idx = 0;
    const tryNext = () => {
      if (idx >= urls.length) {
        reject(new Error('No hero image loadable'));
        return;
      }
      const url = urls[idx++];
      const probe = new Image();
      probe.onload = () => resolve(url);
      probe.onerror = () => tryNext();
      probe.src = url;
    };
    tryNext();
  });
}

/** 히어로 장착 */
async function mountHero() {
  const host = getOrCreateHeroHost();
  ensureHeroStyles(host);

  // 이미지 엘리먼트 준비
  let img = host.querySelector<HTMLImageElement>('img');
  if (!img) {
    img = document.createElement('img');
    styleHeroImg(img);
    host.appendChild(img);
  } else {
    styleHeroImg(img);
  }

  try {
    const firstOk = await pickFirstLoadable(HERO_IMAGES);
    img.src = firstOk;
  } catch {
    // 모든 이미지 실패 시, 안전한 빈 프레임 유지
    img.remove(); // 완전 공백 대신 배경만 보이도록
  }
}

/** 앱 초기화 */
function boot() {
  // 히어로 먼저 보이게
  mountHero();

  // 다른 초기화 로직이 있으면 아래에 추가하면 됩니다.
  // 예) 네비, 버튼 핸들러, 지갑연결 초기화 등
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

// 내보내기: 다른 모듈에서 필요하면 사용할 수 있도록
export { HERO_IMAGES, VERSION };
