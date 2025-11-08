# Flexcoin v3.7R — One‑Click Upload Pack

This is a ready-to-upload static site for GitHub Pages.

## How to use
1. Upload this entire folder to your repo (or unzip and commit).
2. Ensure **Settings → Pages → Source: GitHub Actions**.
3. Push to `main` — the provided workflow builds and deploys automatically.
4. Replace placeholder images with your real assets **without renaming**:
   - `/public/hero/1.jpg` … `/public/hero/7.jpg` (1600×900)
   - `/public/action/1.jpg` … `/public/action/8.jpg` (square)
   - `/public/nft-preview/1.jpg` … `/public/nft-preview/8.jpg` (square)
5. Update config in `/config/` if needed:
   - `addresses.json` (token & wallets)
   - `presale.json` (dates, socials, tokenomics)

## Notes
- Base path is `/` for custom domain `flexcoin.io.kr`.
- Countdown is wired to **2025‑12‑01 21:00 KST**.
- PancakeSwap & BscScan links are pre-wired for your token.
- Whitepaper placeholders (8 PDFs) included at `/public/whitepaper/`.

Enjoy. Earn. Flex. 💫
