import { ethers } from "ethers"
import * as api from "./api"
import { TxCall, ContractInfo } from "./api/types"
import { Id, Groups, Call } from "./components/graph/lib/types"
import { Trace, Input, Output, Fn } from "./components/tracer/types"
import * as graph from "./components/graph/lib/graph"
import { zip } from "./utils"
import { Account, Evm } from "./components/ctx/evm/types"

// TODO: move to graph/lib/types?
export type Obj<V> = {
  id: Id
  val: V
}

// TODO: store into objects?
export type Arrow<V> = {
  src: Id
  dst: Id
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

// TODO: clean up
export function build(
  root: TxCall,
  contracts: ContractInfo[],
): {
  objs: Map<Id, Obj<Account | Fn>>
  arrows: Arrow<Fn>[]
  groups: Groups
  calls: Call[]
  trace: Trace<Evm>
} {
  const cons: { [key: string]: ContractInfo[] } = contracts.reduce((z, c) => {
    // @ts-ignore
    z[c.address] = c
    return z
  }, {})

  // contract or function to Id
  const ids: Map<string, Id> = new Map()
  const objs: Map<Id, Obj<Account | Fn>> = new Map()
  const groups: Groups = new Map()
  const calls: Call[] = []
  // TODO: remove?
  const arrows: Arrow<Fn>[] = []
  const stack: Trace<Evm>[] = []

  // TODO: clean up + add to objs
  groups.set(0, new Set())
  // @ts-ignore
  groups.get(0).add(0)
  ids.set("eoa", 0)

  graph.dfs<TxCall>(
    root,
    (c) => c?.calls || [],
    (i, d, c) => {
      // @ts-ignore
      const fn = parse(cons[c.to]?.abi, c.input, c.output)

      const fnKey = `fn:${c.to}.${fn?.selector}`
      if (!ids.has(fnKey)) {
        ids.set(fnKey, ids.size)
      }
      const fnId = ids.get(fnKey) as Id

      const trace: Trace<Evm> = {
        i,
        depth: d,
        fn: {
          id: fnId,
          // @ts-ignore
          mod: cons[c.to]?.name || c.to,
          name: fn?.name || "",
        },
        inputs: fn?.inputs || [],
        outputs: fn?.outputs || [],
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

      // Objects
      if (!objs.has(trace.fn.id)) {
        objs.set(trace.fn.id, { id: trace.fn.id, val: trace.fn })
      }

      for (const addr of [c.from, c.to]) {
        const key = `addr:${addr}`
        if (!ids.has(key)) {
          ids.set(key, ids.size)
          const id = ids.get(key) as Id
          objs.set(id, {
            id: id,
            val: {
              // @ts-ignore
              name: cons[addr]?.name,
              addr,
              fns: new Map(),
            },
          })
        }
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

      if (parent) {
        arrows.push({
          src: parent.fn.id,
          dst: trace.fn.id,
          val: trace.fn,
        })
      }

      const toKey = `addr:${c.to}`
      const toId = ids.get(toKey) as Id
      // @ts-ignore
      const acc = objs.get(toId).val as Account
      if (!acc.fns.has(trace.fn.id)) {
        acc.fns.set(trace.fn.id, trace.fn)
      }

      // Groups
      if (!groups.has(toId)) {
        groups.set(toId, new Set())
      }
      // @ts-ignore
      groups.get(toId).add(trace.fn.id)

      // Calls
      // TODO: fix parent
      calls.push({
        // @ts-ignore
        src: parent?.fn.id || 0,
        // @ts-ignore
        dst: trace.fn.id,
        depth: d,
      })
    },
  )

  // TODO: remove
  console.log(calls, groups, objs)

  return {
    objs,
    arrows,
    trace: stack[0],
    groups,
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

  const { calls, groups, objs, arrows, trace } = build(t.result, contracts)

  return {
    calls,
    groups,
    objs,
    arrows,
    trace,
    graph: graph.build(calls),
  }
}
