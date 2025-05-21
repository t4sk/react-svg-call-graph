import { CallGraph } from "./components/CallGraph"

function App() {
  return (
    <CallGraph
      backgroundColor="pink"
      width={600}
      height={500}
      rectFill="blue"
      showDot={true}
      nodeWidth={100}
      nodeHeight={50}
      nodeGap={60}
    />
  )
}

export default App
