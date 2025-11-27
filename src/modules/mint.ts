// src/modules/mint.ts
// FlexNFT 민트 모듈 (BSC 메인넷 OpenEditionERC721 + Drop)

import { BrowserProvider, Contract, parseUnits } from "ethers";

// ---- 상수 ---------------------------------------------------------

const BNB_MAINNET = 56;

// 모두 소문자 (체크섬 이슈 방지)
const NFT_MAINNET = "0x834586083e355ae80b88f479178935085dd3bf75";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// Drop 확장의 claim 함수 최소 ABI
const DROP_ABI = [
  "function claim(address receiver,uint256 quantity,address currency,uint256 pricePerToken,(bytes32[] proof,uint256 quantityLimitPerWallet,uint256 pricePerToken,address currency) allowlistProof,bytes data) payable",
];

// 한 개 가격: 0.0001 BNB
const NFT_PRICE_BNB = "0.0001";

// ---- 상태 ---------------------------------------------------------

let provider: BrowserProvider | null = null;

// ---- 내부 유틸 ----------------------------------------------------

async function getProvider(): Promise<BrowserProvider> {
  if (provider) return provider;
  if (!(window as any).ethereum) {
    throw new Error("MetaMask(또는 Web3 지갑)를 먼저 설치해 주세요.");
  }
  provider = new BrowserProvider((window as any).ethereum);
  return provider;
}

async function ensureBscMainnet(p: BrowserProvider) {
  const net = await p.getNetwork();
  if (Number(net.chainId) === BNB_MAINNET) return;

  await (window as any).ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: "0x38" }], // 56
  });
}

// 실제 민팅 로직
async function mint(quantity: number) {
  const p = await getProvider();
  await ensureBscMainnet(p);

  const signer = await p.getSigner();
  const account = await signer.getAddress();

  const contract = new Contract(NFT_MAINNET, DROP_ABI, signer);

  const pricePerToken = parseUnits(NFT_PRICE_BNB, 18);
  const totalValue = pricePerToken * BigInt(quantity);

  // allowlistProof 비우더라도 구조체는 꼭 채워야 함
  const allowlistProof = {
    proof: [] as string[],
    quantityLimitPerWallet: 0,
    pricePerToken: 0,
    currency: ZERO_ADDRESS,
  };

  const tx = await contract.claim(
    account,
    quantity,
    ZERO_ADDRESS,
    pricePerToken,
    allowlistProof,
    "0x",
    {
      value: totalValue,
    }
  );

  await tx.wait();
}

// ---- UI 바인딩 ----------------------------------------------------

export default function setupMintUI() {
  // 예: 민팅 버튼 하나 (#btn-nft-mint)만 사용하는 경우
  const oneBtn = document.getElementById("btn-nft-mint");
  if (oneBtn) {
    oneBtn.addEventListener("click", async () => {
      try {
        oneBtn.setAttribute("disabled", "true");
        oneBtn.textContent = "Minting...";
        await mint(1);
        alert("NFT 민팅 성공!");
      } catch (err: any) {
        console.error(err);
        alert("NFT 민팅 실패: " + (err?.message || String(err)));
      } finally {
        oneBtn.removeAttribute("disabled");
        oneBtn.textContent = "Mint 1 FLEX NFT";
      }
    });
  }

  // 만약 3개 / 5개 버튼 등이 따로 있으면
  // 여기서 비슷한 방식으로 btn-mint-3, btn-mint-5에 mint(3), mint(5) 붙이면 됨.
}
