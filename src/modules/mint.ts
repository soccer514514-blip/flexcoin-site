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
// ✅ 체인 정의 (기존 유지)
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
// ✅ NFT 컨트랙트 주소
// ============================

// ⚠️ bad address checksum 방지 위해 전부 소문자로 사용
//    (ethers v6에서 소문자 or 완전 올바른 EIP55 둘 중 하나만 허용)
const FLEX_NFT_MAINNET = "0x834586083e355ae80b88f479178935085dd3bf75"; // FlexNFT (thirdweb Drop)
const FLEX_NFT_TESTNET = "0x8ce19090faf32b48adb78db0d029aa3ccd0cc0b8"; // 테스트넷용 옛날 NFT

// Legacy용 주소 맵
const ADDR: any = {
  bscTestnet: FLEX_NFT_TESTNET,
  // ⚠️ 메인넷 legacy 컨트랙트는 아직 없음 → 잘못 호출하면 무조건 revert
  //    필요하면 추후 별도 legacy 메인넷 주소로 교체
  bscMainnet: FLEX_NFT_MAINNET,
};

// ============================
// ✅ 기본 NFT ABI (기존 유지)
// ============================
const ABI = [
  "function mint(uint256 quantity) payable",
  "function price() view returns (uint256)",
];

// ============================
// ✅ Thirdweb client
// ============================
const client = createThirdwebClient({
  // 네 프로젝트 Settings > Project Settings 에서 본 Client ID
  clientId: "blb54e589683ef64f55e316f2162a4fe",
});

// ============================
// ✅ thirdweb FlexNFT 컨트랙트 핸들
// ============================
const nftContract = getContract({
  client,
  address: FLEX_NFT_MAINNET, // FlexNFT mainnet
  chain: BNBChain,
});

// ✅ MetaMask 지갑 (thirdweb 방식)
const metamaskWallet = createWallet("io.metamask");

// ----------------------
// ✅ 공통 지갑 연결 함수 (기존 ethers 방식 유지)
// ----------------------
async function connect(chainKey: string) {
  if (!(window as any).ethereum)
    throw new Error("지갑이 없습니다. MetaMask를 설치하세요.");

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
  // 🟡 1) 지갑 연결 버튼
  // ----------------------
  btnC.onclick = async () => {
    try {
      const signer = await connect(sel.value);
      const addr = await signer.getAddress();
      log.textContent = "Connected: " + addr;
    } catch (e: any) {
      log.textContent = "Connect error: " + (e.message || e);
    }
  };

  // ----------------------
  // 🟡 2) Legacy Mint 버튼
  // ----------------------
  btnM.onclick = async () => {
    try {
      // ⚠️ 메인넷에서는 legacy 컨트랙트가 없으므로 안내만 띄우고 종료
      if (sel.value === "bscMainnet") {
        log.textContent =
          "Legacy Mint: 메인넷용 옛 NFT 컨트랙트가 아직 등록되지 않았습니다. FlexNFT 버튼을 사용하세요.";
        return;
      }

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
  // 🟢 3) FlexNFT 전용 Mint (thirdweb Drop / claim)
// ----------------------
  btnFlex.onclick = async () => {
    try {
      log.textContent = "Preparing FlexNFT transaction...";

      // 1) thirdweb + MetaMask 로 계정 연결 (BNBChain)
      const account = await metamaskWallet.connect({
        client,
        chain: BNBChain,
      });

      // 2) claim 트랜잭션 준비
      //    ⚠️ 여기서 메서드 시그니처를 전체로 명시하는 것이 중요!
      const priceWei = 100000000000000n; // 0.0001 BNB

      const transaction = prepareContractCall({
        contract: nftContract,
        method: "function claim(address receiver, uint256 quantity)",
        params: [account.address, 1],
        value: priceWei,
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
