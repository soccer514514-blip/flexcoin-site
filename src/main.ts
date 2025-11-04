// src/modules/mint.ts — SAFE
type NetKey = "bsc" | "bscTestnet";

const ADDR: Record<NetKey, string> = {
  // TODO: 실제 컨트랙트 주소로 교체
  bsc: "0x0000000000000000000000000000000000000000",
  bscTestnet: "0x0000000000000000000000000000000000000000"
};

const ABI = [
  { "inputs": [], "name": "price", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "quantity", "type": "uint256" }], "name": "mint", "outputs": [], "stateMutability": "payable", "type": "function" },
];

const NETS: Record<NetKey, { chainId: number; chainHex: string; label: string }> = {
  bsc: { chainId: 56, chainHex: "0x38", label: "BSC Mainnet" },
  bscTestnet: { chainId: 97, chainHex: "0x61", label: "BSC Testnet" },
};

function el<T extends HTMLElement = HTMLElement>(id: string) {
  return document.getElementById(id) as T | null;
}

async function loadEthers() {
  try {
    // 이미 로드됐으면 재사용
    if ((window as any).ethers) return (window as any).ethers;
    const mod = await import("https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js");
    (window as any).ethers = mod;
    return mod;
  } catch {
    return null;
  }
}

function fmtEth(wei?: string | number): string {
  try {
    const ethers = (window as any).ethers;
    if (!ethers || wei == null) return "-";
    return ethers.utils.formatEther(wei);
  } catch { return "-"; }
}

async function connectWallet(): Promise<string | null> {
  try {
    const { ethereum } = window as any;
    if (!ethereum) return null;
    const accs = await ethereum.request({ method: "eth_requestAccounts" });
    return (accs && accs[0]) || null;
  } catch { return null; }
}

async function ensureNetwork(target: NetKey) {
  try {
    const { ethereum } = window as any;
    if (!ethereum) return false;
    const current = await ethereum.request({ method: "eth_chainId" });
    const need = NETS[target].chainHex;
    if (current?.toLowerCase() === need.toLowerCase()) return true;
    await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: need }] });
    return true;
  } catch { return false; }
}

async function readPrice(addr: string): Promise<string | null> {
  try {
    const ethers = await loadEthers();
    if (!ethers) return null;
    const provider = new ethers.providers.Web3Provider((window as any).ethereum, "any");
    const c = new ethers.Contract(addr, ABI, provider);
    const p = await c.price();
    return p?.toString?.() ?? null;
  } catch { return null; }
}

async function doMint(addr: string, qty: number, priceWei: string | null) {
  const ethers = await loadEthers();
  if (!ethers) throw new Error("ethers 로딩 실패");
  const provider = new ethers.providers.Web3Provider((window as any).ethereum, "any");
  const signer = provider.getSigner();
  const c = new ethers.Contract(addr, ABI, signer);
  const value = priceWei ? ethers.BigNumber.from(priceWei).mul(qty) : "0";
  const tx = await c.mint(qty, { value });
  return await tx.wait();
}

function renderMintUI() {
  const root = el("mint-root");
  if (!root) return false;
  root.innerHTML = `
    <div class="card">
      <div class="row" style="justify-content:space-between">
        <select id="mint-net">
          <option value="bscTestnet">BSC Testnet</option>
          <option value="bsc">BSC Mainnet</option>
        </select>

        <div class="row">
          <input id="mint-qty" type="number" min="1" value="1" style="width:80px;padding:8px;border-radius:10px;border:1px solid #222;background:#131316;color:#e9e9ec" />
          <a id="btn-connect" class="btn" href="javascript:;">Connect Wallet</a>
          <a id="btn-mint" class="btn" href="javascript:;" style="display:none">Mint 1 NFT</a>
        </div>
      </div>

      <div class="muted" style="margin-top:10px">
        <span>Address:</span> <code id="mint-addr">-</code>
        <span style="margin-left:12px">Price:</span> <code id="mint-price">-</code> <span>BNB</span>
        <div id="mint-msg" class="muted" style="margin-top:8px"></div>
      </div>
    </div>
  `;
  return true;
}

