import { CallGraphUi } from "./components/CallGraphUi"
import { SvgNode, Arrow, Hover } from "./lib/types"
import { getArrowKey } from "./components/CallGraph"
import { build } from "./lib/graph"
import { calls, objs } from "./dev"

const graph = build(calls)

console.log(calls, graph)

function getNodeFillColor(hover: Hover, node: SvgNode): string {
  if (hover.node == null) {
    return "rgba(120, 0, 255, 1)"
  }
  if (
    hover.node == node.id ||
    graph.inbound.get(hover.node)?.has(node.id) ||
    graph.outbound.get(hover.node)?.has(node.id)
  ) {
    return "rgba(120, 0, 255, 1)"
  }
  return "rgba(120, 0, 255, 0.3)"
}

function getArrowColor(hover: Hover, arrow: Arrow): string {
  if (hover.node != null) {
    if (hover.node == arrow.s) {
      return "blue"
    }
    if (hover.node == arrow.e) {
      return "red"
    }
    return "rgba(0, 0, 0, 0.2)"
  }
  if (hover.arrows != null && hover.arrows.size > 0) {
    if (hover.arrows.has(getArrowKey(arrow))) {
      return "orange"
    }
    return "rgba(0, 0, 0, 0.2)"
  }
  return "black"
}

// TODO: render on hover node and hover arrows
function App() {
  return (
    <CallGraphUi
      calls={calls}
      backgroundColor="pink"
      width={900}
      height={600}
      showDot={true}
      nodeWidth={200}
      nodeHeight={50}
      nodeXGap={100}
      nodeYGap={60}
      getNodeStyle={(hover, node) => {
        return {
          fill: getNodeFillColor(hover, node),
          stroke: "black",
        }
      }}
      getArrowColor={(hover, arrow) => {
        if (hover.node != null) {
          if (hover.node == arrow.s) {
            return "blue"
          }
          if (hover.node == arrow.e) {
            return "red"
          }
          return "rgba(0, 0, 0, 0.2)"
        }
        if (hover.arrows != null && hover.arrows.size > 0) {
          if (hover.arrows.has(getArrowKey(arrow))) {
            return "orange"
          }
          return "rgba(0, 0, 0, 0.2)"
        }
        return "black"
      }}
      renderNode={(node) => {
        const obj = objs.get(node.id)
        // return node.id
        return (
          <span
            style={{
              width: 140,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textAlign: "center",
            }}
          >
            {obj?.name || obj?.address || node.id}
          </span>
        )
      }}
    />
  )
}

export default App
