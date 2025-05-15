import React from "react"
import * as math from "../lib/math"

export const SvgRect: React.FC<{
  x: number
  y: number
  width: number
  height: number
  fill?: string
  stroke?: string
}> = ({ x, y, width, height, fill = "none", stroke = "black" }) => {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      stroke={stroke}
      strokeWidth="2"
    />
  )
}

export const SvgDot: React.FC<{
  x: number
  y: number
  radius: number
  fill?: string
}> = ({ x, y, radius, fill = "red" }) => {
  return <circle cx={x} cy={y} r={radius} fill={fill} />
}

export const SvgLine: React.FC<{
  x0: number
  y0: number
  x1: number
  y1: number
  stroke?: string
}> = ({ x0, y0, x1, y1, stroke }) => {
  return (
    <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={stroke} strokeWidth="2" />
  )
}

const DY = 10
const ARROW = 4

export const SvgCubicBezier: React.FC<{
  x0: number
  y0: number
  x1: number
  y1: number
  t: number
  color?: string
}> = ({ x0, y0, x1, y1, t, color = "black" }) => {
  const dy = DY
  const arrow = ARROW
  const x0_t = math.lerp(x0, x1, t)
  const y0_t = math.lerp(y0 + dy, y1 - dy, 1 - t)
  const x1_t = math.lerp(x0, x1, 1 - t)
  const y1_t = math.lerp(y0 + dy, y1 - dy, t)
  // M x y = move to x, y

  // Cubic Bezier curve
  //   p0,    p1,    p2
  // C x0 y0, x1 y1, x y
  const d = `M ${x0} ${y0 + dy} C ${x0_t} ${y0_t}, ${x1_t} ${y1_t}, ${x1} ${y1 - dy}`

  return (
    <>
      <defs>
        <marker
          id="cubic-arrow-black"
          markerWidth="5"
          markerHeight="5"
          refX="2.5"
          refY="2.5"
          orient="auto"
        >
          <path d="M 0 0 L 5 2.5 L 0 5 z" />
        </marker>
        <marker
          id={`cubic-arrow-${color}`}
          markerWidth="5"
          markerHeight="5"
          refX="2.5"
          refY="2.5"
          orient="auto"
        >
          <path d="M 0 0 L 5 2.5 L 0 5 z" fill={color} stroke={color} />
        </marker>
      </defs>
      <path
        d={`M ${x0}, ${y0} L ${x0} ${y0 + dy}`}
        stroke={color}
        fill="none"
        strokeWidth="2"
      />
      <path d={d} stroke={color} fill="none" strokeWidth="2" />
      <path
        d={`M ${x1}, ${y1 - dy} L ${x1} ${y1 - arrow}`}
        stroke={color}
        fill="none"
        strokeWidth="2"
        markerEnd={`url(#cubic-arrow-${color})`}
      />
    </>
  )
}

export const SvgCubicBezierArc: React.FC<{
  x0: number
  y0: number
  x1: number
  y1: number
  t: number
  color?: string
}> = ({ x0, y0, x1, y1, t, color = "black" }) => {
  const dy = DY
  const arrow = ARROW
  const mid_x = (x0 + x1) / 2
  const mid_y = y0 - Math.abs(x1 - x0) / 2

  const x0_t = math.lerp(x0, mid_x, t)
  const y0_t = math.lerp(y0 - dy, mid_y, t)
  const x1_t = math.lerp(x1, mid_x, t)
  const y1_t = math.lerp(y1 - dy, mid_y, t)

  // M x y = move to x, y
  // Cubic Bezier curve
  //   p0,    p1,    p2
  // C x0 y0, x1 y1, x y
  const d = `M ${x0} ${y0 - dy} C ${x0_t} ${y0_t}, ${x1_t} ${y1_t}, ${x1} ${y1 - dy}`

  return (
    <>
      <defs>
        <marker
          id="arc-arrow-black"
          markerWidth="5"
          markerHeight="5"
          refX="2.5"
          refY="2.5"
          orient="auto"
        >
          <path d="M 0 0 L 5 2.5 L 0 5 z" />
        </marker>
        <marker
          id={`arc-arrow-${color}`}
          markerWidth="5"
          markerHeight="5"
          refX="2.5"
          refY="2.5"
          orient="auto"
        >
          <path d="M 0 0 L 5 2.5 L 0 5 z" stroke={color} fill={color} />
        </marker>
      </defs>
      <path
        d={`M ${x0}, ${y0 - dy} L ${x0} ${y0}`}
        stroke={color}
        fill="none"
        strokeWidth="2"
      />
      <path d={d} stroke={color} fill="none" strokeWidth="2" />
      <path
        d={`M ${x1}, ${y1 - dy} L ${x1} ${y1 - arrow}`}
        stroke={color}
        fill="none"
        strokeWidth="2"
        markerEnd={`url(#arc-arrow-${color})`}
      />
    </>
  )
}
