import { Call, Neighbors, Graph } from "./types"

export function build(calls: Call[]): Graph {
  const inbound: Neighbors = new Map()
  const outbound: Neighbors = new Map()

  for (let i = 0; i < calls.length; i++) {
    const c = calls[i]

    if (!outbound.has(c.id)) {
      outbound.set(c.id, new Set())
    }

    if (c.children) {
      for (const v of c.children) {
        if (!inbound.has(v)) {
          inbound.set(v, new Set())
        }
        inbound.get(v)?.add(c.id)
        outbound.get(c.id)?.add(v)
      }
    }
  }

  return { inbound, outbound }
}

export function bfs(
  start: number,
  get: (v: number) => number[] | null,
  f?: (i: number, v: number) => void
) {
  const q: [number, number][] = [[0, start]]
  const visited: Set<number> = new Set()
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

export function dfs(
  start: number,
  get: (v: number) => number[] | null,
  f?: (d: number, v: number) => void
): boolean {
  const q: [number | null, number][] = [[null, start]]
  const visited: Set<number> = new Set()
  const path: number[] = []

  while (q.length > 0) {
    const [p, v] = q.pop() as [number | null, number]

    // Cycle detected - invalid DAG
    if (visited.has(v)) {
      return false
    }

    // Backtrack path to p
    while (path.length > 0 && path[path.length - 1] != p) {
      const u = path.pop() as number
      visited.delete(u)
    }

    visited.add(v)
    path.push(v)

    if (f) {
      f(path.length - 1, v)
    }

    const neighbors = get(v)
    if (neighbors) {
      for (const w of [...neighbors].reverse()) {
        q.push([v, w])
      }
    }
  }

  // No cycles - valid DAG
  return true
}
