import { BrowserProvider, Contract, parseEther } from 'ethers'

const CHAINS:any = {
  bscTestnet: { chainId: '0x61', name: 'BSC Testnet', rpc: 'https://data-seed-prebsc-1-s3.binance.org:8545' },
  bscMainnet: { chainId: '0x38', name: 'BSC', rpc: 'https://bsc-dataseed.binance.org' }
}

// Replace these when ready
const ADDR:any = {
  bscTestnet: '0xYourTestnetNFTAddress',
  bscMainnet: '0xYourMainnetNFTAddress'
}
const ABI = [
  // minimal ABI: function mint(uint256 quantity) payable
  "function mint(uint256 quantity) payable",
  "function price() view returns (uint256)"
]

async function connect(chainKey:string){
  if (!window.ethereum) throw new Error('No wallet')
  const target = CHAINS[chainKey]
  try{
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: target.chainId }]
    })
  }catch(e:any){
    if (e.code === 4902){
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: target.chainId,
          chainName: target.name,
          rpcUrls: [target.rpc],
          nativeCurrency: { name:'BNB', symbol:'BNB', decimals:18 }
        }]
      })
    }else{
      throw e
    }
  }
  const provider = new BrowserProvider(window.ethereum as any)
  const signer = await provider.getSigner()
  return { provider, signer }
}

export function setupMintUI(){
  const sel = document.getElementById('net') as HTMLSelectElement
  const btnC = document.getElementById('connect') as HTMLButtonElement
  const btnM = document.getElementById('mint') as HTMLButtonElement
  const log = document.getElementById('mint-log') as HTMLPreElement

  btnC.onclick = async ()=>{
    try{
      const { signer } = await connect(sel.value)
      const addr = await signer.getAddress()
      log.textContent = `Connected: ${addr}`
    }catch(e:any){
      log.textContent = 'Connect error: ' + (e.message || e)
    }
  }

  btnM.onclick = async ()=>{
    try{
      const { signer } = await connect(sel.value)
      const contract = new Contract(ADDR[sel.value], ABI, signer)
      // If contract has price(), fetch; else example 0.01 BNB
      let value = parseEther('0.01')
      try{
        const p = await contract.price()
        value = p
      }catch(_){}
      const tx = await contract.mint(1, { value })
      log.textContent = 'Minting... TX: ' + tx.hash
      const r = await tx.wait()
      log.textContent = 'Minted! Block: ' + r.blockNumber
    }catch(e:any){
      log.textContent = 'Mint error: ' + (e.message || e)
    }
  }
}