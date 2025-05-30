import { CallGraphUi } from "./components/CallGraphUi"
import { build } from "./lib/graph"
import { calls, objs } from "./dev"

const graph = build(calls)

console.log(calls, graph)

// TODO: fix incorrect inbounds, outbounds and depth? BorrowLogic?
function App() {
  return (
    <CallGraphUi
      calls={calls}
      backgroundColor="pink"
      width={800}
      height={800}
      showDot={true}
      nodeWidth={200}
      nodeHeight={50}
      nodeGap={60}
      getNodeFillColor={(hover, node) => {
        if (hover == null) {
          return "rgba(0, 0, 255, 1)"
        }
        // console.log(hover, node.id, graph.inbound.get(hover))
        if (hover == node.id || graph.inbound.get(hover)?.has(node.id) || graph.outbound.get(hover)?.has(node.id)) {
          return "rgba(0, 0, 255, 1)"
        }
        return "rgba(0, 0, 255, 0.3)"
      }}
      getNodeStrokeColor={(hover, node) => "black"}
      getLineColor={(hover, arrow) => {
        if (hover == null) {
          return "black"
        }
        if (hover == arrow.s) {
          return "red"
        }
        if (hover == arrow.e) {
          return "blue"
        }
        return "rgba(0, 0, 0, 0.2)"
      }}
      renderNode={(node) => {
        const obj = objs.get(node.id)
        return node.id
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
              {node.id} - {obj?.address || obj?.name}
          </span>
        )
      }}
    />
  )
}

export default App
