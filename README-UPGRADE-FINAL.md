
# Flexcoin — Final Upgrade Pack
Generated: 2025-11-04T07:11:05.197454Z

## What's inside
- Robust GitHub Pages workflow (dist deploy, ci/install fallback)
- Runtime JSON in **public/** (i18n + presale config)
- CNAME preset for **flexcoin.io.kr**
- Safe **index.html** entry for Vite

## 10‑second upload (GitHub web)
1. Download & unzip this pack.
2. Open your repo → **Add file → Upload files**.
3. Drag **all files/folders** from this pack to the **repository root** (overwrite).
4. Commit message: `chore: final upgrade (dist deploy + public runtime)` → **Commit to main**.
5. Actions finishes → open `https://flexcoin.io.kr` → press F12.
   - Network must show `/assets/*.js` = 200.
   - If `/src/main.ts` appears, your workflow wasn't replaced; re‑upload this file: `.github/workflows/update-and-deploy.yml`.

## Notes
- Runtime fetch paths should be absolute: `/i18n/ko.json`, `/config/config.presale.json`.
- Minting: set addresses in `src/modules/mint.ts` then commit → auto deploy.
