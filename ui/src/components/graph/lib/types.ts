export type Id = number

// Call graph
export type Call = {
  src: Id
  dst: Id
  depth: number
}

// Group id => function ids
export type Groups = Map<Id, Set<Id>>

// Directed graph
export type Neighbors = Map<Id, Set<Id>>

export type Graph = {
  // Child => parents
  incoming: Neighbors
  // Parent => children
  outgoing: Neighbors
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
  // left
  x: number
  // top
  y: number
  width: number
  height: number
}

export type ArrowType = "arrow" | "zigzag" | "callback"

export type Arrow = {
  // Call index
  i: number
  // Starting node id
  s: Id
  // Ending node id
  e: Id
  type: ArrowType
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

export type Screen = {
  width: number
  height: number
  center: Point
  node: {
    width: number
    height: number
    // Space between 2 nodes
    gap: { x: number; y: number }
  }
}

export type Node = {
  id: Id
  rect: Rect
}

export type Layout = {
  rect: Rect
  nodes: Map<Id, Node>
  arrows: Arrow[]
}

// UI
export type Hover = {
  node: Id | null
  arrows: Map<string, Id> | null
}

export type Tracer = {
  hover: Id | null
}
