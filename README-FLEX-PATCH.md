
# Flexcoin Pages Bootstrap Patch

Uploaded: 2025-11-04T04:03:43.891876Z

**Fixes GitHub Pages 404** by adding:
- `index.html` (gold theme placeholder + countdown)
- `CNAME` = `flexcoin.io.kr`
- `.nojekyll`
- `404.html` (SPA refresh safety)
- Countdown wired to `config/config.presale.json` (2025-12-01 KST)
- Workflow that logs `site/` contents

## Apply
1) In GitHub repo → **Add file → Upload files** → Drop the *contents of this ZIP* at the repo root.  
2) Commit to **main** → Actions runs automatically.  
3) Open **Settings → Pages → Visit site** (or https://flexcoin.io.kr).
