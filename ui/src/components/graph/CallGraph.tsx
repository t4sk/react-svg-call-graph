import React, { useMemo } from "react"
import {
  Groups,
  Call,
  ViewBox,
  Point,
  Node,
  Arrow,
  Hover,
  Tracer,
} from "./lib/types"
import * as svg from "./lib/screen"
import {
  SvgRect,
  SvgDot,
  SvgArrow,
  SvgZigZagArrow,
  SvgCallBackArrow,
} from "./Svg"
import * as math from "./lib/math"

const TEXT_GAP = -30
const STEP = 50
const MIN_STEPS = 4
// R >= STEP / 2?
const R = 25
const BOX_X_PADD = 10
const BOX_Y_PADD = 10

const DEFAULT_FILL = "none"
const DEFAULT_STROKE = "black"

function sample(a: Arrow, xPadd: number = 0, yPadd: number = 0): Point[] {
  const ps = svg.poly(a.type, a.start, a.end, xPadd, yPadd)
  const [len] = math.len(ps)

  const n = Math.max(len > STEP ? (len / STEP) | 0 : MIN_STEPS, MIN_STEPS)

  return math.sample(n, (i) => {
    const t = i / n
    return math.perp(ps, t)
  })
}

export const CallGraph: React.FC<{
  groups: Groups
  calls: Call[]
  tracer?: Tracer
  backgroundColor: string
  width: number
  height: number
  viewBox: ViewBox
  mouse: Point | null
  dragging: boolean
  showDot?: boolean
  getNodeStyle?: (
    hover: Hover,
    node: Node,
  ) => { fill?: string; stroke?: string }
  getArrowStyle?: (
    hover: Hover,
    arrow: Arrow,
  ) => { type: string; style: { stroke?: string } }
  nodeWidth?: number
  nodeHeight?: number
  nodeXGap?: number
  nodeYGap?: number
  renderNode?: (hover: Hover, node: Node) => React.ReactNode
  renderArrowText?: (arrow: Arrow) => string | number
  renderHover?: (hover: Hover, mouse: Point | null) => React.ReactNode
}> = ({
  groups,
  calls,
  tracer,
  backgroundColor,
  width,
  height,
  viewBox,
  mouse,
  dragging,
  showDot = false,
  getNodeStyle = () => ({ fill: DEFAULT_FILL, stroke: DEFAULT_STROKE }),
  getArrowStyle = () => ({ type: "", style: { stroke: DEFAULT_STROKE } }),
  renderArrowText = (arrow) => arrow.i,
  renderNode = () => null,
  renderHover = () => null,
  nodeWidth = 100,
  nodeHeight = 50,
  nodeXGap = 50,
  nodeYGap = 50,
}) => {
  const arrowXPadd = nodeXGap >> 1
  const arrowYPadd = nodeYGap >> 1
  const layout = useMemo(() => {
    return svg.map(groups, calls, {
      width,
      height,
      center: {
        x: width >> 1,
        y: height >> 1,
      },
      node: {
        width: nodeWidth,
        height: nodeHeight,
        gap: {
          x: nodeXGap,
          y: nodeYGap,
        },
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
  const mouseSvgXY = { x: svgX, y: svgY }

  const hover: Hover = { node: null, arrows: null }
  if (!dragging && mouse && svgX != 0 && svgY != 0) {
    for (const node of layout.nodes.values()) {
      if (svg.isInside(mouseSvgXY, node.rect)) {
        hover.node = node.id
      }
    }

    if (hover.node == null) {
      hover.arrows = new Map()

      for (let i = 0; i < layout.arrows.length; i++) {
        const a = layout.arrows[i]
        const box = svg.box(
          svg.poly(a.type, a.start, a.end, arrowXPadd, -arrowYPadd),
          BOX_X_PADD,
          BOX_Y_PADD,
        )
        if (svg.isInside(mouseSvgXY, box)) {
          // TODO: cache?
          const points = sample(a, arrowXPadd, -arrowYPadd)
          for (let i = 0; i < points.length; i++) {
            if (math.dist(points[i], mouseSvgXY) < R) {
              hover.arrows.set(svg.getArrowKey(a), a.i)
            }
          }
        }
      }
    }
  }

  const renderArrow = (a: Arrow, type: string, style: { stroke?: string }) => {
    const key = svg.getArrowKey(a)
    const offset = overlaps.get(key) || 0
    overlaps.set(key, offset > 0 ? offset - 1 : 0)

    // const points = sample(a, arrowXPadd, -arrowYPadd)

    if (a.start.y == a.end.y) {
      return (
        <>
          {/*points.map((p, i) => (
             <SvgDot x={p.x} y={p.y} radius={4} key={i} />
             ))*/}
          <SvgArrow
            x0={a.start.x}
            y0={a.start.y}
            x1={a.end.x}
            y1={a.end.y}
            type={type}
            stroke={style?.stroke || DEFAULT_STROKE}
            text={renderArrowText(a)}
            textYGap={offset * TEXT_GAP}
          />
        </>
      )
    }
    if (a.end.x <= a.start.x) {
      return (
        <>
          {/*points.map((p, i) => (
             <SvgDot x={p.x} y={p.y} radius={4} key={i} />
             ))*/}
          <SvgCallBackArrow
            x0={a.start.x}
            y0={a.start.y}
            x1={a.end.x}
            y1={a.end.y}
            xPadd={arrowXPadd}
            yPadd={-arrowYPadd}
            type={type}
            stroke={style?.stroke || DEFAULT_STROKE}
            text={renderArrowText(a)}
            textYGap={offset * TEXT_GAP}
          />
        </>
      )
    }

    return (
      <>
        {/*points.map((p, i) => (
           <SvgDot x={p.x} y={p.y} radius={4} key={i} />
           ))*/}
        <SvgZigZagArrow
          x0={a.start.x}
          y0={a.start.y}
          x1={a.end.x}
          y1={a.end.y}
          type={type}
          stroke={style?.stroke || DEFAULT_STROKE}
          text={renderArrowText(a)}
          textYGap={offset * TEXT_GAP}
        />
      </>
    )
  }

  return (
    <div style={{ width, height, position: "relative" }}>
      <svg
        width={width}
        height={height}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        style={{ backgroundColor }}
      >
        {layout.arrows.map((a, i) => {
          // Render arrows that are not hovered
          if (
            a.s == hover.node ||
            a.e == hover.node ||
            a.s == tracer?.hover ||
            a.e == tracer?.hover
          ) {
            return null
          }
          const style = getArrowStyle(hover, a)
          return (
            <React.Fragment key={`arrow-${i}`}>
              {renderArrow(a, style.type, style.style)}
            </React.Fragment>
          )
        })}

        {layout.arrows.map((a, i) => {
          // Render arrows that are hovered second
          if (
            a.s != hover.node &&
            a.e != hover.node &&
            a.s != tracer?.hover &&
            a.e != tracer?.hover
          ) {
            return null
          }
          const style = getArrowStyle(hover, a)
          return (
            <React.Fragment key={`arrow-hover-${i}`}>
              {renderArrow(a, style.type, style.style)}
            </React.Fragment>
          )
        })}

        {[...layout.nodes.values()].map((node, i) => {
          const style = getNodeStyle(hover, node)
          return (
            <SvgRect
              key={`node-${i}`}
              x={node.rect.x}
              y={node.rect.y}
              width={node.rect.width}
              height={node.rect.height}
              fill={style?.fill || DEFAULT_FILL}
              stroke={style?.stroke || DEFAULT_STROKE}
            />
          )
        })}

        {[...layout.nodes.values()].map((node, i) => {
          return (
            <foreignObject
              key={`obj-${i}`}
              x={node.rect.x}
              y={node.rect.y}
              width={node.rect.width}
              height={node.rect.height}
            >
              {renderNode(hover, node)}
            </foreignObject>
          )
        })}

        {/* Debug */}

        {/*Object.values(layout.mid).map((p, i) => (
          <SvgDot x={p.x} y={p.y} key={i} radius={4} />
        ))*/}

        {mouse && showDot ? (
          <SvgDot x={svgX} y={svgY} radius={R} fill="rgba(255, 0, 0, 0.5)" />
        ) : null}
      </svg>
      {renderHover(hover, mouse)}
    </div>
  )
}
