import { Node } from "./lib/types"
import { assert } from "./lib/utils"
import * as dag from "./lib/dag"
import { SvgUi } from "./components/SvgUi"

import { DATA } from "./data"

const topic_to_id = DATA.reduce((z, d, i) => {
  // @ts-ignore
  z[d.path] = i + 1
  return z
}, {})

// @ts-ignore
const nodes: Node[] = DATA.map((d, i) => {
  return {
    id: i + 1,
    // @ts-ignore
    parents: new Set(d.parents.map((t) => topic_to_id[t])),
  }
})

const cards = DATA.map((d) => d.title)

const { graph, starts } = dag.build(nodes)

// Check valid DAG
for (const s of starts) {
  assert(dag.dfs(graph, s), `invalid DAG starting from ${s}`)
}

function App() {
  return (
    <SvgUi
      graph={graph}
      starts={starts}
      backgroundColor="pink"
      width={600}
      height={500}
      rectFill="blue"
      renderNode={(node) => (
        <a href="/" style={{ textAlign: "center", color: "white" }}>
          {cards[node.id - 1]}
        </a>
      )}
      showDot={true}
      nodeWidth={100}
      nodeHeight={50}
      nodeGap={60}
    />
  )
}

export default App
