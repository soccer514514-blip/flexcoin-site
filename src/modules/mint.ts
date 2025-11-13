// ✅ 기본 import (ethers.js + thirdweb 병합)
import { BrowserProvider, Contract, parseEther } from "ethers";
import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  sendAndConfirmTransaction,
} from "thirdweb";
import { BNBChain } from "thirdweb/chains";
import { createWallet } from "thirdweb/wallets";

// ============================
// ✅ 체인 정의
// ============================
const CHAINS: any = {
  bscTestnet: {
    chainId: "0x61",
    name: "BSC Testnet",
    rpc: "https://data-seed-prebsc-1-s3.binance.org:8545",
  },
  bscMainnet: {
    chainId: "0x38",
    name: "BSC",
    rpc: "https://bsc-dataseed.binance.org",
  },
};

// ============================
// ✅ NFT 컨트랙트 주소 (모두 소문자 버전)
// ============================
const FLEX_NFT_MAINNET = "0x834586083e355ae80d08f479178935085dd3bf75";
const FLEX_NFT_TESTNET = "0x8ce19090faf32b48adb78db0d029aa3ccd0cc0b";

const ADDR: any = {
  bscTestnet: FLEX_NFT_TESTNET,
  bscMainnet: FLEX_NFT_MAINNET,
};

// ============================
// ✅ 기본 NFT ABI (legacy 컨트랙트용)
// ============================
const ABI = [
  "function mint(uint256 quantity) payable",
  "function price() view returns (uint256)",
];

// ============================
// ✅ Thirdweb client
// ============================
const client = createThirdwebClient({
  // thirdweb 대시보드 > Project Settings 에서 본 Client ID
  clientId: "blb54e589683ef64f55e316f2162a4fe",
});

// ============================
// ✅ thirdweb FlexNFT 컨트랙트 핸들
// ============================
const nftContract = getContract({
  client,
  address: FLEX_NFT_MAINNET,
  chain: BNBChain,
});

// ✅ MetaMask 지갑 (thirdweb 방식)
const metamaskWallet = createWallet("io.metamask");

// ----------------------
// ✅ 공통 지갑 연결 함수 (ethers 방식)
// ----------------------
async function connect(chainKey: string) {
  if (!(window as any).ethereum) {
    throw new Error("지갑이 없습니다. MetaMask를 설치하세요.");
  }

  const target = CHAINS[chainKey];

  // 네트워크 스위치
  try {
    await (window as any).ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: target.chainId }],
    });
  } catch (e: any) {
    if (e.code === 4902) {
      // 체인 추가
      await (window as any).ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: target.chainId,
            chainName: target.name,
            rpcUrls: [target.rpc],
            nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
          },
        ],
      });
    } else {
      throw e;
    }
  }

  const provider = new BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  return signer;
}

// ----------------------
// ✅ Mint UI 세팅
// ----------------------
export function setupMintUI() {
  const sel = document.getElementById("net") as HTMLSelectElement;
  const btnC = document.getElementById("connect") as HTMLButtonElement;
  const btnM = document.getElementById("mint") as HTMLButtonElement;
  const btnFlex = document.getElementById("mint-flex") as HTMLButtonElement; // Flex 버튼
  const log = document.getElementById("mint-log") as HTMLPreElement;

  // ----------------------
  // 🟡 기본 NFT Mint (기존 컨트랙트 / legacy)
  // ----------------------
  btnC.onclick = async () => {
    try {
      const signer = await connect(sel.value);
      log.textContent = "Connected: " + (await signer.getAddress());
    } catch (e: any) {
      log.textContent = "Connect error: " + (e.message || e);
    }
  };

  btnM.onclick = async () => {
    try {
      const signer = await connect(sel.value);
      const contract = new Contract(ADDR[sel.value], ABI, signer);

      // 기본값 0.01 BNB (컨트랙트에 price() 있으면 그 값 사용)
      let value = parseEther("0.01");
      try {
        value = await contract.price();
      } catch {
        // price() 없으면 그냥 0.01 BNB 사용
      }

      const tx = await contract.mint(1, { value });
      log.textContent = "Minting... TX: " + tx.hash;
      await tx.wait();
      log.textContent = "✅ Minted (Legacy NFT)";
    } catch (e: any) {
      log.textContent = "Mint error: " + (e.message || e);
    }
  };

  // ----------------------
  // 🟢 FlexNFT 전용 Mint (thirdweb Drop / claim)
// ----------------------
  btnFlex.onclick = async () => {
    try {
      // 1) thirdweb + MetaMask 로 계정 연결 (BNBChain)
      const account = await metamaskWallet.connect({
        client,
        chain: BNBChain,
      });

      // 2) claim 트랜잭션 준비
      const transaction = prepareContractCall({
        contract: nftContract,
        method: "claim",
        // OpenEditionERC721 Drop 계열: claim(receiver, quantity)
        params: [account.address, 1],
        // ❗ FlexNFT 실제 민트 가격 (BNB) — claim 조건과 동일하게
        value: 100000000000000n, // 0.0001 BNB
      });

      // 3) 트랜잭션 전송 + 컨펌까지 기다리기
      const receipt = await sendAndConfirmTransaction({
        transaction,
        account,
      });

      log.textContent =
        "✅ FlexNFT Mint Success!\nTX: " +
        receipt.transactionHash +
        "\nBscScan에서 확인 가능.";
    } catch (err: any) {
      console.error("❌ FlexNFT Mint 실패:", err);
      log.textContent = "❌ FlexNFT Mint Error: " + (err.message || err);
    }
  };
}
