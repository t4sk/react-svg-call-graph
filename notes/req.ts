import {ethers} from "ethers"
import TX_TRACE_RES from "./data/tx-res.json"
import ABIS from "./data/abis.json"
import env from "./env"
import {get, post} from "./lib"
import {TxTrace, Call} from "./types"
import { dfs } from "../src/lib/graph"

// 1. Get tx trace -> getTxTrace
// 2. Collect contract addresses -> dfs tx trace
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

async function getTxTrace(txHash: string): Promise<TxTrace> {
  return post<any, TxTrace>(env.RPC_URL, {
    jsonrpc: "2.0",
    method: "debug_traceTransaction",
    params: [txHash, { tracer: "callTracer" }],
    id: 1,
  })
}

async function getContract(
  addr: string
): Promise<{ abi: string | null; name: string | null }> {
  const res = await get(
    `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${addr}&apikey=${env.ETHERSCAN_API_KEY}`
  )
  console.log(res)

  // @ts-ignore
  const abi = res?.result?.[0]?.ABI || null
  // @ts-ignore
  const name = res?.result?.[0]?.ContractName || null

  const parse = (abi: string) => {
    try {
      return JSON.parse(abi)
    } catch (e) {
      return null
    }
  }

  return { abi: parse(abi), name }
}

async function main() {
    const txHash =
      "0x5e4deab9462bec720f883522d306ec306959cb3ae1ec2eaf0d55477eed01b5a4"

    // const trace = await getTxTrace(txHash)
    // console.log(trace)

    const calls: [number, Call][] = []

    dfs<Call>(
      // @ts-ignore
      TX_TRACE_RES.result,
      (c) => c?.calls || [],
      (d, c) => {
        calls.push([d, c])
      },
    )

    const addrs = new Set<string>()
    for (const [_, c] of calls) {
        addrs.add(c.from)
        addrs.add(c.to)
    }

    // TODO: promise.all
    for (const addr of addrs) {
        const res = await getContract(addr)
        console.log(addr, res)
    }


}

main()

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
