import { ethers } from "ethers"
import { TxCall, Contract } from "./api/types"
import { Call } from "./components/graph/lib/types"
import { Trace, Input, Output } from "./components/tracer/types"
import { dfs } from "./components/graph/lib/graph"
import { zip } from "./utils"

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

function parse(
  abi: any[] | null,
  input: string,
  output?: string,
): {
  name: string
  inputs: Input[]
  outputs: Output[]
  selector: string
} | null {
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
    outputs: [],
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
        value: v,
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
        value: v,
      }
    })
  }
  return func
}

export function build(
  root: TxCall,
  contracts: Contract[],
): {
  ids: Map<string, number>
  objs: Map<number, Obj>
  arrows: Arrow[]
  calls: Call[]
  trace: Trace
} {
  const cons: { [key: string]: Contract } = contracts.reduce((z, c) => {
    // @ts-ignore
    z[c.address] = c
    return z
  }, {})

  // DFS to flatten tx calls
  // call counter
  let objId = 0
  const flat: [number, TxCall][] = []

  // Address => objId
  const ids: Map<string, number> = new Map()
  const objs: Map<number, Obj> = new Map()
  const arrows: Arrow[] = []

  let traceId = 0
  const stack: Trace[] = []

  dfs<TxCall>(
    root,
    (c) => c?.calls || [],
    (d, c) => {
      // console.log("CALL", c)
      // @ts-ignore
      const func = parse(cons[c.to]?.abi, c.input, c.output)

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
          objs.set(objId, { address: addr, name: cons[addr]?.name || null })
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
          obj: cons[c.to]?.name || c.to,
          name: func?.name || "",
          inputs: func?.inputs || [],
          outputs: func?.outputs || [],
          // TODO:
          ok: true,
          vm: {
            // @ts-ignore
            contract: cons[c.to]?.name,
            address: c.to,
            value: BigInt(c.value || 0),
            type: c.type.toLowerCase(),
            rawInput: c.input,
            rawOutput: c.output,
            selector: func?.selector,
            gas: BigInt(c.gasUsed),
          },
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

  const trace = stack[0]
  const calls: Call[] = []

  for (const [d, c] of flat) {
    calls.push({
      // @ts-ignore
      src: ids.get(c.from),
      // @ts-ignore
      dst: ids.get(c.to),
      depth: d,
    })
  }

  return {
    ids,
    objs,
    arrows,
    trace,
    calls,
  }
}
