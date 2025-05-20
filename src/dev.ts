type Trace = {
  id: number
  parent: number | null
  depth: number
  children: number[] | null
}

type Graph = Map<number, Set<number>>
type Parents = Map<number, number>

const trace: Trace[] = [
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
  // { id: 16, parent: 4, depth: 2, children: [0] },
  // { id: 0, parent: 16, depth: 3, children: [99] },
  // { id: 99, parent: 0, depth: 4, children: null },
]

function build(trace: Trace[]): {graph: Graph, parents: Parents} {
  const graph: Graph = new Map()
  const parents: Parents = new Map()

  for (let i = 0; i < trace.length; i++) {
    const t = trace[i]

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

function bfs(graph: Graph, start: number, f?: (i: number, v: number) => void) {
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

function dfs(
  graph: Graph,
  start: number,
  f?: (d: number, v: number) => void,
): boolean {
  type Node = {p: number | null; v: number }

  const q: Node[] = [{ p: null, v: start }]
  const visited: Set<number> = new Set()
  const path: number[] = []

  while (q.length > 0) {
    // Avoid using shift() which is O(N) to get element from the head of q
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

const { graph, parents } = build(trace)
console.log(graph, parents)

/*
const pos: Map<number, number> = new Map()

bfs(graph, 0, (d, v) => {
  console.log(d, v, graph.get(v))

  const neighbors = graph.get(v)
  if (neighbors) {
    const n = neighbors.size
    const mid = n >> 1

    // Positions relative to parent
    let i = 0
    if (n % 2 == 0) {
      for (const w of neighbors) {
        pos.set(w, mid - i - Math.floor(i / mid))
        i++
      }
    } else {
      for (const w of neighbors) {
        pos.set(w, mid - i)
        i++
      }
    }
  }
})

console.log(pos)
*/

/*
const arr: [number, number][] = []
dfs(graph, 0, (d, v) => {
  arr.push([d, v])
})
console.log(arr)
*/

