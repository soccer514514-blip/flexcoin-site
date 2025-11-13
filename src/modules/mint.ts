// ✅ FlexNFT / Legacy NFT 민트 모듈 (ethers만 사용 버전)

import { BrowserProvider, Contract, parseEther } from "ethers";

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
// ✅ 컨트랙트 주소들
// ============================

// 👉 OpenEditionERC721 FlexNFT 메인넷 (thirdweb 대시보드에 있는 주소)
//   **반드시 전부 소문자**
const FLEX_NFT_MAINNET = "0x834586083e355ae80b88f479178935085dd3bf75";

// 👉 테스트넷용(있으면 사용, 없으면 그대로 둬도 됨)
const FLEX_NFT_TESTNET = "0x8ce19090faf32b48adb78db0d029aa3ccd0cc0b8";

// 👉 예전 방식(legacy)용 주소
//    지금은 굳이 안 써도 되지만 UI는 유지하므로 남겨둠
const ADDR: any = {
  bscTestnet: FLEX_NFT_TESTNET,
  bscMainnet: FLEX_NFT_MAINNET,
};

// ============================
// ✅ Legacy NFT ABI (예전 mint 버튼용)
// ============================
const LEGACY_ABI = [
  "function mint(uint256 quantity) payable",
  "function price() view returns (uint256)",
];

// ============================
// ✅ FlexNFT (OpenEditionERC721) ABI
//    - claim(address receiver, uint256 quantity) payable
// ============================
const FLEX_ABI = [
  "function claim(address receiver, uint256 quantity) payable",
];

// ----------------------
// ✅ 공통 지갑 연결 함수 (MetaMask)
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
  const btnFlex = document.getElementById("mint-flex") as HTMLButtonElement;
  const log = document.getElementById("mint-log") as HTMLPreElement;

  // ----------------------
  // 🟡 MetaMask 연결 버튼
  // ----------------------
  btnC.onclick = async () => {
    try {
      const signer = await connect(sel.value);
      log.textContent = "Connected: " + (await signer.getAddress());
    } catch (e: any) {
      log.textContent = "Connect error: " + (e.message || e);
    }
  };

  // ----------------------
  // 🟡 Legacy Mint 버튼 (예전 컨트랙트용)
  //    지금은 FlexNFT와 같은 주소를 쓰지만,
  //    혹시 안 될 경우를 위해 보조 용도로만 사용해도 됨
  // ----------------------
  btnM.onclick = async () => {
    try {
      const signer = await connect(sel.value);
      const contract = new Contract(ADDR[sel.value], LEGACY_ABI, signer);

      // 기본값 0.01 BNB, 컨트랙트에 price() 있으면 거기 값 사용
      let value = parseEther("0.01");
      try {
        const onchainPrice = await contract.price();
        if (onchainPrice) {
          value = onchainPrice;
        }
      } catch {
        // price() 없으면 기본값 유지
      }

      const tx = await contract.mint(1, { value });
      log.textContent = "Minting (Legacy)... TX: " + tx.hash;
      await tx.wait();
      log.textContent = "✅ Minted (Legacy NFT)";
    } catch (e: any) {
      log.textContent =
        "Mint error (Legacy): " + (e.reason || e.message || String(e));
    }
  };

  // ----------------------
  // 🟢 FlexNFT 전용 Mint 버튼 (OpenEditionERC721)
//    -> thirdweb JS 없이, 컨트랙트에 직접 claim 호출
  // ----------------------
  btnFlex.onclick = async () => {
    try {
      // 1) MetaMask 연결 + BNB Mainnet 보장
      const signer = await connect("bscMainnet");
      const userAddress = await signer.getAddress();

      // 2) 컨트랙트 인스턴스 (FlexNFT 메인넷)
      const flex = new Contract(FLEX_NFT_MAINNET, FLEX_ABI, signer);

      // 3) 가격 설정
      //    thirdweb Claim Conditions 에서 설정한 가격:
      //    0.0001 BNB 이므로 그대로 사용
      const unitPrice = parseEther("0.0001"); // BigInt
      const quantity = 1n;
      const totalValue = unitPrice * quantity;

      // 4) 트랜잭션 전송
      const tx = await flex.claim(userAddress, quantity, {
        value: totalValue,
      } as any);

      log.textContent = "Minting FlexNFT... TX: " + tx.hash;
      await tx.wait();

      log.textContent =
        "✅ FlexNFT Mint Success! 트랜잭션이 BscScan에 기록되었습니다.";
    } catch (err: any) {
      console.error("❌ FlexNFT Mint 실패:", err);
      log.textContent =
        "❌ FlexNFT Mint Error: " +
        (err.reason || err.message || String(err));
    }
  };
}
