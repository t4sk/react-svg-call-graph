import React from "react"

export const SvgRect: React.FC<{
  x: number
  y: number
  width: number
  height: number
  rx?: number
  ry?: number
  fill?: string
  stroke?: string
}> = ({
  x,
  y,
  width,
  height,
  fill = "none",
  stroke = "black",
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
      strokeWidth="2"
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
  text?: string | number
  textYGap?: number
}> = ({ x0, y0, x1, y1, stroke = "black", text, textYGap = -10 }) => {
  const id = `arrow-${stroke}`
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
        x1={x0}
        y1={y0}
        x2={x1}
        y2={y1}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        markerEnd={`url(#${id})`}
      />
      {text ? (
        <text
          x={(x0 + x1) >> 1}
          y={y0 + textYGap}
          fontSize="16"
          fill="none"
          stroke={stroke}
          textAnchor="middle"
          dominantBaseline="baseline"
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
  text?: string | number
  textXGap?: number
  textYGap?: number
}> = ({ x0, y0, x1, y1, stroke = "black", text, textXGap = -14, textYGap = 0 }) => {
  const mid = (x0 + x1) >> 1
  const id = `zig-zag-arrow-${stroke}`

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
      <line x1={x0} y1={y0} x2={mid} y2={y0} stroke={stroke} strokeWidth="2" />
      <line x1={mid} y1={y0} x2={mid} y2={y1} stroke={stroke} strokeWidth="2" />
      <line
        x1={mid}
        y1={y1}
        x2={x1}
        y2={y1}
        stroke={stroke}
        strokeWidth="2"
        markerEnd={`url(#${id})`}
      />
      {text ? (
        <text
          x={((x0 + x1) >> 1) + textXGap}
          y={((y0 + y1) >> 1) + textYGap}
          fontSize="16"
          fill="none"
          stroke={stroke}
          textAnchor="middle"
          dominantBaseline="middle"
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
  text?: string | number
  textXGap?: number
  textYGap?: number
}> = ({ x0, y0, x1, y1, xPadd, yPadd, stroke = "black", text, textXGap = 18, textYGap = 0 }) => {
  // x0 >= x1 and y1 >= y0
  const id = `call-back-arrow-${stroke}`
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
        x1={x0}
        y1={y0}
        x2={x0 + xPadd}
        y2={y0}
        stroke={stroke}
        strokeWidth="2"
      />
      <line
        x1={x0 + xPadd}
        y1={y0}
        x2={x0 + xPadd}
        y2={y1 - yPadd}
        stroke={stroke}
        strokeWidth="2"
      />
      <line
        x1={x0 + xPadd}
        y1={y1 - yPadd}
        x2={x1}
        y2={y1 - yPadd}
        stroke={stroke}
        strokeWidth="2"
      />
      <line
        x1={x1}
        y1={y1 - yPadd}
        x2={x1}
        y2={y1}
        stroke={stroke}
        strokeWidth="2"
        markerEnd={`url(#${id})`}
      />
      {text ? (
        <text
          x={x0 + xPadd + textXGap}
          y={((y0 + y1) >> 1) + textYGap}
          fontSize="16"
          fill="none"
          stroke={stroke}
          textAnchor="middle"
          dominantBaseline="middle"
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
