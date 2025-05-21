import { useRef, useState } from "react"
import { Call, ViewBox, Point, SvgNode } from "../lib/types"
import * as svg from "../lib/svg"
import styles from "./CallGraphUi.module.css"
import {
  SvgRect,
  SvgCircle,
  SvgDot,
  SvgArrow,
  SvgLine,
  SvgCubicBezier,
  SvgCubicBezierArc,
} from "./Svg"
import { Controller } from "./Controller"

const ARC_X_PADDING = 20

export const CallGraph: React.FC<{
  calls: Call[]
  backgroundColor: string
  width: number
  height: number
  viewBox: ViewBox
  mouse: Point | null
  isDragging: boolean
  showDot?: boolean
  rectFill?: string
  rectStroke?: string
  lineColor?: string
  lineHoverColor?: string
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
  showDot = false,
  rectFill = "none",
  rectStroke = "black",
  lineColor = "black",
  lineHoverColor = "red",
  renderNode,
  nodeWidth = 100,
  nodeHeight = 50,
  nodeGap = 60,
}) => {
  const layout = svg.map(calls, {
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

  const svgX = mouse
    ? svg.getViewBoxX(width, mouse.x, viewBox.width, viewBox.x)
    : 0
  const svgY = mouse
    ? svg.getViewBoxY(height, mouse.y, viewBox.height, viewBox.y)
    : 0

  let hover = null
  if (mouse && svgX != 0 && svgY != 0) {
    /*
    // Binary search y
    const i = (search(layout.ys, (y) => y, svgY) || 0) >> 1
    const xs = layout.xs[i]
    if (xs) {
      // Binary search x
      const j = (search(xs, (x) => x, svgX) || 0) >> 1
      const node = layout.nodes[i][j]
      if (node && svg.isInside({ x: svgX, y: svgY }, node.rect)) {
        hover = node.id
      }
    }
    */
  }

  const circles = [
    {
      x: 100,
      y: 100,
    },
    {
      x: 300,
      y: 100,
    },
  ]

  return (
    <svg
      width={width}
      height={height}
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      style={{ backgroundColor }}
    >
      {/*circles.map((c, i) => (
        <SvgCircle key={i} x={c.x} y={c.y} radius={40} />
      ))*/}
      {layout.nodes.map((node, i) => (
        <SvgRect
          key={i}
          x={node.rect.x}
          y={node.rect.y}
          width={node.rect.width}
          height={node.rect.height}
          fill={rectFill}
          stroke={rectStroke}
        />
      ))}
      {layout.arrows.map((a, i) => {
        return (
          <SvgArrow
            key={i}
            x0={a.start.x}
            y0={a.start.y}
            x1={a.end.x}
            y1={a.end.y}
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

      {mouse && showDot ? <SvgDot x={svgX} y={svgY} radius={4} /> : null}
    </svg>
  )
}

const ZOOMS: number[] = [
  0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6,
  1.7, 1.8, 1.9, 2.0,
]
const MIN_ZOOM_INDEX = 0
const MAX_ZOOM_INDEX = ZOOMS.length - 1

export type Drag = {
  startMouseX: number
  startMouseY: number
  startViewBoxX: number
  startViewBoxY: number
}

export const CallGraphUi: React.FC<{
  calls: Call[]
  backgroundColor: string
  width: number
  height: number
  rectFill?: string
  rectStroke?: string
  lineColor?: string
  lineHoverColor?: string
  renderNode?: (node: SvgNode) => React.ReactNode
  showDot?: boolean
  nodeWidth?: number
  nodeHeight?: number
  nodeGap?: number
}> = ({
  calls,
  backgroundColor,
  width,
  height,
  rectFill,
  rectStroke,
  lineColor,
  lineHoverColor,
  renderNode = (node) => node.id,
  showDot = false,
  nodeWidth,
  nodeHeight,
  nodeGap,
}) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  const [mouse, setMouse] = useState<Point | null>(null)
  const [viewBox, setViewBox] = useState({
    x: 0,
    y: 0,
    width,
    height,
  })
  const [zoomIndex, setZoomIndex] = useState<number>(9)

  const center = {
    x: viewBox.x + (viewBox.width >> 1),
    y: viewBox.y + (viewBox.height >> 1),
  }

  function onClickPlus() {
    // Zoom in -> view box decrease width and height
    const nextZoomIndex = Math.min(zoomIndex + 1, MAX_ZOOM_INDEX)
    const w = Math.floor(width / ZOOMS[nextZoomIndex])
    const h = Math.floor(height / ZOOMS[nextZoomIndex])
    setZoomIndex(nextZoomIndex)
    setViewBox({
      x: center.x - (w >> 1),
      y: center.y - (h >> 1),
      width: w,
      height: h,
    })
  }

  function onClickMinus() {
    // Zoom out -> view box increase width and height
    const nextZoomIndex = Math.max(zoomIndex - 1, MIN_ZOOM_INDEX)
    const w = Math.floor(width / ZOOMS[nextZoomIndex])
    const h = Math.floor(height / ZOOMS[nextZoomIndex])
    setZoomIndex(nextZoomIndex)
    setViewBox({
      x: center.x - (w >> 1),
      y: center.y - (h >> 1),
      width: w,
      height: h,
    })
  }

  function getMouse(
    ref: HTMLDivElement | null,
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ): Point | null {
    if (!ref) {
      return null
    }
    const rect = ref.getBoundingClientRect()

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  function onMouseDown(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault()
    const mouse = getMouse(ref.current, e)
    if (mouse) {
      setDrag({
        startMouseX: mouse.x,
        startMouseY: mouse.y,
        startViewBoxX: viewBox.x,
        startViewBoxY: viewBox.y,
      })
    }
  }

  function onMouseUp(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault()
    setDrag(null)
  }

  function onMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault()
    const mouse = getMouse(ref.current, e)
    if (mouse) {
      setMouse(mouse)
      if (drag) {
        const dx = mouse.x - drag.startMouseX
        const dy = mouse.y - drag.startMouseY
        setViewBox({
          ...viewBox,
          x: drag.startViewBoxX - dx,
          y: drag.startViewBoxY - dy,
        })
      }
    }
  }

  function onMouseOut(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault()
    setDrag(null)
  }

  const percentage = Math.floor((width / viewBox.width) * 100)

  return (
    <div
      style={{
        backgroundColor,
        position: "relative",
        width,
        height,
      }}
      ref={ref}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
    >
      <CallGraph
        calls={calls}
        backgroundColor={backgroundColor}
        width={width}
        height={height}
        viewBox={viewBox}
        mouse={mouse}
        isDragging={!!drag}
        showDot={showDot}
        rectFill={rectFill}
        rectStroke={rectStroke}
        lineColor={lineColor}
        lineHoverColor={lineHoverColor}
        renderNode={renderNode}
        nodeWidth={nodeWidth}
        nodeHeight={nodeHeight}
        nodeGap={nodeGap}
      />
      {drag ? (
        <div
          style={{
            cursor: "grabbing",
            position: "absolute",
            top: 0,
            left: 0,
            width,
            height,
          }}
          onMouseOut={onMouseOut}
        ></div>
      ) : null}
      <div className={styles.controller}>
        <Controller
          onClickPlus={onClickPlus}
          onClickMinus={onClickMinus}
          percentage={percentage}
        />
      </div>
    </div>
  )
}
