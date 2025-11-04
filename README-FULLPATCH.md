# Flexcoin Vite Full Patch

Uploaded: 2025-11-04T04:25:12.988010Z

## What's inside
- Vite (vanilla TS) project with:
  - i18n (ko/en)
  - SEO meta & favicon
  - Countdown (2025-12-01 KST, `config/config.presale.json`)
  - Tokenomics & Roadmap sections
  - NFT Mint UI (ethers v6, BSC Testnet/Mainnet toggle; replace contract addresses)
- GitHub Actions workflow for **dist/** deployment
- `CNAME` (`flexcoin.io.kr`), `.nojekyll`, `404.html`

## Local dev
```bash
npm i
npm run dev
```
## Build
```bash
npm run build   # outputs dist/
```
## Deploy (GitHub Actions)
- Push to **main** → auto deploy to GitHub Pages.