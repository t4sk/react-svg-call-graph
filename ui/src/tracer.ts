import { ethers } from "ethers"
import * as api from "./api"
import { TxCall, ContractInfo } from "./api/types"
// TODO: rename type?
import { Call } from "./components/graph/lib/types"
import { Trace, Input, Output, Fn } from "./components/tracer/types"
import * as graph from "./components/graph/lib/graph"
import { zip } from "./utils"
import { Account, Evm } from "./chain"

// TODO: move to graph/lib/types?
export type Obj<V> = {
  id: string
  val: V
}

export type Arrow<V> = {
  src: string
  dst: string
  val: V
}

function parse(
  abi: any[] | null,
  input: string,
  output?: string,
): {
  name?: string
  selector?: string
  inputs?: Input[]
  outputs?: Output[]
} | null {
  if (!abi) {
    return null
  }

  const iface = new ethers.Interface(abi)
  const tx = iface.parseTransaction({ data: input })
  if (!tx) {
    return null
  }

  const fn = {
    name: tx.name,
    selector: tx.selector,
    inputs: [],
    outputs: [],
  }

  // @ts-ignore
  if (tx?.fragment) {
    const vals = iface.decodeFunctionData(tx.fragment, input)
    // @ts-ignore
    fn.inputs = zip(vals, [...tx.fragment.inputs], (v, t) => {
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
    fn.outputs = zip(vals, [...tx.fragment.outputs], (v, t) => {
      return {
        type: t.type,
        name: t.name,
        value: v,
      }
    })
  }
  return fn
}

export function build(
  root: TxCall,
  contracts: ContractInfo[],
): {
  ids: Map<string, number>
  objs: Map<string, Obj<Account | Fn>>
  arrows: Arrow<Fn>[]
  calls: Call[]
  trace: Trace<Evm>
} {
  const cons: { [key: string]: ContractInfo[] } = contracts.reduce((z, c) => {
    // @ts-ignore
    z[c.address] = c
    return z
  }, {})

  // id = fn = fn : address : selector
  //    = account = addr : address
  const objs: Map<string, Obj<Account | Fn>> = new Map()
  // TODO: remove?
  const ids: Map<string, number> = new Map()
  // TODO: remove?
  const calls: Call[] = []
  const arrows: Arrow<Fn>[] = []
  const stack: Trace<Evm>[] = []

  graph.dfs<TxCall>(
    root,
    (c) => c?.calls || [],
    (i, d, c) => {
      // @ts-ignore
      const fn = parse(cons[c.to]?.abi, c.input, c.output)

      const trace: Trace<Evm> = {
        id: i,
        depth: d,
        fn: {
          id: `fn:${c.to}:${fn?.selector || ""}`,
          // @ts-ignore
          mod: cons[c.to]?.name || c.to,
          name: fn?.name || "",
          inputs: fn?.inputs || [],
          outputs: fn?.outputs || [],
        },
        ctx: {
          // @ts-ignore
          name: cons[c.to]?.name,
          src: c.from,
          dst: c.to,
          value: BigInt(c.value || 0),
          type: c.type.toLowerCase(),
          raw: {
            input: c.input,
            output: c.output,
          },
          selector: fn?.selector,
          gas: BigInt(c.gasUsed),
        },
        calls: [],
      }

      // Stack
      while (stack.length >= d + 1) {
        stack.pop()
      }
      const parent = stack[stack.length - 1]
      if (parent) {
        parent.calls.push(trace)
      }
      stack.push(trace)

      // Objects
      if (!objs.has(trace.fn.id)) {
        objs.set(trace.fn.id, { id: trace.fn.id, val: trace.fn })
      }

      for (const addr of [c.from, c.to]) {
        const id = `addr:${addr}`
        if (!objs.has(id)) {
          objs.set(id, {
            id,
            val: {
              // @ts-ignore
              name: cons[addr]?.name,
              addr,
              fns: new Map(),
            },
          })
        }
      }

      // @ts-ignore
      const con = objs.get(`addr:${c.to}`).val as Contract
      if (!con.fns.has(trace.fn.id)) {
        con.fns.set(trace.fn.id, trace.fn)
      }

      if (parent) {
        arrows.push({
          src: parent.fn.id,
          dst: trace.fn.id,
          val: trace.fn,
        })
      }

      // Calls
      calls.push({
        // @ts-ignore
        src: ids.get(c.from),
        // @ts-ignore
        dst: ids.get(c.to),
        depth: d,
      })
    },
  )

  return {
    ids,
    objs,
    arrows,
    trace: stack[0],
    calls,
  }
}

export async function getTrace(txHash: string) {
  const t = await api.getTxTrace(txHash)

  const txCalls: [number, TxCall][] = []
  graph.dfs<TxCall>(
    t.result,
    (c) => c?.calls || [],
    (_, d, c) => {
      txCalls.push([d, c])
    },
  )

  const addrs = new Set<string>()
  for (const [_, c] of txCalls) {
    addrs.add(c.from)
    addrs.add(c.to)
  }

  const contracts: ContractInfo[] = await api.getContracts({
    // TODO: chain params from input
    chain: "eth-mainnet",
    chain_id: 1,
    addrs: [...addrs.values()],
  })

  const { calls, ids, objs, arrows, trace } = build(t.result, contracts)

  return {
    calls,
    ids,
    objs,
    arrows,
    trace,
    graph: graph.build(calls),
  }
}
