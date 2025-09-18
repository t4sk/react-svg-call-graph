import {
  Id,
  Call,
  Groups,
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
import { assert } from "./utils"

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
  const mw = rect.width >> 1
  const mh = rect.height >> 1

  return {
    top: {
      x: rect.x + mw,
      y: rect.y,
    },
    bottom: {
      x: rect.x + mw,
      y: rect.y + rect.height,
    },
    left: {
      x: rect.x,
      y: rect.y + mh,
    },
    right: {
      x: rect.x + rect.width,
      y: rect.y + mh,
    },
    center: {
      x: rect.x + mw,
      y: rect.y + mh,
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

function arrow(nodes: Map<Id, Node>, i: number, start: Id, end: Id): Arrow {
  const s = nodes.get(start) as Node
  const e = nodes.get(end) as Node

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

export function map(groups: Groups, calls: Call[], screen: Screen): Layout {
  const nodes: Map<Id, Node> = new Map()
  // Reverse look up call.src or call.dst to group id
  const rev: Map<Id, Id> = new Map()

  // Calculate module width and height
  for (const [g, fs] of groups) {
    const node = {
      id: g,
      rect: {
        x: 0,
        y: 0,
        width: screen.node.width,
        height: screen.node.height * (fs.size + 1),
      },
    }
    nodes.set(g, node)

    for (const f of fs.values()) {
      rev.set(f, g)
    }
  }

  // Calculate group x position based on min call depth
  // Calculate group y position based on call index
  // Group id => depth
  const xOffsets: Map<Id, number> = new Map()
  // Depth => y offset
  const yOffsets: Map<number, number> = new Map()

  for (let i = 0; i < calls.length; i++) {
    const c = calls[i]
    // src and dst group ids
    const src = rev.get(c.src) as Id
    const dst = rev.get(c.dst) as Id
    assert(src != undefined, `missing group for src ${c.src}`)
    assert(dst != undefined, `missing group for dst ${c.dst}`)

    if (!xOffsets.has(src)) {
      const d = c.depth
      xOffsets.set(src, d)

      const node = nodes.get(src) as Node
      const x0 = d * (node.rect.width + screen.node.gap.x)
      const y0 = yOffsets.get(d) ?? 0
      node.rect.x = x0
      node.rect.y = y0

      // Next node at this depth is rendered below this node
      const y1 = y0 + node.rect.height + screen.node.gap.y
      yOffsets.set(d, y1)
      // Nodes to be rendered at next depth is aligned to this node's top y position
      yOffsets.set(d + 1, Math.max(yOffsets.get(d + 1) ?? 0, y0))
      // Nodes to be rendered at previous depths are shifted up to
      // this node's bottom y position or yMax
      let yMax = y0
      for (let i = 0; i <= d - 1; i++) {
        yMax = Math.max(yOffsets.get(i) ?? 0, yMax)
      }
      for (let i = 0; i <= d - 1; i++) {
        yOffsets.set(i, yMax)
      }
    }
    if (!xOffsets.has(dst)) {
      const d = c.depth + 1
      xOffsets.set(dst, d)

      const node = nodes.get(dst) as Node
      const x0 = d * (node.rect.width + screen.node.gap.x)
      const y0 = yOffsets.get(d) ?? 0
      node.rect.x = x0
      node.rect.y = y0

      // Same algorithm as yOffsets for src
      const y1 = y0 + node.rect.height + screen.node.gap.y
      yOffsets.set(d, y1)
      yOffsets.set(d + 1, Math.max(yOffsets.get(d + 1) ?? 0, y0))

      let yMax = y0
      for (let i = 0; i <= d - 1; i++) {
        yMax = Math.max(yOffsets.get(i) ?? 0, yMax)
      }
      for (let i = 0; i <= d - 1; i++) {
        yOffsets.set(i, yMax)
      }
    }
  }

  // Position nodes to center of the screen
  let xMax = 0
  let yMax = 0
  for (const [_, node] of nodes) {
    xMax = Math.max(xMax, getMidPoints(node.rect).right.x)
    yMax = Math.max(yMax, getMidPoints(node.rect).bottom.y)
  }

  const x0 = screen.center.x - (xMax >> 1)
  const y0 = screen.center.y - (yMax >> 1)
  for (const [_, node] of nodes) {
    node.rect.x += x0
    node.rect.y += y0
  }

  // Calculate function positions
  for (const [g, fs] of groups) {
    const group = nodes.get(g) as Node
    assert(group != undefined, `group undefined: ${g}`)
    let i = 0
    for (const f of fs) {
      nodes.set(f, {
        id: f,
        rect: {
          x: group.rect.x,
          y: group.rect.y + (i + 1) * screen.node.height,
          width: screen.node.width,
          height: screen.node.height,
        },
      })
      i++
    }
  }

  const arrows: Arrow[] = []
  for (let i = 0; i < calls.length; i++) {
    const c = calls[i]
    arrows.push(arrow(nodes, i, c.src, c.dst))
  }

  return {
    rect: {
      x: x0,
      y: y0,
      width: xMax,
      height: yMax,
    },
    nodes,
    arrows,
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
