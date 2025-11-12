// src/modules/mint.ts
// -------------------------------------------------------------
// FLEX NFT 민팅 모듈 (ethers + thirdweb 하이브리드, 오류내성 보강)
// - 체인 스위치/추가 자동
// - /config/addresses.json 또는 /public/config/addresses.json 에서 nft 주소 자동 로드
// - mint(1, {value}) -> 실패 시 mint({value}) 폴백
// - price() 없으면 고정가 0.0001 BNB 폴백
// - thirdweb clientId 가 있으면 claim() 경로도 시도 (없어도 정상 동작)
// -------------------------------------------------------------

import { BrowserProvider, Contract, parseEther } from "ethers";
import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  sendTransaction,
} from "thirdweb";
import { BNBChain } from "thirdweb/chains";

// ===== 체인 정의 =====
const CHAINS: Record<
  "bscTestnet" | "bscMainnet",
  { chainId: `0x${string}`; name: string; rpc: string }
> = {
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

// ===== 기본 주소(폴백) =====
const DEFAULT_ADDR = {
  bscTestnet: "0xYourTestnetNFTAddress",
  bscMainnet: "0x834586083e355ae80b88f479178935085dD3Bf75", // FlexNFT mainnet
};

// ===== 컨트랙트 ABI (오버로드 대응) =====
const ABI = [
  "function mint(uint256 quantity) payable",
  "function mint() payable",
  "function price() view returns (uint256)",
];

// ===== thirdweb (선택적) =====
const THIRDWEB_CLIENT_ID =
  (window as any)?.THIRDWEB_CLIENT_ID ||
  (window as any)?.env?.THIRDWEB_CLIENT_ID ||
  "YOUR_THIRDWEB_CLIENT_ID"; // 없으면 그냥 ethers 경로만 사용

const twClient =
  THIRDWEB_CLIENT_ID && THIRDWEB_CLIENT_ID !== "YOUR_THIRDWEB_CLIENT_ID"
    ? createThirdwebClient({ clientId: THIRDWEB_CLIENT_ID })
    : undefined;

// 유틸: JSON 폴백 로더
async function fetchFirst<T = any>(
  paths: string[],
  fallback: T
): Promise<T> {
  for (const p of paths) {
    try {
      const r = await fetch(p, { cache: "no-cache" });
      if (r.ok) return (await r.json()) as T;
    } catch (_) {}
  }
  return fallback;
}

// 지갑 연결 & 체인 스위치
async function connect(chainKey: "bscMainnet" | "bscTestnet") {
  const eth = (window as any).ethereum;
  if (!eth) throw new Error("지갑이 없습니다. MetaMask를 설치하세요.");
  const target = CHAINS[chainKey];

  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: target.chainId }],
    });
  } catch (e: any) {
    if (e?.code === 4902) {
      await eth.request({
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

  const provider = new BrowserProvider(eth);
  const signer = await provider.getSigner();
  return signer;
}

// 수치 포맷
const fmt = (v: any) => (typeof v === "bigint" ? `${v}` : String(v));

// BscScan 링크
const scanTx = (hash: string) => `https://bscscan.com/tx/${hash}`;

// ===== 공개 API: 버튼 바인딩 =====
export async function setupMintUI() {
  // 주소 자동 로드
  const addrJson = await fetchFirst<any>(
    ["/config/addresses.json", "/public/config/addresses.json"],
    {}
  );
  const ADDR = {
    bscMainnet: addrJson.nft_mainnet || DEFAULT_ADDR.bscMainnet,
    bscTestnet: addrJson.nft_testnet || DEFAULT_ADDR.bscTestnet,
  };

  // thirdweb 컨트랙트 (있을 때만)
  const twContract =
    twClient &&
    getContract({
      client: twClient,
      address: ADDR.bscMainnet,
      chain: BNBChain,
    });

  const sel = document.getElementById("net") as HTMLSelectElement;
  const btnC = document.getElementById("connect") as HTMLButtonElement;
  const btnLegacy = document.getElementById("mint") as HTMLButtonElement;
  const btnFlex = document.getElementById("mint-flex") as HTMLButtonElement;
  const log = document.getElementById("mint-log") as HTMLPreElement;
  const write = (s: string) => (log.textContent = s);

  // 연결
  btnC.onclick = async () => {
    try {
      const signer = await connect(sel.value as any);
      write("Connected: " + (await signer.getAddress()));
    } catch (e: any) {
      write("Connect error: " + (e?.message || e));
    }
  };

  // ----- 레거시 민트 (ethers) -----
  btnLegacy.onclick = async () => {
    try {
      const chainKey = sel.value as "bscMainnet" | "bscTestnet";
      const signer = await connect(chainKey);
      const contract = new Contract(ADDR[chainKey], ABI, signer);

      // 1) price() 시도 → 실패 시 0.0001 BNB 고정가
      let value = parseEther("0.0001");
      try {
        const p = await contract.price();
        if (typeof p === "bigint" && p > 0n) value = p;
      } catch {}

      // 2) mint(1) 시도 → 실패하면 mint()로 폴백
      let tx;
      try {
        tx = await contract.mint(1, { value });
      } catch (e1) {
        tx = await contract.mint({ value });
      }

      write("Minting... TX: " + tx.hash + "\n" + scanTx(tx.hash));
      const r = await tx.wait();
      write("✅ Minted!\n" + scanTx(tx.hash) + `\nstatus: ${r?.status ?? "-"}`);
    } catch (e: any) {
      // MetaMask -32603(Internal JSON-RPC) 가독화
      const msg =
        e?.data?.message ||
        e?.error?.message ||
        e?.message ||
        String(e);
      write("Mint error: " + msg);
    }
  };

  // ----- FlexNFT 민트 (thirdweb claim) -----
  btnFlex.onclick = async () => {
    // thirdweb clientId 없으면 ethers 경로로 동일 수행
    if (!twClient || !twContract) {
      btnLegacy.click();
      return;
    }

    try {
      // FlexNFT는 메인넷 고정
      const signer = await connect("bscMainnet");
      const wallet = await signer.getAddress();

      // 0.0001 BNB
      const valueWei = "100000000000000";

      const tx = prepareContractCall({
        contract: twContract,
        method: "claim",
        params: [wallet, 1],
        value: valueWei,
      });

      const receipt = await sendTransaction({ transaction: tx });
      const hash =
        (receipt as any)?.transactionHash ||
        (receipt as any)?.hash ||
        "";
      log.textContent =
        "✅ FlexNFT Mint Success!\n" +
        (hash ? scanTx(hash) : "TX sent.");
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.error?.message ||
        err?.message ||
        String(err);
      log.textContent = "❌ FlexNFT Mint Error: " + msg;
    }
  };
}

export default setupMintUI;
