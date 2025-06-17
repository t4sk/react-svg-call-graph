import { ethers } from "ethers"
import TX from "../tmp/tx-res.json"
import NAMES from "../tmp/names.json"
import ABIS from "../tmp/abis.json"
import "../tmp/req.ts"

import { Call } from "./lib/types"
import { dfs } from "./lib/graph"

const abis = ABIS.reduce((z, abi) => {
  if (abi.abi) {
    // @ts-ignore
    z[abi.addr] = abi.abi
  }
  return z
}, {})

console.log("ABI", abis)

type TxCall = {
  from: string
  to: string
  input: string
  output?: string
  calls?: TxCall[]
}

export type Obj = {
  address: string
  name: string | null
}

export type Arrow = {
  src: string
  dst: string
  raw: {
    input: string | null
    output: string | null
  }
  function: {
    name: string
    // inputs: any[] | null
    // outputs: any[] | null
  } | null
  // chain specific (gas, delegate call, etc...)
}

// DFS to flatten tx calls
// call counter
let id = 0
// Address => id
const ids: Map<string, number> = new Map()
const flat: [number, TxCall][] = []

export const objs: Map<number, Obj> = new Map()
export const arrows: Arrow[] = []

dfs<TxCall>(
  TX.result,
  (c) => c?.calls || [],
  (d, c) => {
    console.log("CALL", c)
    // @ts-ignore
    const abi = abis[c.to]
    let func = null
    if (abi) {
      const iface = new ethers.Interface(abi)
      const tx = iface.parseTransaction({ data: c.input })
      if (tx) {
        func = {}
        // @ts-ignore
        func.name = tx.name
      }
      console.log("func", tx?.name)
      console.log("TX", tx)
      console.log("INPUTS", tx?.fragment?.inputs, tx?.args)
      // @ts-ignore
      if (tx?.fragment && c.output) {
        // @ts-ignore
        const out = iface.decodeFunctionResult(tx.fragment, c.output)
        console.log("OUT", out)
      }
    }

    arrows.push({
      src: c.from,
      dst: c.to,
      raw: {
        input: c.input || null,
        output: c.output || null,
      },
      // @ts-ignore
      function: func,
    })

    for (const addr of [c.from, c.to]) {
      if (!ids.has(addr)) {
        id += 1
        ids.set(addr, id)
        // @ts-ignore
        objs.set(id, { address: addr, name: NAMES[addr] || null })
      }
    }
    flat.push([d, c])
  },
)

export const calls: Call[] = [
  {
    src: null,
    dst: 1,
    depth: 0,
  },
]

for (const [d, c] of flat) {
  calls.push({
    // @ts-ignore
    src: ids.get(c.from),
    // @ts-ignore
    dst: ids.get(c.to),
    depth: d + 1,
  })
}

const data = []
for (const [key, obj] of objs) {
  data.push(obj.address)
  // console.log(obj)
}
console.log(data)