export async function setupMintUI() {
  // 렌더 자리 없으면 조용히 종료(예외 X)
  if (!renderMintUI()) return;

  const btnConnect = el<HTMLAnchorElement>("btn-connect");
  const btnMint = el<HTMLAnchorElement>("btn-mint");
  const selNet = el<HTMLSelectElement>("mint-net");
  const qtyInput = el<HTMLInputElement>("mint-qty");
  const outAddr = el("mint-addr");
  const outPrice = el("mint-price");
  const outMsg = el("mint-msg");

  let net: NetKey = (selNet?.value as NetKey) || "bscTestnet";
  let user: string | null = null;
  let priceWei: string | null = null;

  const toast = (m: string) => { if (outMsg) outMsg.textContent = m; };

  async function refreshInfo() {
    const addr = ADDR[net];
    if (outAddr) outAddr.textContent = addr && !/^0x0{40}$/i.test(addr) ? addr : "(주소 미설정)";
    priceWei = null; if (outPrice) outPrice.textContent = "-";

    if (!addr || /^0x0{40}$/i.test(addr)) {
      toast("컨트랙트 주소가 아직 설정되지 않았습니다.");
      if (btnMint) btnMint.style.display = "none";
      return;
    }
    priceWei = await readPrice(addr);
    if (priceWei && outPrice) outPrice.textContent = fmtEth(priceWei);
    if (btnMint) {
      const q = Math.max(1, parseInt(qtyInput?.value || "1", 10) || 1);
      btnMint.textContent = `Mint ${q} NFT`;
      btnMint.style.display = user ? "inline-block" : "none";
    }
  }

  selNet?.addEventListener("change", async () => { net = (selNet.value as NetKey) || "bscTestnet"; await refreshInfo(); });
  qtyInput?.addEventListener("input", () => {
    if (btnMint) {
      const q = Math.max(1, parseInt(qtyInput.value || "1", 10) || 1);
      btnMint.textContent = `Mint ${q} NFT`;
    }
  });

  btnConnect?.addEventListener("click", async () => {
    const hasEth = (window as any).ethereum;
    if (!hasEth) { toast("메타마스크(또는 EVM 지갑)를 설치해 주세요."); return; }
    if (!(await ensureNetwork(net))) { toast("지갑 네트워크를 전환할 수 없습니다."); return; }
    user = await connectWallet();
    if (!user) { toast("지갑 연결을 취소했습니다."); return; }
    toast(`지갑 연결됨: ${user.substring(0, 6)}…${user.substring(user.length - 4)}`);
    if (btnMint) btnMint.style.display = "inline-block";
  });

  btnMint?.addEventListener("click", async () => {
    try {
      const addr = ADDR[net];
      if (!addr || /^0x0{40}$/i.test(addr)) { toast("컨트랙트 주소가 설정되어 있지 않습니다."); return; }
      if (!user) { toast("먼저 지갑을 연결해 주세요."); return; }
      const q = Math.max(1, parseInt(qtyInput?.value || "1", 10) || 1);
      toast("민팅 트랜잭션 전송 중…");
      const receipt = await doMint(addr, q, priceWei);
      toast(`민팅 완료! Tx: ${receipt.transactionHash}`);
    } catch (e: any) {
      console.error(e);
      toast(e?.message || "민팅 실패");
    }
  });

  await refreshInfo();

  const eth = (window as any).ethereum;
  if (eth && eth.on) {
    eth.on("accountsChanged", (accs: string[]) => {
      user = (accs && accs[0]) || null;
      toast(user ? `지갑 변경됨: ${user.substring(0, 6)}…${user.substring(user.length - 4)}` : "지갑 연결 해제됨");
      if (btnMint) btnMint.style.display = user ? "inline-block" : "none";
    });
    eth.on("chainChanged", async () => { await refreshInfo(); });
  }
}
