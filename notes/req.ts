import {ethers} from "ethers"
import res from "./tx-res.json"
import ABIS from "./abis.json"
import env from "./env"
import {get, post} from "./lib"

// 1. Get tx trace -> getTxTrace
// 2. Collect contract addresses
// 3. Get contract name, abi, etc... -> batch getContract
// 4. Parse ABI
// 5. Merge into trace

// TODO: db data
// chain => address => contract
//                     - name
//                     - address
//                     - abi
// function selector
// - selector
// - inputs
// - outputs

/*
console.log(ethers)

for (const abi of ABIS) {
  if (abi.abi) {
    const contract = new ethers.Interface(abi.abi)
  }
}

console.log("RES", res)
*/

async function getTxTrace(txHash: string) {
  const res = await post(env.RPC_URL, {
    jsonrpc: "2.0",
    method: "debug_traceTransaction",
    params: [txHash, { tracer: "callTracer" }],
    id: 1,
  })
  console.log(res)
}

async function getContract(
  addr: string
): Promise<{ abi: string; name: string }> {
  const res = await get(
    `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${addr}&apikey=${env.ETHERSCAN_API_KEY}`
  )
  console.log(res)

  // @ts-ignore
  const abi = res?.result?.[0]?.ABI || ""
  // @ts-ignore
  const name = res?.result?.[0]?.ContractName || ""

  const parse = (abi: string) => {
    try {
      return JSON.parse(abi)
    } catch (e) {
      return null
    }
  }

  return { abi: parse(abi), name }
}

// Main
const TX_HASH =
  "0x5e4deab9462bec720f883522d306ec306959cb3ae1ec2eaf0d55477eed01b5a4"

/*
async function batch() {
  const res = []
  for (const addr of addrs) {
    const { name, abi } = await getContract(addr)
    // @ts-ignore
    res.push({ addr, name, abi })
  }
  console.log(res)
}

const map = contracts.reduce((z, e) => {
  // @ts-ignore
  z[e.addr] = e.name
  return z
}, {})

console.log("MAP", map)
*/
