
Flexcoin Hero Upgrade Patch

1) Unzip this file.
2) Open PowerShell in your project root (flexcoin-site).
3) Run:
   powershell -ExecutionPolicy Bypass -File .\apply_patch.ps1 -ProjectRoot .
4) Commit & push to GitHub:
   git add -A
   git commit -m "feat(hero): images + base + CNAME"
   git push origin main
