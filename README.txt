
Flexcoin V5.2 All-in-One (GitHub Pages, Real Images + Whitepapers)
- Upload everything to the repository ROOT (branch: main).
- GitHub Actions will build (Vite) and deploy to Pages automatically.
- Images: /public/hero (main.jpg + 1..8.jpg), /public/action (1..8.jpg), /public/nft-preview (1..8.jpg).
- Whitepapers: /public/whitepaper/en|ko|ja|zh|es|de|pt|it.pdf (V5.1 brand set).
- Runtime config: /config/allocations.json, /config/addresses.json (version v5.2).
- Pinksale button auto-activates when you set presale.pinksale_url in allocations.json.
- Hero loader auto-fallback uses /hero/1.jpg if /hero/main.jpg is missing.
