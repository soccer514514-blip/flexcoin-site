// src/mint.ts
// FlexNFT 민트 모듈 (BSC 메인넷 OpenEditionERC721 + Drop)

import { BrowserProvider, Contract, parseUnits } from "ethers";

// ---- 상수 설정 ----------------------------------------------------

const BNB_MAINNET = 56;

// thirdweb에서 네이티브 토큰(BNB)을 표시할 때 사용하는 주소
const NATIVE_TOKEN = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" as const;

// FlexNFT 컨트랙트 (BSC 메인넷)
// ※ 체크섬 주소 사용
const NFT_MAINNET = "0x834586083e355ae80B88f479178935085dD3Bf75";

// 일반 0주소 (필요 시 사용)
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// Drop 확장의 claim 함수 ABI (필요한 것만 최소로)
const DROP_ABI = [
  "function claim(address receiver,uint256 quantity,address currency,uint256 pricePerToken,(bytes32[] proof,uint256 quantityLimitPerWallet,uint256 pricePerToken,address currency) allowlistProof,bytes data) payable",
];

// ---- 상태 변수 ----------------------------------------------------

let provider: BrowserProvider | null = null;
let signer: any = null;
let currentAccount: string | null = null;
let currentChainId: number | null = null;

// ---- DOM 엘리먼트 -------------------------------------------------

const networkSelect = document.getElementById("mint-network") as HTMLSelectElement | null;
const btnConnect = document.getElementById("mint-connect") as HTMLButtonElement | null;
const btnMintLegacy = document.getElementById("mint-legacy") as HTMLButtonElement | null;
const btnMintFlex = document.getElementById("mint-flex") as HTMLButtonElement | null;
const mintLog = document.getElementById("mint-log") as HTMLDivElement | null;

function log(msg: string) {
  if (mintLog) mintLog.textContent = msg;
  console.log(msg);
}

// ---- 지갑 연결 ----------------------------------------------------

async function connectWallet() {
  try {
    if (!window.ethereum) {
      log("MetaMask가 브라우저에서 감지되지 않았습니다.");
      return;
    }

    provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    currentAccount = accounts[0];

    const net = await provider.getNetwork();
    currentChainId = Number(net.chainId);

    if (btnConnect && currentAccount) {
      const short = `${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`;
      btnConnect.textContent = `Connected: ${short}`;
    }

    // 네트워크 셀렉트가 있다면 BNB Mainnet으로 고정
    if (networkSelect) {
      networkSelect.value = "bnb-mainnet";
    }

    log(`Connected: ${currentAccount}`);
  } catch (err: any) {
    console.error(err);
    log(`Connect error: ${err?.message ?? String(err)}`);
  }
}

// ---- 체인 체크 & 스위치 -------------------------------------------

async function ensureBnbMainnet() {
  if (!provider) return;

  if (currentChainId === BNB_MAINNET) return;

  try {
    await provider.send("wallet_switchEthereumChain", [
      { chainId: "0x38" }, // 56 in hex
    ]);
    const net = await provider.getNetwork();
    currentChainId = Number(net.chainId);
    log("Switched to BNB Smart Chain mainnet.");
  } catch (err: any) {
    console.error(err);
    log(`네트워크 전환 실패: ${err?.message ?? String(err)}`);
    throw err;
  }
}

// ---- FlexNFT 민트 (0.0001 BNB) ------------------------------------

async function mintFlexNft() {
  try {
    if (!provider || !currentAccount) {
      log("먼저 'Connect' 버튼으로 지갑을 연결해주세요.");
      return;
    }

    await ensureBnbMainnet();

    signer = await provider.getSigner();
    const contract = new Contract(NFT_MAINNET, DROP_ABI, signer);

    // 1개 민트
    const quantity = 1n;

    // thirdweb 대시보드에서 설정한 0.0001 BNB
    const pricePerToken = parseUnits("0.0001", 18); // 0.0001 BNB

    // 퍼블릭 세일용 AllowlistProof
    // - proof: 빈 배열 (화이트리스트 없음)
    // - quantityLimitPerWallet: 이번에 민트 가능한 수량(여기서는 1)
    // - pricePerToken / currency: 실제 클레임 조건과 동일하게 맞춤
    const allowlistProof = {
      proof: [] as string[],
      quantityLimitPerWallet: quantity,
      pricePerToken,
      currency: NATIVE_TOKEN,
    };

    // claim(receiver, quantity, currency, pricePerToken, allowlistProof, data)
    const tx = await contract.claim(
      currentAccount,
      quantity,
      NATIVE_TOKEN,     // 네이티브 토큰(BNB)
      pricePerToken,
      allowlistProof,
      "0x",
      {
        // 실제로 0.0001 BNB 지불
        value: pricePerToken,
      },
    );

    log("트랜잭션 전송됨. MetaMask에서 승인 후 잠시 기다려주세요...");
    const receipt = await tx.wait();
    log(`✅ FlexNFT Mint Success! Tx: ${receipt.hash}`);
  } catch (err: any) {
    console.error(err);
    const message = err?.reason || err?.shortMessage || err?.message || String(err);
    log(`Mint error: ${message}`);
  }
}

// ---- Legacy 버튼은 비활성화(혼동 방지) -----------------------------

function disableLegacy() {
  if (btnMintLegacy) {
    btnMintLegacy.onclick = () => {
      log("Legacy mint는 더 이상 사용하지 않습니다. 오른쪽 'Mint FlexNFT (0.0001 BNB)' 버튼을 사용해주세요.");
    };
  }
}

// ---- 이벤트 바인딩 -------------------------------------------------

function init() {
  if (btnConnect) {
    btnConnect.addEventListener("click", () => {
      void connectWallet();
    });
  }

  if (btnMintFlex) {
    btnMintFlex.addEventListener("click", () => {
      void mintFlexNft();
    });
  }

  disableLegacy();
  log("FLEX NFT MINT 모듈 로드 완료.");
}

// Vite 번들에서 실행되도록
init();
