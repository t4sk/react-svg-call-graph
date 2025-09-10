import {
  Id,
  Call,
  Point,
  Rect,
  MidPoints,
  Arrow,
  ArrowType,
  Screen,
  Node,
  Layout,
} from "./types"
import * as math from "./math"

export function getArrowKey(a: Arrow): string {
  return `${a.s},${a.e}`
}

export function splitArrowKey(key: string): { src: Id; dst: Id } {
  const [src, dst] = key.split(",")
  return {
    src: parseInt(src),
    dst: parseInt(dst),
  }
}

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

export function isInside(p: Point, rect: Rect): boolean {
  return (
    p.x >= rect.x &&
    p.x <= rect.x + rect.width &&
    p.y >= rect.y &&
    p.y <= rect.y + rect.height
  )
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

export function getArrowType(p0: Point, p1: Point): ArrowType {
  if (p0.y == p1.y) {
    return "arrow"
  }
  if (p1.x <= p0.x) {
    return "callback"
  }
  return "zigzag"
}

export function poly(
  type: ArrowType,
  p0: Point,
  p1: Point,
  xPadd: number = 0,
  yPadd: number = 0,
): Point[] {
  switch (type) {
    case "zigzag": {
      const mid = (p0.x + p1.x) >> 1
      return [p0, { x: mid, y: p0.y }, { x: mid, y: p1.y }, p1]
    }
    case "callback": {
      return [
        p0,
        { x: p0.x + xPadd, y: p0.y },
        { x: p0.x + xPadd, y: p1.y + yPadd },
        { x: p1.x, y: p1.y + yPadd },
        p1,
      ]
    }
    default:
      return [p0, p1]
  }
}

export function box(
  points: Point[],
  xPadd: number = 0,
  yPadd: number = 0,
): Rect {
  let xMin = points[0].x
  let xMax = points[0].x
  let yMin = points[0].y
  let yMax = points[0].y

  for (let i = 1; i < points.length; i++) {
    const p = points[i]
    if (p.x < xMin) {
      xMin = p.x
    }
    if (p.y < yMin) {
      yMin = p.y
    }
    if (p.x > xMax) {
      xMax = p.x
    }
    if (p.y > yMax) {
      yMax = p.y
    }
  }

  return {
    x: xMin - xPadd,
    y: yMin - yPadd,
    width: xMax - xMin + 2 * xPadd,
    height: yMax - yMin + 2 * yPadd,
  }
}

function arrow(map: Map<Id, Node>, i: number, start: Id, end: Id): Arrow {
  const s = map.get(start) as Node
  const e = map.get(end) as Node

  const m0 = getMidPoints(s.rect)
  const m1 = getMidPoints(e.rect)

  let p0 = { x: 0, y: 0 }
  let p1 = { x: 0, y: 0 }

  if (m0.center.x < m1.center.x) {
    p0 = m0.right
    p1 = m1.left
  } else {
    p0 = m0.right
    p1 = m1.top
  }

  return {
    i,
    s: s.id,
    e: e.id,
    type: getArrowType(p0, p1),
    start: p0,
    end: p1,
  }
}

export function map(mods: Map<Id, Id>, calls: Call[], screen: Screen): Layout {
  // TODO:
  // 1. Initialize contract nodes
  // 2. Put functions into contracts
  // 3. Calculate contract boxes (width and height)
  // 4. Calculate contract x positions based on min function depth
  // 5, Calculate contract y positions based on call index

  const nodes: Node[] = []
  const map: Map<Id, Node> = new Map()

  let xMax = 0
  let yMax = 0

  // depth => offset
  const offsets: Map<Id, number> = new Map()
  offsets.set(0, 0)
  let dup = 0

  // Add first caller as dst for calculation in the for loop
  const cs: Call[] = [
    { src: null, dst: 0, depth: 0 },
    ...calls.map((c) => ({
      ...c,
      depth: c.depth + 1,
    })),
  ]

  const { height, width, gapX, gapY } = screen.node
  const halfWidth = width >> 1
  const halfHeight = height >> 1
  for (let i = 0; i < cs.length; i++) {
    const c = cs[i]

    if (map.has(c.dst)) {
      dup += 1
      continue
    }

    const offset = offsets.get(c.depth) || 0
    /*
    // Next depth is shifted up
    offsets.set(c.depth + 1, offset - 1)
    // Previous depths are shifted up
    offsets.set(c.depth - 1, offset)
    for (let k = 0; k <= c.depth - 1; k++) {
      offsets.set(k, offset)
    }
    */

    const rect = {
      x: halfWidth + c.depth * (width + gapX),
      y: halfHeight + (i + offset - dup) * (height + gapY),
      width: width,
      height: height,
    }
    const node = {
      id: c.dst,
      rect,
      mid: getMidPoints(rect),
      nodes: [],
    }

    nodes.push(node)
    map.set(c.dst, node)

    xMax = Math.max(xMax, node.mid.right.x)
    yMax = Math.max(yMax, node.mid.bottom.y)
  }

  // Set final positions of the nodes
  const x0 = screen.center.x - (xMax >> 1)
  const y0 = screen.center.y - (yMax >> 1)

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const rect = {
      x: x0 + node.rect.x,
      y: y0 + node.rect.y,
      width: node.rect.width,
      height: node.rect.height,
    }
    const mid = getMidPoints(rect)
    nodes[i] = {
      ...node,
      rect,
      mid,
    }
    map.set(node.id, nodes[i])
  }

  const arrows: Arrow[] = []
  for (let i = 0; i < calls.length; i++) {
    const c = calls[i]
    if (c.src != null) {
      arrows.push(arrow(map, i, c.src, c.dst))
    }
  }

  const rect = {
    x: x0,
    y: y0,
    width: xMax,
    height: yMax,
  }

  const mid = getMidPoints(rect)

  return {
    rect,
    mid,
    nodes,
    arrows,
    map,
  }
}

export function overlaps(arrows: Arrow[]): Map<string, number> {
  const m: Map<string, number> = new Map()
  for (let i = 0; i < arrows.length; i++) {
    const key = getArrowKey(arrows[i])
    m.set(key, (m.get(key) ?? 0) + 1)
  }
  return m
}
