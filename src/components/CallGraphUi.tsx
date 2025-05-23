import { useRef, useState, useEffect } from "react"
import { Call, ViewBox, Point, SvgNode } from "../lib/types"
import * as svg from "../lib/svg"
import styles from "./CallGraphUi.module.css"
import {
  SvgRect,
  SvgCircle,
  SvgDot,
  SvgArrow,
  SvgZigZagArrow,
  SvgCallBackArrow,
  SvgLine,
  SvgCubicBezier,
  SvgCubicBezierArc,
} from "./Svg"
import { search } from "../lib/utils"
import { Controller } from "./Controller"

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
  // TODO: don't call on every render
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

  return (
    <svg
      width={width}
      height={height}
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      style={{ backgroundColor }}
    >
      {layout.arrows.map((a, i) => {
        if (a.start.y == a.end.y) {
          return (
            <SvgArrow
              key={i}
              x0={a.start.x}
              y0={a.start.y}
              x1={a.end.x}
              y1={a.end.y}
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
                yPadd={nodeGap >> 1}
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
          />
        )
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
              fill={rectFill}
              stroke={rectStroke}
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

// TODO: fix smoother drag
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

  useEffect(() => {
    zoom(3)
  }, [])

  function zoom(next: number) {
    // Zoom in -> view box decrease width and height
    // Zoom out -> view box increase width and height
    const up = next >= zoomIndex
    const nextZoomIndex = up ? Math.min(next, MAX_ZOOM_INDEX) : Math.max(next, MIN_ZOOM_INDEX)
    const w = Math.floor(width / ZOOMS[nextZoomIndex])
    const h = Math.floor(height / ZOOMS[nextZoomIndex])
    const center = {
      x: viewBox.x + (viewBox.width >> 1),
      y: viewBox.y + (viewBox.height >> 1),
    }

    setZoomIndex(nextZoomIndex)
    setViewBox({
      x: center.x - (w >> 1),
      y: center.y - (h >> 1),
      width: w,
      height: h,
    })
  }

  function onClickPlus() {
    zoom(zoomIndex + 1)
  }

  function onClickMinus() {
    zoom(zoomIndex - 1)
  }

  function getMouse(
    ref: HTMLDivElement | null,
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
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

  const zoomPercentage = Math.floor((width / viewBox.width) * 100)

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
          zoomPercentage={zoomPercentage}
        />
      </div>
    </div>
  )
}
