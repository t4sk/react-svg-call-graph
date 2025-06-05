// Call graph
export type Call = {
  src: number | null
  dst: number
  depth: number
}

// Directed graph
export type Neighbors = Map<number, Set<number>>

export type Graph = {
  // Child => parents
  inbound: Neighbors,
  // Parent => children
  outbound: Neighbors
}

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
  node: { width: number; height: number; gapX: number, gapY: number }
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
  nodes: SvgNode[]
  arrows: Arrow[]
  map: Map<number, SvgNode>
}
