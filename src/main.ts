// src/modules/mint.ts
// -------------------------------------------------------
// FlexNFT 민트 모듈 (BSC 메인넷 DropERC721)
// -------------------------------------------------------

import { BrowserProvider, Contract, parseUnits } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const BNB_MAINNET = 56;

// FlexNFT 메인넷 컨트랙트 주소 (소문자)
const NFT_MAINNET = "0x834586083e355ae80b88f479178935085dd3bf75";

// Drop 확장 claim 함수 ABI
const DROP_ABI = [
  "function claim(address receiver,uint256 quantity,address currency,uint256 pricePerToken,(bytes32[] proof,uint256 quantityLimitPerWallet,uint256 pricePerToken,address currency) allowlistProof,bytes data) payable",
];

// 상태
let provider: BrowserProvider | null = null;
let signer: any = null;
let currentAccount: string | null = null;

// -------------------------------------------------------
// 로그 유틸
// -------------------------------------------------------
function log(msg: string) {
  const pre = document.getElementById("mint-log") as HTMLPreElement | null;
  if (pre) pre.textContent = msg;
  console.log("[FlexNFT]", msg);
}

// -------------------------------------------------------
// 지갑 / 네트워크
// -------------------------------------------------------
async function ensureWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask 필요");
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
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x38" }], // 56
    });
  }
}

// -------------------------------------------------------
// 버튼 핸들러
// -------------------------------------------------------
async function handleConnect() {
  try {
    if (!window.ethereum) {
      alert("Please install MetaMask (or a compatible wallet).");
      return;
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });

    const { currentAccount } = await ensureWallet();
    await ensureNetwork();

    const btn = document.getElementById("connect") as HTMLButtonElement | null;
    if (btn && currentAccount) {
      const short =
        currentAccount.slice(0, 6) + "..." + currentAccount.slice(-4);
      btn.textContent = `Connected: ${short}`;
    }

    log("Wallet connected. Ready to mint.");
  } catch (err) {
    console.error(err);
    log("Wallet connect failed.");
  }
}

async function handleMint() {
  try {
    await ensureNetwork();
    const { signer, currentAccount } = await ensureWallet();
    if (!currentAccount) throw new Error("Wallet not connected.");

    // 0.0001 BNB
    const price = parseUnits("0.0001", 18);

    const contract = new Contract(NFT_MAINNET, DROP_ABI, signer);

    log("Sending mint transaction...");

    const tx = await contract.claim(
      currentAccount,
      1, // quantity
      "0x0000000000000000000000000000000000000000", // native BNB
      price,
      {
        proof: [],
        quantityLimitPerWallet: 0,
        pricePerToken: price,
        currency: "0x0000000000000000000000000000000000000000",
      },
      "0x",
      {
        value: price,
      }
    );

    log("Mint submitted. Waiting for confirmation...");
    await tx.wait();
    log("✅ Mint completed! Check your wallet NFT tab.");
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

// -------------------------------------------------------
// 메인 UI 세팅
//  - DOM 완전히 준비된 다음에만 버튼에 onclick 연결
//  - 버튼이 없어도 에러 안 나게 방어 코드 추가
// -------------------------------------------------------
export default function setupMintUI() {
  // 아직 DOM 파싱 중이면 DOMContentLoaded 때 다시 실행
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

  // 버튼 / 엘리먼트 찾기 (둘 중 아무 id든 잡도록)
  const netSelect = document.getElementById("net") as HTMLSelectElement | null;
  const connectBtn = document.getElementById(
    "connect"
  ) as HTMLButtonElement | null;

  const legacyBtn = document.getElementById(
    "mint"
  ) as HTMLButtonElement | null; // 옛날 버튼
  const flexBtn = (document.getElementById("btn-nft-mint") ||
    document.getElementById("mint-flex")) as HTMLButtonElement | null;

  const logBox = document.getElementById("mint-log") as HTMLPreElement | null;

  // 필수 요소 하나라도 없으면 그냥 조용히 빠져나감 (에러 X)
  if (!connectBtn || !flexBtn || !netSelect || !logBox) {
    console.warn("[FlexNFT] Mint UI elements missing", {
      netSelect,
      connectBtn,
      flexBtn,
      logBox,
    });
    return;
  }

  // 네트워크 선택은 BSC 메인넷 고정
  netSelect.value = "bscMainnet";

  // legacy 버튼은 비활성화
  if (legacyBtn) {
    legacyBtn.disabled = true;
  }

  // 클릭 핸들러 연결
  connectBtn.onclick = (e) => {
    e.preventDefault();
    handleConnect();
  };

  flexBtn.onclick = (e) => {
    e.preventDefault();
    handleMint();
  };

  // 새 민트 버튼 활성화
  flexBtn.disabled = false;

  log("NFT mint UI initialized.");
}
