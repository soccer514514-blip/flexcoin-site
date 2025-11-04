// scripts/postbuild.mjs
/**
 * Flexcoin post-build tasks:
 * - Generate sitemap.xml from known SPA routes
 * - Generate robots.txt (allow all + sitemap link)
 * - Optional: humans.txt
 *
 * SITE_URL 환경변수 없으면 기본값 사용
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { SitemapStream, streamToPromise } from 'sitemap';

const SITE_URL = process.env.SITE_URL ?? 'https://flexcoin.io.kr';
const OUT_DIR = resolve('dist');

await mkdir(OUT_DIR, { recursive: true });

// ---- 1) Sitemap -------------------------------------------------------------

/** 여기에 실제 라우팅 경로들을 추가하세요. (SPA이지만 SEO용으로 명시) */
const routes = [
  '/',                 // Landing
  '/whitepaper',       // 백서(다국어 라우팅은 동적 처리)
  '/roadmap',
  '/tokenomics',
  '/nft',
  '/mint',
  '/community',
  '/privacy',
  '/terms'
];

// 우선순위/갱신주기 간단 지정
const priorities = {
  '/': 1.0,
  '/whitepaper': 0.9,
  '/roadmap': 0.8,
  '/tokenomics': 0.8,
  '/nft': 0.8,
  '/mint': 0.9,
  '/community': 0.6,
  '/privacy': 0.3,
  '/terms': 0.3
};

const smStream = new SitemapStream({ hostname: SITE_URL.replace(/\/+$/, '') + '/' });
for (const path of routes) {
  smStream.write({
    url: path,
    changefreq: 'daily',
    priority: priorities[path] ?? 0.5
  });
}
smStream.end();

const sitemap = await streamToPromise(smStream).then((d) => d.toString('utf-8'));
await writeFile(resolve(OUT_DIR, 'sitemap.xml'), sitemap, 'utf-8');

// ---- 2) robots.txt ----------------------------------------------------------
const robots = [
  'User-agent: *',
  'Allow: /',
  '',
  `Sitemap: ${SITE_URL.replace(/\/+$/, '')}/sitemap.xml`,
  ''
].join('\n');

await writeFile(resolve(OUT_DIR, 'robots.txt'), robots, 'utf-8');

// ---- 3) (선택) humans.txt ----------------------------------------------------
const humans = [
  '/* TEAM */',
  'Developer: Flexcoin Team',
  'Twitter: https://x.com/Flexcoinmeme',
  'Telegram: https://t.me/+p1BMrdypmDFmNTA1',
  '',
  '/* SITE */',
  `Last-Update: ${new Date().toISOString()}`
].join('\n');

await writeFile(resolve(OUT_DIR, 'humans.txt'), humans, 'utf-8');

console.log('[postbuild] ✅ sitemap.xml, robots.txt, humans.txt generated in /dist');
