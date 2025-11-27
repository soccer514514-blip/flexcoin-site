// src/modules/mint.ts
// FlexNFT 민트 모듈 (BSC 메인넷 OpenEditionERC721 + Drop)

import { BrowserProvider, Contract, parseUnits } from "ethers";

// ---- 상수 -----------------------------------------------------------

// BNB 메인넷
const BNB_MAINNET = 56;

// FlexNFT 메인넷 컨트랙트 주소 (소문자 고정)
const NFT_MAINNET = "0x834586083e355ae80b88f479178935085dd3bf75";

// thirdweb 네이티브 토큰 상수 (BNB, ETH 등 공통)
const NATIVE_TOKEN =
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as const;

// Drop 확장 claim ABI (필요한 것만 최소)
const DROP_ABI = [
  "function claim(address receiver,uint256 quantity,address currency,uint256 pricePerToken,(bytes32[] proof,uint256 quantityLimitPerWallet,uint256 pricePerToken,address currency) allowlistProof,bytes data) payable",
];

// ---- 상태 -----------------------------------------------------------

let provider: BrowserProvider | null = null;
let signer: any | null = null;
let currentAccount: string | null = null;

// ---- 헬퍼 -----------------------------------------------------------

function setLog(msg: string) {
  const el = document.getElementById("mint-log") as HTMLPreElement | null;
  if (el) el.textContent = msg;
}

async function ensureWallet() {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    setLog("MetaMask not found. Please install MetaMask.");
    throw new Error("no metamask");
  }

  if (!provider) {
    provider = new BrowserProvider((window as any).ethereum);
  }

  const accounts = await (window as any).ethereum.request({
    method: "eth_requestAccounts",
  });

  currentAccount = accounts?.[0] ?? null;
  signer = await provider.getSigner();

  const net = await provider.getNetwork();
  const chainId = Number(net.chainId);

  if (chainId !== BNB_MAINNET) {
    // 체인 자동 스위치 시도
    try {
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x38" }], // 56 in hex
      });
    } catch (_) {
      setLog("Please switch network to BNB Smart Chain (chainId 56).");
      throw new Error("wrong network");
    }
  }

  return { provider, signer, account: currentAccount! };
}

// ---- 메인 UI 세팅 ---------------------------------------------------

export default function setupMintUI() {
  const netSelect = document.getElementById("net") as HTMLSelectElement | null;
  const connectBtn = document.getElementById(
    "connect"
  ) as HTMLButtonElement | null;
  const mintBtn = document.getElementById(
    "btn-nft-mint"
  ) as HTMLButtonElement | null;

  // 하나라도 없으면 조용히 빠져나가고 콘솔에만 경고
  if (!netSelect || !connectBtn || !mintBtn) {
    console.warn("Mint UI elements missing", {
      netSelect,
      connectBtn,
      mintBtn,
    });
    return;
  }

  // 네트워크 선택은 일단 BSC 메인넷 고정 (나중에 테스트넷 추가 가능)
  netSelect.value = "bscMainnet";

  // ---- Connect 버튼 ----
  connectBtn.onclick = async () => {
    try {
      setLog("Connecting wallet...");
      const { account } = await ensureWallet();
      setLog(`Connected: ${account}`);
    } catch (err: any) {
      console.error(err);
      if (err?.message !== "wrong network") {
        setLog("Wallet connection cancelled or failed.");
      }
    }
  };

  // ---- Mint 버튼 ----
  mintBtn.onclick = async () => {
    try {
      setLog("Preparing mint transaction...");

      const { signer, account } = await ensureWallet();

      // 수량 1개 고정
      const quantity = 1n;

      // 0.0001 BNB (18 decimals)
      const pricePerToken = parseUnits("0.0001", 18);
      const totalPrice = pricePerToken * quantity;

      const contract = new Contract(NFT_MAINNET, DROP_ABI, signer);

      // 화이트리스트 미사용 → proof 비움, currency는 NATIVE_TOKEN 로 맞춤
      const allowlistProof = {
        proof: [] as string[],
        quantityLimitPerWallet: 0n,
        pricePerToken: 0n,
        currency: NATIVE_TOKEN,
      };

      const tx = await contract.claim(
        account,
        quantity,
        NATIVE_TOKEN, // 🔥 네이티브 토큰 주소로 지정 (중요)
        pricePerToken,
        allowlistProof,
        "0x",
        {
          value: totalPrice, // 🔥 msg.value = 총 가격
        }
      );

      setLog(`Mint pending... tx: ${tx.hash}`);

      const receipt = await tx.wait();
      setLog(`Mint success in block ${receipt.blockNumber}.`);

    } catch (err: any) {
      console.error(err);
      const msg =
        err?.shortMessage ||
        err?.reason ||
        err?.data?.message ||
        err?.message ||
        String(err);
      setLog(`Mint error: ${msg}`);
    }
  };
}
