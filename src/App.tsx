import { CallGraphUi } from "./components/CallGraphUi"

import { calls, objs } from "./dev"

// TODO: dark mode

function App() {
  return (
    <CallGraphUi
      calls={calls}
      backgroundColor="pink"
      width={800}
      height={800}
      rectFill="blue"
      showDot={true}
      nodeWidth={100}
      nodeHeight={50}
      nodeGap={60}
      renderNode={(node) => {
        const obj = objs.get(node.id)
        return obj?.name || obj?.address || node.id
      }}
    />
  )
}

export default App
