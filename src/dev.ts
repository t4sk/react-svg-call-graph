console.log("dev")

type Trace = {
  id: number
  parent: number | null
  depth: number
  children: number[] | null
}

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
  { id: 16, parent: 4, depth: 2, children: [0] },
  { id: 0, parent: 16, depth: 3, children: [99] },
  { id: 99, parent: 0, depth: 4, children: null },
]

type Graph = Map<number, Set<number>>

function build(trace: Trace[]): Graph {
  const graph: Graph = new Map()

  for (let i = 0; i < trace.length; i++) {
    const t = trace[i]

    if (!graph.has(t.id)) {
      graph.set(t.id, new Set())
    }

    if (t.children) {
      for (const v of t.children) {
        graph.get(t.id)?.add(v)
      }
    }
  }

  return graph
}

function bfs(graph: Graph, start: number, f?: (i: number, v: number) => void) {
  const q: [number, number][] = [[0, start]]
  const visited: Set<number> = new Set()

  while (q.length > 0) {
    const [d, v] = q.pop() as [number, number]

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

const graph = build(trace)
console.log(graph)

bfs(graph, 0, (i, v) => console.log(i, v))
