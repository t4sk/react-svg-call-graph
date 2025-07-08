import { CallGraphUi } from "./components/CallGraphUi"
import { SvgNode, Arrow, Hover } from "./lib/types"
import { getArrowKey } from "./lib/svg"
import { build } from "./lib/graph"
import { calls, objs, arrows } from "./dev"

const graph = build(calls)

// console.log(calls, graph)

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
    // NOTE: complex colors such as rgba and url makes arrow head disappear
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
      return "purple"
    }
    return "rgba(0, 0, 0, 0.1)"
  }
  return "black"
}

function App() {
  return (
    <CallGraphUi
      calls={calls}
      backgroundColor="pink"
      width={1200}
      height={400}
      showDot={true}
      nodeWidth={200}
      nodeHeight={50}
      nodeXGap={100}
      nodeYGap={80}
      getNodeStyle={(hover, node) => {
        return {
          fill: getNodeFillColor(hover, node),
          stroke: "black",
        }
      }}
      getArrowStyle={(hover, arrow) => {
        return {
          stroke: getArrowColor(hover, arrow),
        }
      }}
      renderArrowText={(arrow) => {
        return `${arrow.i} ${arrows[arrow.i]?.function?.name || "?"}`
      }}
      renderNode={(hover, node) => {
        const obj = objs.get(node.id)
        // return node.id
        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span
              style={{
                width: 140,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                textAlign: "center",
                color: "white",
              }}
            >
              {obj?.name || obj?.address || node.id}
            </span>
          </div>
        )
      }}
      renderHover={(hover, mouse) => {
        if (!mouse) {
          return null
        }
        if (hover.node) {
          return (
            <div
              style={{
                position: "absolute",
                top: mouse.y + 10,
                left: mouse.x + 10,
                width: 100,
                height: 100,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            >
              {hover.node}
            </div>
          )
        }
        if (hover.arrows && hover.arrows.size > 0) {
          return (
            <div
              style={{
                position: "absolute",
                top: mouse.y + 10,
                left: mouse.x + 10,
                width: 100,
                height: 100,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                padding: 10,
              }}
            >
              {[...hover.arrows].map(([k, v]) => {
                return (
                  <div>
                    {k} {arrows[v]?.function?.name || v}
                  </div>
                )
              })}
            </div>
          )
        }
        return null
      }}
    />
  )
}

export default App
