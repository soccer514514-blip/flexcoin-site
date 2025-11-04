
# Flexcoin Vite Hotfix Patch
Uploaded: 2025-11-04T05:04:57.132283Z

## What this does
- Moves runtime JSON to **public/** so they are copied to **dist/**.
- Uses **root absolute paths** `/i18n/...`, `/config/...` for reliable fetch.
- Adds **BOOT OK** console log & error banner for quick diagnosis.
- Prints first lines of **dist/index.html** in Actions logs.

## Apply
1. Upload all files in this ZIP to your repo root (overwrite).
2. Commit to `main` → Actions will build & deploy.
3. Visit site and open DevTools Console: check `BOOT OK`.
