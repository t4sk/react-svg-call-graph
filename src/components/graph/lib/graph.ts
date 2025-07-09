import { Call, Neighbors, Graph } from "./types"

export function build(calls: Call[]): Graph {
  const inbound: Neighbors = new Map()
  const outbound: Neighbors = new Map()

  for (let i = 0; i < calls.length; i++) {
    const c = calls[i]

    if (!inbound.has(c.dst)) {
      inbound.set(c.dst, new Set())
    }

    if (c.src) {
      inbound.get(c.dst)?.add(c.src)

      if (!outbound.has(c.src)) {
        outbound.set(c.src, new Set())
      }

      outbound.get(c.src)?.add(c.dst)
    }
  }

  return { inbound, outbound }
}

export function bfs<A>(
  start: A,
  get: (v: A) => A[] | null,
  f?: (d: number, v: A) => void,
) {
  const q: [number, A][] = [[0, start]]
  const visited: Set<A> = new Set()
  let i = 0

  while (i < q.length) {
    // Avoid using shift() which is O(N) to get element from the head of q
    const [d, v] = q[i++]

    if (visited.has(v)) {
      continue
    }
    visited.add(v)

    if (f) {
      f(d, v)
    }

    const neighbors = get(v)
    if (neighbors) {
      for (const w of neighbors) {
        if (!visited.has(w)) {
          q.push([d + 1, w])
        }
      }
    }
  }
}

export function dfs<A>(a: A, get: (a: A) => A[], f: (d: number, a: A) => void) {
  const q: [number, A][] = [[0, a]]

  while (q.length > 0) {
    const [d, a] = q.pop() as [number, A]

    f(d, a)

    const next = get(a)
    if (next.length > 0) {
      for (const a of [...next].reverse()) {
        q.push([d + 1, a])
      }
    }
  }
}
