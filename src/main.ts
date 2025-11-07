/* ---------------------------------------------------------
   Flexcoin Main Script — Clean Final Build (Mainnet)
   Version: 2025-11-07
   Features:
   - Hero image auto path fix (/public/hero/1~7.jpg)
   - NFT preview rotator (/public/nft-preview/nft-preview1~6.jpg)
   - Presale config auto loader (/public/config/presale.json)
   - Wallet connect (BSC mainnet)
--------------------------------------------------------- */

import { ethers } from "ethers";

/* ===========================
   1. HERO IMAGE AUTO-FIX
=========================== */
const __HERO_VER = new URLSearchParams(location.search).get('v') || String(Date.now());
const HERO_BASE = '/public/hero/';

function fixHeroImagePaths() {
  const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('img'));
  imgs.forEach(img => {
    const raw = img.getAttribute('src') || '';
    const m = raw.match(/(?:^|\/)([1-7])\.jpg(?:\?.*)?$/i);
    if (!m) return;
    const n = m[1];
    const fixed = `${HERO_BASE}${n}.jpg?v=${__HERO_VER}`;
    if (raw !== fixed) img.src = fixed;
    img.onerror = () => { img.src = `${HERO_BASE}${n}.jpg?v=${Date.now()}`; };
  });
}
document.addEventListener('DOMContentLoaded', fixHeroImagePaths);
window.addEventListener('load', () => setTimeout(fixHeroImagePaths, 0));

/* ===========================
   2. NFT PREVIEW ROTATOR
=========================== */
const NFT_PREVIEW_DIR = '/public/nft-preview/';
const NFT_PREVIEW_COUNT = 6;

function mountNftPreview() {
  const box = document.querySelector<HTMLElement>('#nft-preview, .nft-preview, [data-nft-preview]');
  if (!box) return;
  const imgs = Array.from({ length: NFT_PREVIEW_COUNT }, (_, i) =>
    `${NFT_PREVIEW_DIR}nft-preview${i + 1}.jpg?v=${__HERO_VER}`
  );
  const img = new Image();
  img.alt = "NFT Preview";
  img.style.maxWidth = "100%";
  img.style.height = "auto";
  img.loading = "lazy";
  let idx = 0;
  function next() {
    img.src = imgs[idx % imgs.length];
    idx++;
  }
  box.innerHTML = "";
  box.appendChild(img);
  next();
  setInterval(next, 4000);
}
document.addEventListener('DOMContentLoaded', mountNftPreview);

/* ===========================
   3. PRESALE CONFIG LOADER
=========================== */
async function loadPresaleConfig() {
  try {
    const res = await fetch(`/public/config/presale.json?v=${__HERO_VER}`);
    if (!res.ok) return;
    const data = await res.json();
    (window as any).__FLEX_PRESALE__ = data;
    document.dispatchEvent(new CustomEvent("flex:presale:config", { detail: data }));
    console.log("✅ Presale config loaded:", data);
  } catch (err) {
    console.warn("⚠️ Presale config missing or invalid");
  }
}
document.addEventListener('DOMContentLoaded', loadPresaleConfig);

/* ===========================
   4. WALLET CONNECT (BSC)
=========================== */
const BSC_MAINNET = {
  chainId: '0x38',
  chainName: 'BNB Smart Chain Mainnet',
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com']
};

async function connectWallet() {
  if (!(window as any).ethereum) {
    alert("MetaMask not detected. Please install it.");
    return;
  }
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const network = await provider.getNetwork();
  if (network.chainId !== 56n) {
    await (window as any).ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [BSC_MAINNET]
    });
  }
  const accounts = await provider.send("eth_requestAccounts", []);
  const addr = accounts[0];
  const short = addr.slice(0, 6) + "..." + addr.slice(-4);
  const btn = document.querySelector("#wallet-btn");
  if (btn) btn.textContent = short;
  console.log("✅ Connected wallet:", addr);
}

const walletBtn = document.querySelector("#wallet-btn");
if (walletBtn) walletBtn.addEventListener("click", connectWallet);

/* ===========================
   5. STATUS + LOADER
=========================== */
window.addEventListener('load', () => {
  console.log("🚀 Flexcoin Multi-Path Loader ready • Build OK");
  const el = document.getElementById('build-status');
  if (el) el.textContent = "Flexcoin ready • Vite build OK";
});
