// src/modules/mint.ts
// -------------------------------------------------------
// FlexNFT 민트 모듈 (BSC 메인넷 DropERC721)
//  - 네트워크 고정: BNB Mainnet (chainId 56)
//  - 가격: 0.0001 BNB
//  - claim() 호출
// -------------------------------------------------------

import { BrowserProvider, Contract, parseUnits } from "ethers";

// 윈도우 타입 보완
declare global {
  interface Window {
    ethereum?: any;
  }
}

const BNB_MAINNET = 56;

// 모두 소문자(체크섬 문제 방지)
const NFT_MAINNET = "0x834586083e355ae80b88f479178935085dd3bf75";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// Drop 확장의 claim 함수 ABI
const DROP_ABI = [
  "function claim(address receiver,uint256 quantity,address currency,uint256 pricePerToken,(bytes32[] proof,uint256 quantityLimitPerWallet,uint256 pricePerToken,address currency) allowlistProof,bytes data) payable",
];

// 상태
let provider: BrowserProvider | null = null;
let signer: any = null;
let currentAccount: string | null = null;

// ------------------------------------------------------------------
// 유틸: 로그 출력
// ------------------------------------------------------------------
function log(msg: string) {
  const pre = document.getElementById("mint-log") as HTMLPreElement | null;
  if (pre) {
    pre.textContent = msg;
  } else {
    console.log("[FlexNFT]", msg);
  }
}

// ------------------------------------------------------------------
// 지갑 / 네트워크 보조 함수
// ------------------------------------------------------------------
async function ensureWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask (또는 호환 지갑)이 필요합니다.");
  }

  if (!provider) {
    provider = new BrowserProvider(window.ethereum);
  }

  if (!signer) {
    signer = await provider.getSigner();
    currentAccount = await signer.getAddress();
  }

  return { provider, signer, currentAccount };
}

async function ensureNetwork() {
  const { provider } = await ensureWallet();
  const net = await provider!.getNetwork();
  const chainId = Number(net.chainId);

  if (chainId !== BNB_MAINNET) {
    // 체인 자동 전환 시도
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x38" }], // 56
    });
  }
}

// ------------------------------------------------------------------
// 버튼 핸들러
// ------------------------------------------------------------------
async function handleConnect() {
  try {
    if (!window.ethereum) {
      alert("MetaMask (또는 호환 지갑)을 설치해 주세요.");
      return;
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });
    const { currentAccount } = await ensureWallet();
    await ensureNetwork();

    const btn = document.getElementById("connect") as HTMLButtonElement | null;
    if (btn && currentAccount) {
      const short = `${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`;
      btn.textContent = `Connected: ${short}`;
    }

    log("Wallet connected. Ready to mint.");
  } catch (err: any) {
    console.error(err);
    log("Wallet connect failed.");
  }
}

async function handleMint() {
  try {
    await ensureNetwork();
    const { signer, currentAccount } = await ensureWallet();
    if (!currentAccount) {
      throw new Error("지갑이 연결되어 있지 않습니다.");
    }

    // 0.0001 BNB
    const price = parseUnits("0.0001", 18);

    const contract = new Contract(NFT_MAINNET, DROP_ABI, signer);

    log("Sending mint transaction...");

    const tx = await contract.claim(
      currentAccount,
      1, // quantity
      ZERO_ADDRESS, // native BNB
      price,
      {
        proof: [],
        quantityLimitPerWallet: 0,
        pricePerToken: price,
        currency: ZERO_ADDRESS,
      },
      "0x",
      {
        value: price,
      }
    );

    log("Mint submitted. Waiting for confirmation...");
    await tx.wait();
    log("✅ Mint completed! Check your wallet's NFT tab.");
  } catch (err: any) {
    console.error(err);
    const m =
      err?.reason ||
      err?.shortMessage ||
      err?.message ||
      "Mint failed (execution reverted).";
    log(`Mint error: ${m}`);
  }
}

// ------------------------------------------------------------------
// 메인 UI 세팅
//  - DOM이 모두 만들어진 후에만 버튼에 onclick을 걸도록 처리
// ------------------------------------------------------------------
export default function setupMintUI() {
  // DOM 아직이면 이벤트 걸고 바로 리턴
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        setupMintUI();
      },
      { once: true } as any
    );
    return;
  }

  const netSelect = document.getElementById("net") as HTMLSelectElement | null;
  const connectBtn = document.getElementById("connect") as HTMLButtonElement | null;
  const mintBtn = document.getElementById("btn-nft-mint") as HTMLButtonElement | null;

  if (!netSelect || !connectBtn || !mintBtn) {
    console.warn("[FlexNFT] Mint UI elements not found on this page.");
    return;
  }

  // 네트워크 선택은 BSC 메인넷으로 고정
  netSelect.value = "bscMainnet";
  netSelect.disabled = true;

  connectBtn.onclick = (e) => {
    e.preventDefault();
    handleConnect();
  };

  mintBtn.onclick = (e) => {
    e.preventDefault();
    handleMint();
  };

  // 버튼 활성화
  mintBtn.disabled = false;

  log("NFT mint UI initialized.");
}
