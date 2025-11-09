# Flexcoin V4.9 All-in-One (GitHub Pages Ready)

- Place everything at repo root (main branch).
- Uses `.github/workflows/pages.yml` to auto build & deploy.
- Folders (match your screenshot):
  • public/hero/main.jpg, 1..8.jpg
  • public/action/1..8.jpg
  • public/nft-preview/1..8.jpg
  • public/whitepaper/en.pdf … it.pdf
  • config/allocations.json, config/addresses.json
  • src/utils/heroLoader.ts, src/utils/runtimeConfig.ts
  • src/constants/images.ts
  • index.html, src/main.ts
- `resolveHeroMain()` falls back to `/hero/1.jpg` when `/hero/main.jpg` is missing.
- Built at: 2025-11-09T10:13:43.290726
