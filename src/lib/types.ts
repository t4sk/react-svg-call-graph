// DAG
export type Node = {
  id: number
  parents: Set<number>
}

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
  // Sorted x coordinates of box boundries for each row
  xs: number[][]
  // Sorted y coordinates of row boundries
  ys: number[]
}
