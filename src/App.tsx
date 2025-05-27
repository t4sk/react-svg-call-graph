import { CallGraphUi } from "./components/CallGraphUi"

import { calls, objs } from "./dev"

function App() {
  return (
    <CallGraphUi
      calls={calls}
      backgroundColor="pink"
      width={800}
      height={800}
      rectFill="blue"
      showDot={true}
      nodeWidth={200}
      nodeHeight={50}
      nodeGap={60}
      getLineHoverColor={(hover, arrow) => {
        return hover == arrow.s ? "red" : "blue"
      }}
      renderNode={(node) => {
        const obj = objs.get(node.id)
        // return node.id
        return (
          <span style={{
            width: 140,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textAlign: "center"
          }}>
          {obj?.name || obj?.address || node.id}
          </span>
        )
      }}
    />
  )
}

export default App
