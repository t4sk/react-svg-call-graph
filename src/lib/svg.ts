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
import * as math from "./math"

export function getViewBoxX(
  width: number,
  mouseX: number,
  viewBoxWidth: number,
  viewBoxX: number
): number {
  return math.lin(viewBoxWidth, width, mouseX, viewBoxX)
}

export function getViewBoxY(
  height: number,
  mouseY: number,
  viewBoxHeight: number,
  viewBoxY: number
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

function arrow(map: Map<number, SvgNode>, i: number, start: number, end: number): Arrow {
  const s = map.get(start) as SvgNode
  const e = map.get(end) as SvgNode

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
    start: p0,
    end: p1,
  }
}

export function map(calls: Call[], canvas: Canvas): Layout {
  const nodes: SvgNode[][] = []
  const map: Map<number, SvgNode> = new Map()

  const xs: number[] = []
  // depth => y positions
  const ys: number[][] = []
  let xMax = 0
  let yMax = 0

  // depth => offset
  const offsets: Map<number, number> = new Map()
  offsets.set(0, 0)
  let dup = 0

  for (let i = 0; i < calls.length; i++) {
    const c = calls[i]

    if (map.has(c.dst)) {
      dup += 1
      continue
    }

    const offset = offsets.get(c.depth) || 0
    // Next depth is shifted up
    offsets.set(c.depth + 1, offset - 1)
    // Previous depths are shifted up
    offsets.set(c.depth - 1, offset)
    for (let i = 0; i <= c.depth - 1; i++) {
      offsets.set(i, offset)
    }

    const { height, width, gapX, gapY } = canvas.node
    const rect = {
      x: (width >> 1) + c.depth * (width + gapX),
      y: (height >> 1) + (i + offset - dup) * (height + gapY),
      width: width,
      height: height,
    }
    const mid = getMidPoints(rect)
    const node = {
      id: c.dst,
      rect,
      mid,
    }

    while (nodes.length <= c.depth) {
      nodes.push([])
    }
    nodes[c.depth].push(node)
    map.set(c.dst, node)

    while (ys.length <= c.depth) {
      ys.push([])
    }

    if (ys[c.depth].length == 0) {
      xs.push(mid.left.x, mid.right.x)
      xMax = Math.max(xMax, mid.right.x)
    }
    ys[c.depth].push(mid.top.y, mid.bottom.y)
    yMax = Math.max(yMax, mid.bottom.y)
  }

  // Check xs sorted
  for (let i = 0; i < xs.length; i++) {
    if (xs[i] >= xs[i + 1]) {
      console.warn("x not sorted", i, xs[i], xs[i + 1])
    }
  }

  // Check ys sorted
  for (let i = 0; i < ys.length; i++) {
    for (let j = 0; j < ys[i].length - 1; j++) {
      if (ys[i][j] >= ys[i][j + 1]) {
        console.warn("y not sorted", i, j, ys[i][j], ys[i][j + 1])
      }
    }
  }

  // Set final positions of the nodes
  const x0 = canvas.center.x - (xMax >> 1)
  const y0 = canvas.center.y - (yMax >> 1)

  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < nodes[i].length; j++) {
      const node = nodes[i][j]
      const rect = {
        x: x0 + node.rect.x,
        y: y0 + node.rect.y,
        width: node.rect.width,
        height: node.rect.height,
      }
      const mid = getMidPoints(rect)
      nodes[i][j] = {
        ...node,
        rect,
        mid,
      }
      map.set(node.id, nodes[i][j])
    }
  }

  for (let i = 0; i < xs.length; i++) {
    xs[i] += x0
  }

  for (let i = 0; i < ys.length; i++) {
    for (let j = 0; j < ys[i].length; j++) {
      ys[i][j] += y0
    }
  }

  const arrows: Arrow[] = []
  for (let i = 0; i < calls.length; i++) {
    const c = calls[i]
    if (c.src) {
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
    boxes: [],
    nodes,
    arrows,
    map,
    xs,
    ys,
  }
}

export function overlaps(arrows: Arrow[]): Map<string, number> {
  const m: Map<string, number> = new Map()
  for (let i = 0; i < arrows.length; i++) {
    const a = arrows[i]
    const key = `${a.s},${a.e}`
    m.set(key, (m.get(key) ?? 0) + 1)
  }
  return m
}
