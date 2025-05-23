import { Call } from "./lib/types"

import TX from "../tmp/tx.json"

type TxCall = {
  from: string
  to: string
  input: string
  calls?: TxCall[]
}

export function dfs(
  call: TxCall,
  f: (d: number, call: TxCall) => void
) {
  const q = [[0, call]]

  while (q.length > 0) {
    const [d, c] = q.pop() as [number, TxCall]

    f(d, c)

    const calls = c?.calls || []
    if (calls.length > 0) {
      for (const c of [...calls].reverse()) {
        q.push([d + 1, c])
      }
    }
  }
}

// @ts-ignore
let id = 0
const ids: Map<string, number> = new Map()
// @ts-ignore
const flat = []

dfs(TX.result, (d, c) => {
  if (!ids.has(c.from)) {
    id += 1
    ids.set(c.from, id)
  }
  if (!ids.has(c.to)) {
    id += 1
    ids.set(c.to, id)
  }
  flat.push([d, c])
})

// @ts-ignore
console.log(ids, flat)

// @ts-ignore
const cs = flat.map(([d, c]) => {
  const calls = c.calls || []
  return {
    id: ids.get(c.to),
    parent: ids.get(c.from),
    depth: d,
// @ts-ignore
    children: calls.map(c => ids.get(c.to))
  }
})

console.log(cs)

export const calls = cs

/*
export const calls: Call[] = [
  { id: 0, parent: null, depth: 0, children: [1, 2, 3, 4] },
  { id: 1, parent: 0, depth: 1, children: [5, 6, 7] },
  { id: 5, parent: 1, depth: 2, children: null },
  { id: 6, parent: 1, depth: 2, children: null },
  { id: 7, parent: 1, depth: 2, children: null },
  { id: 2, parent: 0, depth: 1, children: [8, 9, 10] },
  { id: 8, parent: 2, depth: 2, children: null },
  { id: 9, parent: 2, depth: 2, children: null },
  { id: 10, parent: 2, depth: 2, children: null },
  { id: 3, parent: 0, depth: 1, children: [11, 12, 13] },
  { id: 11, parent: 3, depth: 2, children: null },
  { id: 12, parent: 3, depth: 2, children: null },
  { id: 13, parent: 3, depth: 2, children: null },
  { id: 4, parent: 0, depth: 1, children: [14, 15, 16] },
  { id: 14, parent: 4, depth: 2, children: null },
  { id: 15, parent: 4, depth: 2, children: null },
  { id: 16, parent: 4, depth: 2, children: null },
  { id: 16, parent: 4, depth: 2, children: [0] },
  { id: 0, parent: 16, depth: 3, children: [99] },
  { id: 99, parent: 0, depth: 4, children: null },
]
*/
