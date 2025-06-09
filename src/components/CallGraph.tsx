import { useMemo } from "react"
import { Call, ViewBox, Point, SvgNode, Arrow, Hover } from "../lib/types"
import * as svg from "../lib/svg"
import {
  SvgRect,
  SvgDot,
  SvgArrow,
  SvgZigZagArrow,
  SvgCallBackArrow,
} from "./Svg"
import * as math from "../lib/math"

const TEXT_GAP = -30
const STEP = 50
const MIN_STEPS = 4
// R >= STEP / 2?
const R = 25
const BOX_X_PADD = 10
const BOX_Y_PADD = 10

function sample(a: Arrow, xPadd: number = 0, yPadd: number = 0): Point[] {
  const ps = svg.poly(a.type, a.start, a.end, xPadd, yPadd)
  const [len] = math.len(ps)

  const n = Math.max(len > STEP ? (len / STEP) | 0 : MIN_STEPS, MIN_STEPS)

  return math.sample(n, (i) => {
    const t = i / n
    return math.perp(ps, t)
  })
}

export function getArrowKey(a: Arrow): string {
  return `${a.s},${a.e}`
}

export const CallGraph: React.FC<{
  calls: Call[]
  backgroundColor: string
  width: number
  height: number
  viewBox: ViewBox
  mouse: Point | null
  isDragging: boolean
  showDot?: boolean
  getNodeStyle?: (
    hover: Hover,
    node: SvgNode,
  ) => { fill?: string; stroke?: string }
  getArrowStyle?: (hover: Hover, arrow: Arrow) => { stroke?: string }
  nodeWidth?: number
  nodeHeight?: number
  nodeXGap?: number
  nodeYGap?: number
  renderNode: (node: SvgNode) => React.ReactNode
}> = ({
  calls,
  backgroundColor,
  width,
  height,
  viewBox,
  mouse,
  isDragging,
  showDot = false,
  getNodeStyle = () => {},
  getArrowStyle = () => {},
  renderNode,
  nodeWidth = 100,
  nodeHeight = 50,
  nodeXGap = 50,
  nodeYGap = 50,
}) => {
  const arrowXPadd = nodeXGap >> 1
  const arrowYPadd = nodeYGap >> 1
  const layout = useMemo(() => {
    return svg.map(calls, {
      width,
      height,
      center: {
        x: width >> 1,
        y: height >> 1,
      },
      node: {
        width: nodeWidth,
        height: nodeHeight,
        gapX: nodeXGap,
        gapY: nodeYGap,
      },
    })
  }, [calls, width, height])

  const overlaps = svg.overlaps(layout.arrows)

  const svgX = mouse
    ? svg.getViewBoxX(width, mouse.x, viewBox.width, viewBox.x)
    : 0
  const svgY = mouse
    ? svg.getViewBoxY(height, mouse.y, viewBox.height, viewBox.y)
    : 0

  let hover: Hover = { node: null, arrows: null }
  if (!isDragging && mouse && svgX != 0 && svgY != 0) {
    const m = { x: svgX, y: svgY }
    for (let i = 0; i < layout.nodes.length; i++) {
      const node = layout.nodes[i]
      if (svg.isInside(m, node.rect)) {
        hover.node = node.id
      }
    }

    if (hover.node == null) {
      hover.arrows = new Set()

      for (let i = 0; i < layout.arrows.length; i++) {
        const a = layout.arrows[i]
        const box = svg.box(
          svg.poly(a.type, a.start, a.end, arrowXPadd, -arrowYPadd),
          BOX_X_PADD,
          BOX_Y_PADD,
        )
        if (svg.isInside(m, box)) {
          // TODO: cache
          const points = sample(a, arrowXPadd, -arrowYPadd)
          for (let i = 0; i < points.length; i++) {
            if (math.dist(points[i], m) < R) {
              hover.arrows.add(getArrowKey(a))
            }
          }
        }
      }
    }
  }

  function renderArrow(i: number, a: Arrow, style: { stroke?: string }) {
    const key = getArrowKey(a)
    const offset = overlaps.get(key) || 0
    overlaps.set(key, offset > 0 ? offset - 1 : 0)

    const points = sample(a, arrowXPadd, -arrowYPadd)

    if (a.start.y == a.end.y) {
      return (
        <>
          {points.map((p, i) => (
            <SvgDot x={p.x} y={p.y} radius={4} key={i} />
          ))}
          <SvgArrow
            key={i}
            x0={a.start.x}
            y0={a.start.y}
            x1={a.end.x}
            y1={a.end.y}
            stroke={style?.stroke || "black"}
            text={a.i}
            textYGap={offset * TEXT_GAP}
          />
        </>
      )
    }
    if (a.end.x <= a.start.x) {
      return (
        <>
          {points.map((p, i) => (
            <SvgDot x={p.x} y={p.y} radius={4} key={i} />
          ))}
          <SvgCallBackArrow
            key={i}
            x0={a.start.x}
            y0={a.start.y}
            x1={a.end.x}
            y1={a.end.y}
            xPadd={arrowXPadd}
            yPadd={-arrowYPadd}
            stroke={style?.stroke || "black"}
            text={a.i}
            textYGap={offset * TEXT_GAP}
          />
        </>
      )
    }

    return (
      <>
        {points.map((p, i) => (
          <SvgDot x={p.x} y={p.y} radius={4} key={i} />
        ))}
        <SvgZigZagArrow
          key={i}
          x0={a.start.x}
          y0={a.start.y}
          x1={a.end.x}
          y1={a.end.y}
          stroke={style?.stroke || "black"}
          text={a.i}
          textXGap={offset * TEXT_GAP}
        />
      </>
    )
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      style={{ backgroundColor }}
    >
      {layout.arrows.map((a, i) => {
        if (a.s == hover.node || a.e == hover.node) {
          return null
        }
        const style = getArrowStyle(hover, a)
        return renderArrow(i, a, style)
      })}

      {layout.arrows.map((a, i) => {
        if (a.s != hover.node && a.e != hover.node) {
          return null
        }
        const style = getArrowStyle(hover, a)
        return renderArrow(i, a, style)
      })}

      {layout.nodes.map((node, i) => {
        const style = getNodeStyle(hover, node)
        return (
          <SvgRect
            key={i}
            x={node.rect.x}
            y={node.rect.y}
            width={node.rect.width}
            height={node.rect.height}
            fill={style?.fill || "none"}
            stroke={style?.stroke || "black"}
          />
        )
      })}

      {layout.nodes.map((node, i) => {
        return (
          <foreignObject
            key={i}
            x={node.rect.x}
            y={node.rect.y}
            width={node.rect.width}
            height={node.rect.height}
          >
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
              {renderNode(node)}
            </div>
          </foreignObject>
        )
      })}

      {Object.values(layout.mid).map((p, i) => (
        <SvgDot x={p.x} y={p.y} key={i} radius={4} />
      ))}

      {mouse && showDot ? (
        <SvgDot x={svgX} y={svgY} radius={R} fill="rgba(255, 0, 0, 0.5)" />
      ) : null}
    </svg>
  )
}
