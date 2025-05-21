import {
  Call,
  Point,
  Rect,
  MidPoints,
  Arrow,
  Canvas,
  SvgNode,
  Layout,
} from "./types"
import * as graph from "./graph"
import * as math from "./math"

export function getViewBoxX(
  width: number,
  mouseX: number,
  viewBoxWidth: number,
  viewBoxX: number,
): number {
  return math.lin(viewBoxWidth, width, mouseX, viewBoxX)
}

export function getViewBoxY(
  height: number,
  mouseY: number,
  viewBoxHeight: number,
  viewBoxY: number,
): number {
  return math.lin(viewBoxHeight, height, mouseY, viewBoxY)
}

export function getCenterX(rect: Rect): number {
  return rect.x + (rect.width >> 1)
}

export function getCenterY(rect: Rect): number {
  return rect.y + (rect.height >> 1)
}

export function getCenter(rect: Rect): Point {
  return {
    x: rect.x + (rect.width >> 1),
    y: rect.y + (rect.height >> 1),
  }
}

export function getMidPoints(rect: Rect): MidPoints {
  const midWidth = rect.width >> 1
  const midHeight = rect.height >> 1

  return {
    top: {
      x: rect.x + midWidth,
      y: rect.y,
    },
    bottom: {
      x: rect.x + midWidth,
      y: rect.y + rect.height,
    },
    left: {
      x: rect.x,
      y: rect.y + midHeight,
    },
    right: {
      x: rect.x + rect.width,
      y: rect.y + midHeight,
    },
    center: {
      x: rect.x + midWidth,
      y: rect.y + midHeight,
    },
  }
}

export function iter(mids: {
  top: Point
  bottom: Point
  left: Point
  right: Point
  center: Point
}): Point[] {
  const { top, left, bottom, right, center } = mids
  // clockwise
  return [top, left, bottom, right, center]
}

function box(canvas: Canvas, n: number, p0: Point): Rect {
  const height = canvas.node.height
  const width = n * canvas.node.width + (n - 1) * canvas.node.gap

  return {
    x: p0.x - (width >> 1),
    y: p0.y - (height >> 1),
    width,
    height,
  }
}

function arrow(map: Map<number, SvgNode>, start: number, end: number): Arrow {
  const s = map.get(start) as SvgNode
  const e = map.get(end) as SvgNode

  const m0 = getMidPoints(s.rect)
  const m1 = getMidPoints(e.rect)

  let p0 = { x: 0, y: 0 }
  let p1 = { x: 0, y: 0 }

  p0 = m0.right
  p1 = m1.left

  return {
    s: s.id,
    e: e.id,
    start: p0,
    end: p1,
  }
}

export function isInside(p: Point, rect: Rect): boolean {
  return (
    p.x >= rect.x &&
    p.x <= rect.x + rect.width &&
    p.y >= rect.y &&
    p.y <= rect.y + rect.height
  )
}

/*
export function map(calls: Call[]): Map<number, Point> {
  const pos: Map<number, Point> = new Map()
  for (let i = 0; i < calls.length; i++) {
    const c = calls[i]
    if (!pos.has(c.id)) {
      pos.set(c.id, { x: c.depth, y: i })
    }
  }
  return pos
}
*/

export function map(calls: Call[], canvas: Canvas): Layout {
  let maxDepth = 0
  {
    const visited = new Set()
    for (let i = 0; i < calls.length; i++) {
      const c = calls[i]
      if (!visited.has(c.id)) {
        visited.add(c.id)
        maxDepth = Math.max(maxDepth, c.depth)
      }
    }
  }

  const height =
    calls.length * canvas.node.height + (calls.length - 1) * canvas.node.gap
  const width = maxDepth * canvas.node.width + (maxDepth - 1) * canvas.node.gap

  const x0 = canvas.center.x - (width >> 1)
  const y0 = canvas.center.y - (height >> 1)

  const nodes: SvgNode[] = []
  const map: Map<number, SvgNode> = new Map()
  const xs: number[] = []
  const ys: number[] = []

  for (let i = 0; i < calls.length; i++) {
    const c = calls[i]

    if (map.has(c.id)) {
      continue
    }

    const { height, width, gap } = canvas.node
    const rect = {
      x: x0 + (width >> 1) + c.depth * (width + gap),
      y: y0 + (height >> 1) + i * (height + gap),
      width: width,
      height: height,
    }
    const mid = getMidPoints(rect)
    const node = {
      id: c.id,
      rect,
      mid,
    }
    nodes.push(node)
    map.set(c.id, node)

    /*
    xs[i].push(mid.left.x, mid.right.x)
    ys.push(mid.top.y, mid.bottom.y)
    */
  }

  const arrows: Arrow[] = []
  for (let i = 0; i < calls.length; i++) {
    const c = calls[i]
    const neighbors = c.children
    if (neighbors) {
      for (let j = 0; j < neighbors.length; j++) {
        arrows.push(arrow(map, c.id, neighbors[j]))
      }
    }
  }

  const rect = {
    x: canvas.center.x - (width >> 1),
    y: canvas.center.y - (height >> 1),
    width,
    height,
  }

  const mid = getMidPoints(rect)

  return {
    rect,
    mid,
    boxes: [],
    nodes,
    arrows,
    map,
    xs,
    ys,
  }
}
