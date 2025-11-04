
# Vite Fix Build+Index Patch
Uploaded: 2025-11-04T05:18:38.947330Z

## Why blank page happened
Live HTML showed `<script type="module" src="/src/main.ts?v=hotfix">` which is not transformed to built assets.
This patch restores Vite's default entry (`/src/main.ts`) and makes the workflow build and deploy `dist/`.

## Apply (2 steps)
1) Upload these files to the repo root (overwrite) and **Commit to main**.
   Suggested message: `fix: build to dist and restore Vite index`

2) Check **Actions** → workflow success → open the site → press F12 → ensure no 404 for `/assets/*.js`.

## Notes
- Runtime JSON are served from `/i18n` and `/config` via **public/**, so they exist in `dist/`.
- If you still see a blank page, open **Network** tab and look for 404 on `assets/*.js`; send me a screenshot.
