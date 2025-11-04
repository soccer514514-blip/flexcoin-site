
import { BrowserProvider, Contract, parseEther } from 'ethers'

const CHAINS:any = {
  bscTestnet: { chainId: '0x61', name: 'BSC Testnet', rpc: 'https://data-seed-prebsc-1-s3.binance.org:8545' },
  bscMainnet: { chainId: '0x38', name: 'BSC', rpc: 'https://bsc-dataseed.binance.org' }
}

const ADDR:any = {
  bscTestnet: '0xYourTestnetNFTAddress',
  bscMainnet: '0xYourMainnetNFTAddress'
}
const ABI = [
  "function mint(uint256 quantity) payable",
  "function price() view returns (uint256)"
]

async function connect(chainKey:string){
  if (!(window as any).ethereum) throw new Error('지갑이 없습니다. MetaMask를 설치하세요.')
  const target = CHAINS[chainKey]
  try{
    await (window as any).ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: target.chainId }] })
  }catch(e:any){
    if (e.code === 4902){
      await (window as any).ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{ chainId: target.chainId, chainName: target.name, rpcUrls: [target.rpc], nativeCurrency:{name:'BNB',symbol:'BNB',decimals:18} }]
      })
    }else{ throw e }
  }
  const provider = new BrowserProvider((window as any).ethereum)
  const signer = await provider.getSigner()
  return signer
}

export function setupMintUI(){
  const sel = document.getElementById('net') as HTMLSelectElement
  const btnC = document.getElementById('connect') as HTMLButtonElement
  const btnM = document.getElementById('mint') as HTMLButtonElement
  const log = document.getElementById('mint-log') as HTMLPreElement

  btnC.onclick = async ()=>{
    try{
      const signer = await connect(sel.value)
      log.textContent = 'Connected: ' + await signer.getAddress()
    }catch(e:any){
      log.textContent = 'Connect error: ' + (e.message || e)
    }
  }

  btnM.onclick = async ()=>{
    try{
      const signer = await connect(sel.value)
      const contract = new Contract(ADDR[sel.value], ABI, signer)
      let value = parseEther('0.01')
      try{ value = await contract.price() }catch{}
      const tx = await contract.mint(1, { value })
      log.textContent = 'Minting... TX: ' + tx.hash
      await tx.wait()
      log.textContent = 'Minted!'
    }catch(e:any){
      log.textContent = 'Mint error: ' + (e.message || e)
    }
  }
}
