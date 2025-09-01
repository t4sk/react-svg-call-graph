import { Call, Neighbors, Graph } from "./types"

export function build(calls: Call[]): Graph {
  // dst => sources
  const incoming: Neighbors = new Map()
  // src => destinations
  const outgoing: Neighbors = new Map()

  for (let i = 0; i < calls.length; i++) {
    const c = calls[i]

    if (!incoming.has(c.dst)) {
      incoming.set(c.dst, new Set())
    }

    if (c.src) {
      incoming.get(c.dst)?.add(c.src)

      if (!outgoing.has(c.src)) {
        outgoing.set(c.src, new Set())
      }

      outgoing.get(c.src)?.add(c.dst)
    }
  }

  return { incoming, outgoing }
}

export function bfs<A>(
  start: A,
  get: (v: A) => A[] | null,
  f?: (i: number, d: number, v: A) => void,
) {
  const q: [number, A][] = [[0, start]]
  const visited: Set<A> = new Set()
  let i = 0
  let k = 0

  while (i < q.length) {
    // Avoid using shift() which is O(N) to get element from the head of q
    const [d, v] = q[i++]

    if (visited.has(v)) {
      continue
    }
    visited.add(v)

    if (f) {
      f(k, d, v)
      k++
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

export function dfs<A>(
  a: A,
  get: (a: A) => A[],
  f: (i: number, d: number, a: A) => void,
) {
  const q: [number, A][] = [[0, a]]

  let i = 0
  while (q.length > 0) {
    const [d, a] = q.pop() as [number, A]

    f(i, d, a)
    i++

    const next = get(a)
    if (next.length > 0) {
      for (const a of [...next].reverse()) {
        q.push([d + 1, a])
      }
    }
  }
}
