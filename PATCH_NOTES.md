# Flexcoin v3.6 — Core Upgrade Pack

Includes:
- public/hero/1..7.jpg (1600x900) + main-hero.jpg
- public/nft-preview/1..6.jpg (1024x1024)
- config/addresses.json (BSC mainnet canonical)
- src/snippets/paths.ts (importable paths)

How to use:
1) Drop /public and /config into your repo root (same level as index.html).
2) Ensure your HTML has <img id="hero-img"> and a container with id="preview".
3) In your JS, rotate HERO_IMAGES and inject NFT_PREVIEWS. See paths.ts.
4) If using Vite, set base: '/' in vite.config.ts.