import React from "react"

const FONT = "sans-serif"
const FONT_SIZE = 18

export const SvgRect: React.FC<{
  x: number
  y: number
  width: number
  height: number
  rx?: number
  ry?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
}> = ({
  x,
  y,
  width,
  height,
  fill = "none",
  stroke = "black",
  strokeWidth = 2,
  rx = 8,
  ry = 8,
}) => {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      rx={rx}
      ry={ry}
    />
  )
}

export const SvgArrow: React.FC<{
  x0: number
  y0: number
  x1: number
  y1: number
  stroke?: string
  strokeWidth?: number
  text?: string | number
  textXGap?: number
  textYGap?: number
  type?: string
}> = ({
  x0,
  y0,
  x1,
  y1,
  stroke = "black",
  strokeWidth = 2,
  text,
  textXGap = 0,
  textYGap = -10,
  type = ""
}) => {
  const id = `arrow-${type}`
  return (
    <>
      <defs>
        <marker
          id={id}
          markerWidth="5"
          markerHeight="5"
          refX="5"
          refY="2.5"
          orient="auto"
        >
          <path fill={stroke} stroke={stroke} d="M 0 0 L 5 2.5 L 0 5 z" />
        </marker>
      </defs>
      <line
        className="flow"
        x1={x0}
        y1={y0}
        x2={x1}
        y2={y1}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        markerEnd={`url(#${id})`}
      />

      {text ? (
        <text
          x={((x0 + x1) >> 1) + textXGap}
          y={y0 + textYGap}
          fontFamily={FONT}
          fontSize={FONT_SIZE}
          fill={stroke}
          stroke={stroke}
          textAnchor="middle"
          dominantBaseline="baseline"
          textRendering="optimizeLegibility"
        >
          {text}
        </text>
      ) : null}
    </>
  )
}

export const SvgZigZagArrow: React.FC<{
  x0: number
  y0: number
  x1: number
  y1: number
  stroke?: string
  strokeWidth?: number
  text?: string | number
  textXGap?: number
  textYGap?: number
  type?: string
}> = ({
  x0,
  y0,
  x1,
  y1,
  stroke = "black",
  strokeWidth = 2,
  text,
  textXGap = -14,
  textYGap = -14,
  type = ""
}) => {
  const midX = (x0 + x1) >> 1
  const id = `zig-zag-arrow-${type}`

  return (
    <>
      <defs>
        <marker
          id={id}
          markerWidth="5"
          markerHeight="5"
          refX="5"
          refY="2.5"
          orient="auto"
          stroke={stroke}
        >
          <path fill={stroke} color={stroke} d="M 0 0 L 5 2.5 L 0 5 z" />
        </marker>
      </defs>
      <line
        className="flow"
        x1={x0}
        y1={y0}
        x2={midX}
        y2={y0}
        stroke={stroke}
        strokeWidth="2"
      />
      <line
        className="flow"
        x1={midX}
        y1={y0}
        x2={midX}
        y2={y1}
        stroke={stroke}
        strokeWidth="2"
      />
      <line
        className="flow"
        x1={midX}
        y1={y1}
        x2={x1}
        y2={y1}
        stroke={stroke}
        strokeWidth={strokeWidth}
        markerEnd={`url(#${id})`}
      />
      {text ? (
        <text
          x={midX + textXGap}
          y={y1 + textYGap}
          fontFamily={FONT}
          fontSize={FONT_SIZE}
          fill={stroke}
          stroke={stroke}
          textAnchor="end"
          dominantBaseline="middle"
          textRendering="optimizeLegibility"
        >
          {text}
        </text>
      ) : null}
    </>
  )
}

export const SvgCallBackArrow: React.FC<{
  x0: number
  y0: number
  x1: number
  y1: number
  xPadd: number
  yPadd: number
  stroke?: string
  strokeWidth?: number
  text?: string | number
  textXGap?: number
  textYGap?: number
  type?: string
}> = ({
  x0,
  y0,
  x1,
  y1,
  xPadd,
  yPadd,
  stroke = "black",
  strokeWidth = 2,
  text,
  textXGap = 0,
  textYGap = -14,
  type = ""
}) => {
  // x0 >= x1 and y1 >= y0
  const id = `call-back-arrow-${type}`
  return (
    <>
      <defs>
        <marker
          id={id}
          markerWidth="5"
          markerHeight="5"
          refX="5"
          refY="2.5"
          orient="auto"
        >
          <path fill={stroke} stroke={stroke} d="M 0 0 L 5 2.5 L 0 5 z" />
        </marker>
      </defs>
      <line
        className="flow"
        x1={x0}
        y1={y0}
        x2={x0 + xPadd}
        y2={y0}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <line
        className="flow"
        x1={x0 + xPadd}
        y1={y0}
        x2={x0 + xPadd}
        y2={y1 + yPadd}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <line
        className="flow"
        x1={x0 + xPadd}
        y1={y1 + yPadd}
        x2={x1}
        y2={y1 + yPadd}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <line
        className="flow"
        x1={x1}
        y1={y1 + yPadd}
        x2={x1}
        y2={y1}
        stroke={stroke}
        strokeWidth={strokeWidth}
        markerEnd={`url(#${id})`}
      />
      {text ? (
        <text
          x={x1 + textXGap}
          y={y1 + yPadd + textYGap}
          fontFamily={FONT}
          fontSize={FONT_SIZE}
          fill={stroke}
          stroke={stroke}
          textAnchor="start"
          dominantBaseline="middle"
          textRendering="optimizeLegibility"
        >
          {text}
        </text>
      ) : null}
    </>
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
