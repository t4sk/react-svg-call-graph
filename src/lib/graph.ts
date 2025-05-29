import { Call, Graph } from "./types"

export function build(calls: Call[]): { graph: Graph; } {
  const graph: Graph = new Map()

  for (let i = 0; i < calls.length; i++) {
    const t = calls[i]

    if (!graph.has(t.id)) {
      graph.set(t.id, new Set())
    }

    if (t.children) {
      for (const v of t.children) {
        graph.get(t.id)?.add(v)
      }
    }
  }

  return { graph }
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
