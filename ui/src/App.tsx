import { useEffect } from "react"
import {
  Provider as WindowSizeProvider,
  useWindowSizeContext,
} from "./contexts/WindowSize"
import {
  Provider as TracerProvider,
  useTracerContext,
  State as TracerState,
} from "./components/tracer/TracerContext"
import { CallGraphUi } from "./components/graph/CallGraphUi"
import { Id, Graph, Node, Arrow, Hover } from "./components/graph/lib/types"
import Tracer from "./components/tracer"
import Evm from "./components/ctx/evm/tracer/Evm"
import { Fn } from "./components/tracer/types"
import { Account } from "./components/ctx/evm/types"
import useAsync from "./hooks/useAsync"
import styles from "./App.module.css"
import { getTrace, Obj, ObjType } from "./tracer"

// Padding for scroll
const SCROLL = 20

// TODO: import foundry trace
// TODO: graph - token transfers
// TODO: graph - ETH transfer
// TODO: on click graph -> pin trace

type ArrowType = "in" | "out" | "hover" | "dim" | "pin" | "tracer" | ""

function getArrowType(
  hover: Hover,
  arrow: Arrow,
  tracer: TracerState,
): ArrowType {
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
    if (hover.arrows.has(arrow.i)) {
      return "hover"
    }
    return "dim"
  }
  return ""
}

function getNodeFillColor(
  objs: Map<Id, Obj<ObjType, Account | Fn>>,
  hover: Hover,
  node: Node,
  graph: Graph,
  tracer: TracerState,
): string {
  const obj = objs.get(node.id) as Obj<ObjType, Account | Fn>
  if (hover.node == null) {
    if (obj?.type == "acc") {
      return "var(--node-color)"
    }
    return "transparent"
  }
  if (
    hover.node == node.id ||
    graph.incoming.get(hover.node)?.has(node.id) ||
    graph.outgoing.get(hover.node)?.has(node.id)
  ) {
    return "var(--node-hover-color)"
  }
  if (obj?.type == "acc") {
    return "var(--node-dim-color)"
  }
  return "transparent"
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

// TODO: light theme
// TODO: dynamic graph size
// TODO: drag tracer height
function App() {
  const windowSize = useWindowSizeContext()
  const tracer = useTracerContext()

  const _getTrace = useAsync(getTrace)

  useEffect(() => {
    const f = async () => {
      const txHash =
        "0x5e4deab9462bec720f883522d306ec306959cb3ae1ec2eaf0d55477eed01b5a4"
      // const txHash = "0xa542508dfd209f23cb306861ea25b5c131e82dcdf75c86d874644b4c436d9f6f"
      await _getTrace.exec(txHash)
    }
    f()
  }, [])

  if (!windowSize || !_getTrace.data) {
    return null
  }

  const { trace, graph, calls, groups, objs, arrows } = _getTrace.data

  const height = windowSize.height - SCROLL
  const width = windowSize.width - SCROLL

  return (
    <div className={styles.component} style={{ width, height }}>
      <div
        className={styles.tracer}
        style={{ height: (height * 0.4) | 0, width }}
      >
        <Tracer trace={trace} renderCtx={(ctx) => <Evm ctx={ctx} />} />
      </div>
      <CallGraphUi
        groups={groups}
        calls={calls}
        tracer={tracer.state}
        backgroundColor="var(--bg-color)"
        width={width}
        height={(height * 0.6) | 0}
        showDot={true}
        nodeWidth={220}
        nodeHeight={40}
        nodeXGap={100}
        nodeYGap={80}
        getNodeStyle={(hover, node) => {
          return {
            fill: getNodeFillColor(objs, hover, node, graph, tracer.state),
            stroke: "var(--node-border-color)",
          }
        }}
        getArrowStyle={(hover, arrow) => {
          const t = getArrowType(hover, arrow, tracer.state)
          return {
            type: t,
            style: {
              stroke: getArrowColor(t),
            },
          }
        }}
        renderArrowText={(arrow) => {
          return `${arrow.i}`
        }}
        renderNode={(hover, node) => {
          // TODO: fix
          // @ts-ignore
          const obj = objs.get(node.id) as Obj<ObjType, Account>
          if (obj?.type == "acc") {
            return (
              <div className={styles.accNode}>
                <span className={styles.nodeText}>
                  {obj?.val.name || obj?.val?.addr || node.id}
                </span>
              </div>
            )
          }
          return (
            <div className={styles.fnNode}>
              <span className={styles.nodeText}>
                {obj?.val.name || node.id}
              </span>
            </div>
          )
        }}
        renderHover={(hover, mouse) => {
          if (!mouse) {
            return null
          }
          if (hover.node != null) {
            const obj = objs.get(hover.node)
            const text =
              obj?.val?.name ||
              // @ts-ignore
              (obj?.type == "acc" ? obj?.val?.addr : "?") ||
              "?"
            return (
              <div
                className={styles.hoverNode}
                style={{
                  position: "absolute",
                  top: mouse.y + 10,
                  left: mouse.x + 10,
                }}
              >
                {text}
              </div>
            )
          }
          if (hover.arrows && hover.arrows.size > 0) {
            const arrs = [...hover.arrows.values()]
            arrs.sort((a, b) => a - b)

            return (
              <div
                className={styles.hoverArrows}
                style={{
                  position: "absolute",
                  top: mouse.y + 10,
                  left: mouse.x + 10,
                }}
              >
                {arrs.map((i) => {
                  const arr = arrows[i]
                  if (!arr) {
                    return null
                  }
                  const s = objs.get(arr.src)?.val as Fn
                  const d = objs.get(arr.dst)?.val as Fn
                  return (
                    <div className={styles.call} key={i}>
                      <div className={styles.index}>{i}</div>
                      <div className={styles.obj}>{s?.mod || "?"}</div>
                      <div className={styles.arrow}>{"->"}</div>
                      <div className={styles.obj}>{d?.mod || "?"}</div>
                      <div>.</div>
                      <div className={styles.func}>{arr?.val?.name || "?"}</div>
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
