import { CallGraphUi } from "./components/CallGraphUi"

import { calls, objs } from "./dev"

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
        // TODO: Need set of parents and childrens to highlight all adjacent nodes
        if (hover == node.id) {
          return "rgba(0, 0, 255, 1)"
        }
        return "rgba(0, 0, 255, 0.3)"
      }}
      getNodeStrokeColor={(hover, node) => "black"}
      getLineColor={(hover, arrow) => {
        if (hover == arrow.s) {
          return "red"
        }
        if (hover == arrow.e) {
          return "blue"
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
