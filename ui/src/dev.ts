import { ethers } from "ethers"
import { Call } from "./components/graph/lib/types"
import { Trace, Func, Input, Output } from "./components/tracer/types"
import { dfs} from "./components/graph/lib/graph"

import TX from "../notes/data/tx-res.json"
import NAMES from "../notes/data/names.json"
import ABIS from "../notes/data/abis.json"
import "../notes/req.ts"

const abis = ABIS.reduce((z, abi) => {
  if (abi.abi) {
    // @ts-ignore
    z[abi.addr] = abi.abi
  }
  return z
}, {})

function zip<A, B, C>(a: A[], b: B[], f: (a: A, b: B) => C): C[] {
  const n = Math.min(a.length, b.length)
  const c: C[] = []

  for (let i = 0; i < n; i++) {
    c.push(f(a[i], b[i]))
  }

  return c
}

type TxCall = {
  from: string
  to: string
  input: string
  output?: string
  calls?: TxCall[]
  value: string
  gas: string
  gasUsed: string
  type: string
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
let objId = 0
const flat: [number, TxCall][] = []

// Address => objId
export const ids: Map<string, number> = new Map()
export const objs: Map<number, Obj> = new Map()
export const arrows: Arrow[] = []

function parseTx(abi: any[] | null ,input: string, output?: string): { name: string, inputs: Input[], outputs: Output[], selector: string } | null {
  if (!abi) {
    return null
  }

  const iface = new ethers.Interface(abi)
  const tx = iface.parseTransaction({ data: input })
  if (!tx) {
    return null
  }

  const func = {
    name: tx.name,
    selector: tx.selector,
    inputs: [],
    outputs: []
  }
  // console.log("TX", tx)
  // @ts-ignore
  if (tx?.fragment) {
    const vals = iface.decodeFunctionData(tx.fragment, input)
    // @ts-ignore
    func.inputs = zip(vals, [...tx.fragment.inputs], (v, t) => {
      return {
        type: t.type,
        name: t.name,
        value: v
      }
    })

  }
  if (tx?.fragment && output) {
    // @ts-ignore
    const vals = iface.decodeFunctionResult(tx.fragment, output)
    // @ts-ignore
    func.outputs = zip(vals, [...tx.fragment.outputs], (v, t) => {
      return {
        type: t.type,
        name: t.name,
        value: v
      }
    })
  }
  return func
}

let traceId = 0
const stack: Trace[] = []

dfs<TxCall>(
  // @ts-ignore
  TX.result,
  (c) => c?.calls || [],
  (d, c) => {
    // console.log("CALL", c)
    // @ts-ignore
    const func = parseTx(abis[c.to], c.input, c.output)

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
        ids.set(addr, objId)
        // @ts-ignore
        objs.set(objId, { address: addr, name: NAMES[addr] || null })
        objId += 1
      }
    }
    flat.push([d, c])

    // Stack
    const trace: Trace = {
      id: traceId,
      func: {
        depth: d,
        // @ts-ignore
        obj: NAMES[c.to] || c.to,
        name: func?.name || "",
        inputs: func?.inputs || [],
        outputs: func?.outputs || [],
        // TODO:
        ok: true,
        vm: {
          // @ts-ignore
          contract: NAMES[c.to],
          address: c.to,
          value: BigInt(c.value || 0),
          type: c.type.toLowerCase(),
          rawInput: c.input,
          rawOutput: c.output,
          selector: func?.selector,
          gas: BigInt(c.gasUsed)
        }
      },
      children: [],
    }
    // 0 based id
    traceId++

    while (stack.length >= d + 1) {
      // @ts-ignore
      stack.pop()
    }
    // @ts-ignore
    const parent = stack[stack.length - 1]
    if (parent) {
      parent.children.push(trace)
    }
    stack.push(trace)
  },
)

export const trace = stack[0]

export const calls: Call[] = []

for (const [d, c] of flat) {
  calls.push({
    // @ts-ignore
    src: ids.get(c.from),
    // @ts-ignore
    dst: ids.get(c.to),
    depth: d,
  })
}

