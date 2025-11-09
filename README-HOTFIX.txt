Flexcoin V5.2 — Hotfix Build Patch

This patch fixes the GitHub Actions error: `vite: not found` (exit code 127).

What’s inside:
- package.json  → adds devDependencies.vite
- .github/workflows/pages.yml → uses `npm install` instead of `npm ci`

How to apply:
1) In your `flexcoin-site` repository root, upload these two files and overwrite:
   - /package.json
   - /.github/workflows/pages.yml
2) Commit to the `main` branch.
3) Open GitHub → Actions → “Deploy Vite to GitHub Pages” and watch it pass.
4) After it succeeds, your site will be rebuilt from /dist and deployed automatically.

Notes:
- Using `npm install` avoids lockfile mismatch errors while we’re iterating.
- Later, if you want to go back to `npm ci`, generate a new package-lock.json locally:
    npm install
    git add package-lock.json
    git commit -m "lockfile update for CI"
