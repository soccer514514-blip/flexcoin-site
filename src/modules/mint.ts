// ======================================
// ✅ 기본 import
// ======================================
import { BrowserProvider, Contract, parseEther } from "ethers";
import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  sendAndConfirmTransaction,
} from "thirdweb";
import { BNBChain } from "thirdweb/chains";
import { createWallet } from "thirdweb/wallets";

// ======================================
// ✅ Thirdweb Client
// ======================================
const client = createThirdwebClient({
  clientId: "blb54e589683ef64f55e316f2162a4fe",
});

// ======================================
// ✅ 체인 정보
// ======================================
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

// ======================================
// ✅ NFT 주소 (전부 소문자로!)
// ======================================
const FLEX_NFT_MAINNET = "0x834586083e355ae80b88f479178935085dd3bf75";
const FLEX_NFT_TESTNET = "0x8ce19090faf32b48adb78db0d029aa3ccd0cc0b8";

const ADDR: any = {
  bscTestnet: FLEX_NFT_TESTNET,
  bscMainnet: FLEX_NFT_MAINNET,
};

// ======================================
// ✅ Legacy NFT ABI (구 mint용)
// ======================================
const ABI = [
  "function mint(uint256 quantity) payable",
  "function price() view returns (uint256)",
];

// ======================================
// ✅ Thirdweb FlexNFT Drop 컨트랙트
// ======================================
const nftContract = getContract({
  client,
  address: FLEX_NFT_MAINNET,
  chain: BNBChain,
});

// ======================================
// ✅ MetaMask Wallet
// ======================================
const metamaskWallet = createWallet("io.metamask");

// ======================================
// ✅ MetaMask 연결 함수
// ======================================
async function connect(chainKey: string) {
  if (!window.ethereum) throw new Error("MetaMask가 필요합니다.");

  const target = CHAINS[chainKey];

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: target.chainId }],
    });
  } catch (e: any) {
    if (e.code === 4902) {
      await window.ethereum.request({
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

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return signer;
}

// ======================================
// ✅ UI Setup
// ======================================
export function setupMintUI() {
  const sel = document.getElementById("net") as HTMLSelectElement;
  const btnC = document.getElementById("connect") as HTMLButtonElement;
  const btnM = document.getElementById("mint") as HTMLButtonElement;
  const btnFlex = document.getElementById("mint-flex") as HTMLButtonElement;
  const log = document.getElementById("mint-log") as HTMLPreElement;

  // -------------------------------
  // 기본 Legacy mint
  // -------------------------------
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
      log.textContent = "✅ Minted (Legacy NFT)";
    } catch (e: any) {
      log.textContent = "Mint error: " + (e.message || e);
    }
  };

  // -------------------------------
  // 🔥 FlexNFT (thirdweb drop)
  // -------------------------------
  btnFlex.onclick = async () => {
    try {
      const account = await metamaskWallet.connect({
        client,
        chain: BNBChain,
      });

      // claimTo(address, quantity)
      const transaction = prepareContractCall({
        contract: nftContract,
        method: "claimTo",
        params: [account.address, 1],
        value: 100000000000000n, // 0.0001 BNB
      });

      const receipt = await sendAndConfirmTransaction({
        transaction,
        account,
      });

      log.textContent =
        "✅ FlexNFT Mint Success!\nTX: " + receipt.transactionHash;
    } catch (err: any) {
      log.textContent = "❌ FlexNFT Mint Error: " + (err.message || err);
    }
  };
}
