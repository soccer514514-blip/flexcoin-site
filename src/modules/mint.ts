// ✅ 기본 import (ethers.js + thirdweb 병합)
import { BrowserProvider, Contract, parseEther } from "ethers";
import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  sendTransaction,
} from "thirdweb";
import { BNBChain } from "thirdweb/chains";

// ✅ 체인 정의 (기존 유지)
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

// ✅ NFT 컨트랙트 주소
const ADDR: any = {
  bscTestnet: "0xYourTestnetNFTAddress",
  bscMainnet: "0x834586083e355ae80b88f479178935085dD3Bf75", // ✅ FlexNFT mainnet 주소
};

// ✅ ABI 정의 (기존 유지)
const ABI = [
  "function mint(uint256 quantity) payable",
  "function price() view returns (uint256)",
];

// ✅ Thirdweb client (추가)
const client = createThirdwebClient({
  clientId: "YOUR_THIRDWEB_CLIENT_ID", // thirdweb 프로젝트 client ID
});

const nftContract = getContract({
  client,
  address: "0x834586083e355ae80b88f479178935085dD3Bf75", // FlexNFT mainnet
  chain: BNBChain,
});

// ----------------------
// ✅ 공통 지갑 연결 함수
// ----------------------
async function connect(chainKey: string) {
  if (!(window as any).ethereum)
    throw new Error("지갑이 없습니다. MetaMask를 설치하세요.");
  const target = CHAINS[chainKey];
  try {
    await (window as any).ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: target.chainId }],
    });
  } catch (e: any) {
    if (e.code === 4902) {
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
// ✅ 기존 Mint UI + FlexNFT 확장
// ----------------------
export function setupMintUI() {
  const sel = document.getElementById("net") as HTMLSelectElement;
  const btnC = document.getElementById("connect") as HTMLButtonElement;
  const btnM = document.getElementById("mint") as HTMLButtonElement;
  const btnFlex = document.getElementById("mint-flex") as HTMLButtonElement; // 새 Flex 버튼
  const log = document.getElementById("mint-log") as HTMLPreElement;

  // ----------------------
  // 🟡 기본 NFT Mint
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
      let value = parseEther("0.01");
      try {
        value = await contract.price();
      } catch {}
      const tx = await contract.mint(1, { value });
      log.textContent = "Minting... TX: " + tx.hash;
      await tx.wait();
      log.textContent = "✅ Minted (기존 NFT)";
    } catch (e: any) {
      log.textContent = "Mint error: " + (e.message || e);
    }
  };

  // ----------------------
  // 🟢 FlexNFT 전용 Mint (thirdweb Claim)
  // ----------------------
  btnFlex.onclick = async () => {
    try {
      const signer = await connect("bscMainnet");
      const walletAddress = await signer.getAddress();

      const tx = prepareContractCall({
        contract: nftContract,
        method: "claim",
        params: [walletAddress, 1],
        value: "100000000000000", // 0.0001 BNB in Wei
      });

      const receipt = await sendTransaction({ transaction: tx });
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
