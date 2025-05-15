import {
  Graph,
  Point,
  Rect,
  MidPoints,
  Arrow,
  Canvas,
  SvgNode,
  Layout,
} from "./types"
import * as dag from "./dag"
import * as math from "./math"
import { assert } from "./utils"

// binary search
export function bsearch<A>(
  arr: A[],
  get: (a: A) => number,
  x: number,
): number | null {
  if (arr.length == 0) {
    return null
  }

  if (arr.length == 1) {
    return 0
  }

  let low = 0
  let high = arr.length - 1

  assert(get(arr[low]) < get(arr[high]), "data not sorted")

  // Binary search
  while (low < high) {
    let mid = ((low + high) / 2) >> 0

    if (get(arr[mid]) > x) {
      high = mid
    } else {
      low = mid + 1
    }
  }

  return low
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

  if (s.rect.y > e.rect.y) {
    p0 = m0.top
    p1 = m1.bottom
  } else if (s.rect.y < e.rect.y) {
    p0 = m0.bottom
    p1 = m1.top
  } else {
    p0 = m0.top
    p1 = m1.top
  }

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

export function map(graph: Graph, starts: number[], canvas: Canvas): Layout {
  const rows = dag.group(graph, starts)

  // Height of the graph
  const height =
    rows.length * canvas.node.height + (rows.length - 1) * canvas.node.gap
  const y0 = canvas.center.y - (height >> 1)

  // Bounding boxes around each row
  const boxes = rows.map((r, i) =>
    box(canvas, r.length, {
      x: canvas.center.x,
      y:
        y0 +
        (canvas.node.height >> 1) +
        i * (canvas.node.height + canvas.node.gap),
    }),
  )

  const nodes: SvgNode[][] = []
  const map: Map<number, SvgNode> = new Map()
  const xs: number[][] = []
  const ys: number[] = []
  for (let i = 0; i < rows.length; i++) {
    const row: SvgNode[] = []
    const box = boxes[i]
    xs.push([])
    for (let j = 0; j < rows[i].length; j++) {
      const id = rows[i][j]
      const rect: Rect = {
        x: box.x + j * (canvas.node.width + canvas.node.gap),
        y: box.y,
        width: canvas.node.width,
        height: canvas.node.height,
      }
      const mid = getMidPoints(rect)
      const node = {
        id,
        rect,
        mid,
      }
      row.push(node)
      map.set(id, node)
      xs[i].push(mid.left.x, mid.right.x)
      if (j == 0) {
        ys.push(mid.top.y, mid.bottom.y)
      }
    }
    nodes.push(row)
  }

  const arrows: Arrow[] = []
  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < nodes[i].length; j++) {
      const v = nodes[i][j].id
      const es = graph.get(v)
      if (es) {
        for (const e of es) {
          arrows.push(arrow(map, v, e))
        }
      }
    }
  }

  const width = Math.max(...boxes.map((b) => b.width))

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
    boxes,
    nodes,
    arrows,
    map,
    xs,
    ys,
  }
}
