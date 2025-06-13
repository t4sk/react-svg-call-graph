import { Call } from "./lib/types"
import { dfs } from "./lib/graph"
import TX from "../tmp/tx-res.json"
import NAMES from "../tmp/names.json"
import "../tmp/req.ts"

type TxCall = {
  from: string
  to: string
  input: string
  calls?: TxCall[]
}

export type Obj = {
  address: string
  name: string | null
}

// DFS to flatten tx calls
let id = 0
// Address => id
const ids: Map<string, number> = new Map()
const flat: [number, TxCall][] = []

export const objs: Map<number, Obj> = new Map()

dfs<TxCall>(
  TX.result,
  (c) => c?.calls || [],
  (d, c) => {
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
