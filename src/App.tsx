import { CallGraphUi } from "./components/CallGraphUi"

import { calls, objs } from "./dev"

// TODO: dark mode
// TODO: hover
// TODO: sequence

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
      renderNode={(node) => {
        const obj = objs.get(node.id)
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
