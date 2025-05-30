import { useMemo } from "react"
import { Call, ViewBox, Point, SvgNode, Arrow } from "../lib/types"
import * as svg from "../lib/svg"
import {
  SvgRect,
  SvgDot,
  SvgArrow,
  SvgZigZagArrow,
  SvgCallBackArrow,
} from "./Svg"
import { search } from "../lib/utils"

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
  nodeGap?: number
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
  nodeGap = 60,
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
        gap: nodeGap,
      },
    })
  }, [calls, width, height])

  const svgX = mouse
    ? svg.getViewBoxX(width, mouse.x, viewBox.width, viewBox.x)
    : 0
  const svgY = mouse
    ? svg.getViewBoxY(height, mouse.y, viewBox.height, viewBox.y)
    : 0

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
    if (a.start.y == a.end.y) {
      return (
        <SvgArrow
          key={i}
          x0={a.start.x}
          y0={a.start.y}
          x1={a.end.x}
          y1={a.end.y}
          stroke={lineColor}
          text={a.i}
        />
      )
    }
    if (a.end.x <= a.start.x) {
      return (
        <SvgCallBackArrow
          key={i}
          x0={a.start.x}
          y0={a.start.y}
          x1={a.end.x}
          y1={a.end.y}
          xPadd={nodeGap >> 1}
          yPadd={-(nodeGap >> 1)}
          stroke={lineColor}
          text={a.i}
        />
      )
    }
    return (
      <SvgZigZagArrow
        key={i}
        x0={a.start.x}
        y0={a.start.y}
        x1={a.end.x}
        y1={a.end.y}
        stroke={lineColor}
        text={a.i}
      />
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
