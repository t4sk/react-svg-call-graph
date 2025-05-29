// Call graph
export type Call = {
  id: number
  parent: number | null
  depth: number
  children: number[] | null
}

// Directed graph
export type Graph = Map<number, Set<number>>

// SVG
export type ViewBox = {
  x: number
  y: number
  width: number
  height: number
}

export type Point = {
  x: number
  y: number
}

export type Rect = {
  x: number
  y: number
  width: number
  height: number
}

export type Arrow = {
  // Call index
  i: number
  // Starting node id
  s: number
  // Ending node id
  e: number
  start: Point
  end: Point
}

export type MidPoints = {
  top: Point
  left: Point
  bottom: Point
  right: Point
  center: Point
}

export type Canvas = {
  width: number
  height: number
  center: Point
  node: { width: number; height: number; gap: number }
}

export type SvgNode = {
  // Node id
  id: number
  rect: Rect
  mid: MidPoints
}

export type Layout = {
  rect: Rect
  mid: MidPoints
  boxes: Rect[]
  nodes: SvgNode[][]
  arrows: Arrow[]
  map: Map<number, SvgNode>
  // Sorted x coordinates
  xs: number[]
  // Sorted y coordinates for each column
  ys: number[][]
}
