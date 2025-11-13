// src/mint.ts
// FLEX NFT MINT - Phase 4까지 임시 비활성화 버전 (Coming Soon)

// ---- DOM 엘리먼트 -------------------------------------------------

const networkSelect = document.getElementById("mint-network") as HTMLSelectElement | null;
const btnConnect = document.getElementById("mint-connect") as HTMLButtonElement | null;
const btnMintLegacy = document.getElementById("mint-legacy") as HTMLButtonElement | null;
const btnMintFlex = document.getElementById("mint-flex") as HTMLButtonElement | null;
const mintLog = document.getElementById("mint-log") as HTMLDivElement | null;

// ---- 로그 유틸 ----------------------------------------------------

function log(msg: string) {
  if (mintLog) {
    mintLog.textContent = msg;
  }
  console.log(msg);
}

// ---- 초기화 -------------------------------------------------------

function init() {
  // 네트워크 셀렉트 박스가 있다면 BNB Mainnet으로 고정 표시
  if (networkSelect) {
    networkSelect.value = "bnb-mainnet";
  }

  // 지갑 연결 버튼: 지금은 토큰/프리세일용 준비 중이라는 안내만
  if (btnConnect) {
    btnConnect.addEventListener("click", () => {
      log("지갑 연결은 토큰 / 프리세일용으로 준비 중입니다. NFT 민팅은 로드맵 Phase 4에서 오픈 예정입니다.");
    });
  }

  // Legacy 버튼: 완전히 비활성화 안내
  if (btnMintLegacy) {
    btnMintLegacy.onclick = () => {
      log("Legacy NFT Mint는 비활성화되었습니다. (로드맵 Phase 4에서 새 FlexNFT 민팅으로 다시 오픈 예정)");
    };
  }

  // FlexNFT 버튼: Coming Soon 안내만 표시
  if (btnMintFlex) {
    btnMintFlex.onclick = () => {
      log("FlexNFT Mint 는 로드맵 Phase 4 (Ecosystem Expansion)에서 오픈 예정입니다. 지금은 준비 중 상태입니다. 🙂");
    };
  }

  // 초기 상태 메시지
  log("FLEX NFT MINT: Coming Soon (Phase 4). 현재는 민팅 기능이 비활성화된 상태입니다.");
}

// Vite 번들에서 자동 실행
init();
