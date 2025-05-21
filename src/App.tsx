import { CallGraphUi } from "./components/CallGraphUi"

import { calls } from "./dev"

function App() {
  return (
    <CallGraphUi
      calls={calls}
      backgroundColor="pink"
      width={600}
      height={500}
      rectFill="blue"
      showDot={true}
      nodeWidth={100}
      nodeHeight={50}
      nodeGap={60}
      renderNode={(node) => {
        return node.id
      }}
    />
  )
}

export default App
