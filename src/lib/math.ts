import {Point} from "./types"

export function lerp(a: number, b: number, t: number): number {
  return a * (1 - t) + t * b
}

export function lin(dy: number, dx: number, x: number, y0: number): number {
  return (dy / dx) * x + y0
}

export function len(points: Point[]): [number, number[]] {
  const segs = []
  let l = 0
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i]
    const p1 = points[i + 1]
    const dx = p0.x - p1.x
    const dy = p0.y - p1.y
    const d = Math.sqrt(dx*dx + dy*dy)
    segs.push(d)
    l += d
  }

  return [l, segs]
}

// Polyline interpolation
export function perp(points: Point[], t: number): Point {
  const [l, segs] = len(points)

  const d = t * l
  let a = 0
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i]
    if (d < a + s) {
      const u = (d - a) / s
      const p0 = points[i]
      const p1 = points[i + 1]
      return {
        x: lerp(p0.x, p1.x, u),
        y: lerp(p0.y, p1.y, u)
      }
    }
    a += s
  }

  const last = points[points.length - 1]
  return {
    x: last.x,
    y: last.y,
  }
}
