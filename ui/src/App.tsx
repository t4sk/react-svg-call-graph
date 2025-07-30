import {Provider as WindowSizeProvider, useWindowSizeContext } from "./contexts/WindowSize"
import {Provider as TracerProvider, useTracerContext, State as TracerState} from "./components/tracer/TracerContext"
import { CallGraphUi } from "./components/graph/CallGraphUi"
import { SvgNode, Arrow, Hover } from "./components/graph/lib/types"
import { getArrowKey, splitArrowKey } from "./components/graph/lib/svg"
import { build } from "./components/graph/lib/graph"
import Tracer from "./components/tracer"
import styles from "./App.module.css"
import { calls, trace, objs, arrows } from "./dev"

// Padding for scroll
const SCROLL = 20
const graph = build(calls)

// TODO: import foundry trace
// TODO: graph - token transfers
// TODO: graph - ETH transfer

type ArrowType = "in" | "out" | "hover" | "dim" | "pin" | "tracer" | ""

function getArrowType(hover: Hover, arrow: Arrow, tracer: TracerState): ArrowType {
  if (tracer.pins.has(arrow.i)) {
    return "pin"
  }
  if (tracer.hover != null) {
    if (tracer.hover == arrow.i) {
        return "tracer"
    }
    return "dim"
  }
  if (hover.node != null) {
    if (hover.node == arrow.s) {
      return "out"
    }
    if (hover.node == arrow.e) {
      return "in"
    }
    return "dim"
  }
  if (hover.arrows != null && hover.arrows.size > 0) {
    if (hover.arrows.has(getArrowKey(arrow))) {
      return "hover"
    }
    return "dim"
  }
  return ""
}

function getNodeFillColor(hover: Hover, node: SvgNode, tracer: TracerState): string {
  if (hover.node == null) {
    return "var(--node-color)"
  }
  if (
    hover.node == node.id ||
    graph.inbound.get(hover.node)?.has(node.id) ||
    graph.outbound.get(hover.node)?.has(node.id)
  ) {
    return "var(--node-hover-color)"
  }
  return "var(--node-dim-color)"
}

function getArrowColor(t: ArrowType): string {
  switch (t) {
    case "in":
      return "var(--arrow-in-color)"
    case "out":
      return "var(--arrow-out-color)"
    case "hover":
      return "var(--arrow-hover-color)"
    case "dim":
      return "var(--arrow-dim-color)"
    case "pin":
      return "var(--arrow-pin-color)"
    case "tracer":
      return "var(--arrow-tracer-color)"
    default:
      return "var(--arrow-color)"
  }
}

function App() {
  // TODO: light theme
  // TODO: dynamic graph size

  const windowSize = useWindowSizeContext()
  const tracer = useTracerContext()

  if (!windowSize) {
    return null
  }

  const height = windowSize.height - SCROLL
  const width = windowSize.width - SCROLL

  return (
    <div className={styles.component} style={{ width, height}}>
      <div className={styles.tracer} style={{ height: (height * 0.4) | 0, width,}}>
        <Tracer trace={trace}/>
      </div>
      <CallGraphUi
        calls={calls}
        tracer={tracer.state}
        backgroundColor="var(--bg-color)"
        width={width}
        height={(height * 0.6) | 0}
        showDot={true}
        nodeWidth={200}
        nodeHeight={50}
        nodeXGap={100}
        nodeYGap={80}
        getNodeStyle={(hover, node) => {
          return {
            fill: getNodeFillColor(hover, node, tracer.state),
            stroke: "var(--node-border-color)"
          }
        }}
        getArrowStyle={(hover, arrow) => {
          const t = getArrowType(hover, arrow, tracer.state)
          return {
            type: t,
            style: {
              stroke: getArrowColor(t),
            }
          }
        }}
        renderArrowText={(arrow) => {
          return `${arrow.i} ${arrows[arrow.i]?.function?.name || "?"}`
        }}
        renderNode={(hover, node) => {
          const obj = objs.get(node.id)
          return (
            <div className={styles.node}>
              <span className={styles.nodeText}>
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
            const obj = objs.get(hover.node)
            return (
              <div
                className={styles.hoverNode}
                style={{
                  position: "absolute",
                  top: mouse.y + 10,
                  left: mouse.x + 10,
                }}
              >
                {obj?.name ? <div>{obj?.name}</div> : null}
                {obj?.address ? <div>{obj?.address}</div> : null}
              </div>
            )
          }
          if (hover.arrows && hover.arrows.size > 0) {
            const arrs = [...hover.arrows.entries()]
            arrs.sort((a, b) => a[1] - b[1])

            return (
              <div
                className={styles.hoverArrows}
                style={{
                  position: "absolute",
                  top: mouse.y + 10,
                  left: mouse.x + 10,
                }}
              >
                {arrs.map(([k, v]) => {
                  const { src, dst } = splitArrowKey(k)
                  const s = objs.get(src)
                  const d = objs.get(dst)
                  return (
                    <div className={styles.call} key={k}>
                      <div className={styles.index}>{v}</div>
                      <div className={styles.obj}>{s?.name || s?.address || "?"}</div>
                      <div className={styles.arrow}>{"->"}</div>
                      <div className={styles.obj}>{d?.name || d?.address || "?"}</div>
                      <div>.</div>
                      <div className={styles.func}>{arrows[v]?.function?.name || "?"}</div>
                    </div>
                  )
                })}
              </div>
            )
          }
          return null
        }}
      />
    </div>
  )
}

export default () => {
  return (
    <WindowSizeProvider>
      <TracerProvider>
        <App />
      </TracerProvider>
    </WindowSizeProvider>
  )
}
