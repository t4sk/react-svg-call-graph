import { useMemo } from "react"
import { Call, ViewBox, Point, SvgNode, Arrow } from "../lib/types"
import * as svg from "../lib/svg"
import {
  SvgRect,
  SvgDot,
  SvgArrow,
  SvgZigZagArrow,
  SvgCallBackArrow,
  poly,
} from "./Svg"
import * as math from "../lib/math"
import { search } from "../lib/utils"

const TEXT_GAP = -30

export const CallGraph: React.FC<{
  calls: Call[]
  backgroundColor: string
  width: number
  height: number
  viewBox: ViewBox
  mouse: Point | null
  isDragging: boolean
  showDot?: boolean
  getNodeFillColor?: (hover: number | null, node: SvgNode) => string
  getNodeStrokeColor?: (hover: number | null, node: SvgNode) => string
  getLineColor?: (hover: number | null, arrow: Arrow) => string
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
  getNodeFillColor = () => "none",
  getNodeStrokeColor = () => "black",
  getLineColor = () => "black",
  renderNode,
  nodeWidth = 100,
  nodeHeight = 50,
  nodeXGap = 50,
  nodeYGap = 50,
}) => {
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

  // TODO: use quadtree?
  let hover = null
  if (!isDragging && mouse && svgX != 0 && svgY != 0) {
    const i = (search(layout.xs, (x) => x, svgX) || 0) >> 1
    const ys = layout.ys[i]
    if (ys) {
      const j = (search(ys, (y) => y, svgY) || 0) >> 1
      const node = layout.nodes[i][j]
      if (node && svg.isInside({ x: svgX, y: svgY }, node.rect)) {
        hover = node.id
      }
    }
  }

  function renderArrow(i: number, a: Arrow, lineColor: string) {
    // TODO: reposition overlapping texts
    const key = `${a.s},${a.e}`
    const offset = overlaps.get(key) || 0
    overlaps.set(key, offset > 0 ? offset - 1 : 0)

    if (a.start.y == a.end.y) {
      let points = [0, 0.25, 0.5, 0.75, 1].map(t => math.perp(poly("arrow", a.start, a.end), t))

      return (
        <>
          {points.map(p => (<SvgDot x={p.x} y={p.y} radius={4} />))}
        <SvgArrow
          key={i}
          x0={a.start.x}
          y0={a.start.y}
          x1={a.end.x}
          y1={a.end.y}
          stroke={lineColor}
          text={a.i}
          textYGap={offset * TEXT_GAP}
        />
        </>
      )
    }
    if (a.end.x <= a.start.x) {
      let points = [0, 0.25, 0.5, 0.75, 1].map(t => math.perp(poly("callback", a.start, a.end, nodeXGap / 2, - nodeYGap / 2), t))
      points = []

      return (
        <>
          {points.map(p => (<SvgDot x={p.x} y={p.y} radius={4} />))}
        <SvgCallBackArrow
          key={i}
          x0={a.start.x}
          y0={a.start.y}
          x1={a.end.x}
          y1={a.end.y}
          xPadd={nodeXGap >> 1}
          yPadd={-(nodeYGap >> 1)}
          stroke={lineColor}
          text={a.i}
          textYGap={offset * TEXT_GAP}
        />
        </>
      )
    }

    let points = [0, 0.25, 0.5, 0.75, 1].map(t => math.perp(poly("zigzag", a.start, a.end), t))
    return (
        <>
          {points.map(p => (<SvgDot x={p.x} y={p.y} radius={4} />))}
      <SvgZigZagArrow
        key={i}
        x0={a.start.x}
        y0={a.start.y}
        x1={a.end.x}
        y1={a.end.y}
        stroke={lineColor}
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
        if (a.s == hover || a.e == hover) {
          return null
        }
        return renderArrow(i, a, getLineColor(hover, a))
      })}

      {layout.arrows.map((a, i) => {
        if (a.s != hover && a.e != hover) {
          return null
        }
        return renderArrow(i, a, getLineColor(hover, a))
      })}

      {layout.nodes.map((nodes, i) => {
        return nodes.map((node, j) => {
          return (
            <SvgRect
              key={`${i}-${j}`}
              x={node.rect.x}
              y={node.rect.y}
              width={node.rect.width}
              height={node.rect.height}
              fill={getNodeFillColor(hover, node)}
              stroke={getNodeStrokeColor(hover, node)}
            />
          )
        })
      })}

      {layout.nodes.map((nodes, i) => {
        return nodes.map((node, j) => {
          return (
            <foreignObject
              key={`${i}-${j}`}
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
        })
      })}

      {Object.values(layout.mid).map((p, i) => (
        <SvgDot x={p.x} y={p.y} key={i} radius={4} />
      ))}

      {mouse && showDot ? <SvgDot x={svgX} y={svgY} radius={4} /> : null}
    </svg>
  )
}
