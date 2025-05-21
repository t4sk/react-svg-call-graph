import { Call, Graph, Parents } from "./types"

export function build(calls: Call[]): { graph: Graph; parents: Parents } {
  const graph: Graph = new Map()
  const parents: Parents = new Map()

  for (let i = 0; i < calls.length; i++) {
    const t = calls[i]

    if (!graph.has(t.id)) {
      graph.set(t.id, new Set())
    }

    if (t.children) {
      for (const v of t.children) {
        graph.get(t.id)?.add(v)
        parents.set(v, t.id)
      }
    }
  }

  return { graph, parents }
}

export function bfs(
  graph: Graph,
  start: number,
  f?: (i: number, v: number) => void,
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

    const neighbors = graph.get(v)
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
  graph: Graph,
  start: number,
  f?: (d: number, v: number) => void,
): boolean {
  type Node = { p: number | null; v: number }

  const q: Node[] = [{ p: null, v: start }]
  const visited: Set<number> = new Set()
  const path: number[] = []

  while (q.length > 0) {
    const { p, v } = q.pop() as Node

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

    const neighbors = graph.get(v)
    if (neighbors) {
      for (const w of [...neighbors].reverse()) {
        q.push({ p: v, v: w })
      }
    }
  }

  // No cycles - valid DAG
  return true
}
