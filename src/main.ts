/* ---------------------------------------------------------
   FLEX ⛏️ Main bootstrap (hero path hotfix 포함)
--------------------------------------------------------- */

/** 쿼리스트링 ?v= 가 있으면 그대로, 없으면 현재시각을 버전으로 사용 */
const VER: string =
  new URLSearchParams(location.search).get("v") || String(Date.now());

/** 절대경로 생성기: 무조건 https://flexcoin.io.kr/public/hero/N.jpg 형태로 만듦 */
function heroUrl(n: number) {
  return new URL(`/public/hero/${n}.jpg?v=${VER}`, location.origin).toString();
}

/** 히어로 후보들(1~7) – 절대경로로 강제 */
const HERO_IMAGES: string[] = Array.from({ length: 7 }, (_, i) => heroUrl(i + 1));

/** 문서 내 img들의 잘못된 상대경로(예: "1.jpg")를 절대경로로 즉시 보정 */
function fixHeroImagePaths(scope: ParentNode = document) {
  const imgs = Array.from(scope.querySelectorAll<HTMLImageElement>("img"));
  const rx = /(?:^|\/)([1-7])\.jpg(?:\?.*)?$/i;

  imgs.forEach((img) => {
    const raw = img.getAttribute("src") || "";
    const m = raw.match(rx);
    if (!m) return;

    const n = Number(m[1]);
    const fixed = heroUrl(n);
    if (img.src !== fixed) img.src = fixed;

    // 에러 시 캐시버스터 새로고침
    img.onerror = () => (img.src = heroUrl(n));
  });
}

/** 초기에 히어로가 없다면 추가로 보정(선택) */
function ensureHeroMounted() {
  const host =
    document.querySelector(".hero, .Hero, [data-hero], #hero, .hero-wrap") ??
    undefined;
  if (!host) return;

  const hasImg = host.querySelector("img");
  if (!hasImg) {
    const img = document.createElement("img");
    img.alt = "Flexcoin Hero";
    img.decoding = "async";
    img.loading = "eager";
    img.src = HERO_IMAGES[0];
    host.appendChild(img);
  }
}

/** 페이지 로드 훅 */
document.addEventListener("DOMContentLoaded", () => {
  ensureHeroMounted();
  fixHeroImagePaths(document);
});

window.addEventListener("load", () => {
  // 지연로딩/슬라이더로 동적으로 들어온 이미지 2차 보정
  setTimeout(() => fixHeroImagePaths(document), 0);
});

/* ---------------------------------------------------------
   아래는 기존 앱 부트스트랩 코드가 있었다면 유지
   (만약 프레임워크 없이 DOM만 쓰는 경우 그대로 둬도 무방)
--------------------------------------------------------- */
// 예시: 카운트다운 등 기존 코드가 이 파일 아래쪽에 있었다면 그대로 두세요.
