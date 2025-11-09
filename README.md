# Flexcoin V5.3 All-in-One

- Upload everything to the repository root (main branch).
- GitHub Pages workflow included (builds `dist/`).
- Public assets:
  - `/public/hero/1..8.jpg` (auto-rotate; `/hero/main.jpg` optional)
  - `/public/action/1..8.jpg`
  - `/public/nft-preview/1..8.jpg`
  - `/public/whitepaper/*.pdf` (8 languages, high-contrast)
- Runtime config from `/config/allocations.json` and `/config/addresses.json`.
- Hero fallback: if `/hero/main.jpg` is missing, loader uses `/hero/1.jpg`.
