import { Node, Graph } from "./types"

// Node[] -> build graph -> check valid DAG -> organize into levels
export function build(nodes: Node[]): { graph: Graph; starts: number[] } {
  const graph: Graph = new Map()
  const starts: number[] = []

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]

    if (node.parents.size == 0) {
      starts.push(node.id)
    } else {
      for (const v of node.parents) {
        if (!graph.has(v)) {
          graph.set(v, new Set())
        }
        graph.get(v)?.add(node.id)
      }
    }
  }

  return { graph, starts }
}

type DfsNode = {
  // parent
  p: number | null
  // current vertex
  v: number
}

export function dfs(
  graph: Graph,
  start: number,
  f?: (path: number[]) => void,
): boolean {
  const q: DfsNode[] = [{ p: null, v: start }]
  const visited: Set<number> = new Set()
  const path: number[] = []

  while (q.length > 0) {
    const { p, v } = q.pop() as DfsNode

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

    const next = graph.get(v)
    if (next) {
      for (const w of next) {
        q.push({ p: v, v: w })
      }
    } else {
      // Return new copy of path
      if (f) {
        f([...path])
      }
    }
  }

  // No cycles - valid DAG
  return true
}

export function bfs(
  graph: Graph,
  start: number,
  f?: (i: number, vs: number[]) => void,
) {
  const q: number[][] = [[start]]
  const visited: Set<number> = new Set()

  let i = 0
  while (q.length > 0) {
    const vs = q.pop() as number[]

    if (f) {
      f(i, [...vs])
    }

    const row: Set<number> = new Set()
    for (const v of vs) {
      if (visited.has(v)) {
        continue
      }
      visited.add(v)

      const next = graph.get(v)
      if (next) {
        for (const w of next) {
          if (!visited.has(w)) {
            row.add(w)
          }
        }
      }
    }

    if (row.size > 0) {
      q.push([...row])
    }
    i++
  }
}

export function group(graph: Graph, starts: number[]): number[][] {
  const rows: Set<number>[] = []

  // BFS from each starting point
  for (const s of starts) {
    let i = 0
    bfs(graph, s, (_, vs) => {
      if (i == rows.length) {
        rows.push(new Set())
      }
      for (const v of vs) {
        rows[i].add(v)
      }
      i++
    })
  }

  const vs: number[][] = []
  const inserted: Set<number> = new Set()

  for (const row of rows) {
    const r = []
    for (const v of row) {
      if (inserted.has(v)) {
        continue
      }
      inserted.add(v)
      r.push(v)
    }
    if (r.length > 0) {
      vs.push(r)
    }
  }

  return vs
}
